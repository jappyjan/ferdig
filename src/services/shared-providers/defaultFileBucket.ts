import {Configuration, registerProvider} from '@tsed/di';
import {MinioConfig, S3Config} from '../../config/sub-configs/fileBucket';
import FileBucket from './FileBucket/FileBucket';

export const DEFAULT_FILE_BUCKET_CONNECTION = Symbol.for('DEFAULT_FILE_BUCKET_CONNECTION');
export type DEFAULT_FILE_BUCKET_CONNECTION = FileBucket;

registerProvider({
    provide: DEFAULT_FILE_BUCKET_CONNECTION,
    deps: [Configuration],
    async useAsyncFactory(configuration: Configuration) {
        const options = configuration.get<MinioConfig | S3Config>('fileBucket');

        const client = new FileBucket(options);

        await client.init();

        return client;
    },
});
