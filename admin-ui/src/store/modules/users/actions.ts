import {ActionTree} from 'vuex';
import {RootState} from '@/store/RootState';
import {State} from './State';
import {getFerdigClient} from '@/api';
import {State as ApplicationsState} from '../applications/State';
import {makeCrudActions} from '@/store/module-templates/makeCrudActions';
import {FerdigAuthSignupPayload} from '../../../../../../ferdig-client-js';
import {FerdigUsersListParams} from '../../../../../../ferdig-client-js/dist/Users';

export const actions: ActionTree<State, RootState> = {
    ...makeCrudActions<State>(async ({rootState}) => {
        const applicationsState = (rootState as unknown as { applications: ApplicationsState }).applications;

        if (!applicationsState.activeApplication) {
            throw new Error('Cannot get Users: no activeApplication');
        }

        const usersClient = getFerdigClient().users;
        const oldCreate = usersClient.create.bind(usersClient);
        usersClient.create = ({email, password}: Omit<FerdigAuthSignupPayload, 'applicationId'>) => oldCreate({
            applicationId: applicationsState.activeApplication?.id ?? '-',
            email,
            password,
        });
        const oldList = usersClient.list.bind(usersClient);
        usersClient.list = (params: FerdigUsersListParams) => oldList(
            params,
            applicationsState.activeApplication?.id,
        );

        return usersClient;
    }),
}
