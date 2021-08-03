import {ApplicationAutomationFlowNodeCreatePayload} from '../../../../services/Applications/Automations/ApplicationAutomationFlowNodeCreatePayload';
import {ApplicationAutomationFlowNodeType} from '../../../../entity/Applications/Automations/ApplicationAutomationFlowNode';
import {CollectionOf, Enum, Nullable, Required} from '@tsed/schema';
import ApplicationAutomationFlowNodeConfigValueCreateModel from './ApplicationAutomationFlowNodeConfigValueCreateModel';

export default class ApplicationAutomationFlowNodeCreateModel implements ApplicationAutomationFlowNodeCreatePayload {
    @Required()
    id: string;

    @Required()
    @Nullable(String)
    parentId: string | null;

    @Required()
    @Enum(ApplicationAutomationFlowNodeType)
    type: ApplicationAutomationFlowNodeType;

    @Required()
    @CollectionOf(ApplicationAutomationFlowNodeConfigValueCreateModel)
    configValues: ApplicationAutomationFlowNodeConfigValueCreateModel[];
}
