import {UnprocessableEntity} from '@tsed/exceptions';

export default class AutomationPayloadError extends UnprocessableEntity {
    constructor(msg: string) {
        super(msg);
    }
}
