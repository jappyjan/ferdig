import {FlowyBlock, PayloadValueType} from '@/views/applications/automations/details/FlowyBlock';
import {FerdigApplicationAutomationFlowNode, FerdigApplicationAutomationFlowNodeType} from '@ferdig/client-js';

const defaultEntityProperties = {
    id: PayloadValueType.String,
    createdAt: PayloadValueType.Date,
    updatedAt: PayloadValueType.Date,
};

const UserAsPayload = {
    ...defaultEntityProperties,
    email: PayloadValueType.String,
    emailValidationToken: PayloadValueType.String,
    notificationSettings: {
        ...defaultEntityProperties,
        wantsPushNotification: PayloadValueType.Boolean,
    },
};

export const blocks: FlowyBlock[] = [
    {
        nodeType: FerdigApplicationAutomationFlowNodeType.User_Created,
        label: 'On: User created',
        description: 'When a user was created',
        acceptsChildren: true,
        acceptsParents: false,
        icon: 'mdi-account-plus',
        configValues: [],
        configurator: null,
        returnedPayload: UserAsPayload,
    },
    {
        nodeType: FerdigApplicationAutomationFlowNodeType.Auth_Login,
        label: 'On: Login',
        description: 'When a user successfully authenticates',
        acceptsChildren: true,
        acceptsParents: false,
        icon: 'mdi-login',
        configValues: [],
        configurator: null,
        returnedPayload: UserAsPayload,
    },
    {
        nodeType: FerdigApplicationAutomationFlowNodeType.NotificationTemplate_Load,
        label: 'Do: Load Notification Template',
        description: 'Load a Notification Template by its id and passes it to the next block',
        acceptsChildren: true,
        acceptsParents: true,
        icon: 'mdi-message-draw',
        configurator: 'notification-template-load-node-configurator',
        editorDescription: 'This will fetch a Template by its ID and fills its placeholders with values from the payload. If "templateId" is set inside the payload, it will overwrite this configuration',
        configValues: [],
        returnedPayload: {
            ...defaultEntityProperties,
            internalName: PayloadValueType.String,
            subject: PayloadValueType.String,
            body: PayloadValueType.String,
        },
    },
    {
        nodeType: FerdigApplicationAutomationFlowNodeType.Automation_ChangePayload,
        label: 'Do: Change Payload',
        description: 'Change/Set Keys of the Payload',
        acceptsChildren: true,
        acceptsParents: true,
        icon: 'mdi-pencil',
        configurator: 'automation-change-payload-node-configurator',
        configValues: [],
        returnedPayload: {},
    },
    {
        nodeType: FerdigApplicationAutomationFlowNodeType.Automation_MapPayload,
        label: 'Do: Map Payload',
        description: 'Copy Values of one Key of the Payload to another',
        acceptsChildren: true,
        acceptsParents: true,
        icon: 'mdi-pencil',
        configurator: 'automation-map-payload-node-configurator',
        configValues: [],
        returnedPayload: {},
    },
    {
        nodeType: FerdigApplicationAutomationFlowNodeType.Notifications_Send,
        label: 'Do: Send Notification',
        description: 'Send a Notification',
        editorDescription: 'This will send a Notification to a User. If any config key is set inside the payload, it will overwrite this configuration',
        acceptsChildren: true,
        acceptsParents: true,
        icon: 'mdi-send',
        configurator: 'notifications-send-node-configurator',
        configValues: [],
        returnedPayload: {},
    },
];

export function nodeTypeToFlowBlockData(node: FerdigApplicationAutomationFlowNode): FlowyBlock {
    const block = blocks.find((block) => block.nodeType === node.type);

    if (!block) {
        throw new Error(`Unknown Flow-Block Type: ${node.type}`);
    }

    block.configValues = node.configValues;

    return block;
}
