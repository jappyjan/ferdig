import {Required} from '@tsed/schema';
import {ApplicationAutomationFlowNodeConfigurationValueCreatePayload} from '../../../../services/Applications/Automations/ApplicationAutomationFlowNodeConfigurationValueCreatePayload';

export default class ApplicationAutomationFlowNodeConfigValueCreateModel implements ApplicationAutomationFlowNodeConfigurationValueCreatePayload {
    @Required()
    key: string;

    @Required()
    value: string;
}
