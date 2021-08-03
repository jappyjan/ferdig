import {UnprocessableEntity} from '@tsed/exceptions';

export default class PropertyNotAnArrayError extends UnprocessableEntity {
    public constructor(internalName: string) {
        super(`Property '${internalName}' must be an array`);
    }
}
