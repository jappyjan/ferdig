import {ConstructorOptions as EventEmitterOptions} from 'eventemitter2';

export const eventEmitterConfig: EventEmitterOptions & { enabled: boolean } = {
    enabled: true,
    wildcard: true,
    verboseMemoryLeak: true,
};
