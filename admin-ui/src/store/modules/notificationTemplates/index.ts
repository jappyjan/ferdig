import {Module} from 'vuex';
import {State} from './State';
import {RootState} from '@/store/RootState';
import {actions} from './actions';
import {mutations} from './mutations';
import {getters} from './getters';

export const notificationTemplates: Module<State, RootState> = {
    namespaced: true,
    state: new State(),
    mutations,
    actions,
    getters,
};
