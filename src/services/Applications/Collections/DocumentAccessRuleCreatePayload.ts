import {CollectionDocumentsAccessRuleComparisonOperator} from '../../../entity/Applications/Collections/ApplicationCollectionDocumentAccessRule';

export interface DocumentAccessRuleCreatePayload {
    leftSide: string;
    operator: CollectionDocumentsAccessRuleComparisonOperator;
    rightSide: string;
    and: DocumentAccessRuleCreatePayload[];
    or: DocumentAccessRuleCreatePayload[];
}
