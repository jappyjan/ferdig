import SocketIO from 'socket.io';
import {createAdapter} from '@socket.io/redis-adapter';
import {RedisClient} from 'redis';
import {getEnvVar} from '../../utils/env';

const socketIoConfig: Partial<SocketIO.ServerOptions> = {
    path: '/socket.io',
    serveClient: true,
    cors: {
        origin: '*'
    }
};

const redisHost = getEnvVar('REDIS_HOST', 'string', '');
if (redisHost) {
    const pubClient = new RedisClient({host: 'localhost', port: 6379});
    const subClient = pubClient.duplicate();

    socketIoConfig.adapter = createAdapter(pubClient, subClient);
}

export {
    socketIoConfig,
}
