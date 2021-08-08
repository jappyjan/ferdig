import {Format, JsonFormatTypes, Required} from '@tsed/schema';
import ApplicationConfiguration from '../../../entity/Applications/Configuration/ApplicationConfiguration';
import ApplicationConfigurationEmailModel from './ApplicationConfigurationEmailModel';

export default class ApplicationConfigurationModel implements Partial<ApplicationConfiguration> {
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
    loginRequiresValidEmail: boolean;

    @Required()
    email: ApplicationConfigurationEmailModel;
}
