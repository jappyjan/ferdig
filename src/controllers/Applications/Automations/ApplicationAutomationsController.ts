import {CrudController} from '../../CrudController';
import {BodyParams, Controller, Delete, Get, PathParams, Post, Put, Req} from '@tsed/common';
import ApplicationAutomationModel from './Models/ApplicationAutomationModel';
import {ListResult} from '../../../services/shared-types/ListResult';
import {Returns, Summary} from '@tsed/schema';
import ApplicationsListResponseModel from '../Models/ApplicationsListResponseModel';
import {Authorize} from '@tsed/passport';
import ApplicationAutomation from '../../../entity/Applications/Automations/ApplicationAutomation';
import ApplicationAutomationsService from '../../../services/Applications/Automations/ApplicationAutomationsService';
import User from '../../../entity/Users/User';
import ApplicationAutomationsListPayloadModel from './Models/ApplicationAutomationsListPayloadModel';
import ApplicationAutomationsCreatePayloadModel from './Models/ApplicationAutomationsCreatePayloadModel';
import ApplicationAutomationsUpdatePayloadModel from './Models/ApplicationAutomationsUpdatePayloadModel';
import ApplicationAutomationFlowNodeLog
    from '../../../entity/Applications/Automations/ApplicationAutomationFlowNodeLog';
import ApplicationAutomationFlowNodeLogModel from './Models/ApplicationAutomationFlowNodeLogModel';

@Controller({
    path: '/:applicationId/automations',
})
export default class ApplicationAutomationsController implements CrudController<ApplicationAutomation> {
    private readonly automationsService: ApplicationAutomationsService;

    public constructor(automationsService: ApplicationAutomationsService) {
        this.automationsService = automationsService;
    }

    @Post()
    @Summary('Create an Automation')
    @Returns(200, ApplicationAutomationModel)
    @Authorize('jwt')
    public async create(
        @PathParams('applicationId') applicationId: string,
        @BodyParams() payload: ApplicationAutomationsCreatePayloadModel,
        @Req() req: Req,
    ): Promise<ApplicationAutomation> {
        const authenticatedUser = req.user as User || null;

        return await this.automationsService.create(
            authenticatedUser,
            applicationId,
            payload,
        );
    }

    @Get('/:automationId')
    @Summary('Get an Automation')
    @Returns(200, ApplicationAutomationModel)
    @Authorize('jwt')
    public async getOne(
        @PathParams('applicationId') applicationId: string,
        @PathParams('automationId') automationId: string,
        @Req() req: Req,
    ): Promise<ApplicationAutomation> {
        const authenticatedUser = req.user as User || null;

        return await this.automationsService.getByIdentifier(
            authenticatedUser,
            {
                applicationId,
                automationId,
            },
        );
    }

    @Post('/list')
    @Summary('List and Filter all Applications')
    @Returns(200, ApplicationsListResponseModel)
    @Authorize('jwt')
    public async list(
        @PathParams('applicationId') applicationId: string,
        @BodyParams() payload: ApplicationAutomationsListPayloadModel,
        @Req() req: Req,
    ): Promise<ListResult<ApplicationAutomation>> {
        const authenticatedUser = req.user as User || null;

        return this.automationsService.list(
            authenticatedUser,
            applicationId,
            payload,
        );
    }

    @Delete('/:automationId')
    @Summary('Remove an Automation')
    @Returns(200, String)
    @Authorize('jwt')
    public async remove(
        @PathParams('applicationId') applicationId: string,
        @PathParams('automationId') automationId: string,
        @Req() req: Req,
    ): Promise<'success'> {
        const authenticatedUser = req.user as User ?? null;

        await this.automationsService.remove(
            authenticatedUser,
            {
                applicationId,
                automationId,
            },
        );

        return 'success';
    }

    @Put('/:automationId')
    @Summary('Update an Automation')
    @Returns(200, ApplicationAutomationModel)
    @Authorize('jwt')
    public async update(
        @PathParams('applicationId') applicationId: string,
        @PathParams('automationId') automationId: string,
        @BodyParams() payload: ApplicationAutomationsUpdatePayloadModel,
        @Req() req: Req,
    ): Promise<ApplicationAutomation> {
        const authenticatedUser = req.user as User || null;

        return await this.automationsService.update(
            authenticatedUser,
            {
                applicationId,
                automationId,
            },
            payload,
        )
    }

    @Get('/:automationId/nodes/:nodeId/logs')
    @Summary('Get all logs of a node of an automation')
    @(Returns(200, Array).Of(ApplicationAutomationFlowNodeLogModel))
    @Authorize('jwt')
    public async getLogsOfNode(
        @PathParams('applicationId') applicationId: string,
        @PathParams('automationId') automationId: string,
        @PathParams('nodeId') nodeId: string,
        @Req() req: Req,
    ): Promise<ApplicationAutomationFlowNodeLog[]> {
        const authenticatedUser = req.user as User || null;

        return await this.automationsService.getLogsOfNode(
            authenticatedUser,
            {
                applicationId,
                automationId,
                nodeId,
            },
        );
    }
}
