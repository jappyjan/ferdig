import {UnprocessableEntity} from '@tsed/exceptions';

export default class UnknownColumnError extends UnprocessableEntity {
    constructor(columnName: string) {
        super(`Unknown Column: ${columnName}`);
    }
}
