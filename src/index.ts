import {$log} from '@tsed/common';
import {PlatformExpress} from '@tsed/platform-express';
import {Server} from './Server';

async function bootstrap() {
    try {
        $log.info('Start server...');
        const platform = await PlatformExpress.bootstrap(Server);

        await platform.listen();
        $log.info('Server initialized');
    } catch (er) {
        $log.fatal('Server bootstrap failed', er);
    }
}

bootstrap().then(() => $log.info('Server initialization finished!'));
