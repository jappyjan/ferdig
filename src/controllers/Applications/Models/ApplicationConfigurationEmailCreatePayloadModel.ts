import {OneOf, Enum, Required} from '@tsed/schema';
import {EmailClientType} from '../../../services/Applications/Notifications/Handler/Email/EmailClient';

class ApplicationConfigurationEmailSMTPClientConfig {
    @Required()
    host: string;

    @Required()
    port: number;

    @Required()
    ssl: boolean;

    @Required(true, '')
    authUser: string;

    @Required(true, '')
    authPassword: string;

    @Required()
    fromName: string;

    @Required()
    fromAddress: string;

    @Required()
    replyToName: string;

    @Required()
    replyToAddress: string;
}

class ApplicationConfigurationEmailAWSSESClientConfig {
    @Required()
    fromAddress: string;

    @Required()
    replyToAddress: string;
}

export default class ApplicationConfigurationEmailCreatePayloadModel {
    @Required()
    @Enum(EmailClientType)
    clientType: EmailClientType;

    @Required()
    @OneOf(ApplicationConfigurationEmailSMTPClientConfig, ApplicationConfigurationEmailAWSSESClientConfig)
    clientConfig: ApplicationConfigurationEmailSMTPClientConfig | ApplicationConfigurationEmailAWSSESClientConfig
}
