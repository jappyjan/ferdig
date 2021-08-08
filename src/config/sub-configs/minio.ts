import {ClientOptions} from 'minio';
import {getEnvVar} from '../../utils/env';

export const minioConfig: ClientOptions = {
    endPoint: getEnvVar('MINIO_ENDPOINT', 'string'),
    port: getEnvVar('MINIO_PORT', 'number', 9000),
    useSSL: getEnvVar('MINIO_SSL', 'boolean', true),
    accessKey: getEnvVar('MINIO_ROOT_USER', 'string'),
    secretKey: getEnvVar('MINIO_ROOT_PASSWORD', 'string')
}
