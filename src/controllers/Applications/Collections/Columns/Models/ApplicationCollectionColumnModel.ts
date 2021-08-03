import ApplicationCollectionColumn from '../../../../../entity/Applications/Collections/ApplicationCollectionColumn';
import ApplicationCollectionDocumentAccessRuleModel from '../../Models/ApplicationCollectionDocumentAccessRuleModel';
import {Format, JsonFormatTypes, Required} from '@tsed/schema';

// WILLDO: remove valueType from emit when enum issue https://github.com/tsedio/tsed/issues/1446 is resolved
export default class ApplicationCollectionColumnModel implements Partial<Omit<ApplicationCollectionColumn, 'readAccessRule' | 'writeAccessRule' | 'valueType'>> {
    @Required()
    id: string;

    @Required()
    @Format(JsonFormatTypes.DATE_TIME)
    createdAt: Date;

    @Required()
    @Format(JsonFormatTypes.DATE_TIME)
    updatedAt: Date;

    @Required()
    internalName: string;

    // WILLDO: replace when tsed issue with enums https://github.com/tsedio/tsed/issues/1446 is resolved
    // @Enum(ApplicationCollectionColumnValueType)
    // valueType: ApplicationCollectionColumnValueType;
    @Required()
    valueType: string;

    @Required()
    isArray: boolean;

    @Required()
    readAccessRule: ApplicationCollectionDocumentAccessRuleModel;

    @Required()
    writeAccessRule: ApplicationCollectionDocumentAccessRuleModel;

}
