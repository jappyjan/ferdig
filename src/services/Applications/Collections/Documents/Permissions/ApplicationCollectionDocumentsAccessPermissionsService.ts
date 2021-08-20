import {Inject, Service} from '@tsed/di';
import {QueryRunner} from 'typeorm';
import {Const} from '@tsed/schema';
import resolvePath from 'object-resolve-path';
import {DEFAULT_DB_CONNECTION} from '../../../../shared-providers/defaultDBConnection';
import UsersService from '../../../../Users/UsersService';
import ApplicationCollectionDocument
    from '../../../../../entity/Applications/Collections/ApplicationCollectionDocument';
import User from '../../../../../entity/Users/User';
import ApplicationCollectionDocumentAccessRule, {CollectionDocumentsAccessRuleComparisonOperator} from '../../../../../entity/Applications/Collections/ApplicationCollectionDocumentAccessRule';
import AccessToEntityDeniedException from '../../../../Errors/AccessToEntityDeniedException';
import ApplicationCollectionDocumentAccessRuleCreateModel
    from '../../../../../controllers/Applications/Collections/Models/ApplicationCollectionDocumentAccessRuleCreateModel';
import ApplicationCollectionDocumentProperty
    from '../../../../../entity/Applications/Collections/ApplicationCollectionDocumentProperty';
import {documentToObject} from '../../../../../entity/Applications/Collections/utils/document-to-object';
import {runInTransaction, waitForAllPromises} from '../../../../../utils/typeorm.utils';

@Service()
export default class ApplicationCollectionDocumentsAccessPermissionsService {
    @Const('applications.collections.documents.accessRules.cacheDuration')
    private readonly accessRuleCacheDuration: number;

    private readonly orm: DEFAULT_DB_CONNECTION;
    private readonly usersService: UsersService;

    public constructor(
        @Inject(DEFAULT_DB_CONNECTION) orm: DEFAULT_DB_CONNECTION,
        usersService: UsersService,
    ) {
        this.orm = orm;
        this.usersService = usersService;
    }

    // noinspection JSMethodCanBeStatic
    private parseValueDescriptor(
        authenticatedUser: User | null,
        descriptor: string,
        document: ApplicationCollectionDocument,
    ): string {
        const availableValues = {
            document: documentToObject(document),
            user: {
                email: authenticatedUser?.email,
                id: authenticatedUser?.id,
                emailVerified: authenticatedUser?.auth.emailVerified,
                isDisabled: authenticatedUser?.auth.isDisabled,
                createdAt: authenticatedUser?.createdAt,
                updatedAt: authenticatedUser?.updatedAt,
            },
        }

        try {
            return resolvePath(availableValues, descriptor) || descriptor;
        } catch {
            return descriptor;
        }
    }

    private async hasPermissionForAndRules(
        authenticatedUser: User | null,
        rule: ApplicationCollectionDocumentAccessRule,
        document: ApplicationCollectionDocument,
        injectedRunner?: QueryRunner,
    ): Promise<boolean | null> {
        const manager = injectedRunner ? injectedRunner.manager : this.orm.manager;

        const andRules = await manager.getRepository(ApplicationCollectionDocumentAccessRule)
            .find({
                where: {parentAndRule: rule},
                cache: this.accessRuleCacheDuration,
            });

        if (andRules.length === 0) {
            return null;
        }

        const permissionsForAndRules: boolean[] = await waitForAllPromises(andRules.map((andRule) => {
            return this.hasPermission(authenticatedUser, andRule, document, injectedRunner);
        }));

        return permissionsForAndRules.reduce((val, sum) => val && sum);
    }

    private async hasPermissionForOrRules(
        authenticatedUser: User | null,
        rule: ApplicationCollectionDocumentAccessRule,
        document: ApplicationCollectionDocument,
        injectedRunner?: QueryRunner,
    ): Promise<boolean | null> {
        const manager = injectedRunner ? injectedRunner.manager : this.orm.manager;

        const orRules = await manager.getRepository(ApplicationCollectionDocumentAccessRule)
            .find({
                where: {parentAndRule: rule},
                cache: this.accessRuleCacheDuration,
            });

        if (orRules.length === 0) {
            return null;
        }

        const permissionsForOrRules: boolean[] = await waitForAllPromises(orRules.map((orRule) => {
            return this.hasPermission(authenticatedUser, orRule, document, injectedRunner);
        }));

        return permissionsForOrRules.reduce((val, sum) => val || sum);
    }

    public async hasPermissionOrFails(
        authenticatedUser: User | null,
        rule: ApplicationCollectionDocumentAccessRule,
        document: ApplicationCollectionDocument,
        injectedRunner?: QueryRunner,
    ): Promise<void> {
        if (await this.hasPermission(authenticatedUser, rule, document, injectedRunner)) {
            return;
        }

        throw new AccessToEntityDeniedException();
    }

    public async hasPermission(
        authenticatedUser: User | null,
        rule: ApplicationCollectionDocumentAccessRule,
        document: ApplicationCollectionDocument,
        injectedRunner?: QueryRunner,
    ): Promise<boolean> {
        if (!rule) {
            return false;
        }

        const hasPermissionForOneOrRule = await this.hasPermissionForOrRules(authenticatedUser, rule, document, injectedRunner);
        if (hasPermissionForOneOrRule) {
            return true;
        }

        const hasPermissionForAllAndRules = await this.hasPermissionForAndRules(authenticatedUser, rule, document, injectedRunner);
        if (hasPermissionForAllAndRules === false) {
            return false;
        }

        const rightSideValue = this.parseValueDescriptor(authenticatedUser, rule.rightSide ?? '', document);
        const leftSideValue = this.parseValueDescriptor(authenticatedUser, rule.leftSide ?? '', document);

        let hasPermissionForCurrentRule: boolean;
        switch (rule.operator) {
            case CollectionDocumentsAccessRuleComparisonOperator.EQUAL:
                hasPermissionForCurrentRule = leftSideValue === rightSideValue;
                break;

            case CollectionDocumentsAccessRuleComparisonOperator.NOT_EQUAL:
                hasPermissionForCurrentRule = leftSideValue !== rightSideValue;
                break;

            case CollectionDocumentsAccessRuleComparisonOperator.FALSE:
                hasPermissionForCurrentRule = !Boolean(leftSideValue);
                break;

            case CollectionDocumentsAccessRuleComparisonOperator.TRUE:
                hasPermissionForCurrentRule = Boolean(leftSideValue);
                break;

            case CollectionDocumentsAccessRuleComparisonOperator.GREATER:
                if (!leftSideValue && rightSideValue) {
                    hasPermissionForCurrentRule = true;
                } else if (leftSideValue && !rightSideValue) {
                    hasPermissionForCurrentRule = false;
                } else if (!leftSideValue && !rightSideValue) {
                    hasPermissionForCurrentRule = false;
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    hasPermissionForCurrentRule = leftSideValue! > rightSideValue!;
                }
                break;

            case CollectionDocumentsAccessRuleComparisonOperator.GREATER_OR_EQUAL:
                if (!leftSideValue && rightSideValue) {
                    hasPermissionForCurrentRule = false;
                } else if (leftSideValue && !rightSideValue) {
                    hasPermissionForCurrentRule = true;
                } else if (!leftSideValue && !rightSideValue) {
                    hasPermissionForCurrentRule = true;
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    hasPermissionForCurrentRule = leftSideValue! >= rightSideValue!;
                }
                break;

            case CollectionDocumentsAccessRuleComparisonOperator.LESS:
                if (!leftSideValue && rightSideValue) {
                    hasPermissionForCurrentRule = true;
                } else if (leftSideValue && !rightSideValue) {
                    hasPermissionForCurrentRule = false;
                } else if (!leftSideValue && !rightSideValue) {
                    hasPermissionForCurrentRule = false;
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    hasPermissionForCurrentRule = leftSideValue! < rightSideValue!;
                }
                break;

            case CollectionDocumentsAccessRuleComparisonOperator.LESS_OR_EQUAL:
                if (!leftSideValue && rightSideValue) {
                    hasPermissionForCurrentRule = true;
                } else if (leftSideValue && !rightSideValue) {
                    hasPermissionForCurrentRule = false;
                } else if (!leftSideValue && !rightSideValue) {
                    hasPermissionForCurrentRule = true;
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    hasPermissionForCurrentRule = leftSideValue! <= rightSideValue!;
                }
                break;

            default:
                hasPermissionForCurrentRule = false;
                break;
        }

        return hasPermissionForCurrentRule;
    }

    public async createAccessRule(
        data: ApplicationCollectionDocumentAccessRuleCreateModel,
        injectedRunner?: QueryRunner,
    ): Promise<ApplicationCollectionDocumentAccessRule> {
        let runner = injectedRunner;
        if (!runner) {
            runner = this.orm.createQueryRunner();
            await runner.connect();
            await runner.startTransaction();
        }

        return await runInTransaction(
            'ApplicationCollectionDocumentsAccessPermissionsService::createAccessRule',
            {runner, isInjectedRunner: Boolean(injectedRunner)},
            ({runner: runnerInTransaction}) => {
                return this.createAccessRuleWithRunner(
                    data,
                    runnerInTransaction,
                );
            },
        )
    }

    private async createAccessRuleWithRunner(
        data: ApplicationCollectionDocumentAccessRuleCreateModel,
        runner: QueryRunner,
    ): Promise<ApplicationCollectionDocumentAccessRule> {
        const manager = runner.manager;

        const andRules: ApplicationCollectionDocumentAccessRule[] = await waitForAllPromises(data.and.map((andData) => this.createAccessRule(andData, runner)));
        const orRules: ApplicationCollectionDocumentAccessRule[] = await waitForAllPromises(data.or.map((orData) => this.createAccessRule(orData, runner)));

        return await manager.getRepository(ApplicationCollectionDocumentAccessRule)
            .save({
                leftSide: data.leftSide,
                operator: data.operator,
                rightSide: data.rightSide,
                and: andRules,
                or: orRules,
            });
    }

    public async removeAccessRule(
        rule: ApplicationCollectionDocumentAccessRule,
        injectedRunner?: QueryRunner,
    ): Promise<void> {
        let runner = injectedRunner;
        if (!runner) {
            runner = this.orm.createQueryRunner();
            await runner.connect();
            await runner.startTransaction();
        }

        return await runInTransaction(
            'ApplicationCollectionDocumentsAccessPermissionsService::removeAccessRule',
            {runner, isInjectedRunner: Boolean(injectedRunner)},
            ({runner: runnerInTransaction}) => {
                return this.removeAccessRuleWithRunner(
                    rule,
                    runnerInTransaction,
                );
            },
        )
    }

    private async removeAccessRuleWithRunner(
        rule: ApplicationCollectionDocumentAccessRule,
        runner: QueryRunner,
    ): Promise<void> {
        const manager = runner.manager;

        const [andRules, orRules] = await waitForAllPromises([
            manager.getRepository(ApplicationCollectionDocumentAccessRule)
                .find({
                    parentAndRule: rule,
                }),
            manager.getRepository(ApplicationCollectionDocumentAccessRule)
                .find({
                    parentOrRule: rule,
                }),
        ]);

        await waitForAllPromises([...andRules, ...orRules].map(
            (subRule) => this.removeAccessRule(subRule, runner)),
        );
    }

    public async filterDocumentByPermissions(
        authenticatedUser: User | null,
        readAccessRule: ApplicationCollectionDocumentAccessRule,
        document: ApplicationCollectionDocument,
        injectedRunner?: QueryRunner,
    ): Promise<ApplicationCollectionDocument | null> {
        const hasGeneralReadAccessToDocument = await this.hasPermission(
            authenticatedUser,
            readAccessRule,
            document,
            injectedRunner,
        );

        if (!hasGeneralReadAccessToDocument) {
            return null;
        }

        const filterOneProperty = async (property: ApplicationCollectionDocumentProperty): Promise<ApplicationCollectionDocumentProperty | null> => {
            const hasPermission = await this.hasPermission(
                authenticatedUser,
                property.column.readAccessRule,
                document,
                injectedRunner,
            );

            if (!hasPermission) {
                return null;
            }

            return property;
        }

        const propertiesOrNulls = await waitForAllPromises(document.properties.map(
            (property) => filterOneProperty(property),
        ));

        document.properties = propertiesOrNulls.filter(
            (propertyOrNull) => propertyOrNull !== null,
        ) as ApplicationCollectionDocumentProperty[];

        return document;
    }
}
