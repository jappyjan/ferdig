import {Configuration, registerProvider} from '@tsed/di';
import {Client, ClientOptions} from 'minio';
import {Readable} from 'stream';
import {MinioConfig} from '../../config/sub-configs/minio';

export const DEFAULT_MINIO_CONNECTION = Symbol.for('DEFAULT_MINIO_CONNECTION');
export type DEFAULT_MINIO_CONNECTION = Client;
export type MinioFile = {data: Readable | Buffer | string, originalName: string};

registerProvider({
    provide: DEFAULT_MINIO_CONNECTION,
    deps: [Configuration],
    async useAsyncFactory(configuration: Configuration) {
        const options = configuration.get<ClientOptions>('minio') as MinioConfig
        const client = new Client({
            endPoint: options.endPoint,
            port: options.port,
            useSSL: options.useSSL,
            accessKey: options.accessKey,
            secretKey: options.secretKey,
        });

        const bucketExists = await client.bucketExists(options.bucket);
        if (!bucketExists) {
            await client.makeBucket(options.bucket, 'eu-central-1');
        }

        return client;
    },
});
