import Multer from 'multer';
import {multerConfig} from '../../../../config/sub-configs/multerConfig';
import {IMiddleware, Middleware, Next, Req, Res} from '@tsed/common';

const MulterAnyFileMiddleware = (Multer(multerConfig)).any();

@Middleware()
export class UploadAnyFileMiddleware implements IMiddleware {
    use(@Req() req: Req, @Res() res: Res, @Next() next: Next): void {
        MulterAnyFileMiddleware(req, res, next);
    }
}
