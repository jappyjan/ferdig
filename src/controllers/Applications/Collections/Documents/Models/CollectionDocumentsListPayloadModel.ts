import {
    ListFilterOptions,
    ListFilterPropertyComparisonOperator,
    ListPayload,
} from '../../../../../services/Applications/Collections/Documents/ListPayload';
import {CollectionOf, Enum, Required} from '@tsed/schema';
import ListPaginationModel from '../../../../shared-models/ListPaginationModel';

class CollectionDocumentsListFilterOptionsModel implements ListFilterOptions {
    @Required()
    @Enum(ListFilterPropertyComparisonOperator)
    operator: ListFilterPropertyComparisonOperator;

    @Required()
    value: string;

    @Required()
    @CollectionOf(() => CollectionDocumentsListFilterOptionsModel)
    and: CollectionDocumentsListFilterOptionsModel[];

    @Required()
    @CollectionOf(() => CollectionDocumentsListFilterOptionsModel)
    or: CollectionDocumentsListFilterOptionsModel[];
}

export default class CollectionDocumentsListPayloadModel implements ListPayload {
    filter: CollectionDocumentsListFilterOptionsModel | null;
    pagination: ListPaginationModel | null;
}
