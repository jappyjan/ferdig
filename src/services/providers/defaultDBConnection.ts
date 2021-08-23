import {Configuration, registerProvider} from "@tsed/di";
import {createConnection} from "@tsed/typeorm";
import {Connection, ConnectionOptions} from "typeorm";

export const DEFAULT_DB_CONNECTION = Symbol.for("DEFAULT_DB_CONNECTION");
export type DEFAULT_DB_CONNECTION = Connection;

registerProvider({
    provide: DEFAULT_DB_CONNECTION,
    deps: [Configuration],
    async useAsyncFactory(configuration: Configuration) {
       const settings = configuration.get<ConnectionOptions[]>("typeorm") as ConnectionOptions[];
       const connectionOptions = settings.find(o => o.name === "default") as ConnectionOptions;

       return createConnection(connectionOptions);
    }
});
