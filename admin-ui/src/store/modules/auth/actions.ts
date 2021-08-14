import {ActionTree} from 'vuex';
import {RootState} from '@/store/RootState';
import {State} from './State';
import {getFerdigClient} from '@/api';
import {FerdigUser} from '@ferdig/client-js';
import {getEnvVar} from '@/utils/env';

interface LoginPayload {
    email: string;
    password: string;
}

export const actions: ActionTree<State, RootState> = {
    async setSession({commit, dispatch}, {user, token}) {
        getFerdigClient().setToken(token);
        const tokenLocalStorageKey = getEnvVar('VUE_APP_FERDIG_TOKEN_LOCAL_STORAGE_KEY', 'string');
        localStorage.setItem(tokenLocalStorageKey, token);
        commit('setUser', user);
        commit('setToken', token);

        await dispatch('applications/fetchAll', null, {root: true});
    },
    async login({dispatch}, payload: LoginPayload) {
        const session = await getFerdigClient().auth.startSession(payload);

        const user = Object.assign({}, session) as FerdigUser;
        delete (user as unknown as { token: unknown }).token;

        dispatch('setSession', {user, token: session.token});
    },
}
