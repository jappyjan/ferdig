import {Email, Nullable, Required} from '@tsed/schema';

export default class UserCreatePayload {
    @Email()
    @Required()
    public email: string;

    @Required()
    public password: string;

    @Nullable(String)
    public applicationId: string | null;
}
