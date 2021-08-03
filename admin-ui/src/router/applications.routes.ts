import UsersHome from '@/views/applications/users/UsersHome.vue';
import CollectionsHome from '@/views/applications/collections/CollectionsHome.vue';
import CollectionDetails from '@/views/applications/collections/collection-details/CollectionDetails.vue';
import AutomationsHome from '@/views/applications/automations/AutomationsHome.vue';
import AutomationFlowEditor from '@/views/applications/automations/details/AutomationFlowEditor.vue';
import NotificationTemplatesHome from '@/views/applications/notifications/templates/NotificationTemplatesHome.vue';
import NotificationTemplateEditor from '@/views/applications/notifications/templates/NotificationTemplateEditor.vue';
import {RouteConfig} from 'vue-router';
import SettingsHome from '@/views/applications/settings/SettingsHome.vue';

export const applicationsRoutes: Array<RouteConfig> = [
    {
        path: '/applications/:applicationId/users',
        name: 'Home of Users',
        component: UsersHome,
    },
    {
        path: '/applications/:applicationId/collections',
        name: 'Home of Collections',
        component: CollectionsHome,
    },
    {
        path: '/applications/:applicationId/collections/:collectionId',
        name: 'Collection Documents',
        props: true,
        component: CollectionDetails,
    },
    {
        path: '/applications/:applicationId/automations',
        name: 'Home of Automations',
        component: AutomationsHome,
    },
    {
        path: '/applications/:applicationId/automations/:automationId',
        name: 'Automation-Flow Editor',
        props: true,
        component: AutomationFlowEditor,
    },
    {
        path: '/applications/:applicationId/notification-templates',
        name: 'Notification-Templates Home',
        component: NotificationTemplatesHome,
    },
    {
        path: '/applications/:applicationId/notification-templates/:templateId',
        name: 'Notification-Template Editor',
        props: true,
        component: NotificationTemplateEditor,
    },
    {
        path: '/applications/:applicationId/settings',
        name: 'Settings Home',
        props: true,
        component: SettingsHome,
    },
]
