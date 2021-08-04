import {NotificationHandler, NotificationPayload} from '../NotificationHandler';
import User from '../../../../entity/Users/User';
import {Constant} from '@tsed/common';
import {Service} from '@tsed/di';
import {createTransport, Transporter, TransportOptions} from 'nodemailer';
import SMTPTransport, {Options as SMTPTransportOptions} from 'nodemailer/lib/smtp-transport';

@Service()
export default class EmailHandler implements NotificationHandler {
    @Constant('email')
    private readonly transportOptions: SMTPTransportOptions & TransportOptions;
    private transporter: Transporter<SMTPTransport.SentMessageInfo>;

    // noinspection JSUnusedGlobalSymbols
    public async $onInit(): Promise<void> {
        this.transporter = createTransport({
            ...this.transportOptions,
            debug: true,
        });
        await this.transporter.verify();
    }

    public async send(user: User, notification: NotificationPayload): Promise<void> {
        await this.transporter.sendMail({
            to: user.email,
            subject: notification.subject,
            text: notification.body,
            html: notification.body,
        });
    }
}
