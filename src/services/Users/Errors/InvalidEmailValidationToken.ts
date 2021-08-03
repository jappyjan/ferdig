import {UnprocessableEntity} from '@tsed/exceptions';

export default class InvalidEmailValidationToken extends UnprocessableEntity {
    public constructor() {
        super('Invalid E-Mail validation token');
    }
}
