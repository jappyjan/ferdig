import {BodyParams, Req} from '@tsed/common';
import {OnVerify, Protocol} from '@tsed/passport';
import {Strategy} from 'passport-local';
import User from '../../../../../entity/Users/User';
import EmailAlreadyRegisteredError from './Errors/EmailAlreadyRegisteredError';
import UsersService from '../../../../Users/UsersService';
import {CreatePayload} from '../../../../Users/CreatePayload';
import ApplicationsService from '../../../../Applications/ApplicationsService';

type SignupData = Omit<CreatePayload, 'application'> & { applicationId: string };

@Protocol({
    name: 'local-signup',
    useStrategy: Strategy,
    settings: {
        usernameField: 'email',
        passwordField: 'password',
    },
})
export class LoginLocalSignupProtocol implements OnVerify {
    private readonly usersService: UsersService;
    private readonly applicationsService: ApplicationsService;

    constructor(
        usersService: UsersService,
        applicationsService: ApplicationsService,
    ) {
        this.usersService = usersService;
        this.applicationsService = applicationsService;
    }

    public async $onVerify(@Req() request: Req, @BodyParams() userData: SignupData): Promise<User> {
        const {email} = userData;
        const found = await this.usersService.getOneWithoutAuthCheck({email});

        if (found) {
            throw new EmailAlreadyRegisteredError();
        }

        const application = await this.applicationsService.getApplicationById(userData.applicationId);

        return await this.usersService.createUser(null, {
            email: userData.email,
            password: userData.password,
            application,
        });
    }
}
