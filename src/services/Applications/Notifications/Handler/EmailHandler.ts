import {NotificationHandler, NotificationPayload} from '../NotificationHandler';
import User from '../../../../entity/Users/User';
import {Service} from '@tsed/di';
import Application from '../../../../entity/Applications/Application';
import {EmailClient, EmailClientType} from './Email/EmailClient';
import NodemailerClient from './Email/NodemailerClient';

export interface AWSSESClientConfiguration {
    fromAddress: string;
    replyToAddress: string;
    region: string;
}

export interface SMTPClientConfiguration {
    host: string;
    port: number;
    ssl: boolean;
    authUser: string;
    authPassword: string;
    fromName: string;
    fromAddress: string;
    replyToName: string;
    replyToAddress: string;
}

export type EmailClientConfigurations = {
    [EmailClientType.AWS_SES]: AWSSESClientConfiguration,
    [EmailClientType.SMTP]: SMTPClientConfiguration,
}

export interface EmailClientOptions<type extends EmailClientType> {
    clientType: type;
    config: EmailClientConfigurations[type];
}

@Service()
export default class EmailHandler implements NotificationHandler {
    // noinspection JSMethodCanBeStatic
    private getClient(type: EmailClientType): EmailClient {
        let client: EmailClient;

        switch (type) {
            case EmailClientType.SMTP:
            case EmailClientType.AWS_SES:
                client = new NodemailerClient();
                break;

            default:
                throw new Error('Unknown Email ClientType');
        }

        return client;
    }

    public async verifyConfiguration<type extends EmailClientType>(options: EmailClientOptions<type>): Promise<void> {
        const client = this.getClient(options.clientType);
        await client.verifyConfiguration(options);
    }

    public send(application: Application, user: User, notification: NotificationPayload): Promise<void> {
        const client = this.getClient(application.configuration.email.clientType);

        return client.send(application.configuration.email, {
            to: user.email,
            subject: notification.subject,
            text: notification.body,
            html: notification.body,
        });
    }
}
