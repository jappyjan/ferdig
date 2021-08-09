import {CollectionIdentifier} from '../CollectionIdentifier';

export interface DocumentIdentifier extends CollectionIdentifier {
    documentId: string;
}
