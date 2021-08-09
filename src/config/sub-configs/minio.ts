import {ClientOptions} from 'minio';
import {getEnvVar} from '../../utils/env';

export type MinioConfig = ClientOptions & {bucket: string};

export const minioConfig: MinioConfig = {
    endPoint: getEnvVar('MINIO_ENDPOINT', 'string'),
    port: getEnvVar('MINIO_PORT', 'number', 9000),
    useSSL: getEnvVar('MINIO_SSL', 'boolean', true),
    accessKey: getEnvVar('MINIO_ROOT_USER', 'string'),
    secretKey: getEnvVar('MINIO_ROOT_PASSWORD', 'string'),
    bucket: getEnvVar('MINIO_BUCKET', 'string'),
}
