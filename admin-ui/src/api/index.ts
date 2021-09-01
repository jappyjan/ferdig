import {FerdigApplicationConfigurationEmailClientType, FerdigClient} from '@ferdig/client-js';
import {getEnvVar} from '@/utils/env';
import {localStorageKey} from '@/store/LocalStorageKey';

let client: FerdigClient<FerdigApplicationConfigurationEmailClientType> | null = null;

export type GenericDocumentTypeTypes = number | Date | File | string | null | GenericDocumentTypeTypes[];
export type GenericDocumentType = Record<string, GenericDocumentTypeTypes>;

async function makeClientSingleton(): Promise<void> {
    client = new FerdigClient({
        host: getEnvVar('VUE_APP_FERDIG_ADMIN_UI_API_HOST', 'string', location.origin),
    });

    const previousToken = localStorage.getItem(localStorageKey);

    if (previousToken) {
        client.setToken(previousToken);
    } else {
        await client.auth.startSession({protocol: 'anonymous'});
    }
}

export async function getFerdigClient(): Promise<FerdigClient<FerdigApplicationConfigurationEmailClientType>> {
    if (!client) {
        await makeClientSingleton();
    }
    return client!;
}
