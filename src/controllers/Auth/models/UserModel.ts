import {Format, JsonFormatTypes, Required} from '@tsed/schema';
import User from '../../../entity/Users/User';

export default class UserModel implements Express.User, Partial<User> {
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
}
