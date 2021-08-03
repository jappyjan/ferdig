import {MutationTree} from 'vuex';
import {StateStatus} from '@/store/StateStatus';
import {BasicCrudState} from '@/store/module-templates/CrudState';

export function makeCrudMutations<State extends BasicCrudState>(): MutationTree<State> {
    return {
        setStatus(state, status: StateStatus) {
            state.status = status;
        },
        setError(state, error: Error | null) {
            state.error = error;
        },
        save(state, data: State['items'][number]) {
            let found = false;
            state.items = state.items.map((existingItem) => {
                if (existingItem.id === data.id) {
                    found = true;
                    return data;
                }

                return existingItem;
            });

            if (!found) {
                state.items.push(data);
            }
        },
        remove(state, id: string) {
            state.items = state.items.filter((item) => {
                return item.id !== id;
            });
        },
        keepByIds(state, idsToKeep: string[]) {
            state.items = state.items.filter((application) => idsToKeep.includes(application.id));
        },
    }
}
