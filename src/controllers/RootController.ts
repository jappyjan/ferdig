import {Controller, Get} from '@tsed/common';
import {Returns, Summary} from '@tsed/schema';
import { join } from 'path';
import {rootDir} from '../config';

@Controller('/')
export default class RootController {
    @Get('/version')
    @Summary('Get API version information')
    @Returns(200, String)
    public getVersion(): string {
        return require(join(rootDir, '..', 'package.json')).version;
    }
}
