import {CreatePayload} from '../../../services/Applications/CreatePayload';
import {Required} from '@tsed/schema';
import ApplicationConfigurationCreatePayloadModel from './ApplicationConfigurationCreatePayloadModel';
import {EmailClientType} from '../../../services/Applications/Notifications/Handler/Email/EmailClient';

export default class ApplicationCreatePayloadModel implements CreatePayload<EmailClientType> {
    @Required()
    internalName: string;

    @Required()
    configuration: ApplicationConfigurationCreatePayloadModel;
}
