import {CollectionOf, Enum, Required} from '@tsed/schema';
import {CollectionDocumentsAccessRuleComparisonOperator} from '../../../../entity/Applications/Collections/ApplicationCollectionDocumentAccessRule';

export default class ApplicationCollectionDocumentAccessRuleCreateModel {
    @Required()
    public leftSide: string;

    @Required()
    @Enum(CollectionDocumentsAccessRuleComparisonOperator)
    public operator: CollectionDocumentsAccessRuleComparisonOperator;

    @Required()
    public rightSide: string;

    @CollectionOf(() => ApplicationCollectionDocumentAccessRuleCreateModel)
    public and: ApplicationCollectionDocumentAccessRuleCreateModel[];

    @CollectionOf(() => ApplicationCollectionDocumentAccessRuleCreateModel)
    public or: ApplicationCollectionDocumentAccessRuleCreateModel[];
}
