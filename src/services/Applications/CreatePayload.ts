import {EmailClientType} from './Notifications/Handler/Email/EmailClient';
import {EmailClientConfigurations} from './Notifications/Handler/EmailHandler';

export interface CreateConfigurationEmailPayload<type extends EmailClientType> {
    clientType: type;
    clientConfig: EmailClientConfigurations[type];
}

export interface CreateConfigurationPayload<emailType extends EmailClientType> {
    email: CreateConfigurationEmailPayload<emailType>;
}

export interface CreatePayload<emailType extends EmailClientType> {
    internalName: string;
    configuration: CreateConfigurationPayload<emailType>;
}
