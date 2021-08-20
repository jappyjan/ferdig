import {Configuration, Inject} from '@tsed/di';
import {PlatformApplication, Req, Res} from '@tsed/common';
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
        "${rootDir}/middlewares/**/*.ts",
        "${rootDir}/services/**/*.ts",
        "${rootDir}/utils/**/*.ts",
    ]
})
export class Server {
    @Inject()
    app: PlatformApplication;

    @Configuration()
    settings: Configuration;

    // noinspection JSUnusedGlobalSymbols
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
