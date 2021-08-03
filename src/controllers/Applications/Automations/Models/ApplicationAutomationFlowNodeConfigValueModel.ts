import {Format, JsonFormatTypes, Required} from '@tsed/schema';
import ApplicationAutomationFlowNodeConfigValue
    from '../../../../entity/Applications/Automations/ApplicationAutomationFlowNodeConfigValue';

export default class ApplicationAutomationFlowNodeConfigValueModel implements Omit<ApplicationAutomationFlowNodeConfigValue, 'node'> {
    @Required()
    id: string;

    @Required()
    @Format(JsonFormatTypes.DATE_TIME)
    createdAt: Date;

    @Required()
    @Format(JsonFormatTypes.DATE_TIME)
    updatedAt: Date;

    @Required()
    key: string;

    @Required()
    value: string;
}
