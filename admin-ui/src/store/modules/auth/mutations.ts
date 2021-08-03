import {MutationTree} from 'vuex';
import {State} from './State';
import {FerdigUser} from '@ferdig/client-js';

export const mutations: MutationTree<State> = {
    setUser(state, user: FerdigUser | null): void {
        state.user = user;
    },
    setToken(state, token: string | null): void {
        state.token = token;
    }
}
