import {$log, Req} from '@tsed/common';
import {Arg, OnVerify, Protocol} from '@tsed/passport';
import {ExtractJwt, Strategy, StrategyOptions} from 'passport-jwt';
import {getEnvVar} from '../../../../utils/env';
import WrongTokenError from './Errors/WrongTokenError';
import UsersService from '../../../Users/UsersService';

@Protocol<StrategyOptions>({
    name: 'jwt',
    useStrategy: Strategy,
    settings: {
        jwtFromRequest: req => {
            const authHeader = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
            const authQuery = ExtractJwt.fromUrlQueryParameter('auth')(req);

            return authHeader ?? authQuery;
        },
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
    ): Promise<Express.User | boolean> {
        try {
            const userId = jwtPayload.sub;

            let user: Express.User | false = {id: 'anonymous'};
            if (userId !== 'anonymous') {
                user = await this.usersService.getOneWithoutAuthCheck({id: userId});
            }

            req.user = user;
            return user;
        } catch (e) {
            $log.error('JWT Verification Error', e);
            throw new WrongTokenError();
        }
    }
}
