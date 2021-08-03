import {Required} from '@tsed/schema';
import ApplicationCollectionDocumentAccessRuleCreateModel from './ApplicationCollectionDocumentAccessRuleCreateModel';
import {CreatePayload} from '../../../../services/Applications/Collections/CreatePayload';

export default class ApplicationCollectionsCreatePayloadModel implements CreatePayload {
    @Required()
    internalName: string;

    @Required()
    readAccessRule: ApplicationCollectionDocumentAccessRuleCreateModel;

    @Required()
    writeAccessRule: ApplicationCollectionDocumentAccessRuleCreateModel;
}
