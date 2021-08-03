import {Forbidden} from '@tsed/exceptions';

export default class WrongCredentialsError extends Forbidden {
    public constructor() {
        super('Wrong credentials');
    }

}
