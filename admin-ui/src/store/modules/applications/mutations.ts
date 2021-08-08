import {MutationTree} from 'vuex';
import {State} from './State';
import {makeCrudMutations} from '@/store/module-templates/makeCrudMutations';

export const mutations: MutationTree<State> = {
    ...makeCrudMutations(),
    setActiveApplication(state, applicationId: string | null) {
        state.activeApplication = state.items.find((application) => application.id === applicationId) ?? null;
    },
}
