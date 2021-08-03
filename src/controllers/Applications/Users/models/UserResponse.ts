import {Format, JsonFormatTypes, Required} from '@tsed/schema';

export default class UserResponse implements Express.User {
    @Required()
    public id: string;

    @Required()
    @Format(JsonFormatTypes.DATE_TIME)
    public createdAt: Date;

    @Required()
    @Format(JsonFormatTypes.DATE_TIME)
    public updatedAt: Date;

    @Required()
    @Format(JsonFormatTypes.EMAIL)
    public email: string;

    @Required()
    public emailVerified: boolean;

    @Required()
    public hasConsoleAccess: boolean;

    @Required()
    public isDisabled: boolean;
}
