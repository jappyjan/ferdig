import {ListResult} from '../../../../../services/shared-types/ListResult';
import {CollectionOf, Required} from '@tsed/schema';
import ApplicationCollectionColumnModel from './ApplicationCollectionColumnModel';

export default class ApplicationCollectionColumnsListResultModel implements ListResult<ApplicationCollectionColumnModel> {
    @Required()
    @CollectionOf(ApplicationCollectionColumnModel)
    items: ApplicationCollectionColumnModel[];

    @Required()
    moreAvailable: boolean;
}
