import {ActionContext, ActionTree} from 'vuex';
import {RootState} from '@/store/RootState';
import {StateStatus} from '@/store/StateStatus';
import {BasicCrudClient} from '@ferdig/client-js';
import {BasicCrudState} from '@/store/module-templates/CrudState';

type ClientGetter<State extends BasicCrudState> = (props: ActionContext<State, RootState>) => Promise<BasicCrudClient<State['items'][number], unknown, unknown, unknown>>;

export function makeCrudActions<State extends BasicCrudState>(
    clientGetter: ClientGetter<State>,
): ActionTree<State, RootState> {
    return {
        async fetchAll(actionContext) {
            const {commit} = actionContext;

            try {
                commit('startLoading', null, {root: true});
                commit('setStatus', StateStatus.loading);

                const idsToKeep: string[] = [];
                const perPage = 10;

                const client = await clientGetter(actionContext);

                const fetchAllPages = async (lastPage = 0) => {
                    const response = await client
                        .list({
                            skip: lastPage * perPage,
                            take: perPage,
                        });

                    response.items.forEach((app) => {
                        commit('save', app);
                        idsToKeep.push(app.id);
                    });

                    if (response.moreAvailable) {
                        await fetchAllPages(lastPage + 1);
                    }
                }

                await fetchAllPages();
                commit('keepByIds', idsToKeep);
                commit('setError', null);
                commit('setStatus', StateStatus.success);
            } catch (e) {
                commit('setError', e);
                commit('setStatus', StateStatus.error);
            } finally {
                commit('endLoading', null, {root: true});
            }
        },
    }
}
