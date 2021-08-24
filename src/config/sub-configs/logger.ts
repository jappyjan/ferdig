import {$log, PlatformLoggerSettings} from '@tsed/common';
import {isProduction} from '../env';
import {getEnvVar} from '../../utils/env';
import {IAppenderConfiguration} from '@tsed/logger/lib/appenders/interfaces/AppenderConfiguration';

export const loggerAppenders = new Map<string, IAppenderConfiguration>();

if (isProduction) {
    loggerAppenders.set('stdout', {
        type: 'stdout',
        levels: ['info', 'debug', 'trace', 'fatal', 'error', 'warn'],
        layout: {
            type: 'json',

        },
    });

    /*
    loggerAppenders.set('stdout', {
        type: 'stdout',
        levels: ['info', 'debug'],
        layout: {
            type: 'json',

        },
    });

    loggerAppenders.set('stderr', {
        levels: ['trace', 'fatal', 'error', 'warn'],
        type: 'stderr',
        layout: {
            type: 'json',
        },
    });*/
}

loggerAppenders.forEach((appender, name) => {
    $log.appenders.set(name, appender);
});

export const loggerConfig: Partial<PlatformLoggerSettings> = {
    disableRoutesSummary: true,
    logRequest: false,
    level: getEnvVar('LOG_LEVEL', 'string', 'info') as PlatformLoggerSettings['level'],
};
