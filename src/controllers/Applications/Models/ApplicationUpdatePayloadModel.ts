import {UpdatePayload} from '../../../services/Applications/UpdatePayload';
import {Required} from '@tsed/schema';

export default class ApplicationUpdatePayloadModel implements UpdatePayload {
    @Required()
    internalName: string;
}
