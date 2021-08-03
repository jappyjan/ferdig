import {CollectionOf, Required} from '@tsed/schema';
import {ListResult} from '../../../../../services/shared-types/ListResult';
import {DocumentAsObjectType} from '../../../../../entity/Applications/Collections/ApplicationCollectionDocument';

export default class CollectionDocumentsListResponseModel implements ListResult<DocumentAsObjectType> {
    @Required()
    @CollectionOf(Object)
    public items: DocumentAsObjectType[]

    @Required()
    public moreAvailable: boolean;
}
