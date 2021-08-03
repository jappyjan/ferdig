import {NotFound} from '@tsed/exceptions';
import {CollectionColumnIdentifier} from '../CollectionColumnIdentifier';

export default class CollectionColumnNotFoundError extends NotFound {
    public constructor(identifier: CollectionColumnIdentifier) {
        super(`Column with ID ${identifier.columnId} does not exist in collection ${identifier.collectionId} of application with ID ${identifier.applicationId}`);
    }
}
