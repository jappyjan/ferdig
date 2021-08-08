import User from '../../../entity/Users/User';
import Application from '../../../entity/Applications/Application';

export interface NotificationPayload {
    subject: string;
    body: string;
}

export interface NotificationHandler {
    send(application: Application, user: User, notification: NotificationPayload): Promise<void>
}
