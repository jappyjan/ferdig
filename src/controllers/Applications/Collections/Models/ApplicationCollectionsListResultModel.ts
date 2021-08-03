import {CollectionOf, Required} from '@tsed/schema';
import ApplicationCollection from '../../../../entity/Applications/Collections/ApplicationCollection';
import ApplicationCollectionModel from './ApplicationCollectionModel';

export default class ApplicationCollectionsListResultModel {
    @Required()
    @CollectionOf(ApplicationCollection)
    public items: ApplicationCollectionModel[];

    @Required()
    public moreAvailable: boolean;
}
