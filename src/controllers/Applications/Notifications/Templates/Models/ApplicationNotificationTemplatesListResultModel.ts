import {ListResult} from '../../../../../services/shared-types/ListResult';
import ApplicationNotificationTemplateModel from './ApplicationNotificationTemplateModel';
import {CollectionOf, Required} from '@tsed/schema';

export default class ApplicationNotificationTemplatesListResultModel implements ListResult<ApplicationNotificationTemplateModel> {
    @CollectionOf(ApplicationNotificationTemplateModel)
    items: ApplicationNotificationTemplateModel[];

    @Required()
    moreAvailable: boolean;
}
