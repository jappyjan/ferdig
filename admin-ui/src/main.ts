import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import '@mdi/font/css/materialdesignicons.min.css';
import Particles from 'particles.vue';
import VuetifyDialog from 'vuetify-dialog';
import 'vuetify-dialog/dist/vuetify-dialog.css';
import './plugins/flowy';

Vue.use(Particles);

Vue.config.productionTip = false

Vue.use(VuetifyDialog, {
    context: {vuetify},
    confirm: {
        title: 'Are you sure?',
        actions: {
            false: 'No',
            true: {
                text: 'Yes',
                color: 'primary',
            },
        },
    },
    warning: {
        title: 'Warning!',
        actions: {
            true: {
                text: 'OK!',
                color: 'warning',
            },
        },
    },
    error: {
        title: 'Oh no!',
        actions: {
            true: {
                text: 'OK!',
                color: 'error',
            },
        },
    },
    prompt: {
        title: 'Hey!',
        actions: {
            false: 'Cancel',
            true: {
                text: 'OK',
                color: 'primary',
            },
        },
    },
});

const app = new Vue({
    router,
    store,
    vuetify,
    render: h => h(App),
}).$mount('#app')

export {app};
