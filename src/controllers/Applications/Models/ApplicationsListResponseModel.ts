import {CollectionOf, Required} from '@tsed/schema';
import ApplicationModel from './ApplicationModel';

export default class ApplicationsListResponseModel {
    @Required()
    public moreAvailable: boolean;

    @Required()
    @CollectionOf(Object)
    public items: ApplicationModel[]
}
