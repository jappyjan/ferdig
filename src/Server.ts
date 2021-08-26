import {Configuration, Inject} from '@tsed/di';
import {$log, BeforeInit, BeforeRoutesInit, PlatformApplication, Req, Res} from '@tsed/common';
import '@tsed/platform-express'; // /!\ keep this import
import bodyParser from 'body-parser';
import compress from 'compression';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import cors from 'cors';
import '@tsed/ajv';
import '@tsed/async-hook-context';
import {config, rootDir} from './config';
import {join} from 'path';
import {DEFAULT_DB_CONNECTION} from './services/providers/defaultDBConnection';

const uiPath = `${rootDir}/../public/admin-ui`;

@Configuration({
    ...config,
    acceptMimes: ['application/json'],
    httpPort: process.env.PORT || 8083,
    httpsPort: false, // CHANGE
    mount: {
        '/api': [
            `${rootDir}/controllers/**/*.ts`,
        ],
    },
    exclude: [
        '**/*.spec.ts',
    ],
    statics: {
        '/console': [uiPath],
    },
    componentsScan: [
        '${rootDir}/middlewares/**/*.ts',
        '${rootDir}/services/**/*.ts',
        '${rootDir}/utils/**/*.ts',
    ],
})
export class Server implements BeforeInit, BeforeRoutesInit {
    @Inject()
    app: PlatformApplication;

    @Inject(DEFAULT_DB_CONNECTION)
    orm: Promise<DEFAULT_DB_CONNECTION>;

    @Configuration()
    settings: Configuration;

    async $beforeInit(): Promise<void> {
        const orm = await this.orm;
        if (!orm.isConnected) {
            await orm.connect();
        }

        $log.info('running DB Migrations...');
        const executedMigrations = await orm.runMigrations({
            transaction: 'each',
        });
        $log.info(`Executed Migrations(${executedMigrations.length}): ${executedMigrations.map(m => m.name).join(', ')}`);
    }

    $beforeRoutesInit(): void {
        this.app
            .use(cors())
            .use(cookieParser())
            .use(compress({}))
            .use(methodOverride())
            .use(bodyParser.json())
            .use(bodyParser.urlencoded({
                extended: true,
            }));
    }

    // noinspection JSUnusedGlobalSymbols
    $afterRoutesInit(): void {
        this.app.get(`/`, (req: Req, res: Res) => {
            res.redirect('/console')
        });
        this.app.get(`/console/*`, (req: Req, res: Res) => {
            res.sendFile(join(uiPath, 'index.html'));
        });
    }
}
