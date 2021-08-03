import {NotFound} from '@tsed/exceptions';
import {ApplicationAutomationFlowNodeType} from '../../../../entity/Applications/Automations/ApplicationAutomationFlowNode';

export default class UnknownAutomationNodeError extends NotFound {
    constructor(identifier: { applicationId: string; nodeType: ApplicationAutomationFlowNodeType }) {
        super(`Unknown Application Node: ${JSON.stringify(identifier)}`);
    }
}
