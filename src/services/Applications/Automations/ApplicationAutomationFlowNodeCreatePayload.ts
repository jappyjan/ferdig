import {ApplicationAutomationFlowNodeType} from '../../../entity/Applications/Automations/ApplicationAutomationFlowNode';
import {ApplicationAutomationFlowNodeConfigurationValueCreatePayload} from './ApplicationAutomationFlowNodeConfigurationValueCreatePayload';

export interface ApplicationAutomationFlowNodeCreatePayload {
    id: string;
    parentId: string | null;
    type: ApplicationAutomationFlowNodeType;
    configValues: ApplicationAutomationFlowNodeConfigurationValueCreatePayload[];
}
