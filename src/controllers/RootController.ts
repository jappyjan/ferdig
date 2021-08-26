import {Controller, Get} from '@tsed/common';
import {ContentType, Returns, Summary} from '@tsed/schema';
import {Configuration} from '@tsed/di';

@Controller('/')
export default class RootController {
    private readonly apiVersion: string;

    public constructor(@Configuration() config: Configuration) {
        this.apiVersion = config.version;
    }

    @Get('/version')
    @Summary('Get API version information')
    @Returns(200, String)
    @ContentType('text/plain')
    public getVersion(): string {
        return this.apiVersion;
    }

    @Get('/health')
    @Summary('Get API health status')
    @ContentType('text/plain')
    @Returns(200, String)
    public getHealth(): string {
        return 'healthy';
    }
}
