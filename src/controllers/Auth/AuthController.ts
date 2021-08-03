import {BodyParams, Controller, Get, HeaderParams, Post, Req} from '@tsed/common';
import {Authenticate, Authorize} from '@tsed/passport';
import {Returns} from '@tsed/schema';
import UserCreatePayload from './models/UserCreatePayload';
import UserModel from './models/UserModel';
import UserWithTokenModel from './models/UserWithTokenModel';

@Controller('/auth')
export default class AuthController {
    @Post('/signup')
    @Returns(201, UserModel)
    @Authenticate('local-signup')
    public signup(
        @Req() req: Req,
        // eslint-disable-next-line
        @BodyParams() user: UserCreatePayload,
    ): UserModel {
        // FACADE
        return req.user as UserModel;
    }

    @Post('/sessions')
    @Authenticate('local')
    @Returns(201, UserWithTokenModel)
    public startSession(
        @Req() req: Req,
        // eslint-disable-next-line
        @BodyParams('email') email: string,
        // eslint-disable-next-line
        @BodyParams('password') password: string,
    ): UserWithTokenModel {
        // FACADE
        return req.user as UserWithTokenModel;
    }

    @Get('/sessions/current')
    @Authorize('jwt')
    @Returns(200, UserModel)
    public getUserInfo(
        @Req() req: Req,
        // eslint-disable-next-line
        @HeaderParams('authorization') token: string,
    ): UserModel {
        // FACADE
        return req.user as UserModel;
    }

    /*
    @Get("/providers/:protocol")
    @Authorize(":protocol")
    @Returns(200, UserModel)
    public connectProtocol(@Req() req: Req): User {
        // FACADE
        return req.user as UserModel;
    }

    @Get("/providers/:protocol/callback")
    @Authorize(":protocol")
    @Returns(200, UserModel)
    connectProtocolCallback(@Req() req: Req): User {
        // FACADE
        return req.user as UserModel;
    }
     */
}
