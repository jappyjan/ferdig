import Application from '../../entity/Applications/Application';

export interface CreatePayload {
    email: string;
    password: string;
    application: Application | null;
}
