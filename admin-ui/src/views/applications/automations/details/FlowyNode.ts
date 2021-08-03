import {FlowyBlock} from '@/views/applications/automations/details/FlowyBlock';

export interface FlowyNode {
    id: string;
    parentId: -1 | string;
    nodeComponent: string;
    data: FlowyBlock;
}
