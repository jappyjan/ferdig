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

let fileBucketConfig: MinioConfig | S3Config;

const type = getEnvVar('FILE_BUCKET_TYPE', 'string') as FileBucketType;

switch (type) {
    case FileBucketType.Minio:
        fileBucketConfig = getMinioConfig();
        break;

    case FileBucketType.S3:
        fileBucketConfig = getS3Config();
        break;

    default:
        throw new Error(`Environment Variable "FILE_BUCKET_TYPE" not in range (${Object.keys(FileBucketType).join(' | ')})`);
}

export {
    fileBucketConfig,
}
