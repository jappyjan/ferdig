import {CollectionOf, Required} from '@tsed/schema';
import UserModel from '../../Auth/models/UserModel';

export default class UsersListResult {
    @Required()
    @CollectionOf(UserModel)
    public items: UserModel[];

    @Required()
    public moreAvailable: boolean;
}
