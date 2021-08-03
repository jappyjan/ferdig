import {NotFound} from '@tsed/exceptions';
import {NotificationTemplateIdentifier} from '../ApplicationNotificationTemplatesService';

export default class NotificationTemplateNotFoundError extends NotFound {
    constructor(identifier: NotificationTemplateIdentifier) {
        super(`Notification-Template not found. Identifier: ${JSON.stringify(identifier)}`);
    }
}
