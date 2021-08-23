import MinioClient from './MinioClient';
import {BucketFile, IFileBucketClient} from './IFileBucketClient';
import S3Client from './S3Client';
import {Configuration, OnInit, ProviderScope, Scope, Service} from '@tsed/di';
import {filesConfig, FileBucketType, MinioConfig, S3Config} from '../../config/sub-configs/files';

@Service()
@Scope(ProviderScope.SINGLETON)
export default class FilesService implements IFileBucketClient, OnInit {
    private readonly client: IFileBucketClient;

    public constructor(@Configuration() config: Configuration) {
        const options = config.fileBucket as typeof filesConfig;

        switch (options.type) {
            case FileBucketType.S3:
                this.client = new S3Client(options as S3Config);
                break;

            case FileBucketType.Minio:
                this.client = new MinioClient(options as MinioConfig);
                break;

            default:
                throw new Error('Unknown File Bucket Type');
        }
    }

    public async $onInit(): Promise<any> {
        await this.verifyConnection();
    }

    public async verifyConnection() {
        const key = 'system/temp/verify-connection';
        await this.upload(key, 'Hello World');
        await this.delete(key);
    }

    public async init() {
        if (this.client.init) {
            await this.client.init();
        }
    }

    public upload(key: string, file: BucketFile): Promise<void> {
        return this.client.upload(key, file);
    }

    public delete(key: string): Promise<void> {
        return this.client.delete(key);
    }

    async download(key: string) {
        return this.client.download(key);
    }
}
