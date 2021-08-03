import {Nullable} from '@tsed/schema';
import ApplicationCollectionDocumentAccessRuleCreateModel from './ApplicationCollectionDocumentAccessRuleCreateModel';
import {UpdatePayload} from '../../../../services/Applications/Collections/UpdatePayload';

export default class ApplicationCollectionsUpdatePayloadModel implements UpdatePayload {
    @Nullable(String)
    internalName: string;

    @Nullable(ApplicationCollectionDocumentAccessRuleCreateModel)
    readAccessRule: ApplicationCollectionDocumentAccessRuleCreateModel;

    @Nullable(ApplicationCollectionDocumentAccessRuleCreateModel)
    writeAccessRule: ApplicationCollectionDocumentAccessRuleCreateModel;
}
