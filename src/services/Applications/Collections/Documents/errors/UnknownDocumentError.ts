import {UnprocessableEntity} from '@tsed/exceptions';

export default class UnknownDocumentError extends UnprocessableEntity {
    constructor(documentId: string) {
        super(`Unknown Document: ${documentId}`);
    }
}
