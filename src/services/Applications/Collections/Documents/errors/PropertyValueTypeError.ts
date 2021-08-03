import {UnprocessableEntity} from '@tsed/exceptions';

export default class PropertyValueTypeError extends UnprocessableEntity {
    public constructor(columnName: string, value: unknown, expectedType: string) {
        super(`Type mismatch for column "${columnName}" with value "${value}". value is not of type ${expectedType}`);
    }
}
