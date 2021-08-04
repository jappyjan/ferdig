import {Inject, Service} from '@tsed/di';
import UsersService from '../../Users/UsersService';
import {DEFAULT_DB_CONNECTION} from '../../connections/DefaultConnection';
import UserNotificationSettings from '../../../entity/Users/UserNotificationSettings';
import {NotificationPayload} from './NotificationHandler';
import EmailHandler from './Handler/EmailHandler';
import PushNotificationsHandler from './Handler/PushNotificationsHandler';
import User from '../../../entity/Users/User';
import {ApplicationAutomationFlowNodeType} from '../../../entity/Applications/Automations/ApplicationAutomationFlowNode';
import ApplicationAutomationsService from '../Automations/ApplicationAutomationsService';
import AutomationPayloadError from '../Automations/Errors/AutomationPayloadError';
import {QueryRunner} from 'typeorm';

export interface UserIdentifier {
    userId: string;
    applicationId: string;
}

export enum NotificationMedium {
    Email = 'Email',
    Push = 'Push'
}

@Service()
export default class ApplicationNotificationsService {
    private readonly usersService: UsersService;
    private readonly orm: DEFAULT_DB_CONNECTION;
    private readonly emailHandler: EmailHandler;
    private readonly pushNotificationsHandler: PushNotificationsHandler;
    private readonly automationsService: ApplicationAutomationsService;

    public constructor(
        usersService: UsersService,
        @Inject(DEFAULT_DB_CONNECTION) orm: DEFAULT_DB_CONNECTION,
        emailHandler: EmailHandler,
        pushNotificationsHandler: PushNotificationsHandler,
        automationsService: ApplicationAutomationsService,
    ) {
        this.usersService = usersService;
        this.orm = orm;
        this.emailHandler = emailHandler;
        this.pushNotificationsHandler = pushNotificationsHandler;
        this.automationsService = automationsService;
    }

    // noinspection JSUnusedGlobalSymbols
    public $onInit(): void {
        this.automationsService.registerAutomationHandler(
            ApplicationAutomationFlowNodeType.Notifications_Send,
            async (
                ctx,
                {
                    applicationId,
                    getVal,
                },
            ): Promise<void> => {
                const userId = getVal('userId') as string;
                if (!userId) {
                    throw new AutomationPayloadError('Missing payload property "userId"');
                }

                const notification = getVal('notification') as NotificationPayload;
                if (!notification) {
                    throw new AutomationPayloadError('Missing payload property "notification"');
                }
                if (!notification.subject) {
                    throw new AutomationPayloadError('Missing payload property "notification.subject"');
                }
                if (!notification.body) {
                    throw new AutomationPayloadError('Missing payload property "notification.body"');
                }

                const notificationMedium = getVal('notificationMedium');
                if (!notificationMedium) {
                    throw new AutomationPayloadError('Missing payload property "notificationMedium"');
                }

                await this.sendNotification(
                    {
                        userId,
                        applicationId,
                    },
                    notification,
                    [notificationMedium],
                    ctx.runner,
                );
            },
        )
    }

    public async getOrCreateNotificationSettings(
        user: User,
        injectedRunner?: QueryRunner,
    ): Promise<UserNotificationSettings> {
        const manager = injectedRunner ? injectedRunner.manager : this.orm.manager;

        let settings = await manager.getRepository(UserNotificationSettings)
            .createQueryBuilder('settings')
            .where('settings.userId = :userId', {userId: user.id})
            .getOne();

        if (!settings) {
            settings = await manager.getRepository(UserNotificationSettings)
                .save({
                    user,
                });
        }

        return settings;
    }

    public async sendNotification(
        userIdentifier: UserIdentifier,
        payload: NotificationPayload,
        allowedMedium: NotificationMedium[],
        injectedRunner?: QueryRunner,
    ): Promise<void>
    public async sendNotification(
        user: User,
        payload: NotificationPayload,
        allowedMedium: NotificationMedium[],
        injectedRunner?: QueryRunner,
    ): Promise<void>
    public async sendNotification(
        userOrIdentifier: User | UserIdentifier,
        payload: NotificationPayload,
        allowedMedium: NotificationMedium[],
        injectedRunner?: QueryRunner,
    ): Promise<void> {
        let user!: User;
        if (userOrIdentifier instanceof User) {
            if (!userOrIdentifier.id) {
                throw new Error(`Not a valid user: ${JSON.stringify(userOrIdentifier)}`);
            }
            user = userOrIdentifier;
        }

        if (!(userOrIdentifier instanceof User)) {
            if (!userOrIdentifier.userId || !userOrIdentifier.applicationId) {
                throw new Error(`Unknown User identifier: ${JSON.stringify(userOrIdentifier)}`);
            }

            user = await this.usersService.getOneWithoutAuthCheckOrFail(
                {
                    id: userOrIdentifier.userId,
                    applicationId: userOrIdentifier.applicationId,
                },
                false,
                injectedRunner,
            );
        }

        const notificationSettings = await this.getOrCreateNotificationSettings(user, injectedRunner);

        if (
            allowedMedium.includes(NotificationMedium.Push) &&
            notificationSettings.wantsPushNotifications
        ) {
            return await this.pushNotificationsHandler.send(user, payload);
        }

        if (allowedMedium.includes(NotificationMedium.Email)) {
            await this.emailHandler.send(user, payload);
        }
    }
}
