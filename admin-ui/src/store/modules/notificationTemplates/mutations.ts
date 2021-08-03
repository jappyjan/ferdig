import {MutationTree} from 'vuex';
import {State} from './State';
import {makeCrudMutations} from '@/store/module-templates/makeCrudMutations';

export const mutations: MutationTree<State> = {
    ...makeCrudMutations<State>(),
}
