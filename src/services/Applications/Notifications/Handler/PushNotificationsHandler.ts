import {NotificationHandler, NotificationPayload} from '../NotificationHandler';
import User from '../../../../entity/Users/User';
import {$log} from '@tsed/common';
import {Service} from '@tsed/di';
import Application from '../../../../entity/Applications/Application';

@Service()
export default class PushNotificationsHandler implements NotificationHandler {
    send(application: Application, user: User, payload: NotificationPayload): Promise<void> {
        $log.info(`Sending Push-Notification to User ${user.email} with payload: ${JSON.stringify(payload, null, 4)}`);
        return Promise.reject('PushNotifications Handler not yet implemented!');
    }
}
