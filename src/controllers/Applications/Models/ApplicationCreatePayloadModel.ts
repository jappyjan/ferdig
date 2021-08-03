import {CreatePayload} from '../../../services/Applications/CreatePayload';
import {Required} from '@tsed/schema';

export default class ApplicationCreatePayloadModel implements CreatePayload {
    @Required()
    internalName: string;
}
