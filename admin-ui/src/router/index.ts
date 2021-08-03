import Vue from 'vue'
import VueRouter, {RouteConfig} from 'vue-router'
import PageNotFound from '@/views/PageNotFound.vue';
import ApplicationsHome from '@/views/applications/ApplicationsHome.vue';
import {applicationsRoutes} from '@/router/applications.routes';
import ApplicationRouterParent from '@/views/applications/ApplicationRouterParent.vue';
import Store from '../store';

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
    {
        path: '/',
        redirect: '/applications',
    },
    {
        path: '/applications',
        name: 'Applications',
        component: ApplicationsHome,
    },
    {
        path: '/applications/:applicationId',
        redirect: '/applications/:applicationId/users',
        component: ApplicationRouterParent,
        children: applicationsRoutes,
        props: true,
    },
    {
        path: '*',
        name: 'Page not found',
        component: PageNotFound,
    },
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
});

router.beforeEach((to, from, next) => {
    Store.commit('setBreadcrumbs', []);
    next();
});

export default router
