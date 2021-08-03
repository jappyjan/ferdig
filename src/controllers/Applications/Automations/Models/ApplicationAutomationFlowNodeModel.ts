import {CollectionOf, Format, JsonFormatTypes, Required} from '@tsed/schema';
import ApplicationAutomationFlowNode from '../../../../entity/Applications/Automations/ApplicationAutomationFlowNode';
import ApplicationAutomationFlowNodeConfigValueModel from './ApplicationAutomationFlowNodeConfigValueModel';

export default class ApplicationAutomationFlowNodeModel implements Partial<Omit<ApplicationAutomationFlowNode, 'type' | 'configValues' | 'logs'>> {
    @Required()
    id: string;

    @Required()
    @Format(JsonFormatTypes.DATE_TIME)
    createdAt: Date;

    @Required()
    @Format(JsonFormatTypes.DATE_TIME)
    updatedAt: Date;

    @Required()
    parentId: string;

    @Required()
        // @Enum(ApplicationAutomationFlowNodeType)
    type: string;

    @Required()
    @CollectionOf(ApplicationAutomationFlowNodeConfigValueModel)
    configValues: ApplicationAutomationFlowNodeConfigValueModel[];
}
