import {BodyParams, Controller, Delete, Get, PathParams, Post, Put, Req} from '@tsed/common';
import {CrudController} from '../../../CrudController';
import ApplicationNotificationTemplateModel from './Models/ApplicationNotificationTemplateModel';
import {ListResult} from '../../../../services/shared-types/ListResult';
import {Returns, Summary} from '@tsed/schema';
import {Authorize} from '@tsed/passport';
import ApplicationNotificationTemplate
    from '../../../../entity/Applications/Notifications/Templates/ApplicationNotificationTemplate';
import ApplicationNotificationTemplatesListResultModel from './Models/ApplicationNotificationTemplatesListResultModel';
import ApplicationNotificationTemplatesService
    from '../../../../services/Applications/Notifications/Templates/ApplicationNotificationTemplatesService';
import ApplicationNotificationTemplatesListPayloadModel
    from './Models/ApplicationNotificationTemplatesListPayloadModel';
import ApplicationNotificationTemplateUpdatePayloadModel
    from './Models/ApplicationNotificationTemplateUpdatePayloadModel';
import ApplicationNotificationTemplateCreatePayloadModel
    from './Models/ApplicationNotificationTemplateCreatePayloadModel';
import {getUserFromRequest} from '../../../../utils/auth';

@Controller({
    path: '/templates',
})
export default class ApplicationNotificationTemplatesController implements CrudController<ApplicationNotificationTemplate> {
    private readonly templatesService: ApplicationNotificationTemplatesService;

    public constructor(templatesService: ApplicationNotificationTemplatesService) {
        this.templatesService = templatesService;
    }

    @Post()
    @Summary('Create a new Template')
    @Returns(200, ApplicationNotificationTemplateModel)
    @Authorize('jwt')
    public async create(
        @PathParams('applicationId') applicationId: string,
        @BodyParams() data: ApplicationNotificationTemplateCreatePayloadModel,
        @Req() req: Req,
    ): Promise<ApplicationNotificationTemplate> {
        const authenticatedUser = getUserFromRequest(req);

        return await this.templatesService.create(
            authenticatedUser,
            applicationId,
            data,
        );
    }

    @Get('/:templateId')
    @Summary('Get a single template')
    @Returns(200, ApplicationNotificationTemplateModel)
    @Authorize('jwt')
    public async getOne(
        @PathParams('applicationId') applicationId: string,
        @PathParams('templateId') templateId: string,
        @Req() req: Req,
    ): Promise<ApplicationNotificationTemplate> {
        const authenticatedUser = getUserFromRequest(req);

        return await this.templatesService.getTemplate(
            authenticatedUser,
            {
                applicationId,
                templateId,
            },
        );
    }

    @Post('/list')
    @Summary('List and Filter all Templates of an Application')
    @Returns(200, ApplicationNotificationTemplatesListResultModel)
    @Authorize('jwt')
    public async list(
        @PathParams('applicationId') applicationId: string,
        @BodyParams() params: ApplicationNotificationTemplatesListPayloadModel,
        @Req() req: Req,
    ): Promise<ListResult<ApplicationNotificationTemplate>> {
        const authenticatedUser = getUserFromRequest(req);

        return await this.templatesService.list(
            authenticatedUser,
            applicationId,
            params,
        );
    }

    @Delete('/:templateId')
    @Summary('Delete a single Template')
    @Authorize('jwt')
    @Returns(200, String)
    public async remove(
        @PathParams('applicationId') applicationId: string,
        @PathParams('templateId') templateId: string,
        @Req() req: Req,
    ): Promise<'success'> {
        const authenticatedUser = getUserFromRequest(req);

        await this.templatesService.remove(
            authenticatedUser,
            {
                applicationId,
                templateId,
            },
        );

        return 'success';
    }

    @Put('/:templateId')
    @Summary('Update a Template')
    @Returns(200, ApplicationNotificationTemplateModel)
    @Authorize('jwt')
    public async update(
        @PathParams('applicationId') applicationId: string,
        @PathParams('templateId') templateId: string,
        @BodyParams() data: ApplicationNotificationTemplateUpdatePayloadModel,
        @Req() req: Req,
    ): Promise<ApplicationNotificationTemplate> {
        const authenticatedUser = getUserFromRequest(req);

        return await this.templatesService.update(
            authenticatedUser,
            {
                applicationId,
                templateId,
            },
            data,
        );
    }
}
