import {Readable} from 'stream';

export type BucketFile = Readable;

export interface IFileBucketClient {
    init?: () => Promise<void>;

    upload(key: string, file: BucketFile): Promise<void>;

    delete(key: string): Promise<void>;

    download(key: string): Promise<BucketFile>;
}
