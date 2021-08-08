import {Required} from '@tsed/schema';
import ApplicationConfigurationEmailCreatePayloadModel from './ApplicationConfigurationEmailCreatePayloadModel';

export default class ApplicationConfigurationCreatePayloadModel {
    @Required()
    public email: ApplicationConfigurationEmailCreatePayloadModel;
}
