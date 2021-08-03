import ApplicationNotificationTemplate
    from '../../../../../entity/Applications/Notifications/Templates/ApplicationNotificationTemplate';
import {Format, JsonFormatTypes, Required} from '@tsed/schema';

export default class ApplicationNotificationTemplateModel implements Omit<ApplicationNotificationTemplate, 'application'> {
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
    subject: string;

    @Required()
    body: string;
}
