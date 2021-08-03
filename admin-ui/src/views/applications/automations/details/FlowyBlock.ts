import {
    FerdigApplicationAutomationFlowNodeConfigValueCreateData,
    FerdigApplicationAutomationFlowNodeType,
} from '@ferdig/client-js';

export interface FlowyBlockConfigValueDefinition {
    key: string;
    required: boolean;
}

export enum PayloadValueType {
    String = 'String',
    Number = 'Number',
    Boolean = 'Boolean',
    Date = 'Date'
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export type PayloadObjectType = Record<string, PayloadValueType | PayloadObjectType>

export interface FlowyBlock {
    nodeType: FerdigApplicationAutomationFlowNodeType;
    label: string;
    icon?: string;
    description: string;
    acceptsParents: boolean;
    acceptsChildren: boolean;
    configurator: string | null;
    configValues: FerdigApplicationAutomationFlowNodeConfigValueCreateData[];
    editorDescription?: string;
    returnedPayload: PayloadObjectType;
}
