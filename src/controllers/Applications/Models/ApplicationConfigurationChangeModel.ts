import {ApplicationConfigurationChangePayload} from '../../../services/Applications/ApplicationsService';
import {Property} from '@tsed/schema';

export default class ApplicationConfigurationChangeModel implements ApplicationConfigurationChangePayload {
    @Property(Boolean)
    loginRequiresValidEmail?: boolean;
}
