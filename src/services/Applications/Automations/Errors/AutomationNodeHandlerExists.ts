import {ApplicationAutomationFlowNodeType} from '../../../../entity/Applications/Automations/ApplicationAutomationFlowNode';

export default class AutomationNodeHandlerExists extends Error {
    public constructor(nodeType: ApplicationAutomationFlowNodeType) {
        super(`A handler for automation-node of type ${nodeType} is already registered`);
    }
}
