import Vue from 'vue';
import Vuex from 'vuex';
import {applications} from '@/store/modules/applications';
import {auth} from '@/store/modules/auth';
import {Breadcrumb, RootState} from '@/store/RootState';
import {collections} from '@/store/modules/collections';
import {notificationTemplates} from '@/store/modules/notificationTemplates';
import {automations} from '@/store/modules/automations';
import {users} from '@/store/modules/users';

Vue.use(Vuex)

const store = new Vuex.Store({
    state: new RootState(),
    mutations: {
        startLoading(state) {
            state.loadingCount++;
        },
        endLoading(state) {
            state.loadingCount--;
        },
        setBreadcrumbs(state, crumbs: Breadcrumb[]) {
            state.breadcrumbs = crumbs;
        },
    },
    actions: {},
    modules: {
        applications,
        auth,
        collections,
        notificationTemplates,
        automations,
        users,
    },
});

export default store;
