import {Unauthorized} from '@tsed/exceptions';

export default class WrongTokenError extends Unauthorized {
    public constructor() {
        super("Wrong JWT Token");
    }
}
