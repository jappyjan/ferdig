import {CreatePayload} from '../../../services/Applications/CreatePayload';
import {Required} from '@tsed/schema';
import ApplicationConfigurationCreatePayloadModel from './ApplicationConfigurationCreatePayloadModel';

export default class ApplicationCreatePayloadModel implements CreatePayload {
    @Required()
    internalName: string;

    @Required()
    configuration: ApplicationConfigurationCreatePayloadModel;
}
