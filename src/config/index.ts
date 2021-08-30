import '@tsed/typeorm';
import '@tsed/swagger';
import {loggerConfig, passportConfig, socketIoConfig, swaggerConfig, typeormConfig} from './sub-configs';
import {eventEmitterConfig} from './sub-configs/event-emitter';
import {filesConfig} from './sub-configs/files';
import {multerConfig} from './sub-configs/multer';
import {rootDir} from './rootDir';

const {version} = require('../../package.json');

export const config: Partial<TsED.Configuration> = {
    version,
    rootDir,
    logger: loggerConfig,
    typeorm: typeormConfig,
    passport: passportConfig,
    swagger: swaggerConfig,
    socketIO: socketIoConfig,
    eventEmitter: eventEmitterConfig,
    fileBucket: filesConfig,
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
