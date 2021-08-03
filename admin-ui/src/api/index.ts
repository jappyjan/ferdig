import {FerdigClient} from '@ferdig/client-js';
import {getEnvVar} from '../../../src/utils/env';

let client: FerdigClient | null = null;

export type GenericDocumentTypeTypes = number | Date | string | null | GenericDocumentTypeTypes[];
export type GenericDocumentType = Record<string, GenericDocumentTypeTypes>;

export function getFerdigClient(): FerdigClient {
    if (!client) {
        client = new FerdigClient({
            host: getEnvVar('VUE_APP_FERDIG_HOST', 'string'),
        });
    }

    return client;
}
