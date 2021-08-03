import {NotFound} from '@tsed/exceptions';
import {CollectionColumnIdentifier} from '../CollectionColumnIdentifier';

export default class CollectionNotFoundError extends NotFound {
    public constructor(identifier: CollectionColumnIdentifier) {
        super(`Column with ID ${identifier.columnId} does not exist in Collection with ID ${identifier.collectionId} of application with ID ${identifier.applicationId}`);
    }
}
