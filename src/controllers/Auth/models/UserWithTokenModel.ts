import {Required} from '@tsed/schema';
import UserModel from './UserModel';

export default class UserWithTokenModel extends UserModel {
    @Required()
    token: string;
}
