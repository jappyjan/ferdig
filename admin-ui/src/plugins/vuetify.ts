import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import './vuetify.overwrite.sass';
import colors from 'vuetify/es5/util/colors';

Vue.use(Vuetify);

const systemInDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

export default new Vuetify({
    theme: {
        dark: systemInDarkMode,
        themes: {
            dark: {
                primary: colors.purple.base,
                secondary: colors.teal.base,
                accent: colors.cyan.base,
                error: colors.pink.base,
                warning: colors.deepOrange.base,
                info: colors.blueGrey.base,
                success: colors.lime.base,
            },
        },
    },
});
