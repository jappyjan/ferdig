import {Module} from 'vuex';
import {RootState} from '@/store/RootState';
import {actions} from './actions';
import {mutations} from './mutations';
import {getters} from './getters';
import {State} from './State';

export const collections: Module<State, RootState> = {
    namespaced: true,
    state: new State(),
    mutations,
    actions,
    getters,
};
