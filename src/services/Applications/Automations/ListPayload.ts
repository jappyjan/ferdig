import {ListPagination} from '../../shared-types/ListPagination';

export enum ListSortSortableColumns {
    createdAt = 'createdAt',
    updatedAt = 'updatedAt',
    internalName = 'internalName',
}

export interface ListSort {
    column: ListSortSortableColumns;
    descending: boolean;
}

export interface ListPayload {
    pagination: ListPagination | null;
    sort: ListSort | null;
}
