import {UnprocessableEntity} from '@tsed/exceptions';

export default class TooManyFiltersError extends UnprocessableEntity {
    public constructor() {
        super('Too many Filters');
    }
}
