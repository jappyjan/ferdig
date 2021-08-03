import {NotFound} from '@tsed/exceptions';

export default class ApplicationNotFoundError extends NotFound {
    public constructor(id: string) {
        super(`Application with ID ${id} does not exist`);
    }
}
