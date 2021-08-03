import {Forbidden} from '@tsed/exceptions';

export default class EmailNotVerifiedError extends Forbidden {
    public constructor() {
        super('E-Mail not verified');
    }
}
