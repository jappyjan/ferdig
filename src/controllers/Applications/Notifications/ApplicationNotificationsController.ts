import {Controller} from '@tsed/common';
import ApplicationNotificationTemplatesController from './Templates/ApplicationNotificationTemplatesController';

@Controller({
    path: '/:applicationId/notifications',
    children: [
        ApplicationNotificationTemplatesController,
    ],
})
export default class ApplicationNotificationsController {

}
