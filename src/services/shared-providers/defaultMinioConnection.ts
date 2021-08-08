import {Configuration, registerProvider} from "@tsed/di";
import {Client, ClientOptions} from 'minio';

export const DEFAULT_MINIO_CONNECTION = Symbol.for("DEFAULT_MINIO_CONNECTION");
export type DEFAULT_MINIO_CONNECTION = Client;

registerProvider({
    provide: DEFAULT_MINIO_CONNECTION,
    deps: [Configuration],
    async useAsyncFactory(configuration: Configuration) {
       const options = configuration.get<ClientOptions>("minio") as ClientOptions;
       return new Client(options);
    }
});
