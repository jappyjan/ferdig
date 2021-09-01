import ApplicationConfigurationEmail
    from '../../../entity/Applications/Configuration/E-Mail/ApplicationConfigurationEmail';
import {AnyOf, Enum, Integer, JsonFormatTypes, Nullable, Required} from '@tsed/schema';
import {EmailClientType} from '../../../services/Applications/Notifications/Handler/Email/EmailClient';

export default class ApplicationConfigurationEmailModel implements ApplicationConfigurationEmail {
    @Required()
    @Enum(EmailClientType)
    clientType: EmailClientType;

    @Required()
    @AnyOf(JsonFormatTypes.HOSTNAME, JsonFormatTypes.IPV4, JsonFormatTypes.IPV6)
    host: string;

    @Required()
    @Integer()
    port: number;

    @Required()
    ssl: boolean;

    @Required()
    authUser: string;

    @Required()
    authPassword: string;

    @Required()
    fromName: string;

    @Required()
    fromAddress: string;

    @Required()
    replyToAddress: string;

    @Required()
    @Nullable(String)
    replyToName: string | null;
}
