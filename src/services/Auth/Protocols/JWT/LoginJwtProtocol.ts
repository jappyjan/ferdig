import {$log, Req} from '@tsed/common';
import {Arg, OnVerify, Protocol} from '@tsed/passport';
import {ExtractJwt, Strategy, StrategyOptions} from 'passport-jwt';
import User from '../../../../entity/Users/User';
import {getEnvVar} from '../../../../utils/env';
import WrongTokenError from './Errors/WrongTokenError';
import UsersService from '../../../Users/UsersService';

@Protocol<StrategyOptions>({
    name: 'jwt',
    useStrategy: Strategy,
    settings: {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: getEnvVar('AUTH_JWT_SECRET', 'string'),
    },
})
export class LoginJwtProtocol implements OnVerify {
    private readonly usersService: UsersService;

    constructor(usersService: UsersService) {
        this.usersService = usersService;
    }

    public async $onVerify(
        @Req() req: Req,
        @Arg(0) jwtPayload: { sub: string },
    ): Promise<User | false> {
        try {
            const userId = jwtPayload.sub;
            const user = await this.usersService.getOne({id: userId});

            req.user = user;
            return user;
        } catch (e) {
            $log.error('JWT Verification Error', e);
            throw new WrongTokenError();
        }
    }
}
