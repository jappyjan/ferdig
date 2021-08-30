import ApplicationConfigurationEmail
    from '../../../../../entity/Applications/Configuration/E-Mail/ApplicationConfigurationEmail';
import {EmailClientOptions} from '../EmailHandler';

export interface EmailMessage {
    to: string,
    subject: string,
    text: string,
    html?: string,
}

export enum EmailClientType {
    AWS_SES = 'aws_ses',
    SMTP = 'smtp'
}

export interface EmailClient {
    send(emailConfig: ApplicationConfigurationEmail, message: EmailMessage): Promise<void>;
    verifyConfiguration<type extends EmailClientType>(options: EmailClientOptions<type>): Promise<void>;
}
