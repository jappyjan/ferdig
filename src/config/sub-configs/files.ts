import {getEnvVar} from '../../utils/env';

export enum FileBucketType {
    S3 = 's3',
    Minio = 'minio'
}

export type MinioConfig = {
    type: FileBucketType.Minio
    endPoint: string;
    port: number;
    useSSL: boolean;
    accessKey: string;
    secretKey: string;
    bucket: string;
    region: string;
};

function getMinioConfig(): MinioConfig {
    return {
        type: FileBucketType.Minio,
        endPoint: getEnvVar('MINIO_ENDPOINT', 'string'),
        port: getEnvVar('MINIO_PORT', 'number', 9000),
        useSSL: getEnvVar('MINIO_SSL', 'boolean', true),
        accessKey: getEnvVar('MINIO_ROOT_USER', 'string'),
        secretKey: getEnvVar('MINIO_ROOT_PASSWORD', 'string'),
        bucket: getEnvVar('MINIO_BUCKET', 'string'),
        region: getEnvVar('MINIO_REGION', 'string', 'eu-central-1'),
    };
}

export type S3Config = {
    type: FileBucketType.S3;
    bucket: string;
};

function getS3Config(): S3Config {
    return {
        type: FileBucketType.S3,
        bucket: getEnvVar('AWS_S3_BUCKET', 'string'),
    };
}

let filesConfig: (MinioConfig | S3Config) & { createBucketIfNotExist: boolean };

const type = getEnvVar('FILE_BUCKET_TYPE', 'string') as FileBucketType;

const createBucketIfNotExist = getEnvVar('FILE_BUCKET_CREATE_BUCKET_IF_NOT_EXIST', 'boolean', false);

switch (type) {
    case FileBucketType.Minio:
        filesConfig = {
            ...getMinioConfig(),
            createBucketIfNotExist,
        };
        break;

    case FileBucketType.S3:
        filesConfig = {
            ...getS3Config(),
            createBucketIfNotExist,
        };
        break;

    default:
        throw new Error(`Environment Variable "FILE_BUCKET_TYPE" (${type}) not in range (${Object.keys(FileBucketType).join(' | ')})`);
}

export {
    filesConfig,
}
