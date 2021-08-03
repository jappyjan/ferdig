import {UpdatePayload} from '../../../../../services/Applications/Notifications/Templates/UpdatePayload';
import {Required} from '@tsed/schema';

export default class ApplicationNotificationTemplateCreatePayloadModel implements UpdatePayload {
    @Required()
    internalName: string;

    @Required(true, '')
    subject: string;

    @Required(true, '')
    body: string;
}
