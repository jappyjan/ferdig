import {BodyParams, Req} from '@tsed/common';
import {OnVerify, Protocol} from '@tsed/passport';
import {Strategy} from 'passport-local';
import User from '../../../../../entity/Users/User';
import EmailAlreadyRegisteredError from './Errors/EmailAlreadyRegisteredError';
import UsersService from '../../../../Users/UsersService';
import {CreatePayload} from '../../../../Users/CreatePayload';

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

    constructor(usersService: UsersService) {
        this.usersService = usersService;
    }

    public async $onVerify(@Req() request: Req, @BodyParams() userData: CreatePayload): Promise<User> {
        const {email} = userData;
        const found = await this.usersService.getOne({email});

        if (found) {
            throw new EmailAlreadyRegisteredError();
        }

        return await this.usersService.createUser(null, userData);
    }
}
