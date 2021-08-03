import {ListPagination} from '../shared-types/ListPagination';

export enum ListSortSortableColumns {
    email = 'email',
    createdAt = 'createdAt',
    updatedAt = 'updatedAt',
    disabled = 'disabled',
}

export interface ListSort {
    column: ListSortSortableColumns;
    descending: boolean;
}

export interface ListPayload {
    pagination: ListPagination | null;
    sort: ListSort | null;
}
