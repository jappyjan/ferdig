import {BodyParams, Controller, Delete, Get, PathParams, Post, Put, Req} from '@tsed/common';
import {Returns, Summary} from '@tsed/schema';
import CollectionDocumentsListResponseModel from './Models/CollectionDocumentsListResponseModel';
import ApplicationCollectionDocumentsService
    from '../../../../services/Applications/Collections/Documents/ApplicationCollectionDocumentsService';
import User from '../../../../entity/Users/User';
import {Authorize} from '@tsed/passport';
import CollectionDocumentsListPayloadModel from './Models/CollectionDocumentsListPayloadModel';
import {CrudController} from '../../../CrudController';
import {DocumentAsObjectType} from '../../../../entity/Applications/Collections/ApplicationCollectionDocument';
import CollectionDocumentCreateModel from './Models/CollectionDocumentCreateModel';
import CollectionDocumentUpdateModel from './Models/CollectionDocumentUpdateModel';
import {documentToObject} from '../../../../entity/Applications/Collections/utils/document-to-object';

@Controller('/:collectionId/documents')
export default class ApplicationCollectionDocumentsController implements CrudController<DocumentAsObjectType> {
    private readonly documentsService: ApplicationCollectionDocumentsService;

    public constructor(collectionDocumentsService: ApplicationCollectionDocumentsService) {
        this.documentsService = collectionDocumentsService;
    }

    @Post()
    @Summary('Create a new Document')
    @Authorize('jwt')
    public async create(
        @PathParams('applicationId') applicationId: string,
        @PathParams('collectionId') collectionId: string,
        @BodyParams() data: CollectionDocumentCreateModel,
        @Req() req: Req,
    ): Promise<DocumentAsObjectType> {
        const authenticatedUser = req.user as User || null;

        const document = await this.documentsService.createDocument(
            authenticatedUser,
            {
                applicationId,
                collectionId,
            },
            data as unknown as DocumentAsObjectType,
        );

        return documentToObject(document);
    }

    @Put('/:documentId')
    @Summary('Update a new Document')
    @Authorize('jwt')
    public async update(
        @PathParams('applicationId') applicationId: string,
        @PathParams('collectionId') collectionId: string,
        @PathParams('documentId') documentId: string,
        @BodyParams() data: CollectionDocumentUpdateModel,
        @Req() req: Req,
    ): Promise<DocumentAsObjectType> {
        const authenticatedUser = req.user as User || null;

        const document = await this.documentsService.updateDocument(
            authenticatedUser,
            {
                applicationId,
                collectionId,
                documentId,
            },
            data,
        );

        return documentToObject(document);
    }

    @Get('/:documentId')
    @Summary('Get a single Document')
    @Authorize('jwt')
    public async getOne(
        @PathParams('applicationId') applicationId: string,
        @PathParams('collectionId') collectionId: string,
        @PathParams('documentId') documentId: string,
        @Req() req: Req,
    ): Promise<DocumentAsObjectType> {
        const authenticatedUser = req.user as User || null;

        const document = await this.documentsService.getDocument(
            authenticatedUser,
            {
                applicationId,
                collectionId,
                documentId,
            },
        );

        return documentToObject(document);
    }

    @Delete('/:documentId')
    @Summary('Delete a single Document')
    @Authorize('jwt')
    @Returns(200, String)
    public async remove(
        @PathParams('applicationId') applicationId: string,
        @PathParams('collectionId') collectionId: string,
        @PathParams('documentId') documentId: string,
        @Req() req: Req,
    ): Promise<'success'> {
        const authenticatedUser = req.user as User || null;

        await this.documentsService.removeDocument(
            authenticatedUser,
            {
                applicationId,
                collectionId,
                documentId,
            },
        );

        return 'success';
    }

    @Post('/list')
    @Summary('List and Filter all Documents of a collection')
    @Authorize('jwt')
    public async list(
        @PathParams('applicationId') applicationId: string,
        @PathParams('collectionId') collectionId: string,
        @BodyParams() params: CollectionDocumentsListPayloadModel,
        @Req() {user: authenticatedUser}: Req,
    ): Promise<CollectionDocumentsListResponseModel> {
        const result = await this.documentsService.listDocuments(
            (authenticatedUser as User) || null,
            {
                applicationId,
                collectionId,
            },
            params,
        );

        // eslint-disable-next-line
        const documents = result.items.map(
            (document) => documentToObject(document));

        return {
            moreAvailable: result.moreAvailable,
            items: documents,
        };
    }
}
