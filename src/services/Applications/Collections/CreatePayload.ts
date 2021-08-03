import {DocumentAccessRuleCreatePayload} from './DocumentAccessRuleCreatePayload';

export interface CreatePayload {
    internalName: string;
    readAccessRule: DocumentAccessRuleCreatePayload;
    writeAccessRule: DocumentAccessRuleCreatePayload;
}
