import {ApplicationCollectionColumnValueType} from '../../../entity/Applications/Collections/ApplicationCollectionColumn';
import {DocumentAccessRuleCreatePayload} from './DocumentAccessRuleCreatePayload';

export interface ColumnCreatePayload {
    internalName: string;
    valueType: ApplicationCollectionColumnValueType;
    isArray: boolean;
    writeAccessRule: DocumentAccessRuleCreatePayload;
    readAccessRule: DocumentAccessRuleCreatePayload;
}
