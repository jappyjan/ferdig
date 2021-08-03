import {Forbidden} from '@tsed/exceptions';

export default class NoConsoleAccessError extends Forbidden {
    public constructor() {
        super(`You need to have console-access rights to perform this action`);
    }
}
