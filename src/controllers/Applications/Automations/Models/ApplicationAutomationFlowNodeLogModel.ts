import {Format, JsonFormatTypes, Required} from '@tsed/schema';
import ApplicationAutomationFlowNodeLog
    from '../../../../entity/Applications/Automations/ApplicationAutomationFlowNodeLog';

export default class ApplicationAutomationFlowNodeLogModel implements Omit<ApplicationAutomationFlowNodeLog, 'node' | 'level'> {
    @Required()
    id: string;

    @Required()
    @Format(JsonFormatTypes.DATE_TIME)
    createdAt: Date;

    @Required()
    @Format(JsonFormatTypes.DATE_TIME)
    updatedAt: Date;

    @Required()
    level: string;

    @Required()
    message: string;

    @Required()
    receivedPayload: string;
}
