import {NotFound} from '@tsed/exceptions';
import {UserIdentifier} from '../UsersService';

export default class UnknownUserError extends NotFound {
    constructor(identifier: Partial<UserIdentifier>) {
        super(`User not found with identifier: ${JSON.stringify(identifier, null, 4)}`);
    }
}
