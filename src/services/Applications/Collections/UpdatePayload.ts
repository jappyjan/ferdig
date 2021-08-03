import {DocumentAccessRuleCreatePayload} from './DocumentAccessRuleCreatePayload';

export interface UpdatePayload {
    internalName: string;
    readAccessRule: DocumentAccessRuleCreatePayload;
    writeAccessRule: DocumentAccessRuleCreatePayload;
}
