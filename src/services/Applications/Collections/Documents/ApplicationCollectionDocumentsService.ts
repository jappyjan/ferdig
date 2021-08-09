import {Inject} from '@tsed/di';
import {Brackets, EntityManager, QueryRunner, WhereExpression} from 'typeorm';
import {$log, Constant} from '@tsed/common';
import ApplicationCollectionsService from '../ApplicationCollectionsService';
import ApplicationCollectionColumn, {ApplicationCollectionColumnValueType} from '../../../../entity/Applications/Collections/ApplicationCollectionColumn';
import ApplicationCollectionDocument from '../../../../entity/Applications/Collections/ApplicationCollectionDocument';
import {DEFAULT_DB_CONNECTION} from '../../../shared-providers/defaultDBConnection';
import TooManyFiltersError from './errors/TooManyFiltersError';
import ApplicationCollectionDocumentsAccessPermissionsService
    from './Permissions/ApplicationCollectionDocumentsAccessPermissionsService';
import ApplicationCollectionDocumentProperty
    from '../../../../entity/Applications/Collections/ApplicationCollectionDocumentProperty';
import ApplicationCollection from '../../../../entity/Applications/Collections/ApplicationCollection';
import UnknownColumnError from './errors/UnknownColumnError';
import UnknownDocumentError from './errors/UnknownDocumentError';
import User from '../../../../entity/Users/User';
import {CollectionIdentifier} from '../CollectionIdentifier';
import {ListResult} from '../../../shared-types/ListResult';
import {ListFilterOptions, ListFilterPropertyComparisonOperator, ListPayload} from './ListPayload';
import {CreateDocumentPropertyPayload} from './CreateDocumentPropertyPayload';
import PropertyNotAnArrayError from './errors/PropertyNotAnArrayError';
import PropertyValueTypeError from './errors/PropertyValueTypeError';
import {IO, Server, Socket, SocketService} from '@tsed/socketio';
import UsersService from '../../../Users/UsersService';
import {validateAuthJwt} from '../../../../utils/validate-auth-jwt';
import {documentToObject} from '../../../../entity/Applications/Collections/utils/document-to-object';
import {OnCommitAction, runInTransaction, waitForAllPromises} from '../../../../utils/typeorm.utils';
import {DEFAULT_MINIO_CONNECTION, MinioFile} from '../../../shared-providers/defaultMinioConnection';
import {CollectionColumnIdentifier} from '../CollectionColumnIdentifier';
import {DocumentCreateAndUpdateData} from './DocumentCreateAndUpdateData';
import {DocumentIdentifier} from './DocumentIdentifier';
import {ColumnFileIdentifier} from './ColumnFileIdentifier';
import {Readable} from 'stream';
import UnknownFileError from './errors/UnknownFileError';

@SocketService('applications/collections/documents')
export default class ApplicationCollectionDocumentsService {
    @Constant('collections.listDocuments.maxFilters')
    private readonly listDocumentsMaxFilters: number;

    @Constant('minio.bucket')
    private readonly bucketName: string;

    protected readonly io: Server;
    private readonly orm: DEFAULT_DB_CONNECTION;
    protected readonly usersService: UsersService;
    private readonly permissionsService: ApplicationCollectionDocumentsAccessPermissionsService;
    private readonly collectionsService: ApplicationCollectionsService;
    private readonly clientToApplicationMapping: Record<string, Array<{ socket: Socket, user: User }>>;
    private readonly minio: DEFAULT_MINIO_CONNECTION;

    // noinspection JSMethodCanBeStatic
    private getDocumentBaseQuery(manager: EntityManager) {
        return manager.getRepository(ApplicationCollectionDocument)
            .createQueryBuilder('document')
            .leftJoinAndSelect('document.properties', 'property')
            .leftJoinAndSelect('property.column', 'column')
            .leftJoinAndSelect('document.collection', 'collection')
            .leftJoinAndSelect('column.readAccessRule', 'readAccessRule');
    }

    public constructor(
        @IO io: Server,
        @Inject(DEFAULT_DB_CONNECTION) orm: DEFAULT_DB_CONNECTION,
        @Inject(DEFAULT_MINIO_CONNECTION) minio: DEFAULT_MINIO_CONNECTION,
        usersService: UsersService,
        collectionsAccessPermissionsService: ApplicationCollectionDocumentsAccessPermissionsService,
        collectionsService: ApplicationCollectionsService,
    ) {
        this.clientToApplicationMapping = {};
        this.orm = orm;
        this.io = io;
        this.usersService = usersService;
        this.permissionsService = collectionsAccessPermissionsService;
        this.collectionsService = collectionsService;
        this.minio = minio;
    }

    // noinspection JSUnusedGlobalSymbols
    public async $onConnection(@Socket socket: Socket): Promise<void> {
        $log.info('socket connected', socket.id, socket.handshake.auth);

        const {sub: userId} = await validateAuthJwt(socket.handshake.auth.token as string);
        const user = await this.usersService.getOneWithoutAuthCheckOrFail({id: userId});

        let applicationId = '__CONSOLE_ACCESS__';
        if (!user.auth.hasConsoleAccess) {
            if (!user.application) {
                $log.info('socket auth not accepted');
                socket.emit('authorize:response', {
                    state: 'error',
                    error: 'User has no access to any application',
                });
                return;
            }

            applicationId = user.application.id;
        }

        if (!Array.isArray(this.clientToApplicationMapping[applicationId])) {
            this.clientToApplicationMapping[applicationId] = [];
        }

        this.clientToApplicationMapping[applicationId].push({socket, user});

        $log.info('socket auth accepted');
        socket.emit('authorize:response', {
            state: 'success',
        });
    }

    public async listDocuments(
        authenticatedUser: User | null,
        collectionIdentifier: CollectionIdentifier,
        params: ListPayload,
    ): Promise<ListResult<ApplicationCollectionDocument>> {
        // this kinda checks for read access before proceeding with the intense filtering logic
        const collection = await this.collectionsService.getCollection(
            authenticatedUser,
            collectionIdentifier,
        );

        const query = this.getDocumentBaseQuery(this.orm.manager)
            .where('document.collectionId = :collectionId', {collectionId: collectionIdentifier.collectionId});

        const propertyComparisonOperatorToSQL = (operator: ListFilterPropertyComparisonOperator) => {
            switch (operator) {
                case ListFilterPropertyComparisonOperator.EQUAL:
                    return '=';

                case ListFilterPropertyComparisonOperator.NOT_EQUAL:
                    return '<>';

                case ListFilterPropertyComparisonOperator.GREATER:
                    return '>';

                case ListFilterPropertyComparisonOperator.LESS:
                    return '<';

                case ListFilterPropertyComparisonOperator.GREATER_OR_EQUAL:
                    return '>=';

                case ListFilterPropertyComparisonOperator.LESS_OR_EQUAL:
                    return '<=';

                case ListFilterPropertyComparisonOperator.NULL:
                    return ' IS NULL';

                default:
                    throw new Error('Unknown Filter Operator');
            }
        }

        let filterCount = 0;
        const applyFilter = (filter: ListFilterOptions, queryBuilder: WhereExpression) => {
            filterCount++;

            if (filterCount > this.listDocumentsMaxFilters) {
                throw new TooManyFiltersError();
            }

            const filterId = filterCount;

            const operator = propertyComparisonOperatorToSQL(filter.operator);
            if (filter.operator === ListFilterPropertyComparisonOperator.NULL) {
                queryBuilder.where(
                    `collection.internalName ${operator}`,
                );
            } else {
                queryBuilder.where(
                    `collection.internalName ${operator} :filter-${filterId}`,
                    {
                        [`filter-${filterId}`]: filter.value,
                    },
                );
            }

            if (filter.and && filter.and.length > 0) {
                queryBuilder.andWhere(new Brackets((subQueryBuilder) => {
                    // eslint-disable-next-line
                    filter.and!.forEach((andFilter) => {
                        applyFilter(andFilter, subQueryBuilder);
                    });
                }));
            }

            if (filter.or && filter.or.length > 0) {
                queryBuilder.orWhere(new Brackets((subQueryBuilder) => {
                    // eslint-disable-next-line
                    filter.or!.forEach((orFilter) => {
                        applyFilter(orFilter, subQueryBuilder);
                    });
                }));
            }
        };

        if (params.filter) {
            applyFilter(params.filter, query);
        }

        if (!params.pagination) {
            params.pagination = {
                skip: 0,
                take: 15,
            };
        }

        if (params.pagination.take > 50) {
            params.pagination.take = 50;
        }

        query.skip(params.pagination.skip);
        query.take(params.pagination.take + 1);

        const documents = await query.getMany();
        let moreAvailable = documents.length > params.pagination.take;

        if (moreAvailable) {
            documents.pop();
        }

        const accessibleDocuments: ApplicationCollectionDocument[] = [];
        await waitForAllPromises(documents.map((document) => {
            return this.permissionsService.filterDocumentByPermissions(
                authenticatedUser,
                collection.readAccessRule,
                document,
            ).then((documentOrNull) => {
                if (!documentOrNull) {
                    return;
                }

                accessibleDocuments.push(documentOrNull);
            });
        }));

        if (accessibleDocuments.length < params.pagination.take && moreAvailable) {
            const additionalDocuments = await this.listDocuments(
                authenticatedUser,
                collectionIdentifier,
                {
                    filter: params.filter,
                    pagination: {
                        skip: params.pagination.skip + params.pagination.take,
                        take: params.pagination.take - accessibleDocuments.length,
                    },
                },
            );

            moreAvailable = additionalDocuments.moreAvailable;
            accessibleDocuments.push(...additionalDocuments.items);
        }

        return {
            items: accessibleDocuments,
            moreAvailable,
        };
    }

    // noinspection JSMethodCanBeStatic
    private async documentPropertyToString(
        applicationId: string,
        collectionId: string,
        documentId: string,
        column: ApplicationCollectionColumn,
        value: unknown,
    ) {
        let valueAsString = '' + value;

        switch (column.valueType) {
            case ApplicationCollectionColumnValueType.Boolean:
                const valueAsBoolean = (value as string).toLowerCase() === 'true';
                valueAsString = valueAsBoolean ? 'TRUE' : 'FALSE';
                break;

            case ApplicationCollectionColumnValueType.Number:
                const valueAsNumber = Number(value);
                if (Number.isNaN(valueAsNumber)) {
                    throw new PropertyValueTypeError(column.internalName, value, 'number');
                }
                valueAsString = valueAsNumber.toString();
                break;

            case ApplicationCollectionColumnValueType.String:
                valueAsString = `${value}`;
                break;

            case ApplicationCollectionColumnValueType.Date:
                const valueAsDate = new Date(value as string);
                // noinspection SuspiciousTypeOfGuard
                if (!(valueAsDate instanceof Date) || isNaN(valueAsDate.getTime())) {
                    throw new PropertyValueTypeError(column.internalName, value, 'date');
                }
                valueAsString = valueAsDate.toISOString();
                break;

            case ApplicationCollectionColumnValueType.File:
                valueAsString = await this.uploadDocumentPropertyFile({
                    applicationId,
                    collectionId,
                    documentId,
                    columnId: column.id,
                }, value as MinioFile);
                break;
        }

        return valueAsString;
    }

    private async uploadDocumentPropertyFile(identifier: CollectionColumnIdentifier & { documentId: string }, file: MinioFile): Promise<string> {
        const {applicationId, collectionId, documentId, columnId} = identifier;
        const objectName = `/applications/${applicationId}/collections/${collectionId}/documents/${documentId}/columns/${columnId}/${file.originalName}`;

        await this.minio.putObject(this.bucketName, objectName, file.data);

        return objectName;
    }

    // noinspection JSMethodCanBeStatic
    private async createDocumentProperty(
        runner: QueryRunner,
        applicationId: string,
        collection: ApplicationCollection,
        document: ApplicationCollectionDocument,
        property: CreateDocumentPropertyPayload,
    ): Promise<ApplicationCollectionDocumentProperty> {
        const column = await runner.manager.getRepository(ApplicationCollectionColumn)
            .findOne({
                collection,
                internalName: property.internalName,
            });

        if (!column) {
            throw new UnknownColumnError(property.internalName);
        }

        const value = await this.documentPropertyToString(applicationId, collection.id, document.id, column, property.value);

        return runner.manager.getRepository(ApplicationCollectionDocumentProperty).save({
            document,
            column,
            value,
        });
    }

    public async createDocument(
        authenticatedUser: User | null,
        collectionIdentifier: CollectionIdentifier,
        documentData: DocumentCreateAndUpdateData,
        injectedRunner?: QueryRunner,
    ): Promise<ApplicationCollectionDocument> {
        let runner = injectedRunner;
        if (!runner) {
            runner = this.orm.createQueryRunner();
            await runner.connect();
            await runner.startTransaction();
        }

        return await runInTransaction(
            'ApplicationCollectionDocumentsService::createDocument',
            {runner, isInjectedRunner: Boolean(injectedRunner)},
            ({runner: runnerInTransaction}) => {
                return this.createDocumentWithRunner(
                    authenticatedUser,
                    collectionIdentifier,
                    documentData,
                    runnerInTransaction,
                );
            },
        )
    }

    private async createDocumentWithRunner(
        authenticatedUser: User | null,
        collectionIdentifier: CollectionIdentifier,
        documentData: DocumentCreateAndUpdateData,
        runner: QueryRunner,
    ): Promise<ApplicationCollectionDocument> {
        const manager = runner.manager;

        const collection = await this.collectionsService.getCollection(
            authenticatedUser,
            collectionIdentifier,
            runner,
        );

        const document = await manager.getRepository(ApplicationCollectionDocument)
            .save({
                collection,
                properties: [],
            });

        await waitForAllPromises(Object.keys(documentData).map((columnInternalName) => {
            let values: string[];
            if (Array.isArray(documentData[columnInternalName])) {
                values = documentData[columnInternalName] as string[];
            } else {
                values = [documentData[columnInternalName] as string];
            }

            const createSingleProperty = async (value: string) => {
                const property = await this.createDocumentProperty(
                    runner,
                    collectionIdentifier.applicationId,
                    collection,
                    document,
                    {
                        internalName: columnInternalName,
                        value,
                    },
                );

                document.properties.push(property);
            };

            return waitForAllPromises(values.map(createSingleProperty));
        }));

        await this.permissionsService.hasPermissionOrFails(
            authenticatedUser,
            collection.writeAccessRule,
            document,
            runner,
        );

        this.emitDocumentChange({
            ...collectionIdentifier,
            documentId: document.id,
        }, document);

        return document;
    }

    public async getDocument(
        authenticatedUser: User | null,
        identifier: DocumentIdentifier,
        injectedRunner?: QueryRunner,
    ): Promise<ApplicationCollectionDocument> {
        const manager = injectedRunner ? injectedRunner.manager : this.orm.manager;

        const collection = await this.collectionsService.getCollection(authenticatedUser, identifier, injectedRunner);

        const document = await this.getDocumentBaseQuery(manager)
            .where('document.id = :documentId', {documentId: identifier.documentId})
            .andWhere('collection.id = :collectionId', {collectionId: identifier.collectionId})
            .getOne();

        if (!document) {
            throw new UnknownDocumentError(identifier.documentId);
        }

        const filteredDocumentOrNull = await this.permissionsService.filterDocumentByPermissions(
            authenticatedUser,
            collection.readAccessRule,
            document,
            injectedRunner,
        );

        if (!filteredDocumentOrNull) {
            throw new UnknownDocumentError(identifier.documentId);
        }

        return document;
    }

    public async updateDocument(
        authenticatedUser: User | null,
        identifier: DocumentIdentifier,
        data: DocumentCreateAndUpdateData,
        injectedRunner?: QueryRunner,
    ): Promise<ApplicationCollectionDocument> {
        let runner = injectedRunner;
        if (!runner) {
            runner = this.orm.createQueryRunner();
            await runner.connect();
            await runner.startTransaction();
        }

        return await runInTransaction(
            'ApplicationCollectionDocumentsService::updateDocument',
            {runner, isInjectedRunner: Boolean(injectedRunner)},
            ({runner: runnerInTransaction, onCommit}) => {
                return this.updateDocumentWithRunner(
                    authenticatedUser,
                    identifier,
                    data,
                    runnerInTransaction,
                    onCommit,
                );
            },
        )
    }

    private async updateDocumentWithRunner(
        authenticatedUser: User | null,
        identifier: DocumentIdentifier,
        data: DocumentCreateAndUpdateData,
        runner: QueryRunner,
        onCommit: (action: OnCommitAction) => void,
    ): Promise<ApplicationCollectionDocument> {
        const manager = runner.manager;

        const document = await this.getDocument(authenticatedUser, identifier, runner);
        const collection = await this.collectionsService.getCollection(authenticatedUser, identifier, runner);

        delete data.id;
        delete data.createdAt;
        delete data.updatedAt;

        const updateProperty = async (internalName: string) => {
            const propertyIndex = document.properties.findIndex((prop) => prop.column.internalName === internalName);
            let property = document.properties[propertyIndex];

            if (property) {
                await this.removeDocumentProperty(property, runner, onCommit);
            }

            property = await this.createDocumentProperty(
                runner,
                identifier.applicationId,
                collection,
                document,
                {
                    value: data[internalName] as string,
                    internalName,
                },
            );
            document.properties.push(property);
        }

        const updateArrayProperty = async (internalName: string) => {
            const properties = document.properties.filter((prop) => prop.column.internalName === internalName);

            if (!Array.isArray(data[internalName])) {
                throw new PropertyNotAnArrayError(internalName);
            }

            await waitForAllPromises(properties.map(
                (property) => manager.getRepository(ApplicationCollectionDocumentProperty).remove(property)),
            );

            document.properties = await waitForAllPromises((data[internalName] as unknown as string[]).map(
                (value) => {
                    return manager.getRepository(ApplicationCollectionDocumentProperty).save({
                        document,
                        column: properties[0].column,
                        value,
                    })
                }),
            );
        };

        const updateOneColumn = async (internalName: string) => {
            const column = collection.columns.find((col) => col.internalName === internalName);

            if (!column) {
                throw new UnknownColumnError(internalName);
            }

            await this.permissionsService.hasPermissionOrFails(
                authenticatedUser,
                column.writeAccessRule,
                document,
                runner,
            );

            if (column.isArray) {
                await updateArrayProperty(internalName);
            }

            await updateProperty(internalName);
        };

        await waitForAllPromises(Object.keys(data).map((internalName) => {
            return updateOneColumn(internalName);
        }));

        this.emitDocumentChange(identifier, document);

        return document;
    }

    public async removeDocument(
        authenticatedUser: User | null,
        identifier: DocumentIdentifier,
        injectedRunner?: QueryRunner,
    ): Promise<void> {
        let runner = injectedRunner;
        if (!runner) {
            runner = this.orm.createQueryRunner();
            await runner.connect();
            await runner.startTransaction();
        }

        return await runInTransaction(
            'ApplicationCollectionDocumentsService::removeDocument',
            {runner, isInjectedRunner: Boolean(injectedRunner)},
            ({runner: runnerInTransaction, onCommit}) => {
                return this.removeDocumentWithRunner(
                    authenticatedUser,
                    identifier,
                    runnerInTransaction,
                    onCommit,
                );
            },
        )
    }

    private async removeDocumentWithRunner(
        authenticatedUser: User | null,
        identifier: DocumentIdentifier,
        runner: QueryRunner,
        onCommit: (action: OnCommitAction) => void,
    ): Promise<void> {
        const manager = runner.manager;

        const document = await this.getDocument(authenticatedUser, identifier, runner);
        const collection = await this.collectionsService.getCollection(authenticatedUser, identifier, runner);

        await this.permissionsService.hasPermissionOrFails(authenticatedUser, collection.writeAccessRule, document, runner);

        await waitForAllPromises(document.properties.map((property) => {
            return this.removeDocumentProperty(
                property,
                runner,
                onCommit,
            )
        }));

        await manager.getRepository(ApplicationCollectionDocument)
            .remove(document);

        this.emitDocumentChange(identifier, null);
    }

    private emitDocumentChange(identifier: DocumentIdentifier, document: ApplicationCollectionDocument | null) {
        this.emitDocumentChangeAsync(identifier, document)
            .catch((e) => $log.error(e));
    }

    private async emitDocumentChangeAsync(identifier: DocumentIdentifier, document: ApplicationCollectionDocument | null) {
        const clients = [
            ...this.clientToApplicationMapping[identifier.applicationId] || [],
            ...this.clientToApplicationMapping['__CONSOLE_ACCESS__'] || [],
        ];

        const emitToSingleClient = async (client: { user: User, socket: Socket }) => {
            if (document) {
                const collection = await this.collectionsService.getCollection(client.user, identifier);
                await this.permissionsService.hasPermissionOrFails(client.user, collection.readAccessRule, document);
            }

            const baseEventName = `applications/${identifier.applicationId}/collections/${identifier.collectionId}/documents/`;
            const documentAsObject = document ? documentToObject(document) : null;

            const payload = {
                identifier,
                document: documentAsObject,
            };

            client.socket.emit(baseEventName + identifier.documentId, payload);
            client.socket.emit(baseEventName + '*', payload);
        }

        await waitForAllPromises(clients.map(emitToSingleClient));
    }

    private async removeDocumentProperty(
        property: ApplicationCollectionDocumentProperty,
        runner: QueryRunner,
        onCommit: (action: OnCommitAction) => void,
    ) {
        if (property.column.valueType === ApplicationCollectionColumnValueType.File) {
            onCommit(async () => {
                await this.minio.removeObject(this.bucketName, property.value);
            });
        }

        await runner.manager.getRepository(ApplicationCollectionDocumentProperty)
            .remove(property);
    }

    public async getColumnFile(
        authenticatedUser: User | null,
        identifer: ColumnFileIdentifier,
    ): Promise<Readable> {
        const document = await this.getDocument(authenticatedUser, identifer);
        const fileProperty = document.properties.find((property) => property.column.id === identifer.columnId);

        if (!fileProperty) {
            throw new UnknownFileError(identifer);
        }

        return await this.minio.getObject(this.bucketName, fileProperty.value);
    }
}
