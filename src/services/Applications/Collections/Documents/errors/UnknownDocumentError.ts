import {NotFound} from '@tsed/exceptions';

export default class UnknownDocumentError extends NotFound {
    constructor(documentId: string) {
        super(`Unknown Document: ${documentId}`);
    }
}
