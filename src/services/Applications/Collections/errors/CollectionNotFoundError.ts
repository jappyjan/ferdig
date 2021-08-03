import {NotFound} from '@tsed/exceptions';
import {CollectionIdentifier} from '../CollectionIdentifier';

export default class CollectionNotFoundError extends NotFound {
    public constructor(identifier: CollectionIdentifier) {
        super(`Collection with ID ${identifier.collectionId} does not exist in application with ID ${identifier.applicationId}`);
    }
}
