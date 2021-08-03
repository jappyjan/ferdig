import {ActionTree} from 'vuex';
import {RootState} from '@/store/RootState';
import {State} from './State';
import {getFerdigClient} from '@/api';
import {makeCrudActions} from '@/store/module-templates/makeCrudActions';

export const actions: ActionTree<State, RootState> = {
    ...makeCrudActions<State>(() => Promise.resolve(getFerdigClient().applications)),
}
