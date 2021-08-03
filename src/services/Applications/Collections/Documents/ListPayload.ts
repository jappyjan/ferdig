import {ListPagination} from '../../../shared-types/ListPagination';

export enum ListFilterPropertyComparisonOperator {
    EQUAL = 'EQUAL',
    NOT_EQUAL = 'NOT_EQUAL',
    GREATER = 'GREATER',
    LESS = 'LESS',
    GREATER_OR_EQUAL = 'GREATER_OR_EQUAL',
    LESS_OR_EQUAL = 'LESS_OR_EQUAL',
    NULL = 'NULL',
}

export interface ListFilterOptions {
    operator: ListFilterPropertyComparisonOperator;
    value: string;
    and: ListFilterOptions[];
    or: ListFilterOptions[];
}

export interface ListPayload {
    filter: null | ListFilterOptions;
    pagination: null | ListPagination;
}
