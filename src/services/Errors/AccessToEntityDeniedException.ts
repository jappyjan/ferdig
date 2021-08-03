import {Forbidden} from '@tsed/exceptions';

export default class AccessToEntityDeniedException extends Forbidden {
    public constructor() {
        super("Access Denied: Missing Permissions");
    }
}
