import {BodyParams, Controller, Delete, Get, Patch, PathParams, Post, Put, Req} from '@tsed/common';
import ApplicationCollectionsController from './Collections/ApplicationCollectionsController';
import {Returns, Summary} from '@tsed/schema';
import ApplicationsService from '../../services/Applications/ApplicationsService';
import User from '../../entity/Users/User';
import {Authorize} from '@tsed/passport';
import ApplicationModel from './Models/ApplicationModel';
import ApplicationsListResponseModel from './Models/ApplicationsListResponseModel';
import ApplicationsListPayloadModel from './Models/ApplicationsListPayloadModel';
import ApplicationCreatePayloadModel from './Models/ApplicationCreatePayloadModel';
import {CrudController} from '../CrudController';
import ApplicationUpdatePayloadModel from './Models/ApplicationUpdatePayloadModel';
import ApplicationAutomationsController from './Automations/ApplicationAutomationsController';
import ApplicationNotificationsController from './Notifications/ApplicationNotificationsController';
import ApplicationConfigurationModel from './Models/ApplicationConfigurationModel';
import ApplicationConfiguration from '../../entity/Applications/Configuration/ApplicationConfiguration';
import ApplicationConfigurationChangeModel from './Models/ApplicationConfigurationChangeModel';
import {ListResult} from '../../services/shared-types/ListResult';
import Application from '../../entity/Applications/Application';

@Controller({
    path: '/applications',
    children: [
        ApplicationCollectionsController,
        ApplicationAutomationsController,
        ApplicationNotificationsController,
    ],
})
export default class ApplicationsController implements CrudController<Application> {
    private readonly applicationsService: ApplicationsService;

    public constructor(applicationsService: ApplicationsService) {
        this.applicationsService = applicationsService;
    }

    @Put('/:applicationId')
    @Returns(200, ApplicationModel)
    @Summary('Update an application')
    @Authorize('jwt')
    public async update(
        @PathParams('applicationId') applicationId: string,
        @Req() req: Req,
        @BodyParams() payload: ApplicationUpdatePayloadModel,
    ): Promise<Application> {
        const authenticatedUser = req.user as User | null;

        return await this.applicationsService.updateApplication(
            authenticatedUser,
            applicationId,
            payload,
        );
    }

    @Get('/:applicationId')
    @Returns(200, ApplicationModel)
    @Summary('Get an application')
    @Authorize('jwt')
    public async getOne(
        @PathParams('applicationId') applicationId: string,
    ): Promise<Application> {
        return await this.applicationsService.getApplicationById(applicationId);
    }

    @Delete('/:applicationId')
    @Returns(200, String)
    @Summary('Delete an application')
    @Authorize('jwt')
    public async remove(
        @PathParams('applicationId') applicationId: string,
        @Req() req: Req,
    ): Promise<'success'> {
        const authenticatedUser = req.user as User ?? null;

        await this.applicationsService.remove(
            authenticatedUser,
            applicationId,
        );

        return 'success';
    }

    @Post()
    @Summary('Create an Application')
    @Returns(200, ApplicationModel)
    @Authorize('jwt')
    public async create(
        @BodyParams() data: ApplicationCreatePayloadModel,
        @Req() req: Req,
    ): Promise<Application> {
        const authenticatedUser = req.user as User || null;
        return await this.applicationsService.createApplication(
            authenticatedUser,
            data,
        )
    }

    @Post('/list')
    @Summary('List and Filter all Applications')
    @Returns(200, ApplicationsListResponseModel)
    @Authorize('jwt')
    public async list(
        @BodyParams() pagination: ApplicationsListPayloadModel,
        @Req() req: Req,
    ): Promise<ListResult<Application>> {
        const authenticatedUser = req.user as User || null;
        return await this.applicationsService.listApplications(
            authenticatedUser,
            pagination,
        )
    }

    @Patch('/:applicationId/configuration')
    @Returns(200, ApplicationConfigurationModel)
    @Summary('Update an applications configuration')
    @Authorize('jwt')
    public async changeConfiguration(
        @PathParams('applicationId') applicationId: string,
        @BodyParams() data: ApplicationConfigurationChangeModel,
        @Req() req: Req,
    ): Promise<ApplicationConfiguration> {
        const authenticatedUser = req.user as User | null;

        return await this.applicationsService.changeApplicationConfiguration(
            authenticatedUser,
            applicationId,
            data,
        );
    }
}
