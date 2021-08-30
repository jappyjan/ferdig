import {FerdigApplicationConfigurationEmailClientType, FerdigClient} from '@ferdig/client-js';
import {getEnvVar} from '@/utils/env';

let client: FerdigClient<FerdigApplicationConfigurationEmailClientType> | null = null;

export type GenericDocumentTypeTypes = number | Date | File | string | null | GenericDocumentTypeTypes[];
export type GenericDocumentType = Record<string, GenericDocumentTypeTypes>;

export async function getFerdigClient(): Promise<FerdigClient<FerdigApplicationConfigurationEmailClientType>> {
    if (!client) {
        client = new FerdigClient({
            host: getEnvVar('VUE_APP_FERDIG_ADMIN_UI_API_HOST', 'string', location.origin),
        });
        await client.auth.startSession({protocol: 'anonymous'});
    }

    return client;
}
