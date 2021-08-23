import {BucketFile, IFileBucketClient} from './IFileBucketClient';
import {Client} from 'minio';
import {MinioConfig} from '../../config/sub-configs/fileBucket';

export default class MinioClient implements IFileBucketClient {
    private readonly minio: Client;
    private readonly options: MinioConfig;

    constructor(options: MinioConfig) {
        this.options = options;

        this.minio = new Client({
            endPoint: options.endPoint,
            port: options.port,
            useSSL: options.useSSL,
            accessKey: options.accessKey,
            secretKey: options.secretKey,
        });
    }

    public async upload(key: string, file: BucketFile) {
        await this.minio.putObject(this.options.bucket, key, file)
    }

    public async delete(key: string) {
        await this.minio.removeObject(this.options.bucket, key);
    }

    public async download(key: string) {
        return await this.minio.getObject(this.options.bucket, key);
    }
}
