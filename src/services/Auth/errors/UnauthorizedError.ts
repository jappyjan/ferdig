import {Unauthorized} from '@tsed/exceptions';

export default class UnauthorizedError extends Unauthorized {
    public constructor() {
        super('Access Denied: Unauthorized');
    }
}
