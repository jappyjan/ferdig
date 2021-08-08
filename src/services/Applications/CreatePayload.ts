export interface CreateConfigurationEmailPayload {
    host: string;
    port: number;
    ssl: boolean;
    authUser: string;
    authPassword: string;
    fromName: string;
    fromAddress: string;
}

export interface CreateConfigurationPayload {
    email: CreateConfigurationEmailPayload;
}

export interface CreatePayload {
    internalName: string;
    configuration: CreateConfigurationPayload;
}
