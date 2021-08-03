import {BodyParams, Constant, Req} from '@tsed/common';
import {OnVerify, Protocol} from '@tsed/passport';
import {IStrategyOptions, Strategy} from 'passport-local';
import LoginLocalCredentials from './LoginLocalCredentials';
import WrongCredentialsError from './Errors/WrongCredentialsError';
import User from '../../../../entity/Users/User';
import * as jwt from 'jsonwebtoken';
import UsersService from '../../../Users/UsersService';
import ApplicationAutomationsService from '../../../Applications/Automations/ApplicationAutomationsService';
import {ApplicationAutomationFlowNodeType} from '../../../../entity/Applications/Automations/ApplicationAutomationFlowNode';
import EmailNotVerifiedError from './Errors/EmailNotVerifiedError';

@Protocol<IStrategyOptions>({
    name: 'local',
    useStrategy: Strategy,
    settings: {
        usernameField: 'email',
        passwordField: 'password',
    },
})
export class LoginLocalProtocol implements OnVerify {
    @Constant('passport.protocols.jwt.settings')
    jwtSettings: {
        issuer?: string,
        audience?: string,
        secretOrKey: string,
        maxAge?: number
    };

    private readonly usersService: UsersService;
    private readonly automationsService: ApplicationAutomationsService;

    public constructor(
        usersService: UsersService,
        automationsService: ApplicationAutomationsService,
    ) {
        this.usersService = usersService;
        this.automationsService = automationsService;
    }

    public async $onVerify(
        @Req() request: Req,
        @BodyParams() credentials: LoginLocalCredentials,
    ): Promise<User & { token: string }> {
        const {email, password} = credentials;

        const user = await this.usersService.getOne({email});

        if (!user) {
            throw new WrongCredentialsError();
        }

        const passwordIsValid = await this.usersService.verifyPassword(user, password);
        if (!passwordIsValid) {
            throw new WrongCredentialsError();
        }

        if (user.application && user.application.configuration.loginRequiresValidEmail && !user.auth.emailVerified) {
            throw new EmailNotVerifiedError();
        }

        const {issuer, audience, secretOrKey, maxAge = 3600} = this.jwtSettings;
        const now = Date.now();

        const token = jwt.sign(
            {
                iss: issuer,
                aud: audience,
                sub: user.id,
                exp: now + maxAge * 1000,
                iat: now,
            },
            secretOrKey,
        );

        if (user.application) {
            this.automationsService.triggerAutomationEvent(
                {
                    applicationId: user.application.id,
                    nodeType: ApplicationAutomationFlowNodeType.Auth_Login,
                },
                {
                    id: user.id,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    email: user.email,
                    hasConsoleAccess: user.auth.hasConsoleAccess,
                    isDisabled: user.auth.isDisabled,
                    emailVerified: user.auth.emailVerified,
                    notificationSettings: user.notificationSettings,
                    application: user.application,
                },
            );
        }

        return {
            ...user,
            token,
        };
    }
}
