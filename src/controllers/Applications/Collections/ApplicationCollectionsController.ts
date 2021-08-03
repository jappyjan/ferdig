import {BodyParams, Controller, Delete, Get, PathParams, Post, Put, Req} from '@tsed/common';
import ApplicationCollectionDocumentsController from './Documents/ApplicationCollectionDocumentsController';
import {Returns, Summary} from '@tsed/schema';
import {Authorize} from '@tsed/passport';
import User from '../../../entity/Users/User';
import ApplicationCollectionsService from '../../../services/Applications/Collections/ApplicationCollectionsService';
import ApplicationCollectionsCreatePayloadModel from './Models/ApplicationCollectionsCreatePayloadModel';
import ApplicationCollectionsListResultModel from './Models/ApplicationCollectionsListResultModel';
import ApplicationCollectionModel from './models/ApplicationCollectionModel';
import ApplicationCollectionsListPayloadModel from './Models/ApplicationCollectionsListPayloadModel';
import ApplicationCollectionsUpdatePayloadModel from './Models/ApplicationCollectionsUpdatePayloadModel';
import ApplicationCollectionColumnsController from './Columns/ApplicationCollectionColumnsController';
import {CrudController} from '../../CrudController';

@Controller({
    path: '/:applicationId/collections',
    children: [
        ApplicationCollectionDocumentsController,
        ApplicationCollectionColumnsController,
    ],
})
export default class ApplicationCollectionsController implements CrudController<ApplicationCollectionModel> {
    private readonly collectionsService: ApplicationCollectionsService;

    public constructor(collectionsService: ApplicationCollectionsService) {
        this.collectionsService = collectionsService;
    }

    @Delete('/:collectionId')
    @Summary('Delete a single Collection')
    @Authorize('jwt')
    @Returns(200, String)
    public async remove(
        @PathParams('applicationId') applicationId: string,
        @PathParams('collectionId') collectionId: string,
        @Req() req: Req,
    ): Promise<'success'> {
        const authenticatedUser = req.user as User || null;

        await this.collectionsService.removeCollection(
            authenticatedUser,
            {
                applicationId,
                collectionId,
            },
        );

        return 'success';
    }

    @Get('/:collectionId')
    @Summary('Get a single collection')
    @Returns(200, ApplicationCollectionModel)
    @Authorize('jwt')
    public async getOne(
        @PathParams('applicationId') applicationId: string,
        @PathParams('collectionId') collectionId: string,
        @Req() {user: authenticatedUser}: Req,
    ): Promise<ApplicationCollectionModel> {
        return await this.collectionsService.getCollection(
            authenticatedUser as User || null,
            {
                applicationId,
                collectionId,
            },
        );
    }

    @Post()
    @Summary('Create a new Collection')
    @Returns(200, ApplicationCollectionModel)
    @Authorize('jwt')
    public async create(
        @PathParams('applicationId') applicationId: string,
        @BodyParams() params: ApplicationCollectionsCreatePayloadModel,
        @Req() {user: authenticatedUser}: Req,
    ): Promise<ApplicationCollectionModel> {
        return await this.collectionsService.createCollection(
            authenticatedUser as User || null,
            applicationId,
            params,
        );
    }

    @Put('/:collectionId')
    @Summary('Update a Collection')
    @Returns(200, ApplicationCollectionModel)
    @Authorize('jwt')
    public async update(
        @PathParams('applicationId') applicationId: string,
        @PathParams('collectionId') collectionId: string,
        @BodyParams() params: ApplicationCollectionsUpdatePayloadModel,
        @Req() {user: authenticatedUser}: Req,
    ): Promise<ApplicationCollectionModel> {
        return await this.collectionsService.updateCollection(
            authenticatedUser as User || null,
            {
                applicationId,
                collectionId,
            },
            params,
        );
    }

    @Post('/list')
    @Summary('List and Filter all Collections of an Application')
    @Returns(200, ApplicationCollectionsListResultModel)
    @Authorize('jwt')
    public async list(
        @PathParams('applicationId') applicationId: string,
        @BodyParams() params: ApplicationCollectionsListPayloadModel,
        @Req() {user: authenticatedUser}: Req,
    ): Promise<ApplicationCollectionsListResultModel> {
        return await this.collectionsService.list(
            (authenticatedUser as User) || null,
            applicationId,
            params,
        );
    }
}
