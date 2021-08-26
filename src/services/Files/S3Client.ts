import {BucketFile, IFileBucketClient} from './IFileBucketClient';
import {S3} from 'aws-sdk';
import {S3Config} from '../../config/sub-configs/files';

export default class S3Client implements IFileBucketClient {
    private readonly s3: S3;
    private readonly options: S3Config;

    constructor(options: S3Config) {
        this.options = options;

        this.s3 = new S3();
    }

    public async bucketExists(name: string) {
        try {
            await this.s3.headBucket({
                Bucket: name,
            }).promise();
            return true;
        } catch (e) {
            return e.statusCode === 200;
        }
    }

    public async createBucket(name: string): Promise<void> {
        await this.s3.createBucket({
            Bucket: name,
            ACL: 'private',
        });
    }

    public async upload(key: string, file: BucketFile) {
        await this.s3.upload({
            Bucket: this.options.bucket,
            Body: file,
            Key: key,
        }).promise();
    }

    public async delete(key: string) {
        await this.s3.deleteObject({
            Bucket: this.options.bucket,
            Key: key,
        });
    }

    public async download(key: string) {
        const response = await this.s3.getObject({
            Bucket: this.options.bucket,
            Key: key,
        }).promise();

        if (!response.Body) {
            throw new Error('S3 File not found');
        }

        return response.Body as BucketFile;
    }
}
