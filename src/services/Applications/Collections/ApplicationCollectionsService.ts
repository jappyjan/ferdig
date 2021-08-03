import {DEFAULT_DB_CONNECTION} from '../../connections/DefaultConnection';
import Application from '../../../entity/Applications/Application';
import ApplicationCollection from '../../../entity/Applications/Collections/ApplicationCollection';
import CollectionNotFoundError from './errors/CollectionNotFoundError';
import {Inject, Service} from '@tsed/di';
import ApplicationCollectionColumn from '../../../entity/Applications/Collections/ApplicationCollectionColumn';
import ApplicationCollectionDocumentProperty
    from '../../../entity/Applications/Collections/ApplicationCollectionDocumentProperty';
import {EntityManager, QueryRunner} from 'typeorm';
import {Constant} from '@tsed/common';
import User from '../../../entity/Users/User';
import ApplicationCollectionDocumentsAccessPermissionsService
    from './Documents/Permissions/ApplicationCollectionDocumentsAccessPermissionsService';
import UnauthorizedError from '../../Auth/errors/UnauthorizedError';
import NoConsoleAccessError from '../../Auth/errors/NoConsoleAccessError';
import AccessToEntityDeniedException from '../../Errors/AccessToEntityDeniedException';
import ApplicationsService from '../ApplicationsService';
import {CreatePayload} from './CreatePayload';
import {UpdatePayload} from './UpdatePayload';
import {ListResult} from '../../shared-types/ListResult';
import {ColumnCreatePayload} from './ColumnCreatePayload';
import {ColumnUpdatePayload} from './ColumnUpdatePayload';
import {CollectionIdentifier} from './CollectionIdentifier';
import {CollectionColumnIdentifier} from './CollectionColumnIdentifier';
import {ListPayload} from './ListPayload';
import ApplicationCollectionDocumentAccessRule
    from '../../../entity/Applications/Collections/ApplicationCollectionDocumentAccessRule';
import CollectionColumnNotFoundError from './errors/CollectionCollumNotFoundError';
import {runInTransaction, waitForAllPromises} from '../../../utils/typeorm.utils';

const fetchAccessRuleRecursively = async (manager: EntityManager, rule: ApplicationCollectionDocumentAccessRule): Promise<void> => {
    const [and, or] = await waitForAllPromises([
        // eslint-disable-next-line
        manager!.getRepository(ApplicationCollectionDocumentAccessRule)
            .find({
                parentAndRule: rule,
            }),
        // eslint-disable-next-line
        manager!.getRepository(ApplicationCollectionDocumentAccessRule)
            .find({
                parentOrRule: rule,
            }),
    ]);

    rule.and = and;
    rule.or = or;

    await waitForAllPromises([
        ...rule.and.map((andRule) => fetchAccessRuleRecursively(manager, andRule)),
        ...rule.or.map((orRule) => fetchAccessRuleRecursively(manager, orRule)),
    ]);
}

@Service()
export default class ApplicationCollectionsService {
    @Constant('collections.listDocuments.maxFilters')
    private readonly listDocumentsMaxFilters: number;

    private readonly orm: DEFAULT_DB_CONNECTION;
    private readonly collectionDocumentsAccessPermissionsService: ApplicationCollectionDocumentsAccessPermissionsService;
    private readonly applicationsService: ApplicationsService;

    public constructor(
        @Inject(DEFAULT_DB_CONNECTION) orm: DEFAULT_DB_CONNECTION,
        collectionDocumentsAccessPermissionsService: ApplicationCollectionDocumentsAccessPermissionsService,
        applicationsService: ApplicationsService,
    ) {
        this.orm = orm;
        this.collectionDocumentsAccessPermissionsService = collectionDocumentsAccessPermissionsService;
        this.applicationsService = applicationsService;
    }

    // noinspection JSMethodCanBeStatic
    private getBaseQuery(manager: EntityManager) {
        return manager.getRepository(ApplicationCollection)
            .createQueryBuilder('collection')
            .leftJoin('collection.application', 'application')
            .leftJoinAndSelect('collection.columns', 'column')
            .leftJoinAndSelect('column.readAccessRule', 'columnReadRule')
            .leftJoinAndSelect('column.writeAccessRule', 'columnWriteAccessRule')
            .leftJoinAndSelect('collection.readAccessRule', 'readRule')
            .leftJoinAndSelect('collection.writeAccessRule', 'writeRule')
    }

    public async createCollection(
        authenticatedUser: User | null,
        applicationOrApplicationId: Application | string,
        data: CreatePayload,
        injectedRunner?: QueryRunner,
    ): Promise<ApplicationCollection> {
        if (!authenticatedUser || !authenticatedUser.auth.hasConsoleAccess) {
            throw new NoConsoleAccessError();
        }

        let runner = injectedRunner;
        if (!runner) {
            runner = this.orm.createQueryRunner();
            await runner.connect();
            await runner.startTransaction();
        }

        return await runInTransaction(
            'ApplicationCollectionsService::createCollection',
            {
                isInjectedRunner: Boolean(injectedRunner),
                runner,
            },
            ({runner: runnerInTransaction}) => {
                return this.createCollectionWithRunner(
                    applicationOrApplicationId,
                    data,
                    runnerInTransaction,
                )
            },
        );
    }

    private async createCollectionWithRunner(
        applicationOrApplicationId: Application | string,
        data: CreatePayload,
        runner: QueryRunner,
    ): Promise<ApplicationCollection> {
        const manager = runner.manager;

        let application = applicationOrApplicationId as Application;
        if (typeof applicationOrApplicationId === 'string') {
            application = await this.applicationsService.getApplicationById(applicationOrApplicationId, runner);
        }

        const readRule = await this.collectionDocumentsAccessPermissionsService.createAccessRule(data.readAccessRule, runner);
        const writeRule = await this.collectionDocumentsAccessPermissionsService.createAccessRule(data.writeAccessRule, runner);

        return await manager.getRepository(ApplicationCollection)
            .save({
                application: application,
                internalName: data.internalName,
                readAccessRule: readRule,
                writeAccessRule: writeRule,
            });
    }

    public async getCollection(
        authenticatedUser: User | null,
        identifier: CollectionIdentifier,
        injectedRunner?: QueryRunner,
    ): Promise<ApplicationCollection> {
        if (!authenticatedUser) {
            throw new UnauthorizedError();
        }

        const manager = injectedRunner ? injectedRunner.manager : this.orm.manager;

        // console users do not have an application assigned to them
        // so they are allowed to access any application
        if (!authenticatedUser.auth.hasConsoleAccess && identifier.applicationId !== authenticatedUser.application?.id) {
            throw new NoConsoleAccessError();
        }

        const collection = await this.getBaseQuery(manager)
            .where('application.id = :applicationId', {applicationId: identifier.applicationId})
            .andWhere('collection.id = :collectionId', {collectionId: identifier.collectionId})
            .getOne();

        if (!collection) {
            throw new CollectionNotFoundError(identifier);
        }

        await fetchAccessRuleRecursively(manager, collection.readAccessRule);
        await fetchAccessRuleRecursively(manager, collection.writeAccessRule);

        await waitForAllPromises(collection.columns.map((column) => {
            return waitForAllPromises([
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                fetchAccessRuleRecursively(manager!, column.readAccessRule),
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                fetchAccessRuleRecursively(manager!, column.writeAccessRule),
            ]);
        }));

        return collection
    }

    public async updateCollection(
        authenticatedUser: User | null,
        identifier: CollectionIdentifier,
        data: Partial<UpdatePayload>,
        injectedRunner?: QueryRunner,
    ): Promise<ApplicationCollection> {
        let runner = injectedRunner;
        if (!runner) {
            runner = this.orm.createQueryRunner();
            await runner.connect();
            await runner.startTransaction();
        }

        return await runInTransaction(
            'ApplicationCollectionsService::updateCollection',
            {runner, isInjectedRunner: Boolean(injectedRunner)},
            ({runner: runnerInTransaction}) => {
                return this.updateCollectionWithRunner(
                    authenticatedUser,
                    identifier,
                    data,
                    runnerInTransaction,
                );
            },
        )
    }

    private async updateCollectionWithRunner(
        authenticatedUser: User | null,
        identifier: CollectionIdentifier,
        data: Partial<UpdatePayload>,
        runner: QueryRunner,
    ): Promise<ApplicationCollection> {
        const manager = runner.manager;

        if (!authenticatedUser || !authenticatedUser.auth.hasConsoleAccess) {
            throw new NoConsoleAccessError();
        }

        const collection = await this.getCollection(authenticatedUser, identifier, runner);

        if (data.internalName !== undefined) {
            collection.internalName = data.internalName;
        }

        if (data.readAccessRule) {
            await this.collectionDocumentsAccessPermissionsService.removeAccessRule(collection.readAccessRule, runner);
            collection.readAccessRule = await this.collectionDocumentsAccessPermissionsService.createAccessRule(data.readAccessRule, runner);
        }

        if (data.writeAccessRule) {
            await this.collectionDocumentsAccessPermissionsService.removeAccessRule(collection.writeAccessRule, runner);
            collection.writeAccessRule = await this.collectionDocumentsAccessPermissionsService.createAccessRule(data.writeAccessRule, runner);
        }

        return await manager.getRepository(ApplicationCollection)
            .save(collection);
    }

    public async addColumn(
        authenticatedUser: User | null,
        collectionIdentifier: CollectionIdentifier,
        data: ColumnCreatePayload,
        injectedRunner?: QueryRunner,
    ): Promise<ApplicationCollectionColumn> {
        let runner = injectedRunner;
        if (!runner) {
            runner = this.orm.createQueryRunner();
            await runner.connect();
            await runner.startTransaction();
        }

        return await runInTransaction(
            'ApplicationCollectionsService::addColumn',
            {runner, isInjectedRunner: Boolean(injectedRunner)},
            ({runner: runnerInTransaction}) => {
                return this.addColumnWithRunner(
                    authenticatedUser,
                    collectionIdentifier,
                    data,
                    runnerInTransaction,
                );
            },
        )
    }

    private async addColumnWithRunner(
        authenticatedUser: User | null,
        collectionIdentifier: CollectionIdentifier,
        data: ColumnCreatePayload,
        runner: QueryRunner,
    ): Promise<ApplicationCollectionColumn> {
        const manager = runner.manager;

        if (!authenticatedUser || !authenticatedUser.auth.hasConsoleAccess) {
            throw new NoConsoleAccessError();
        }
        const collection = await this.getCollection(authenticatedUser, collectionIdentifier, runner);

        const writeAccessRule = await this.collectionDocumentsAccessPermissionsService.createAccessRule(data.writeAccessRule, runner);
        const readAccessRule = await this.collectionDocumentsAccessPermissionsService.createAccessRule(data.readAccessRule, runner);

        return await manager.getRepository(ApplicationCollectionColumn)
            .save({
                collection,
                internalName: data.internalName.split(' ').join('_'),
                valueType: data.valueType,
                isArray: data.isArray,
                writeAccessRule,
                readAccessRule,
            });
    }

    public async getColumn(
        authenticatedUser: User | null,
        identifier: CollectionColumnIdentifier,
        injectedRunner?: QueryRunner,
    ): Promise<ApplicationCollectionColumn> {
        const collection = await this.getCollection(authenticatedUser, identifier, injectedRunner);
        const column = collection.columns.find((c) => c.id === identifier.columnId);

        if (!column) {
            throw new CollectionColumnNotFoundError(identifier);
        }

        return column;
    }

    public async updateColumn(
        authenticatedUser: User | null,
        columnIdentifier: CollectionColumnIdentifier,
        data: Partial<ColumnUpdatePayload>,
        injectedRunner?: QueryRunner,
    ): Promise<ApplicationCollectionColumn> {
        let runner = injectedRunner;
        if (!runner) {
            runner = this.orm.createQueryRunner();
            await runner.connect();
            await runner.startTransaction();
        }

        return await runInTransaction(
            'ApplicationCollectionsService::updateColumn',
            {runner, isInjectedRunner: Boolean(injectedRunner)},
            ({runner: runnerInTransaction}) => {
                return this.updateColumnWithRunner(
                    authenticatedUser,
                    columnIdentifier,
                    data,
                    runnerInTransaction,
                );
            },
        )
    }

    private async updateColumnWithRunner(
        authenticatedUser: User | null,
        columnIdentifier: CollectionColumnIdentifier,
        data: Partial<ColumnUpdatePayload>,
        runner: QueryRunner,
    ): Promise<ApplicationCollectionColumn> {
        const manager = runner.manager;

        if (!authenticatedUser || !authenticatedUser.auth.hasConsoleAccess) {
            throw new NoConsoleAccessError();
        }

        const column = await this.getColumn(authenticatedUser, columnIdentifier, runner);

        if (data.internalName !== undefined) {
            column.internalName = data.internalName;
        }

        if (data.valueType !== undefined) {
            column.valueType = data.valueType;
        }

        if (data.isArray !== undefined) {
            column.isArray = data.isArray;
        }

        if (data.writeAccessRule !== undefined) {
            await this.collectionDocumentsAccessPermissionsService.removeAccessRule(column.writeAccessRule, runner)
            column.writeAccessRule = await this.collectionDocumentsAccessPermissionsService.createAccessRule(data.writeAccessRule, runner);
        }

        if (data.readAccessRule !== undefined) {
            await this.collectionDocumentsAccessPermissionsService.removeAccessRule(column.readAccessRule, runner)
            column.readAccessRule = await this.collectionDocumentsAccessPermissionsService.createAccessRule(data.readAccessRule, runner);
        }

        return await manager.getRepository(ApplicationCollectionColumn)
            .save(column);
    }

    public async removeColumn(
        authenticatedUser: User | null,
        identifier: CollectionColumnIdentifier,
        injectedRunner?: QueryRunner,
    ): Promise<void> {
        let runner = injectedRunner;
        if (!runner) {
            runner = this.orm.createQueryRunner();
            await runner.connect();
            await runner.startTransaction();
        }

        return await runInTransaction(
            'ApplicationCollectionsService::removeColumn',
            {runner, isInjectedRunner: Boolean(injectedRunner)},
            ({runner: runnerInTransaction}) => {
                return this.removeColumnWithRunner(
                    authenticatedUser,
                    identifier,
                    runnerInTransaction,
                );
            },
        )
    }

    private async removeColumnWithRunner(
        authenticatedUser: User | null,
        identifier: CollectionColumnIdentifier,
        runner: QueryRunner,
    ): Promise<void> {
        const manager = runner.manager;

        if (!authenticatedUser || !authenticatedUser.auth.hasConsoleAccess) {
            throw new NoConsoleAccessError();
        }

        const column = await this.getColumn(authenticatedUser, identifier, runner);

        await this.collectionDocumentsAccessPermissionsService.removeAccessRule(column.writeAccessRule, runner);
        await this.collectionDocumentsAccessPermissionsService.removeAccessRule(column.readAccessRule, runner);

        // delete all document properties which used this column
        const properties = await manager.getRepository(ApplicationCollectionDocumentProperty)
            .createQueryBuilder('property')
            .leftJoin('property.column', 'column')
            .leftJoin('column.collection', 'collection')
            .leftJoin('collection.application', 'application')
            .where('column.id = :columnId', {columnId: identifier.columnId})
            .andWhere('collection.id = :collectionId', {collectionId: identifier.collectionId})
            .andWhere('application.id = :applicationId', {applicationId: identifier.applicationId})
            .getMany();
        await manager.getRepository(ApplicationCollectionDocumentProperty)
            .remove(properties);

        // delete the actual column definition
        await manager.getRepository(ApplicationCollectionColumn)
            .remove(column);
    }

    public async list(
        authenticatedUser: User | null,
        applicationId: string,
        params: ListPayload,
    ): Promise<ListResult<ApplicationCollection>> {
        const hasAccess = authenticatedUser && (authenticatedUser.auth.hasConsoleAccess || authenticatedUser.application?.id === applicationId);
        if (!hasAccess) {
            throw new AccessToEntityDeniedException();
        }

        let pagination = params.pagination;
        if (!pagination) {
            pagination = {
                take: 50,
                skip: 0,
            };
        }

        if (pagination.take > 50) {
            pagination.take = 50;
        }

        const query = this.getBaseQuery(this.orm.manager)
            .where('collection.applicationId = :applicationId', {applicationId})
            .skip(pagination.skip)
            .take(pagination.take + 1);

        if (params.sort) {
            query.orderBy(`collection.${params.sort.column}`, params.sort.descending ? 'DESC' : 'ASC');
        }

        const collections = await query
            .getMany();

        await waitForAllPromises(collections.map((collection) => {
            return waitForAllPromises([
                fetchAccessRuleRecursively(this.orm.manager, collection.readAccessRule),
                fetchAccessRuleRecursively(this.orm.manager, collection.writeAccessRule),
            ]);
        }))

        const moreAvailable = collections.length > pagination.take;
        if (moreAvailable) {
            collections.pop();
        }

        return {
            items: collections,
            moreAvailable,
        };
    }

    public async listColumns(authenticatedUser: User | null, identifier: CollectionIdentifier): Promise<ListResult<ApplicationCollectionColumn>> {
        const collection = await this.getCollection(authenticatedUser, identifier);

        return {
            moreAvailable: false,
            items: collection.columns,
        };
    }

    public async removeCollection(
        authenticatedUser: User | null,
        identifier: CollectionIdentifier,
        injectedRunner?: QueryRunner,
    ): Promise<void> {
        let runner = injectedRunner;
        if (!runner) {
            runner = this.orm.createQueryRunner();
            await runner.connect();
            await runner.startTransaction();
        }

        return await runInTransaction(
            'ApplicationCollectionsService::removeCollection',
            {runner, isInjectedRunner: Boolean(injectedRunner)},
            ({runner: runnerInTransaction}) => {
                return this.removeCollectionWithRunner(
                    authenticatedUser,
                    identifier,
                    runnerInTransaction,
                );
            },
        )
    }

    private async removeCollectionWithRunner(
        authenticatedUser: User | null,
        identifier: CollectionIdentifier,
        runner: QueryRunner,
    ): Promise<void> {
        const manager = runner.manager;

        const collection = await this.getCollection(authenticatedUser, identifier, runner);

        await waitForAllPromises(collection.columns.map((column) => this.removeColumn(
            authenticatedUser,
            {
                ...identifier,
                columnId: column.id,
            },
            runner,
        )));

        await manager.getRepository(ApplicationCollection)
            .remove(collection);
    }
}
