import ApplicationConfigurationEmail
    from '../../../entity/Applications/Configuration/E-Mail/ApplicationConfigurationEmail';
import {AnyOf, Integer, JsonFormatTypes, Required} from '@tsed/schema';

export default class ApplicationConfigurationEmailModel implements ApplicationConfigurationEmail {
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
}
