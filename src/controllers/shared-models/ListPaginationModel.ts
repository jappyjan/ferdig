import {ListPagination} from '../../services/shared-types/ListPagination';
import {Integer, Min, Required} from '@tsed/schema';

export default class ListPaginationModel implements ListPagination {
    @Required()
    @Min(0)
    @Integer()
    skip: number;

    @Required()
    @Min(1)
    @Integer()
    take: number;
}
