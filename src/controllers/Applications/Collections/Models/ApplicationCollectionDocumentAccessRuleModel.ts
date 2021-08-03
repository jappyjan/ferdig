import ApplicationCollectionDocumentAccessRule
    from '../../../../entity/Applications/Collections/ApplicationCollectionDocumentAccessRule';
import {CollectionOf, Format, JsonFormatTypes, Required} from '@tsed/schema';

// WILLDO: remove 'operator' from omit when https://github.com/tsedio/tsed/issues/1446 resolved
export default class ApplicationCollectionDocumentAccessRuleModel implements Partial<Omit<ApplicationCollectionDocumentAccessRule, 'and' | 'or' | 'operator'>> {
    @Required()
    id: string;

    @Required()
    @Format(JsonFormatTypes.DATE_TIME)
    createdAt: Date;

    @Required()
    @Format(JsonFormatTypes.DATE_TIME)
    updatedAt: Date;

    @Required()
    leftSide: string;

    // WILLDO: wait for issue resolve: https://github.com/tsedio/tsed/issues/1446
    @Required()
    operator: string
    // @Enum(CollectionDocumentsAccessRuleComparisonOperator)
    // operator: CollectionDocumentsAccessRuleComparisonOperator;

    @Required()
    rightSide: string;

    @Required()
    @CollectionOf(Object)
    and: ApplicationCollectionDocumentAccessRuleModel[];

    @Required()
    @CollectionOf(Object)
    or: ApplicationCollectionDocumentAccessRuleModel[];
}
