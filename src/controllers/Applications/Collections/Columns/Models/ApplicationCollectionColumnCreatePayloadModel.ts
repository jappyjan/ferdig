import {ColumnCreatePayload} from '../../../../../services/Applications/Collections/ColumnCreatePayload';
import ApplicationCollectionDocumentAccessRuleCreateModel
    from '../../Models/ApplicationCollectionDocumentAccessRuleCreateModel';
import {Required} from '@tsed/schema';

// WILLDO: remove valueType from emit when enum issue https://github.com/tsedio/tsed/issues/1446 is resolved
export default class ApplicationCollectionColumnCreatePayloadModel implements Omit<ColumnCreatePayload, 'valueType'> {
    @Required()
    internalName: string;

    @Required()
    isArray: boolean;

    // WILLDO: replace when enum issue https://github.com/tsedio/tsed/issues/1446 is resolved
    // @Enum(ApplicationCollectionColumnValueType)
    // valueType: ApplicationCollectionColumnValueType;
    @Required()
    valueType: string;

    @Required()
    readAccessRule: ApplicationCollectionDocumentAccessRuleCreateModel;

    @Required()
    writeAccessRule: ApplicationCollectionDocumentAccessRuleCreateModel;
}
