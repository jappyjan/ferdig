import {Logger} from '@tsed/common';
import {validateAuthJwt} from './validate-auth-jwt';
import {Socket} from '@tsed/socketio';
import User from '../entity/Users/User';
import UsersService from '../services/Users/UsersService';

interface Props {
    logger: Logger;
    socket: Socket;
    usersService: UsersService;
}

export async function handleSocketAuth(props: Props): Promise<User> {
    const {logger, socket, usersService} = props;

    logger.info('socket connected', socket.id, socket.handshake.auth);

    const {sub: userId} = await validateAuthJwt(socket.handshake.auth.token as string);
    const user = await usersService.getOneWithoutAuthCheckOrFail({id: userId});

    logger.info('socket auth accepted');
    socket.emit('authorize:response', {
        state: 'success',
    });

    return user;
}
