import {Enum, Nullable, Required} from '@tsed/schema';
import {ListPayload, ListSort, ListSortSortableColumns} from '../../../../services/Users/ListPayload';
import ListPaginationModel from '../../../shared-models/ListPaginationModel';

class ListSortModel implements ListSort {
    @Enum(ListSortSortableColumns)
    column: ListSortSortableColumns;

    @Required()
    descending: boolean;
}

export default class ApplicationUsersListPayloadModel implements ListPayload {
    @Nullable(ListPaginationModel)
    public pagination: ListPaginationModel;

    @Nullable(ListSortModel)
    public sort: ListSortModel | null;
}
