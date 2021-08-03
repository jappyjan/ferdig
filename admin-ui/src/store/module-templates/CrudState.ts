import {StateStatus} from '@/store/StateStatus';

export interface CrudStateItem {
    id: string;
}

export type BasicCrudState = CrudState<CrudStateItem>;

export class CrudState<T extends CrudStateItem> {
    status: StateStatus = StateStatus.loading;
    items: T[] = [];
    error: Error | null = null;
}
