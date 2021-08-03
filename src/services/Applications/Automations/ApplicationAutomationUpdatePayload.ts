import {ApplicationAutomationFlowNodeCreatePayload} from './ApplicationAutomationFlowNodeCreatePayload';

export interface ApplicationAutomationUpdatePayload {
    internalName: string;
    flowNodes: ApplicationAutomationFlowNodeCreatePayload[];
}
