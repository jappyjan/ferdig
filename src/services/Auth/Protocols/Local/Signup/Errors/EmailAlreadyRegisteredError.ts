import {Forbidden} from '@tsed/exceptions';

export default class EmailAlreadyRegisteredError extends Forbidden {
    public constructor() {
        super('E-Mail is already registered');
    }
}
