import {Options as MulterOptions} from 'multer';
import {rootDir} from '../index';

export const multerConfig: MulterOptions = {
    dest: `${rootDir}/../uploads`,
}
