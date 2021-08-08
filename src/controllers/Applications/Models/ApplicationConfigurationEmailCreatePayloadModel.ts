import {Required} from '@tsed/schema';

export default class ApplicationConfigurationEmailCreatePayloadModel {
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
}
