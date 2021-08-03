import User from '../../../entity/Users/User';

export interface NotificationPayload {
    subject: string;
    body: string;
}

export interface NotificationHandler {
    send(user: User, notification: NotificationPayload): Promise<void>
}
