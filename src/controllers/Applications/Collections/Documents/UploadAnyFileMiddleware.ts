import Multer, {Options} from 'multer';
import {multerConfig} from '../../../../config/sub-configs/multerConfig';
import {IMiddleware, Middleware, Next, Req, Res} from '@tsed/common';

const MulterAnyFileMiddleware = (Multer(multerConfig as unknown as Options)).any();

@Middleware()
export class UploadAnyFileMiddleware implements IMiddleware {
    use(@Req() req: Req, @Res() res: Res, @Next() next: Next): void {
        MulterAnyFileMiddleware(req, res, next);
    }
}
