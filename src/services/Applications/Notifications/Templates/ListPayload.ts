import {ListPagination} from '../../../shared-types/ListPagination';

export enum ApplicationNotificationTemplateSortableColumns {
    internalName = 'internalName',
    createdAt = 'createdAt',
    updatedAt = 'updatedAt',
}

export interface SortOptions {
    column: ApplicationNotificationTemplateSortableColumns;
    descending: boolean;
}

export interface ListPayload {
    pagination: ListPagination | null;

    sort: SortOptions | null;
}
