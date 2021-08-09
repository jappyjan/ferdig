import {NotFound} from '@tsed/exceptions';

export default class UnknownColumnError extends NotFound {
    constructor(columnName: string) {
        super(`Unknown Column: ${columnName}`);
    }
}
