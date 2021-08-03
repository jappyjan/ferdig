import {ListPagination} from '../../shared-types/ListPagination';

export enum ApplicationCollectionSortableColumns {
    internalName = 'internalName',
    createdAt = 'createdAt',
    updatedAt = 'updatedAt',
}

export interface SortOptions {
    column: ApplicationCollectionSortableColumns;
    descending: boolean;
}

export interface ListPayload {
    pagination: ListPagination | null;

    sort: SortOptions | null;
}
