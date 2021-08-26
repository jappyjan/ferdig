import {Inject, InjectorService, Service} from '@tsed/di';
import {DEFAULT_DB_CONNECTION} from '../../providers/defaultDBConnection';
import User from '../../../entity/Users/User';
import {ListPayload} from './ListPayload';
import {ListResult} from '../../shared-types/ListResult';
import ApplicationAutomation from '../../../entity/Applications/Automations/ApplicationAutomation';
import {EntityManager, QueryRunner} from 'typeorm';
import AccessToEntityDeniedException from '../../Errors/AccessToEntityDeniedException';
import {ApplicationAutomationCreatePayload} from './ApplicationAutomationCreatePayload';
import ApplicationsService from '../ApplicationsService';
import ApplicationAutomationFlowNode, {ApplicationAutomationFlowNodeType} from '../../../entity/Applications/Automations/ApplicationAutomationFlowNode';
import {$log} from '@tsed/common';
import AutomationNodeHandlerExists from './Errors/AutomationNodeHandlerExists';
import UnknownAutomationNodeError from './Errors/UnknownAutomationNodeError';
import {ApplicationAutomationUpdatePayload} from './ApplicationAutomationUpdatePayload';
import UnknownAutomationError from './Errors/UnknownAutomationError';
import {ApplicationAutomationFlowNodeCreatePayload} from './ApplicationAutomationFlowNodeCreatePayload';
import setByPath from 'object-path-set';
import ApplicationAutomationFlowNodeConfigValue
    from '../../../entity/Applications/Automations/ApplicationAutomationFlowNodeConfigValue';
import ApplicationAutomationFlowNodeLog, {ApplicationAutomationFlowNodeLogLevel} from '../../../entity/Applications/Automations/ApplicationAutomationFlowNodeLog';
import {getEnvVar} from '../../../utils/env';
import resolvePath from 'object-resolve-path';
import {runInTransaction, waitForAllPromises} from '../../../utils/typeorm.utils';
import NoConsoleAccessError from '../../Auth/errors/NoConsoleAccessError';
import {ApplicationNotificationMedium} from '../Notifications/ApplicationNotificationMedium';
import Application from '../../../entity/Applications/Application';
import CronJobsService from '../../CronJobs/CronJobsService';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type PayloadType = Record<string, string | number | boolean | Date | null | PayloadType>;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type AutomationHandlerResult = Record<string, string | AutomationHandlerResult>;

export type AutomationNodeHandler = (
    context: {
        runner: QueryRunner,
        log: (level: ApplicationAutomationFlowNodeLogLevel, message: string) => void,
    },
    data: {
        application: Application,
        configuration: ApplicationAutomationFlowNodeConfigValue[],
        payload: PayloadType,
        getVal: <T extends AutomationHandlerResult, K extends keyof AutomationHandlerResult>(key: K) => T[K],
    },
) => Promise<AutomationHandlerResult | void>;

export interface ApplicationAutomationIdentifier {
    applicationId: string;
    automationId: string
}

export interface ApplicationAutomationNodeIdentifier extends ApplicationAutomationIdentifier {
    nodeId: string;
}

type FlowNodeLogCreateData = Omit<ApplicationAutomationFlowNodeLog, 'id' | 'createdAt' | 'updatedAt'>;

@Service()
export default class ApplicationAutomationsService {
    private readonly orm: DEFAULT_DB_CONNECTION;
    private readonly nodeHandlers: Map<string, AutomationNodeHandler>;
    private applicationsService: ApplicationsService;

    @Inject(InjectorService)
    private injector!: InjectorService;

    public constructor(
        @Inject(DEFAULT_DB_CONNECTION) orm: DEFAULT_DB_CONNECTION,
    ) {
        this.orm = orm;
        this.nodeHandlers = new Map();
    }

    // noinspection JSUnusedGlobalSymbols
    public async $onInit(): Promise<void> {
        this.applicationsService = this.injector.get(ApplicationsService) as ApplicationsService;

        this.registerAutomationHandler(
            ApplicationAutomationFlowNodeType.Automation_ChangePayload,
            async (
                ctx,
                {payload, configuration},
            ) => {
                configuration.forEach((configValue) => {
                    setByPath(payload, configValue.key, configValue.value);
                });

                return payload;
            },
        );

        this.registerAutomationHandler(
            ApplicationAutomationFlowNodeType.Automation_MapPayload,
            async (
                ctx,
                {payload, configuration},
            ) => {
                configuration.forEach(({key: originalKey, value: newKey}) => {
                    setByPath(payload, newKey, resolvePath(payload, originalKey));
                });

                return payload;
            },
        );

        const cronService = this.injector.get(CronJobsService) as CronJobsService;
        const logCleanupCronJobId = 'ApplicationAutomationsService::FlowNodeLogCleanup';
        cronService.registerCronJob(logCleanupCronJobId, () => {
            return this.removeOldFlowNodeLogs();
        });

        const twentyFoursHours = 1000 * 60 * 60 * 24;
        const firstRun = new Date();
        firstRun.setMilliseconds(firstRun.getMilliseconds() + twentyFoursHours);
        await cronService.scheduleJob({
            jobId: logCleanupCronJobId,
            interval: twentyFoursHours,
            runAt: firstRun
        })
    }

    // noinspection JSMethodCanBeStatic
    private getBaseQuery(manager: EntityManager) {
        return manager.getRepository(ApplicationAutomation)
            .createQueryBuilder('automation')
            .leftJoinAndSelect('automation.flowNodes', 'node')
            .leftJoinAndSelect('node.configValues', 'configValue');
    }

    public async list(
        authenticatedUser: User | null,
        applicationId: string,
        payload: ListPayload,
    ): Promise<ListResult<ApplicationAutomation>> {
        const {sort} = payload;
        let {pagination} = payload;

        const manager = this.orm.manager;

        const query = this.getBaseQuery(manager)
            .where('automation.applicationId = :applicationId', {
                applicationId,
            });

        if (!authenticatedUser || !authenticatedUser.auth.hasConsoleAccess) {
            throw new AccessToEntityDeniedException()
        }

        if (sort) {
            query.orderBy('automation.' + sort.column, sort.descending ? 'DESC' : 'ASC');
        }

        if (!pagination) {
            pagination = {
                skip: 0,
                take: 50,
            };
        }

        if (pagination.take > 50) {
            pagination.take = 50;
        }

        query.skip(pagination.skip);
        query.take(pagination.take + 1);

        const automations = await query.getMany();

        const moreAvailable = automations.length > pagination.take;

        if (moreAvailable) {
            automations.pop();
        }

        return {
            items: automations,
            moreAvailable,
        };
    }

    public async create(
        authenticatedUser: User | null,
        applicationId: string,
        data: ApplicationAutomationCreatePayload,
        injectedRunner?: QueryRunner,
    ): Promise<ApplicationAutomation> {
        if (!authenticatedUser || !authenticatedUser.auth.hasConsoleAccess) {
            throw new AccessToEntityDeniedException()
        }

        const manager = injectedRunner ? injectedRunner.manager : this.orm.manager;

        const automation = new ApplicationAutomation();
        automation.internalName = data.internalName;
        automation.application = await this.applicationsService.getApplicationById(applicationId, injectedRunner);
        automation.flowNodes = [];

        return await manager.getRepository(ApplicationAutomation)
            .save(automation);
    }

    public async update(
        authenticatedUser: User | null,
        identifier: ApplicationAutomationIdentifier,
        payload: ApplicationAutomationUpdatePayload,
        injectedRunner?: QueryRunner,
    ): Promise<ApplicationAutomation> {
        let runner = injectedRunner;
        if (!runner) {
            runner = this.orm.createQueryRunner();
        }

        return await runInTransaction(
            'ApplicationAutomationsService::update',
            {runner, isInjectedRunner: Boolean(injectedRunner)},
            ({runner: runnerInTransaction}) => {
                return this.updateWithRunner(
                    authenticatedUser,
                    identifier,
                    payload,
                    runnerInTransaction,
                );
            },
        )
    }

    private async updateWithRunner(
        authenticatedUser: User | null,
        identifier: ApplicationAutomationIdentifier,
        data: ApplicationAutomationUpdatePayload,
        runner: QueryRunner,
    ): Promise<ApplicationAutomation> {
        if (!authenticatedUser?.auth.hasConsoleAccess) {
            throw new AccessToEntityDeniedException();
        }

        const manager = runner.manager;

        const automation = await this.getByIdentifier(authenticatedUser, identifier, runner);

        await manager.getRepository(ApplicationAutomation)
            .update(automation.id, {
                internalName: data.internalName,
            });

        automation.internalName = data.internalName;

        const removeFlowNode = async (flowNode: ApplicationAutomationFlowNode) => {
            await manager.getRepository(ApplicationAutomationFlowNodeConfigValue)
                .remove(flowNode.configValues);

            await manager.getRepository(ApplicationAutomationFlowNode)
                .remove(flowNode);
        };

        await manager.query('SET session_replication_role = \'replica\';');
        await waitForAllPromises(automation.flowNodes.map(removeFlowNode));
        await manager.query('SET session_replication_role = \'origin\';');

        automation.flowNodes = [];

        const parentNodes = data.flowNodes.filter((flowNode) => flowNode.parentId === null);

        const createNode = async (nodeData: ApplicationAutomationFlowNodeCreatePayload, parent?: ApplicationAutomationFlowNode) => {
            const node = await manager.getRepository(ApplicationAutomationFlowNode)
                .save({
                    automation,
                    type: nodeData.type,
                    parent,
                    configValues: [],
                    logs: [],
                });

            const createConfigValue = async (data: ApplicationAutomationFlowNodeConfigValue) => {
                const configValue = await manager.getRepository(ApplicationAutomationFlowNodeConfigValue)
                    .save({
                        node,
                        key: data.key,
                        value: data.value,
                    });

                delete (configValue as unknown as { node: unknown }).node;

                node.configValues.push(configValue);
            };

            await waitForAllPromises(nodeData.configValues.map(createConfigValue));

            delete (node as unknown as { automation: unknown }).automation;
            delete (node as unknown as { parent: unknown }).parent;
            automation.flowNodes.push(node);

            const children = data.flowNodes.filter((flowNode) => flowNode.parentId === nodeData.id);
            await waitForAllPromises(children.map((child) => createNode(child, node)));
        }

        await waitForAllPromises(parentNodes.map((data) => {
            return createNode(data);
        }));

        return automation;
    }

    public async getByIdentifier(
        authenticatedUser: User | null,
        identifier: ApplicationAutomationIdentifier,
        injectedRunner?: QueryRunner,
    ): Promise<ApplicationAutomation> {
        if (!authenticatedUser?.auth.hasConsoleAccess) {
            throw new AccessToEntityDeniedException();
        }

        const manager = injectedRunner ? injectedRunner.manager : this.orm.manager;

        const automation = await this.getBaseQuery(manager)
            .where('automation.id = :automationId', {automationId: identifier.automationId})
            .andWhere('automation.applicationId = :applicationId', {applicationId: identifier.applicationId})
            .getOne();

        if (!automation) {
            throw new UnknownAutomationError(identifier);
        }

        return automation;
    }

    public registerAutomationHandler<NodeType extends ApplicationAutomationFlowNodeType>(
        nodeType: NodeType,
        handler: AutomationNodeHandler,
    ): void {
        if (this.nodeHandlers.has(nodeType)) {
            throw new AutomationNodeHandlerExists(nodeType);
        }

        this.nodeHandlers.set(nodeType, handler);
    }

    public triggerAutomationEvent<NodeType extends ApplicationAutomationFlowNodeType>(
        identifier: { applicationId: string; nodeType: NodeType },
        payload: AutomationHandlerResult,
    ): void {
        this.triggerAutomationEventAsync(identifier, payload)
            .catch((e) => {
                $log.error(e);
            });
    }

    public async triggerAutomationEventAsync<NodeType extends ApplicationAutomationFlowNodeType>(
        identifier: { applicationId: string; nodeType: NodeType },
        payload: AutomationHandlerResult,
    ): Promise<void> {
        const logs: FlowNodeLogCreateData[] = [];

        const runner = this.orm.createQueryRunner();

        try {
            return await runInTransaction(
                'ApplicationAutomationsService::triggerAutomationEventAsync',
                {isInjectedRunner: false, runner},
                ({runner: runnerInTransaction}) => {
                    return this.triggerAutomationEventAsyncWithRunner(
                        identifier,
                        payload,
                        (log: FlowNodeLogCreateData) => {
                            logs.push(log);
                        },
                        runnerInTransaction,
                    );
                },
            );
        } finally {
            $log.info('saving logs of automation');
            await this.orm.manager.getRepository(ApplicationAutomationFlowNodeLog)
                .save(logs)
                .catch((e) => {
                    $log.error('failed to save logs of automation');
                    $log.error(e);
                });
        }
    }

    private async triggerAutomationEventAsyncWithRunner<NodeType extends ApplicationAutomationFlowNodeType>(
        identifier: { applicationId: string; nodeType: NodeType },
        payload: AutomationHandlerResult,
        dbLogger: (data: FlowNodeLogCreateData) => void,
        runner: QueryRunner,
    ): Promise<void> {
        const manager = runner.manager;

        $log.info('Automation Triggered By', JSON.stringify(identifier));

        const node = await manager.getRepository(ApplicationAutomationFlowNode)
            .createQueryBuilder('node')
            .leftJoin('node.automation', 'automation')
            .leftJoinAndSelect('node.configValues', 'configValue')
            .where('node.type = :type', {type: identifier.nodeType})
            .andWhere('automation.applicationId = :applicationId', {applicationId: identifier.applicationId})
            .getOne();

        if (!node) {
            throw new UnknownAutomationNodeError(identifier);
        }

        const makeLogger = (node: ApplicationAutomationFlowNode, payload: unknown) => (
            level: ApplicationAutomationFlowNodeLogLevel,
            message: string,
        ) => {
            $log[level](`${node.type}: ${message}`);
            dbLogger({
                node,
                level,
                message,
                receivedPayload: JSON.stringify(payload),
            });
        }

        const application = await this.applicationsService.getApplicationById(identifier.applicationId, runner);

        const handleNode = async (node: ApplicationAutomationFlowNode, payloadForNode: AutomationHandlerResult): Promise<void> => {
            const log = makeLogger(node, payloadForNode);

            log(
                ApplicationAutomationFlowNodeLogLevel.Info,
                'Triggered',
            );

            const handler = this.nodeHandlers.get(node.type);
            let nextPayload: AutomationHandlerResult = payload;

            if (handler) {
                try {
                    nextPayload = await handler(
                        {
                            runner,
                            log,
                        },
                        {
                            application,
                            payload: payloadForNode,
                            configuration: node.configValues,
                            getVal: <T extends AutomationHandlerResult, K extends keyof AutomationHandlerResult>(key: K) => {
                                return payloadForNode[key] ?? node.configValues.find((c) => c.key === key)?.value as T[K];
                            },
                        });

                    if (!nextPayload) {
                        nextPayload = payloadForNode;
                    }

                    log(
                        ApplicationAutomationFlowNodeLogLevel.Info,
                        `Successful`,
                    );
                } catch (e) {
                    log(
                        ApplicationAutomationFlowNodeLogLevel.Error,
                        e.toString(),
                    );
                    throw e;
                }
            }

            const children = await manager.getRepository(ApplicationAutomationFlowNode)
                .createQueryBuilder('node')
                .leftJoinAndSelect('node.configValues', 'configValue')
                .where('node.parentId = :parentId', {parentId: node.id})
                .getMany();

            await waitForAllPromises(children.map((child) => {
                return handleNode(child, nextPayload);
            }));
        }

        await handleNode(node, payload);
    }

    // replace with alternative like Bree
    // @Every('24 hours', {
    //     name: 'FlowNodeLogCleanup',
    // })
    public async removeOldFlowNodeLogs(): Promise<void> {
        const logRetentionHours = getEnvVar('AUTOMATIONS_LOG_RETENTION_HOURS', 'number');
        const retentionDate = new Date();
        retentionDate.setHours(retentionDate.getHours() - logRetentionHours);

        await this.orm.manager.createQueryBuilder()
            .delete()
            .from(ApplicationAutomationFlowNodeLog)
            .where('createdAt < :retentionDate', {retentionDate})
            .execute();
    }

    public async getLogsOfNode(
        authenticatedUser: User | null,
        identifier: ApplicationAutomationNodeIdentifier,
    ): Promise<ApplicationAutomationFlowNodeLog[]> {
        if (!authenticatedUser?.auth.hasConsoleAccess) {
            throw new AccessToEntityDeniedException();
        }

        return await this.orm.manager.getRepository(ApplicationAutomationFlowNodeLog)
            .createQueryBuilder('log')
            .leftJoin('log.node', 'node')
            .leftJoin('node.automation', 'automation')
            .where('automation.id = :automationId')
            .andWhere('automation.applicationId = :applicationId')
            .andWhere('node.id = :nodeId')
            .orderBy('node.createdAt', 'DESC')
            .limit(25)
            .setParameters(identifier)
            .getMany();
    }

    public async remove(
        authenticatedUser: User | null,
        identifier: ApplicationAutomationIdentifier,
        injectedRunner?: QueryRunner,
    ): Promise<void> {
        let runner = injectedRunner;
        if (!runner) {
            runner = this.orm.createQueryRunner();
        }

        return await runInTransaction(
            'ApplicationAutomationsService::remove',
            {runner, isInjectedRunner: Boolean(injectedRunner)},
            ({runner: runnerInTransaction}) => {
                return this.removeWithRunner(authenticatedUser, identifier, runnerInTransaction);
            },
        );
    }

    private async removeWithRunner(
        authenticatedUser: User | null,
        identifier: ApplicationAutomationIdentifier,
        runner: QueryRunner,
    ): Promise<void> {
        if (!authenticatedUser?.auth.hasConsoleAccess) {
            throw new NoConsoleAccessError();
        }

        const manager = runner.manager;

        const automation = await this.getByIdentifier(authenticatedUser, identifier, runner);

        const removeFlowNode = async (node: ApplicationAutomationFlowNode) => {
            await manager.getRepository(ApplicationAutomationFlowNodeConfigValue)
                .remove(node.configValues);

            const logs = await this.getLogsOfNode(authenticatedUser, {
                ...identifier,
                nodeId: node.id,
            });
            await manager.getRepository(ApplicationAutomationFlowNodeLog)
                .remove(logs);

            await manager.getRepository(ApplicationAutomationFlowNode)
                .remove(node);
        }

        await manager.query('SET session_replication_role = \'replica\';');
        await waitForAllPromises(automation.flowNodes.map(removeFlowNode));
        await manager.query('SET session_replication_role = \'origin\';');

        await manager.getRepository(ApplicationAutomation)
            .remove(automation);
    }

    public async createDefaultAutomations(
        authenticatedUser: User | null,
        applicationId: string,
        emailVerificationNotificationTemplateId: string,
        injectedRunner?: QueryRunner,
    ): Promise<ApplicationAutomation[]> {
        let runner = injectedRunner;
        if (!runner) {
            runner = this.orm.createQueryRunner();
        }

        return await runInTransaction(
            'ApplicationAutomationsService::createDefaultAutomations',
            {runner, isInjectedRunner: Boolean(injectedRunner)},
            ({runner: runnerInTransaction}) => {
                return this.createDefaultAutomationsWithRunner(
                    authenticatedUser,
                    applicationId,
                    emailVerificationNotificationTemplateId,
                    runnerInTransaction,
                );
            },
        );
    }

    private async createDefaultAutomationsWithRunner(
        authenticatedUser: User | null,
        applicationId: string,
        emailVerificationNotificationTemplateId: string,
        runner: QueryRunner,
    ): Promise<ApplicationAutomation[]> {
        return waitForAllPromises([
            this.createDefaultEmailVerificationAutomation(
                authenticatedUser,
                applicationId,
                emailVerificationNotificationTemplateId,
                runner,
            ),
        ]);
    }

    private async createDefaultEmailVerificationAutomation(
        authenticatedUser: User | null,
        applicationId: string,
        notificationTemplateId: string,
        runner: QueryRunner,
    ): Promise<ApplicationAutomation> {
        const automation = await this.create(
            authenticatedUser,
            applicationId,
            {
                internalName: 'Send E-Mail Verification Link',
            },
            runner,
        );

        return await this.updateWithRunner(
            authenticatedUser,
            {applicationId, automationId: automation.id},
            {
                internalName: automation.internalName,
                flowNodes: [
                    {
                        id: 'on_user_create',
                        type: ApplicationAutomationFlowNodeType.User_Created,
                        configValues: [],
                        parentId: null,
                    },
                    {
                        id: 'load_notification_template',
                        type: ApplicationAutomationFlowNodeType.NotificationTemplate_Load,
                        configValues: [{
                            key: 'templateId',
                            value: notificationTemplateId,
                        }],
                        parentId: 'on_user_create',
                    },
                    {
                        id: 'map_payload',
                        type: ApplicationAutomationFlowNodeType.Automation_MapPayload,
                        configValues: [
                            {
                                key: 'id',
                                value: 'userId',
                            },
                            {
                                key: 'template',
                                value: 'notification',
                            },
                        ],
                        parentId: 'load_notification_template',
                    },
                    {
                        id: 'send_email',
                        type: ApplicationAutomationFlowNodeType.Notifications_Send,
                        configValues: [{
                            key: 'notificationMedium',
                            value: ApplicationNotificationMedium.Email,
                        }],
                        parentId: 'map_payload',
                    },
                ],
            },
            runner,
        );
    }
}
