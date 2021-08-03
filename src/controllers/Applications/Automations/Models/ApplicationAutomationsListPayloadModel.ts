import {Enum, Nullable, Required} from '@tsed/schema';
import {ListPayload, ListSort, ListSortSortableColumns} from '../../../../services/Applications/Automations/ListPayload';
import ListPaginationModel from '../../../shared-models/ListPaginationModel';

class ApplicationAutomationsListSortModel implements ListSort {
    @Enum(ListSortSortableColumns)
    column: ListSortSortableColumns;

    @Required()
    descending: boolean;
}

export default class ApplicationAutomationsListPayloadModel implements ListPayload {
    @Nullable(ListPaginationModel)
    public pagination: ListPaginationModel;

    @Nullable(ApplicationAutomationsListSortModel)
    public sort: ApplicationAutomationsListSortModel | null;
}
