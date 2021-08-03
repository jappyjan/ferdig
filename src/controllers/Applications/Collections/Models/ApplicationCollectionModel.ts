import ApplicationCollection from '../../../../entity/Applications/Collections/ApplicationCollection';
import {Format, JsonFormatTypes, Required} from '@tsed/schema';
import ApplicationCollectionDocumentAccessRuleModel from './ApplicationCollectionDocumentAccessRuleModel';
import ApplicationCollectionColumnWithoutAccessRulesModel from './ApplicationCollectionColumnWithoutAccessRulesModel';

export default class ApplicationCollectionModel implements Partial<Omit<ApplicationCollection, 'readAccessRule' | 'writeAccessRule' | 'columns'>> {
    @Required()
    id: string;

    @Required()
    @Format(JsonFormatTypes.DATE_TIME)
    public createdAt: Date;

    @Required()
    @Format(JsonFormatTypes.DATE_TIME)
    public updatedAt: Date;

    @Required()
    public readAccessRule: ApplicationCollectionDocumentAccessRuleModel;

    @Required()
    public writeAccessRule: ApplicationCollectionDocumentAccessRuleModel;

    @Required()
    public internalName: string;

    @Required()
    public columns: ApplicationCollectionColumnWithoutAccessRulesModel[];
}
