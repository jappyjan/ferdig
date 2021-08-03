import {BodyParams, Controller, Delete, Get, PathParams, Post, Put, Req} from '@tsed/common';
import ApplicationCollectionsService from '../../../../services/Applications/Collections/ApplicationCollectionsService';
import {Returns, Summary} from '@tsed/schema';
import {Authorize} from '@tsed/passport';
import User from '../../../../entity/Users/User';
import ApplicationCollectionColumnModel from './Models/ApplicationCollectionColumnModel';
import ApplicationCollectionColumnCreatePayloadModel from './Models/ApplicationCollectionColumnCreatePayloadModel';
import ApplicationCollectionColumnUpdatePayloadModel from './Models/ApplicationCollectionColumnUpdatePayloadModel';
import ApplicationCollectionColumnsListResultModel from './Models/ApplicationCollectionColumnsListResultModel';
import {ApplicationCollectionColumnValueType} from '../../../../entity/Applications/Collections/ApplicationCollectionColumn';
import {CrudController} from '../../../CrudController';

@Controller({
    path: '/:collectionId/columns',
    children: [],
})
export default class ApplicationCollectionColumnsController implements CrudController<ApplicationCollectionColumnModel> {
    private readonly collectionsService: ApplicationCollectionsService;

    public constructor(collectionsService: ApplicationCollectionsService) {
        this.collectionsService = collectionsService;
    }

    @Get('/:columnId')
    @Summary('Get a single column')
    @Authorize('jwt')
    public async getOne(
        @PathParams('applicationId') applicationId: string,
        @PathParams('collectionId') collectionId: string,
        @PathParams('columnId') columnId: string,
        @Req() {user: authenticatedUser}: Req,
    ): Promise<ApplicationCollectionColumnModel> {
        return await this.collectionsService.getColumn(
            authenticatedUser as User || null,
            {
                applicationId,
                collectionId,
                columnId,
            },
        );
    }

    @Post()
    @Summary('Create a new Column')
    @Returns(200, ApplicationCollectionColumnModel)
    @Authorize('jwt')
    public async create(
        @PathParams('applicationId') applicationId: string,
        @PathParams('collectionId') collectionId: string,
        @BodyParams() params: ApplicationCollectionColumnCreatePayloadModel,
        @Req() {user: authenticatedUser}: Req,
    ): Promise<ApplicationCollectionColumnModel> {
        return await this.collectionsService.addColumn(
            authenticatedUser as User || null,
            {
                applicationId,
                collectionId,
            },
            {
                ...params,
                // WILLDO: remove casting when enum issue https://github.com/tsedio/tsed/issues/1446 is resolved
                valueType: params.valueType as ApplicationCollectionColumnValueType,
            },
        );
    }

    @Put('/:columnId')
    @Summary('Update a Column')
    @Returns(200, ApplicationCollectionColumnModel)
    @Authorize('jwt')
    public async update(
        @PathParams('applicationId') applicationId: string,
        @PathParams('collectionId') collectionId: string,
        @PathParams('columnId') columnId: string,
        @BodyParams() params: ApplicationCollectionColumnUpdatePayloadModel,
        @Req() {user: authenticatedUser}: Req,
    ): Promise<ApplicationCollectionColumnModel> {
        return await this.collectionsService.updateColumn(
            authenticatedUser as User || null,
            {
                applicationId,
                collectionId,
                columnId,
            },
            {
                ...params,
                // WILLDO: remove casting when enum issue https://github.com/tsedio/tsed/issues/1446 is resolved
                valueType: params.valueType as ApplicationCollectionColumnValueType,
            },
        );
    }

    @Delete('/:columnId')
    @Summary('Remove a Column')
    @Returns(200, String)
    @Authorize('jwt')
    public async remove(
        @PathParams('applicationId') applicationId: string,
        @PathParams('collectionId') collectionId: string,
        @PathParams('columnId') columnId: string,
        @Req() {user: authenticatedUser}: Req,
    ): Promise<'success'> {
        await this.collectionsService.removeColumn(
            authenticatedUser as User || null,
            {
                applicationId,
                collectionId,
                columnId,
            },
        );

        return 'success';
    }

    @Post('/list')
    @Summary('List and Filter all Columns of a Collection')
    @Returns(200, ApplicationCollectionColumnsListResultModel)
    @Authorize('jwt')
    public async list(
        @PathParams('applicationId') applicationId: string,
        @PathParams('collectionId') collectionId: string,
        @Req() {user: authenticatedUser}: Req,
    ): Promise<ApplicationCollectionColumnsListResultModel> {
        return await this.collectionsService.listColumns(
            (authenticatedUser as User) || null,
            {
                applicationId,
                collectionId,
            },
        );
    }
}
