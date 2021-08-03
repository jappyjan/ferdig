import {Required} from '@tsed/schema';

export default class UserVerifyEmailPayloadModel {
    @Required()
    public token: string;
}
