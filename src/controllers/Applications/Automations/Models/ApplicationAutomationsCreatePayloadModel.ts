import {Required} from '@tsed/schema';
import {ApplicationAutomationCreatePayload} from '../../../../services/Applications/Automations/ApplicationAutomationCreatePayload';

export default class ApplicationAutomationsCreatePayloadModel implements ApplicationAutomationCreatePayload {
    @Required()
    internalName: string;
}
