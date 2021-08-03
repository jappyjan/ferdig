import {Email, Required} from '@tsed/schema';

export default class LoginLocalCredentials {
    @Email()
    @Required()
    public email: string;

    @Required()
    public password: string;
}
