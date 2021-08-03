import {NotFound} from '@tsed/exceptions';
import {ApplicationAutomationIdentifier} from '../ApplicationAutomationsService';

export default class UnknownAutomationError extends NotFound {
    constructor(identifier: ApplicationAutomationIdentifier) {
        super(`Unknown Application Automation: ${JSON.stringify(identifier)}`);
    }
}
