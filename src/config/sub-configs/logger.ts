import {$log, PlatformLoggerSettings} from '@tsed/common';
import {isProduction} from '../env';
import {getEnvVar} from '../../utils/env';

if (isProduction) {
    $log.appenders.set('stdout', {
        type: 'stdout',
        levels: ['info', 'debug'],
        layout: {
            type: 'json',
        },
    });

    $log.appenders.set('stderr', {
        levels: ['trace', 'fatal', 'error', 'warn'],
        type: 'stderr',
        layout: {
            type: 'json',
        },
    });
}

export const loggerConfig: Partial<PlatformLoggerSettings> = {
    disableRoutesSummary: true,
    logRequest: false,
    level: getEnvVar('LOG_LEVEL', 'string', 'info') as PlatformLoggerSettings['level'],
};
