// @tsed/cli do not edit
import {ConnectionOptions} from 'typeorm';
import {getEnvVar} from '../../utils/env';
import User from '../../entity/Users/User';
import Application from '../../entity/Applications/Application';
import ApplicationAutomation from '../../entity/Applications/Automations/ApplicationAutomation';
import ApplicationAutomationFlowNode from '../../entity/Applications/Automations/ApplicationAutomationFlowNode';
import ApplicationAutomationFlowNodeConfigValue
    from '../../entity/Applications/Automations/ApplicationAutomationFlowNodeConfigValue';
import ApplicationAutomationFlowNodeLog from '../../entity/Applications/Automations/ApplicationAutomationFlowNodeLog';
import ApplicationCollection from '../../entity/Applications/Collections/ApplicationCollection';
import ApplicationCollectionColumn from '../../entity/Applications/Collections/ApplicationCollectionColumn';
import ApplicationCollectionDocument from '../../entity/Applications/Collections/ApplicationCollectionDocument';
import ApplicationCollectionDocumentAccessRule
    from '../../entity/Applications/Collections/ApplicationCollectionDocumentAccessRule';
import ApplicationCollectionDocumentProperty
    from '../../entity/Applications/Collections/ApplicationCollectionDocumentProperty';
import ApplicationConfiguration from '../../entity/Applications/Configuration/ApplicationConfiguration';
import ApplicationNotificationTemplate
    from '../../entity/Applications/Notifications/Templates/ApplicationNotificationTemplate';
import UserAuth from '../../entity/Users/UserAuth';
import UserNotificationSettings from '../../entity/Users/UserNotificationSettings';
import CronJob from '../../entity/CronJobs/CronJob';
import {rootDir} from '../rootDir';

const entities = [
    Application,
    ApplicationAutomation,
    ApplicationAutomationFlowNode,
    ApplicationAutomationFlowNodeConfigValue,
    ApplicationAutomationFlowNodeLog,
    ApplicationCollection,
    ApplicationCollectionColumn,
    ApplicationCollectionDocument,
    ApplicationCollectionDocumentAccessRule,
    ApplicationCollectionDocumentProperty,
    ApplicationConfiguration,
    ApplicationNotificationTemplate,
    CronJob,
    User,
    UserAuth,
    UserNotificationSettings,
];

export const typeormConfig: ConnectionOptions[] = [
    {
        name: 'default',
        type: 'postgres',
        host: getEnvVar('POSTGRES_HOST', 'string'),
        port: getEnvVar('POSTGRES_PORT', 'number', 5432),
        username: getEnvVar('POSTGRES_USERNAME', 'string'),
        password: getEnvVar('POSTGRES_PASSWORD', 'string'),
        database: getEnvVar('POSTGRES_DATABASE', 'string'),
        synchronize: false,
        logging: getEnvVar('TYPEORM_LOGGING', 'boolean', false),
        entities,
        migrations: [
            `${rootDir}/db-migrations/*.{js,ts}`,
        ],
        subscribers: [
            `${rootDir}/subscriber/**/*.{js,ts}`,
        ],
        cli: {
            entitiesDir: `src/entity`,
            migrationsDir: `src/db-migrations`,
            subscribersDir: `src/subscriber`,
        },
        cache: {
            duration: 2000,
        },
    },
] as ConnectionOptions[];
