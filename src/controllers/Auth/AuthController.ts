import {BodyParams, Constant, Controller, Get, HeaderParams, Post, Req} from '@tsed/common';
import {Authenticate, Authorize} from '@tsed/passport';
import {Returns} from '@tsed/schema';
import UserCreatePayload from './models/UserCreatePayload';
import UserModel from './models/UserModel';
import UserWithTokenModel from './models/UserWithTokenModel';
import * as jwt from 'jsonwebtoken';
import {getUserFromRequest} from '../../utils/auth';
import User from '../../entity/Users/User';

@Controller('/auth')
export default class AuthController {
    @Constant('passport.protocols.jwt.settings')
    jwtSettings: {
        issuer?: string,
        audience?: string,
        secretOrKey: string,
        maxAge?: number
    };

    @Post('/signup')
    @Returns(201, UserModel)
    @Authenticate('local-signup')
    public signup(
        @Req() req: Req,
        // eslint-disable-next-line
        @BodyParams() user: UserCreatePayload,
    ): User {
        // FACADE
        return getUserFromRequest(req) as User;
    }

    @Post('/sessions/local')
    @Authenticate('local')
    @Returns(201, UserWithTokenModel)
    public startLocalSession(
        @Req() req: Req,
        // eslint-disable-next-line
        @BodyParams('email') email: string,
        // eslint-disable-next-line
        @BodyParams('password') password: string,
    ): User | null {
        // FACADE
        return getUserFromRequest(req);
    }

    @Post('/sessions/anonymous')
    @Authenticate('anonymous')
    @Returns(201)
    public startAnonymousSession(
        @Req() req: Req,
    ): { token: string, anonymous: true } {
        const {issuer, audience, secretOrKey, maxAge = 3600} = this.jwtSettings;
        const now = Date.now();

        const token = jwt.sign(
            {
                iss: issuer,
                aud: audience,
                sub: 'anonymous',
                exp: now + maxAge * 1000,
                iat: now,
            },
            secretOrKey,
        );

        return {
            token,
            anonymous: true,
        };
    }

    @Get('/sessions/current')
    @Authorize('jwt')
    @Returns(200, UserModel)
    public getUserInfo(
        @Req() req: Req,
        // eslint-disable-next-line
        @HeaderParams('authorization') token: string,
    ): User | null {
        // FACADE
        return getUserFromRequest(req);
    }
}
