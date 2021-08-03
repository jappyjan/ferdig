import {ActionTree} from 'vuex';
import {RootState} from '@/store/RootState';
import {State} from './State';
import {getFerdigClient} from '@/api';
import {State as ApplicationsState} from '../applications/State';
import {makeCrudActions} from '@/store/module-templates/makeCrudActions';

export const actions: ActionTree<State, RootState> = {
    ...makeCrudActions<State>(async ({rootState}) => {
        const applicationsState = (rootState as unknown as { applications: ApplicationsState }).applications;

        if (!applicationsState.activeApplication) {
            throw new Error('Cannot get NotificationTemplates: no activeApplication');
        }

        return getFerdigClient().applications.notificationTemplates(applicationsState.activeApplication.id);
    }),
}
