import {Inject, InjectorService, OnInit, Service} from '@tsed/di';
import {DEFAULT_DB_CONNECTION} from '../connections/DefaultConnection';
import Application from '../../entity/Applications/Application';
import ApplicationNotFoundError from './errors/ApplicationNotFoundError';
import User from '../../entity/Users/User';
import NoConsoleAccessError from '../Auth/errors/NoConsoleAccessError';
import {ListResult} from '../shared-types/ListResult';
import {ListPayload} from './ListPayload';
import {CreatePayload} from './CreatePayload';
import {UpdatePayload} from './UpdatePayload';
import {EntityManager, QueryRunner} from 'typeorm';
import ApplicationConfiguration from '../../entity/Applications/Configuration/ApplicationConfiguration';
import {runInTransaction, waitForAllPromises} from '../../utils/typeorm.utils';
import ApplicationCollectionsService from './Collections/ApplicationCollectionsService';
import ApplicationAutomationsService from './Automations/ApplicationAutomationsService';
import UsersService from '../Users/UsersService';
import ApplicationNotificationTemplatesService from './Notifications/Templates/ApplicationNotificationTemplatesService';

export interface ApplicationConfigurationChangePayload {
    loginRequiresValidEmail?: boolean;
}

type InjectableProperties =
    'collectionsService'
    | 'automationsService'
    | 'usersService'
    | 'notificationTemplatesService';

@Service()
export default class ApplicationsService implements OnInit {
    private readonly orm: DEFAULT_DB_CONNECTION;
    private collectionsService: ApplicationCollectionsService;
    private automationsService: ApplicationAutomationsService;
    private usersService: UsersService;
    private notificationTemplatesService: ApplicationNotificationTemplatesService;

    @Inject(InjectorService)
    private injector!: InjectorService;

    public constructor(
        @Inject(DEFAULT_DB_CONNECTION) orm: DEFAULT_DB_CONNECTION,
    ) {
        this.orm = orm;
    }

    public $onInit(): void {
        const inject = <KeyType extends InjectableProperties>(key: KeyType, symbol: unknown) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this[key] = this.injector.get(symbol) as this[KeyType];
        };

        inject('collectionsService', ApplicationCollectionsService);
        inject('automationsService', ApplicationAutomationsService);
        inject('usersService', UsersService);
        inject('notificationTemplatesService', ApplicationNotificationTemplatesService);
    }

    // noinspection JSMethodCanBeStatic
    private getBaseQuery(manager: EntityManager) {
        return manager.getRepository(Application)
            .createQueryBuilder('application')
            .leftJoinAndSelect('application.configuration', 'config');
    }

    public async createApplication(
        authenticatedUser: User | null,
        data: CreatePayload,
    ): Promise<Application> {
        if (!authenticatedUser || !authenticatedUser.auth.hasConsoleAccess) {
            throw new NoConsoleAccessError();
        }

        const runner = this.orm.createQueryRunner();
        await runner.connect();
        await runner.startTransaction('READ UNCOMMITTED');

        return await runInTransaction(
            'ApplicationsService::createApplication',
            {runner, isInjectedRunner: false},
            async ({runner: runnerInTransaction}) => {
                const manager = runnerInTransaction.manager;

                const configuration = await manager.getRepository(ApplicationConfiguration)
                    .save({
                        loginRequiresValidEmail: true,
                    });

                return await manager.getRepository(Application)
                    .save({
                        configuration,
                        internalName: data.internalName,
                    });
            },
        );
    }

    public async getApplicationById(
        id: string,
        injectedRunner?: QueryRunner,
    ): Promise<Application> {
        const manager = injectedRunner ? injectedRunner.manager : this.orm.manager;

        const application = await this.getBaseQuery(manager)
            .where('application.id = :applicationId', {applicationId: id})
            .getOne();

        if (!application) {
            throw new ApplicationNotFoundError(id);
        }

        return application;
    }

    public async updateApplication(
        authenticatedUser: User | null,
        id: string,
        data: Partial<UpdatePayload>,
    ): Promise<Application> {
        if (!authenticatedUser || !authenticatedUser.auth.hasConsoleAccess) {
            throw new NoConsoleAccessError();
        }

        const application = await this.getApplicationById(id);

        if (data.internalName !== undefined) {
            application.internalName = data.internalName;
        }

        return await this.orm.manager.getRepository(Application)
            .save(application);
    }

    public async listApplications(
        authenticatedUser: User | null,
        options?: ListPayload,
    ): Promise<ListResult<Application>> {
        if (!authenticatedUser || !authenticatedUser.auth.hasConsoleAccess) {
            throw new NoConsoleAccessError();
        }

        const manager = this.orm.manager;

        let pagination = options?.pagination;
        if (!pagination) {
            pagination = {
                skip: 0,
                take: 15,
            };
        }

        if (pagination.take > 50) {
            pagination.take = 50;
        }

        const applications = await this.getBaseQuery(manager)
            .skip(pagination.skip)
            .take(pagination.take + 1)
            .getMany();

        const moreAvailable = applications.length > pagination.take;
        if (moreAvailable) {
            applications.pop();
        }

        return {
            items: applications,
            moreAvailable,
        };
    }

    public async changeApplicationConfiguration(
        authenticatedUser: User | null,
        applicationId: string,
        data: ApplicationConfigurationChangePayload,
    ): Promise<ApplicationConfiguration> {
        if (!authenticatedUser?.auth.hasConsoleAccess) {
            throw new NoConsoleAccessError();
        }

        const updateData: ApplicationConfigurationChangePayload = {};

        if (data.loginRequiresValidEmail !== undefined) {
            updateData.loginRequiresValidEmail = data.loginRequiresValidEmail;
        }

        const application = await this.getApplicationById(applicationId);
        await this.orm.manager.getRepository(ApplicationConfiguration)
            .update(application.configuration.id, updateData);

        return Object.assign(new ApplicationConfiguration(), application.configuration, updateData);
    }

    public async remove(
        authenticatedUser: User | null,
        applicationId: string,
    ): Promise<void> {
        const runner = this.orm.createQueryRunner();
        await runner.connect();
        await runner.startTransaction();

        return await runInTransaction(
            'ApplicationsService::remove',
            {runner, isInjectedRunner: false},
            ({runner: runnerInTransaction}) => {
                return this.removeWithRunner(
                    authenticatedUser,
                    applicationId,
                    runnerInTransaction,
                );
            },
        );
    }

    private async removeWithRunner(
        authenticatedUser: User | null,
        applicationId: string,
        runner: QueryRunner,
    ): Promise<void> {
        if (!authenticatedUser?.auth.hasConsoleAccess) {
            throw new NoConsoleAccessError();
        }

        const application = await runner.manager.getRepository(Application)
            .createQueryBuilder('app')
            .leftJoinAndSelect('app.collections', 'collection')
            .leftJoinAndSelect('app.automations', 'automation')
            .leftJoinAndSelect('app.notificationTemplates', 'notificationTemplate')
            .leftJoinAndSelect('app.users', 'user')
            .leftJoinAndSelect('app.configuration', 'configuration')
            .where('app.id = :applicationId', {applicationId})
            .getOne();

        if (!application) {
            throw new ApplicationNotFoundError(applicationId);
        }

        const removeCollections = waitForAllPromises(application.collections.map((item) => {
            return this.collectionsService.removeCollection(authenticatedUser, {
                applicationId,
                collectionId: item.id,
            }, runner);
        }));

        const removeAutomations = waitForAllPromises(application.automations.map((item) => {
            return this.automationsService.remove(authenticatedUser, {
                applicationId,
                automationId: item.id,
            }, runner);
        }));

        const removeNotificationTemplates = waitForAllPromises(application.notificationTemplates.map((item) => {
            return this.notificationTemplatesService.remove(authenticatedUser, {
                applicationId,
                templateId: item.id,
            }, runner);
        }));

        const removeUsers = waitForAllPromises(application.users.map((item) => {
            return this.usersService.remove(authenticatedUser, item.id, runner);
        }));

        const removeConfiguration = runner.manager.getRepository(ApplicationConfiguration)
            .remove(application.configuration);

        await waitForAllPromises<unknown>([
            removeCollections,
            removeAutomations,
            removeNotificationTemplates,
            removeUsers,
            removeConfiguration,
        ]);
    }
}
