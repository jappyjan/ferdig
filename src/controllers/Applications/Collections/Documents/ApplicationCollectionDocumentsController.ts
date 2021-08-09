import {BodyParams, Controller, Delete, Get, PathParams, Post, Put, Req, Res, UseBefore} from '@tsed/common';
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
import {UploadAnyFileMiddleware} from './UploadAnyFileMiddleware';
import {createReadStream, promises as FsPromises, ReadStream} from 'fs';
import {waitForAllPromises} from '../../../../utils/typeorm.utils';
import {DocumentCreateAndUpdateData} from '../../../../services/Applications/Collections/Documents/DocumentCreateAndUpdateData';

@Controller('/:collectionId/documents')
export default class ApplicationCollectionDocumentsController implements CrudController<DocumentAsObjectType> {
    private readonly documentsService: ApplicationCollectionDocumentsService;

    public constructor(collectionDocumentsService: ApplicationCollectionDocumentsService) {
        this.documentsService = collectionDocumentsService;
    }

    @Post()
    @Summary('Create a new Document')
    @Authorize('jwt')
    @UseBefore(UploadAnyFileMiddleware)
    public async create(
        @PathParams('applicationId') applicationId: string,
        @PathParams('collectionId') collectionId: string,
        @BodyParams() data: CollectionDocumentCreateModel,
        @Req() req: Req,
    ): Promise<DocumentAsObjectType> {
        const authenticatedUser = req.user as User || null;

        const createData: DocumentCreateAndUpdateData = {};

        Object.keys(data).forEach((key) => {
            createData[key] = data[key as keyof CollectionDocumentCreateModel];
        });

        const files = req.files as Express.Multer.File[] | undefined;
        const readStreams: ReadStream[] = [];

        try {
            files?.forEach((file) => {
                const path = file.path;
                const field = file.fieldname;
                const originalName = file.originalname;

                const readStream = createReadStream(path);
                createData[field] = {data: readStream, originalName};
                readStreams.push(readStream);
            });

            const document = await this.documentsService.createDocument(
                authenticatedUser,
                {
                    applicationId,
                    collectionId,
                },
                createData,
            );

            return documentToObject(document);
        } finally {
            readStreams.forEach((readStream) => {
                readStream.close();
            });

            const fileUnlinkPromises = files?.map((file) => {
                return FsPromises.unlink(file.path);
            });
            if (fileUnlinkPromises) {
                await waitForAllPromises(fileUnlinkPromises);
            }
        }
    }

    @Put('/:documentId')
    @Summary('Update a new Document')
    @Authorize('jwt')
    @UseBefore(UploadAnyFileMiddleware)
    public async update(
        @PathParams('applicationId') applicationId: string,
        @PathParams('collectionId') collectionId: string,
        @PathParams('documentId') documentId: string,
        @BodyParams() data: CollectionDocumentUpdateModel,
        @Req() req: Req,
    ): Promise<DocumentAsObjectType> {
        const authenticatedUser = req.user as User || null;
        const updateData: DocumentCreateAndUpdateData = {};

        Object.keys(data).forEach((key) => {
            updateData[key] = data[key as keyof CollectionDocumentCreateModel];
        });

        const files = req.files as Express.Multer.File[] | undefined;
        const readStreams: ReadStream[] = [];

        try {
            files?.forEach((file) => {
                const path = file.path;
                const field = file.fieldname;
                const originalName = file.originalname;

                const readStream = createReadStream(path);
                updateData[field] = {data: readStream, originalName};
                readStreams.push(readStream);
            });

            const document = await this.documentsService.updateDocument(
                authenticatedUser,
                {
                    applicationId,
                    collectionId,
                    documentId,
                },
                updateData,
            );

            return documentToObject(document);
        } finally {
            readStreams.forEach((readStream) => {
                readStream.close();
            });

            const fileUnlinkPromises = files?.map((file) => {
                return FsPromises.unlink(file.path);
            });
            if (fileUnlinkPromises) {
                await waitForAllPromises(fileUnlinkPromises);
            }
        }
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
        @Req() req: Req,
    ): Promise<CollectionDocumentsListResponseModel> {
        const authenticatedUser = req.user as User ?? null;

        const result = await this.documentsService.listDocuments(
            authenticatedUser,
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

    @Get('/:documentId/columns/:columnId/:fileName')
    @Summary('Get the contents of a file')
    @Authorize('jwt')
    public async getColumnFile(
        @PathParams('applicationId') applicationId: string,
        @PathParams('collectionId') collectionId: string,
        @PathParams('documentId') documentId: string,
        @PathParams('columnId') columnId: string,
        @PathParams('fileName') fileName: string,
        @Req() req: Req,
        @Res() res: Res,
    ): Promise<void> {
        const authenticatedUser = req.user as User ?? null;

        const stream = await this.documentsService.getColumnFile(
            authenticatedUser,
            {
                applicationId,
                collectionId,
                documentId,
                columnId,
                fileName
            }
        );

        res.contentType('application/octet-stream');

        await new Promise<void>((resolve, reject) => {
            stream.pipe(res);
            stream.on('end', () => resolve());
            stream.on('error', (err) => reject(err));
        });
    }
}
