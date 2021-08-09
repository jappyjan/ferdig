import {NotFound} from '@tsed/exceptions';
import {ColumnFileIdentifier} from '../ColumnFileIdentifier';

export default class UnknownFileError extends NotFound {
    constructor(identifier: ColumnFileIdentifier) {
        super(`Unknown File: ${JSON.stringify(identifier)}`);
    }
}
