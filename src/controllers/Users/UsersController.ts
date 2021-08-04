import {BodyParams, Controller, Delete, Get, PathParams, Post, QueryParams, Req, Res} from '@tsed/common';
import {Returns, Summary} from '@tsed/schema';
import {Authorize} from '@tsed/passport';
import UsersListResult from './models/UsersListResult';
import UsersListPayloadModel from './models/UsersListPayloadModel';
import UserVerifyEmailPayloadModel from './models/UserVerifyEmailPayloadModel';
import UsersService from '../../services/Users/UsersService';
import {CrudController} from '../CrudController';
import User from '../../entity/Users/User';
import {ListResult} from '../../services/shared-types/ListResult';
import UserModel from '../Auth/models/UserModel';

@Controller({
    path: '/users',
})
export default class UsersController implements CrudController<User> {
    private readonly usersService: UsersService;

    public constructor(usersService: UsersService) {
        this.usersService = usersService;
    }

    @Post()
    @Summary('Redirect to Signup Page')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public create(
        @Res() res: Res,
    ) {
        res.redirect('/auth/signup');
    }

    public update(): Promise<User> {
        // TODO: implement this
        throw new Error('Method not implemented.');
    }

    @Get('/:userId')
    @Summary('Get a User')
    @Returns(200, UserModel)
    @Authorize('jwt')
    public async getOne(
        @PathParams('userId') userId: string,
        @Req() req: Req,
    ): Promise<User> {
        const authenticatedUser = req.user as User ?? null;

        return await this.usersService.getOneByIdOrFail(
            authenticatedUser,
            userId,
        );
    }

    @Delete('/:userId')
    @Summary('Remove a User')
    @Returns(200, String).Examples('success')
    @Authorize('jwt')
    public async remove(
        @PathParams('userId') userId: string,
        @Req() req: Req,
    ): Promise<'success'> {
        const authenticatedUser = req.user as User ?? null;

        await this.usersService.remove(
            authenticatedUser,
            userId,
        );

        return 'success';
    }

    @Post('/list')
    @Summary('List and Filter Users')
    @Returns(200, UsersListResult)
    @Authorize('jwt')
    public async list(
        @QueryParams('applicationId') applicationId: string | undefined,
        @BodyParams() params: UsersListPayloadModel,
        @Req() {user: authenticatedUser}: Req,
    ): Promise<ListResult<User>> {
        return await this.usersService.list(
            (authenticatedUser as User) || null,
            applicationId ?? null,
            params,
        );
    }

    @Post('/:userId/verify-email')
    @Summary('Verify the email of a user')
    @Returns(200, String)
    public async verifyEmail(
        @PathParams('userId') userId: string,
        @BodyParams() params: UserVerifyEmailPayloadModel,
    ): Promise<'success'> {
        await this.usersService.verifyEmail(
            userId,
            params.token,
        );

        return 'success';
    }
}
