import {
    ApplicationNotificationTemplateSortableColumns,
    ListPayload,
} from '../../../../../services/Applications/Notifications/Templates/ListPayload';
import {Enum, Nullable, Required} from '@tsed/schema';
import ListPaginationModel from '../../../../shared-models/ListPaginationModel';
import {
    SortOptions,
} from '../../../../../services/Applications/Notifications/Templates/ListPayload';

class ApplicationNotificationTemplatesListSortModel implements SortOptions {
    @Required()
    @Enum(ApplicationNotificationTemplateSortableColumns)
    column: ApplicationNotificationTemplateSortableColumns;

    @Required()
    descending: boolean;
}

export default class ApplicationNotificationTemplatesListPayloadModel implements ListPayload {
    @Nullable(ListPaginationModel)
    pagination: ListPaginationModel | null;

    @Nullable(ApplicationNotificationTemplatesListSortModel)
    sort: { column: ApplicationNotificationTemplateSortableColumns; descending: boolean } | null;
}
