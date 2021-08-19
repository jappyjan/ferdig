// @tsed/cli do not edit
import {ConnectionOptions} from 'typeorm';
import {getEnvVar} from '../../utils/env';
import {rootDir} from '../index';

export const typeormConfig: ConnectionOptions[] = [
    {
        name: 'default',
        type: 'postgres',
        host: getEnvVar('POSTGRES_HOST', 'string'),
        port: getEnvVar('POSTGRES_PORT', 'number', 5432),
        username: getEnvVar('POSTGRES_USERNAME', 'string'),
        password: getEnvVar('POSTGRES_PASSWORD', 'string'),
        database: getEnvVar('POSTGRES_DATABASE', 'string'),
        synchronize: getEnvVar('TYPEORM_SYNCHRONIZE', 'boolean', false),
        logging: getEnvVar('TYPEORM_LOGGING', 'boolean', false),
        entities: [
            `${rootDir}/entity/**/*.{js,ts}`,
        ],
        migrations: [
            `db-migrations/**/*.{js,ts}`,
        ],
        subscribers: [
            `${rootDir}/subscriber/**/*.{js,ts}`,
        ],
        cli: {
            entitiesDir: `${rootDir}/entity`,
            migrationsDir: `db-migrations`,
            subscribersDir: `${rootDir}/subscriber`,
        },
        cache: {
            duration: 2000,
        },
    },
] as ConnectionOptions[];
