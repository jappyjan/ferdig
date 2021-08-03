import ListPaginationModel from '../../../shared-models/ListPaginationModel';
import {Enum, Nullable, Required} from '@tsed/schema';
import {
    ApplicationCollectionSortableColumns,
    ListPayload,
    SortOptions,
} from '../../../../services/Applications/Collections/ListPayload';

class ApplicationCollectionsListSortModel implements SortOptions {
    @Required()
    @Enum(ApplicationCollectionSortableColumns)
    column: ApplicationCollectionSortableColumns;

    @Required()
    descending: boolean;
}

export default class ApplicationCollectionsListPayloadModel implements ListPayload {
    @Nullable(ListPaginationModel)
    pagination: ListPaginationModel | null;

    @Nullable(ApplicationCollectionsListSortModel)
    sort: { column: ApplicationCollectionSortableColumns; descending: boolean } | null;
}
