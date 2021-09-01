import {EmailClient, EmailClientType, EmailMessage} from './EmailClient';
import ApplicationConfigurationEmail
    from '../../../../../entity/Applications/Configuration/E-Mail/ApplicationConfigurationEmail';
import {createTransport, Transporter} from 'nodemailer';
import {$log} from '@tsed/common';
import {LoggerLevel} from 'nodemailer/lib/shared';
import {levels} from '@tsed/logger';
import {EmailClientOptions, SMTPClientConfiguration} from '../EmailHandler';
import * as aws from 'aws-sdk';

export default class NodemailerClient implements EmailClient {
    public async verifyConfiguration<T extends EmailClientType>(options: EmailClientOptions<T>): Promise<void> {
        const transport = this.createTransport(options);
        await transport.verify();
    }

    private createTransport<T extends EmailClientType>(options: EmailClientOptions<T>): Transporter {
        switch (options.clientType) {
            case EmailClientType.SMTP:
                return this.createSMTPTransport(options.config as SMTPClientConfiguration);

            case EmailClientType.AWS_SES:
                return this.createSESTransport();

            default:
                throw new Error('Unknown Email Client-Type');
        }
    }

    private createSMTPTransport(config: SMTPClientConfiguration): Transporter {
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

        return createTransport({
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
            debug: $log.isLevelEnabled(levels().DEBUG),
        });
    }

    // noinspection JSMethodCanBeStatic
    private createSESTransport(): Transporter {
        const ses = new aws.SES();

        return createTransport({
            SES: {
                ses,
                aws
            },
        });
    }

    public async send(config: ApplicationConfigurationEmail, message: EmailMessage) {
        const transporter = await this.createSMTPTransport(config as SMTPClientConfiguration);
        await transporter.sendMail(message);
    }
}
