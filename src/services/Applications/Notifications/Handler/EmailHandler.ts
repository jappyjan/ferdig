import {NotificationHandler, NotificationPayload} from '../NotificationHandler';
import User from '../../../../entity/Users/User';
import {Configuration, Service} from '@tsed/di';
import {createTransport, Transporter} from 'nodemailer';
import ApplicationConfigurationEmail
    from '../../../../entity/Applications/Configuration/E-Mail/ApplicationConfigurationEmail';
import Application from '../../../../entity/Applications/Application';
import {$log} from '@tsed/common';
import {LoggerLevel} from 'nodemailer/lib/shared';
import {emailConfig} from '../../../../config/sub-configs/email';

@Service()
export default class EmailHandler implements NotificationHandler {
    private readonly config: typeof emailConfig;

    public constructor(@Configuration() config: Configuration) {
        this.config = config.email;
    }

    public async verifyConfigurationAndCreateTransport(config: ApplicationConfigurationEmail): Promise<Transporter> {
        let auth: undefined | { user: string, pass: string } = undefined;
        if (config.authUser && config.authPassword) {
            auth = {
                user: config.authUser,
                pass: config.authPassword,
            };
        }

        let host = config.host;
        let port = config.port;
        let ssl = config.ssl;

        if (this.config.useMailcatcher) {
            host = 'localhost';
            port = 1025;
            auth = undefined;
            ssl = false;
        }

        const transporter = createTransport({
            host: host,
            port: port,
            secure: ssl,
            auth,
            from: {
                name: config.fromName,
                address: config.fromAddress,
            },
            logger: {
                info(...params: unknown[]) {
                    $log.info(...params);
                },
                warn(...params: unknown[]) {
                    $log.warn(...params);
                },
                error(...params: unknown[]) {
                    $log.error(...params);
                },
                debug(...params: unknown[]) {
                    $log.debug(...params);
                },
                trace(...params: unknown[]) {
                    $log.trace(...params);
                },
                fatal(...params: unknown[]) {
                    $log.fatal(...params);
                },
                level(level: LoggerLevel) {
                    $log.level = level;
                },
            },
            debug: this.config.debug,
        });

        await transporter.verify();

        return transporter;
    }

    public async send(application: Application, user: User, notification: NotificationPayload): Promise<void> {
        try {
            const transporter = await this.verifyConfigurationAndCreateTransport(application.configuration.email);

            await transporter.sendMail({
                to: user.email,
                subject: notification.subject,
                text: notification.body,
                html: notification.body,
            });
        } catch (e) {
            throw e;
        }
    }
}
