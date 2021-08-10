import {Logger} from '@tsed/common';
import {loggerAppenders} from '../config/sub-configs';

export function makeLogger(name: string): Logger {
    const logger = new Logger(name);

    loggerAppenders.forEach((appender, name) => {
        logger.appenders.set(name, appender);
    });

    return logger;
}
