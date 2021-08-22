import {Inject, Service} from '@tsed/di';
import User from '../../entity/Users/User';
import {DEFAULT_DB_CONNECTION} from '../shared-providers/defaultDBConnection';
import {hashPassword, verifyPassword} from '../../utils/password';
import NoConsoleAccessError from '../Auth/errors/NoConsoleAccessError';
import {ListResult} from '../shared-types/ListResult';
import {CreatePayload} from './CreatePayload';
import {ListPayload} from './ListPayload';
import ApplicationAutomationsService from '../Applications/Automations/ApplicationAutomationsService';
import UnknownUserError from './Errors/UnknownUserError';
import {ApplicationAutomationFlowNodeType} from '../../entity/Applications/Automations/ApplicationAutomationFlowNode';
import UserAuth from '../../entity/Users/UserAuth';
import {randomBytes} from 'crypto';
import {EntityManager, QueryRunner} from 'typeorm';
import {runInTransaction} from '../../utils/typeorm.utils';
import InvalidEmailValidationToken from './Errors/InvalidEmailValidationToken';
import UserNotificationSettings from '../../entity/Users/UserNotificationSettings';

export interface UserIdentifier {
    id: string;
    applicationId: string;
    email: string;
}

@Service()
export default class UsersService {
    private readonly orm: DEFAULT_DB_CONNECTION;
    private readonly automationsService: ApplicationAutomationsService;

    public constructor(
        @Inject(DEFAULT_DB_CONNECTION) orm: DEFAULT_DB_CONNECTION,
        automationsService: ApplicationAutomationsService,
    ) {
        this.orm = orm;
        this.automationsService = automationsService;
    }

    // noinspection JSMethodCanBeStatic
    private getBaseQuery(manager: EntityManager) {
        return manager.getRepository(User)
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.auth', 'auth')
            .leftJoinAndSelect('user.application', 'application')
            .leftJoinAndSelect('application.configuration', 'applicationConfiguration');
    }

    public async getOneByIdOrFail(
        authenticatedUser: User | null,
        userId: string,
    ): Promise<User> {
        if (!authenticatedUser?.auth.hasConsoleAccess && authenticatedUser?.id !== userId) {
            throw new NoConsoleAccessError();
        }

        return await this.getOneWithoutAuthCheckOrFail(
            {id: userId},
            false,
        );
    }

    public async getOneWithoutAuthCheck(
        identifier: Partial<UserIdentifier>,
        includeDisabled = false,
        injectedRunner?: QueryRunner,
    ): Promise<User | false> {
        const manager = injectedRunner ? injectedRunner.manager : this.orm.manager;

        const userQuery = this.getBaseQuery(manager);

        Object.keys(identifier).forEach((userIdentifierPropertyKey, indexOfProperty) => {
            const whereFunc = indexOfProperty === 0 ? userQuery.where.bind(userQuery) : userQuery.andWhere.bind(userQuery);

            whereFunc(`user.${userIdentifierPropertyKey} = :${userIdentifierPropertyKey}`);
        });
        userQuery.setParameters(identifier);

        if (!includeDisabled) {
            userQuery.andWhere('auth.isDisabled = FALSE');
        }

        const user = await userQuery.getOne();
        return user || false;
    }

    public async getOneWithoutAuthCheckOrFail(
        identifier: Partial<UserIdentifier>,
        includeDisabled = false,
        injectedRunner?: QueryRunner,
    ): Promise<User> {
        const user = await this.getOneWithoutAuthCheck(identifier, includeDisabled, injectedRunner);

        if (!user) {
            throw new UnknownUserError(identifier);
        }

        return user;
    }

    public async verifyPassword(user: User, password: string): Promise<boolean> {
        return await verifyPassword(user.auth.passwordHash, password);
    }

    public async createUser(
        authenticatedUser: User | null,
        data: CreatePayload,
        injectedRunner?: QueryRunner,
    ): Promise<User> {
        let runner = injectedRunner;
        if (!runner) {
            runner = this.orm.createQueryRunner();
            await runner.connect();
            await runner.startTransaction();
        }

        return await runInTransaction(
            'UsersService::createUser',
            {runner, isInjectedRunner: Boolean(injectedRunner)},
            ({runner: runnerInTransaction}) => {
                return this.createUserWithRunner(
                    authenticatedUser,
                    data,
                    runnerInTransaction,
                );
            },
        );
    }

    private async createUserWithRunner(
        authenticatedUser: User | null,
        data: CreatePayload,
        runner: QueryRunner,
    ): Promise<User> {
        const manager = runner.manager;

        const passwordHash = await hashPassword(data.password);

        const userCanCreateConsoleUser = !authenticatedUser || !authenticatedUser.auth.hasConsoleAccess;

        const aRandomUser = await manager.getRepository(User).findOne();
        const isFirstUser = !aRandomUser;

        if (!isFirstUser && !data.application && userCanCreateConsoleUser) {
            throw new NoConsoleAccessError();
        }

        const user = await manager
            .getRepository(User)
            .save({
                application: data.application,
                email: data.email,
            });

        const emailValidationToken = randomBytes(20).toString('hex');
        await manager.getRepository(UserAuth).save({
            user,
            emailVerified: false,
            hasConsoleAccess: isFirstUser,
            passwordHash,
            isDisabled: false,
            emailValidationToken,
        });

        if (data.application) {
            this.automationsService.triggerAutomationEvent(
                {
                    applicationId: data.application.id,
                    nodeType: ApplicationAutomationFlowNodeType.User_Created,
                },
                {
                    id: user.id,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    email: user.email,
                    notificationSettings: user.notificationSettings,
                    emailValidationToken,
                },
            );
        }

        return user;
    }

    public async list(
        authenticatedUser: User | null,
        applicationId: string | null,
        params: ListPayload,
    ): Promise<ListResult<User>> {
        if (!authenticatedUser?.auth.hasConsoleAccess) {
            throw new NoConsoleAccessError();
        }

        let pagination = params.pagination;
        if (!pagination) {
            pagination = {
                skip: 0,
                take: 50,
            };
        }

        if (pagination.take > 50) {
            pagination.take = 50;
        }

        const query = this.getBaseQuery(this.orm.manager);

        if (applicationId) {
            query.where('user.applicationId = :applicationId', {applicationId});
        }

        query.skip(pagination.skip)
            .take(pagination.take + 1);

        if (params.sort) {
            query.orderBy(`user.${params.sort.column}`, params.sort.descending ? 'DESC' : 'ASC');
        }

        const users = await query
            .getMany();

        const moreAvailable = users.length > pagination.take;
        if (moreAvailable) {
            users.pop();
        }

        return {
            items: users,
            moreAvailable,
        };
    }

    public async verifyEmail(userId: string, token: string): Promise<void> {
        const user = await this.getOneWithoutAuthCheckOrFail({id: userId});

        if (user.auth.emailValidationToken === null) {
            throw new InvalidEmailValidationToken();
        }

        if (token !== user.auth.emailValidationToken) {
            throw new InvalidEmailValidationToken();
        }

        await this.orm.manager.getRepository(UserAuth)
            .update(user.auth.id, {
                emailVerified: true,
                emailValidationToken: null,
            });
    }

    public async remove(
        authenticatedUser: User | null,
        userId: string,
        injectedRunner?: QueryRunner,
    ): Promise<void> {
        let runner = injectedRunner;
        if (!runner) {
            runner = this.orm.createQueryRunner();
            await runner.connect();
            await runner.startTransaction();
        }

        return await runInTransaction(
            'UsersService::remove',
            {runner, isInjectedRunner: Boolean(injectedRunner)},
            ({runner: runnerInTransaction}) => {
                return this.removeWithRunner(
                    authenticatedUser,
                    userId,
                    runnerInTransaction,
                );
            },
        );
    }

    // noinspection JSMethodCanBeStatic
    private async removeWithRunner(
        authenticatedUser: User | null,
        userId: string,
        runner: QueryRunner,
    ): Promise<void> {
        if (!authenticatedUser?.auth.hasConsoleAccess) {
            throw new NoConsoleAccessError();
        }

        const user = await runner.manager.getRepository(User)
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.notificationSettings', 'notificationSettings')
            .leftJoinAndSelect('user.auth', 'auth')
            .where('user.id = :userId', {userId})
            .getOne();

        if (!user) {
            throw new UnknownUserError({id: userId});
        }

        if (user.notificationSettings) {
            await runner.manager.getRepository(UserNotificationSettings)
                .remove(user.notificationSettings);
        }

        await runner.manager.getRepository(UserAuth)
            .remove(user.auth);

        await runner.manager.getRepository(User)
            .remove(user);
    }
}
