import {BodyParams, Controller, PathParams, Post, Req} from '@tsed/common';
import {Returns, Summary} from '@tsed/schema';
import {Authorize} from '@tsed/passport';
import User from '../../../entity/Users/User';
import UsersService from '../../../services/Users/UsersService';
import ApplicationUsersListResult from './models/ApplicationUsersListResult';
import ApplicationUsersListPayloadModel from './models/ApplicationUsersListPayloadModel';
import {CrudController} from '../../CrudController';
import UserModel from '../../Auth/models/UserModel';
import UserVerifyEmailPayloadModel from './models/UserVerifyEmailPayloadModel';

@Controller({
    path: '/:applicationId/users',
})
export default class ApplicationUsersController implements CrudController<UserModel> {
    private readonly usersService: UsersService;

    public constructor(usersService: UsersService) {
        this.usersService = usersService;
    }

    public create(): Promise<UserModel> {
        throw new Error('WRONG ROUTE TO CREATE A USER... Use /auth/signup route instead');
    }

    public update(): Promise<UserModel> {
        // TODO: implement this
        throw new Error('Method not implemented.');
    }

    public getOne(): Promise<UserModel> {
        // TODO: implement this
        throw new Error('Method not implemented.');
    }

    public remove(): Promise<'success'> {
        // TODO: implement this
        throw new Error('Method not implemented.');
    }

    @Post('/list')
    @Summary('List and Filter all Users of an Application')
    @Returns(200, ApplicationUsersListResult)
    @Authorize('jwt')
    public async list(
        @PathParams('applicationId') applicationId: string,
        @BodyParams() params: ApplicationUsersListPayloadModel,
        @Req() {user: authenticatedUser}: Req,
    ): Promise<ApplicationUsersListResult> {
        return await this.usersService.list(
            (authenticatedUser as User) || null,
            applicationId,
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
