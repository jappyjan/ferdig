import {join} from 'path';
import '@tsed/typeorm';
import '@tsed/swagger';
import {loggerConfig, passportConfig, socketIoConfig, swaggerConfig, typeormConfig} from './sub-configs';
import {eventEmitterConfig} from './sub-configs/event-emitter';
import {agendaConfig} from './sub-configs/agenda';
import {emailConfig} from './sub-configs/email';

const {version} = require('../../package.json');
export const rootDir = join(__dirname, '..');

export const config: Partial<TsED.Configuration> = {
    version,
    rootDir,
    logger: loggerConfig,
    typeorm: typeormConfig,
    passport: passportConfig,
    swagger: swaggerConfig,
    socketIO: socketIoConfig,
    eventEmitter: eventEmitterConfig,
    agenda: agendaConfig,
    email: emailConfig,
    applications: {
        collections: {
            documents: {
                accessRules: {
                    cacheDuration: 5 * 60 * 1000,
                },
            },
        },
    },
};
