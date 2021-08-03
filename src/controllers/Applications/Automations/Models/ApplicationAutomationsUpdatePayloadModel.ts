import {Required} from '@tsed/schema';
import {ApplicationAutomationUpdatePayload} from '../../../../services/Applications/Automations/ApplicationAutomationUpdatePayload';
import ApplicationAutomationFlowNodeCreateModel from './ApplicationAutomationFlowNodeCreateModel';

export default class ApplicationAutomationsUpdatePayloadModel implements ApplicationAutomationUpdatePayload {
    @Required()
    internalName: string;

    @Required()
    flowNodes: ApplicationAutomationFlowNodeCreateModel[];
}
