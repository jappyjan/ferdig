import {Module} from 'vuex';
import {State} from './State';
import {RootState} from '@/store/RootState';
import {actions} from './actions';
import {mutations} from './mutations';
import {getters} from './getters';
import {CrudState} from '@/store/module-templates/CrudState';
import {FerdigApplicationAutomation} from '@ferdig/client-js';

export const automations: Module<State, RootState> = {
    namespaced: true,
    state: new CrudState<FerdigApplicationAutomation>(),
    mutations,
    actions,
    getters,
};
