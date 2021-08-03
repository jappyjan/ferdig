import ApplicationAutomation from '../../../../entity/Applications/Automations/ApplicationAutomation';
import ApplicationAutomationFlowNodeModel from './ApplicationAutomationFlowNodeModel';
import {CollectionOf, Format, JsonFormatTypes, Required} from '@tsed/schema';

export default class ApplicationAutomationModel implements Partial<Omit<ApplicationAutomation, 'flowNodes'>> {
    @Required()
    id: string;

    @Required()
    @Format(JsonFormatTypes.DATE_TIME)
    createdAt: Date;

    @Required()
    @Format(JsonFormatTypes.DATE_TIME)
    updatedAt: Date;

    @Required()
    internalName: string;

    @Required()
    @CollectionOf(ApplicationAutomationFlowNodeModel)
    flowNodes: ApplicationAutomationFlowNodeModel[];
}
