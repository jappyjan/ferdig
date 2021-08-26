import {Logger} from '@tsed/logger';
import {auth} from './auth';
import {Socket} from '@tsed/socketio';
import User from '../entity/Users/User';
import UsersService from '../services/Users/UsersService';

interface Props {
    logger: Logger;
    socket: Socket;
    usersService: UsersService;
}

export async function handleSocketAuth(props: Props): Promise<User | null> {
    const {logger, socket, usersService} = props;

    try {
        logger.info('socket connected', socket.id, socket.handshake.auth);

        const {sub: userId} = await auth(socket.handshake.auth.token as string);
        const user = await usersService.getOneWithoutAuthCheckOrFail({id: userId});

        logger.info('socket auth accepted');
        socket.emit('authorize:response', {
            state: 'success',
        });

        return user;
    } catch (e) {
        logger.fatal(e);
        socket.emit('error', e);

        return  null;
    }
}
