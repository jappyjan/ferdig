import {FileBucketType, MinioConfig, S3Config} from '../../../config/sub-configs/fileBucket';
import MinioClient from './MinioClient';
import {BucketFile, IFileBucketClient} from './IFileBucketClient';
import S3Client from './S3Client';

export default class FileBucket implements IFileBucketClient {
    private readonly client: IFileBucketClient;

    public constructor(options: MinioConfig | S3Config) {
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
