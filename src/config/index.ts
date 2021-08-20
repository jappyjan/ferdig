import {join} from 'path';
import '@tsed/typeorm';
import '@tsed/swagger';
import {loggerConfig, passportConfig, socketIoConfig, swaggerConfig, typeormConfig} from './sub-configs';
import {eventEmitterConfig} from './sub-configs/event-emitter';
import {agendaConfig} from './sub-configs/agenda';
import {fileBucketConfig} from './sub-configs/fileBucket';
import {emailConfig} from './sub-configs/email';
import {multerConfig} from './sub-configs/multerConfig';

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
    fileBucket: fileBucketConfig,
    email: emailConfig,
    multer: multerConfig,
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
