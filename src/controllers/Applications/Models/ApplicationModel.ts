import Application from '../../../entity/Applications/Application';
import {Format, JsonFormatTypes, Required} from '@tsed/schema';
import ApplicationConfigurationModel from './ApplicationConfigurationModel';

export default class ApplicationModel implements Omit<Application, 'configuration' | 'collections' | 'users' | 'automations' | 'notificationTemplates'> {
    @Required()
    id: string;

    @Required()
    @Format(JsonFormatTypes.DATE_TIME)
    createdAt: Date;

    @Required()
    @Format(JsonFormatTypes.DATE_TIME)
    updatedAt: Date;

    @Required()
    internalName: string;

    @Required()
    configuration: ApplicationConfigurationModel;
}
