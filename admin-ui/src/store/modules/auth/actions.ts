import {ActionTree} from 'vuex';
import {RootState} from '@/store/RootState';
import {State} from './State';
import {getFerdigClient} from '@/api';
import {FerdigUser} from '@ferdig/client-js';
import {localStorageKey} from '@/store/LocalStorageKey';

interface LoginPayload {
    email: string;
    password: string;
}

export const actions: ActionTree<State, RootState> = {
    async setSession({commit, dispatch}, {user, token}) {
        (await getFerdigClient()).setToken(token);
        localStorage.setItem(localStorageKey, token);
        commit('setUser', user);
        commit('setToken', token);

        await dispatch('applications/fetchAll', null, {root: true});
    },
    async login({dispatch}, payload: LoginPayload) {
        const session = await (await getFerdigClient())
            .auth
            .startSession({
                data: payload,
                protocol: 'local',
            });

        const user = Object.assign({}, session) as FerdigUser;
        delete (user as unknown as { token: unknown }).token;

        dispatch('setSession', {user, token: session.token});
    },
}
