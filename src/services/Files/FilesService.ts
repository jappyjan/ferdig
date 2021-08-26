import MinioClient from './MinioClient';
import {BucketFile, IFileBucketClient} from './IFileBucketClient';
import S3Client from './S3Client';
import {Configuration, OnInit, ProviderScope, Scope, Service} from '@tsed/di';
import {FileBucketType, filesConfig, MinioConfig, S3Config} from '../../config/sub-configs/files';
import {makeLogger} from '../../utils/logger';
import {Logger} from '@tsed/logger';

@Service()
@Scope(ProviderScope.SINGLETON)
export default class FilesService implements IFileBucketClient, OnInit {
    private readonly client: IFileBucketClient;
    private readonly options: (MinioConfig & { createBucketIfNotExist: boolean }) | (S3Config & { createBucketIfNotExist: boolean });
    private readonly $log: Logger;

    public constructor(@Configuration() config: Configuration) {
        this.options = config.fileBucket as typeof filesConfig;
        this.$log = makeLogger('FilesService');

        switch (this.options.type) {
            case FileBucketType.S3:
                this.client = new S3Client(this.options as S3Config);
                break;

            case FileBucketType.Minio:
                this.client = new MinioClient(this.options as MinioConfig);
                break;

            default:
                throw new Error('Unknown File Bucket Type');
        }
    }

    public async $onInit(): Promise<any> {
        await this.verifyConnection();
    }

    public async verifyConnection() {
        if (this.options.createBucketIfNotExist) {
            const exists = await this.bucketExists(this.options.bucket);
            if (!exists) {
                await this.createBucket(this.options.bucket);
            }
        }

        this.$log.info('Verifying Connection');
        const key = 'system/temp/verify-connection';
        await this.upload(key, 'Hello World');
        await this.delete(key);
    }

    public bucketExists(name: string): Promise<boolean> {
        return this.client.bucketExists(name);
    }

    public async createBucket(name: string) {
        this.$log.info('Creating Bucket:', name);
        await this.client.createBucket(name);
    }

    public async init() {
        this.$log.info('Initialising');
        if (this.client.init) {
            await this.client.init();
        }
    }

    public upload(key: string, file: BucketFile): Promise<void> {
        this.$log.debug('Uploading File:', key);
        return this.client.upload(key, file);
    }

    public delete(key: string): Promise<void> {
        this.$log.debug('Deleting File:', key);
        return this.client.delete(key);
    }

    async download(key: string) {
        this.$log.debug('Downloading File:', key);
        return this.client.download(key);
    }
}
