import {$log} from '@tsed/common';
import {PlatformExpress} from '@tsed/platform-express';
import {Server} from './Server';

async function bootstrap() {
    try {
        $log.info('Start server...');
        const platform = await PlatformExpress.bootstrap(Server);

        await platform.listen();
        $log.info('Server initialized');
    } catch (e) {
        $log.fatal('Server bootstrap failed');
        $log.fatal(e.message);
    }
}

bootstrap().then(() => $log.info('Server initialization finished!'));
