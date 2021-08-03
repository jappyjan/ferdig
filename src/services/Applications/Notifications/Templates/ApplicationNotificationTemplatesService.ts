import {Inject, InjectorService, OnInit, Service} from '@tsed/di';
import ApplicationAutomationsService from '../../Automations/ApplicationAutomationsService';
import ApplicationNotificationTemplate
    from '../../../../entity/Applications/Notifications/Templates/ApplicationNotificationTemplate';
import {DEFAULT_DB_CONNECTION} from '../../../connections/DefaultConnection';
import NotificationTemplateNotFoundError from './Errors/NotificationTemplateNotFoundError';
import AutomationPayloadError from '../../Automations/Errors/AutomationPayloadError';
import {ApplicationAutomationFlowNodeType} from '../../../../entity/Applications/Automations/ApplicationAutomationFlowNode';
import User from '../../../../entity/Users/User';
import {ListPayload} from './ListPayload';
import {ListResult} from '../../../shared-types/ListResult';
import AccessToEntityDeniedException from '../../../Errors/AccessToEntityDeniedException';
import {EntityManager, QueryRunner} from 'typeorm';
import {UpdatePayload} from './UpdatePayload';
import {CreatePayload} from './CreatePayload';
import Application from '../../../../entity/Applications/Application';
import ApplicationNotFoundError from '../../errors/ApplicationNotFoundError';
import {runInTransaction} from '../../../../utils/typeorm.utils';
import NoConsoleAccessError from '../../../Auth/errors/NoConsoleAccessError';

export interface NotificationTemplateIdentifier {
    applicationId: string;
    templateId: string;
}

@Service()
export default class ApplicationNotificationTemplatesService implements OnInit {
    private automationsService: ApplicationAutomationsService;
    private readonly orm: DEFAULT_DB_CONNECTION;

    @Inject()
    injector: InjectorService;

    public constructor(
        @Inject(DEFAULT_DB_CONNECTION) orm: DEFAULT_DB_CONNECTION,
    ) {
        this.orm = orm;
    }

    public $onInit(): void {
        this.automationsService = this.injector.get(ApplicationAutomationsService) as ApplicationAutomationsService;

        this.automationsService.registerAutomationHandler(
            ApplicationAutomationFlowNodeType.NotificationTemplate_Load,
            async (
                ctx,
                {applicationId, payload, configuration},
            ) => {
                const configTemplateId = configuration.find((c) => c.key === 'templateId')?.value;
                const templateId = payload.templateId || configTemplateId;

                if (!templateId) {
                    throw new AutomationPayloadError(
                        `${ApplicationAutomationFlowNodeType.NotificationTemplate_Load} needs payload property "templateId"`,
                    );
                }

                const template = await this.getTemplateWithoutAuthCheck(
                    {
                        applicationId,
                        templateId,
                    },
                    ctx.runner,
                );

                const insertPayloadValueIntoString = (key: string, value: string, originalString: string) => {
                    return originalString.split(`$${key}$`).join(value);
                }

                const insertPayloadValueIntoPlaceholder = (key: string, value: string) => {
                    template.subject = insertPayloadValueIntoString(key, value, template.subject);
                    template.body = insertPayloadValueIntoString(key, value, template.body);
                }
                Object.entries(payload).forEach(([key, value]) => {
                    insertPayloadValueIntoPlaceholder(key, value as string);
                });

                return {
                    ...payload,
                    template,
                };
            },
        )
    }

    // noinspection JSMethodCanBeStatic
    private getBaseQuery(manager: EntityManager) {
        return manager.getRepository(ApplicationNotificationTemplate)
            .createQueryBuilder('template');
    }

    public async getTemplateWithoutAuthCheck(
        identifier: NotificationTemplateIdentifier,
        injectedRunner?: QueryRunner,
    ): Promise<ApplicationNotificationTemplate> {
        const manager = injectedRunner ? injectedRunner.manager : this.orm.manager;

        const template = await this.getBaseQuery(manager)
            .where('template.id = :templateId', {templateId: identifier.templateId})
            .andWhere('template.applicationId = :applicationId', {applicationId: identifier.applicationId})
            .getOne();

        if (!template) {
            throw new NotificationTemplateNotFoundError(identifier);
        }

        return template;
    }

    public async getTemplate(
        authenticatedUser: User | null,
        identifier: NotificationTemplateIdentifier,
        injectedRunner?: QueryRunner,
    ): Promise<ApplicationNotificationTemplate> {
        if (!authenticatedUser?.auth.hasConsoleAccess) {
            throw new AccessToEntityDeniedException();
        }

        return await this.getTemplateWithoutAuthCheck(identifier, injectedRunner);
    }

    public async list(
        authenticatedUser: User | null,
        applicationId: string,
        params: ListPayload,
    ): Promise<ListResult<ApplicationNotificationTemplate>> {
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
            .where('template.applicationId = :applicationId', {applicationId})
            .skip(pagination.skip)
            .take(pagination.take + 1);

        if (params.sort) {
            query.orderBy(`template.${params.sort.column}`, params.sort.descending ? 'DESC' : 'ASC');
        }

        const templates = await query.getMany();

        const moreAvailable = templates.length > pagination.take;
        if (moreAvailable) {
            templates.pop();
        }

        return {
            items: templates,
            moreAvailable,
        };
    }

    public async update(
        authenticatedUser: User | null,
        identifier: NotificationTemplateIdentifier,
        data: UpdatePayload,
        injectedRunner?: QueryRunner,
    ): Promise<ApplicationNotificationTemplate> {
        let runner = injectedRunner;
        if (!runner) {
            runner = this.orm.createQueryRunner();
            await runner.connect();
            await runner.startTransaction();
        }

        return await runInTransaction(
            'ApplicationNotificationTemplatesService::update',
            {runner, isInjectedRunner: Boolean(injectedRunner)},
            ({runner: runnerInTransaction}) => {
                return this.updateWithRunner(
                    authenticatedUser,
                    identifier,
                    data,
                    runnerInTransaction,
                );
            },
        )
    }

    private async updateWithRunner(
        authenticatedUser: User | null,
        identifier: NotificationTemplateIdentifier,
        data: UpdatePayload,
        runner: QueryRunner,
    ): Promise<ApplicationNotificationTemplate> {
        const manager = runner.manager;

        if (!authenticatedUser?.auth.hasConsoleAccess) {
            throw new AccessToEntityDeniedException();
        }

        const template = await this.getTemplate(authenticatedUser, identifier, runner);

        const updateData = {
            internalName: data.internalName,
            subject: data.subject,
            body: data.body,
        };
        await manager.getRepository(ApplicationNotificationTemplate)
            .update(template.id, updateData);
        Object.assign(template, updateData);

        return template;
    }

    public async create(
        authenticatedUser: User | null,
        applicationId: string,
        data: CreatePayload,
        injectedRunner?: QueryRunner,
    ): Promise<ApplicationNotificationTemplate> {
        let runner = injectedRunner;
        if (!runner) {
            runner = this.orm.createQueryRunner();
            await runner.connect();
            await runner.startTransaction();
        }

        return await runInTransaction(
            'ApplicationNotificationTemplatesService::create',
            {runner, isInjectedRunner: Boolean(injectedRunner)},
            ({runner: runnerInTransaction}) => {
                return this.createWithRunner(
                    authenticatedUser,
                    applicationId,
                    data,
                    runnerInTransaction,
                );
            },
        )
    }

    // noinspection JSMethodCanBeStatic
    private async createWithRunner(
        authenticatedUser: User | null,
        applicationId: string,
        data: CreatePayload,
        runner: QueryRunner,
    ): Promise<ApplicationNotificationTemplate> {
        const manager = runner.manager;

        if (!authenticatedUser?.auth.hasConsoleAccess) {
            throw new AccessToEntityDeniedException();
        }

        const application = await manager.getRepository(Application)
            .findOne({
                id: applicationId,
            });

        if (!application) {
            throw new ApplicationNotFoundError(applicationId);
        }

        const template = await manager.getRepository(ApplicationNotificationTemplate)
            .save({
                application,
                internalName: data.internalName,
                subject: data.subject,
                body: data.body,
            });

        delete (template as unknown as { application: unknown }).application;

        return template;
    }

    public async remove(
        authenticatedUser: User | null,
        identifier: NotificationTemplateIdentifier,
        injectedRunner?: QueryRunner,
    ): Promise<void> {
        let runner = injectedRunner;
        if (!runner) {
            runner = this.orm.createQueryRunner();
            await runner.connect();
            await runner.startTransaction();
        }

        return await runInTransaction(
            'ApplicationNotificationTemplatesService::remove',
            {runner, isInjectedRunner: Boolean(injectedRunner)},
            ({runner: runnerInTransaction}) => {
                return this.removeWithRunner(
                    authenticatedUser,
                    identifier,
                    runnerInTransaction,
                );
            },
        );
    }

    private async removeWithRunner(
        authenticatedUser: User | null,
        identifier: NotificationTemplateIdentifier,
        runner: QueryRunner,
    ): Promise<void> {
        if (!authenticatedUser?.auth.hasConsoleAccess) {
            throw new NoConsoleAccessError();
        }

        const template = await this.getTemplate(authenticatedUser, identifier, runner);

        await runner.manager.getRepository(ApplicationNotificationTemplate)
            .remove(template);
    }
}
