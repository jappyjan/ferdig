<template>
  <v-app>
    <splash-screen/>
    <auth-dialog/>

    <app-bar @toggle-drawer="showAppNavigation = !showAppNavigation"/>

    <app-navigation-drawer :show="showAppNavigation"
                           @close="showAppNavigation = false"
    />

    <v-main>
      <v-progress-linear
          :active="loadingCount > 0"
          indeterminate
          absolute
          top
          color="deep-purple"
      />

      <ferdig-update-banner/>

      <v-breadcrumbs v-if="breadcrumbs.length > 0" :items="breadcrumbs">
        <template v-slot:item="{ item }">
          <v-breadcrumbs-item v-bind="item">
            <span>{{ item.text }}</span>
          </v-breadcrumbs-item>

          <v-tooltip v-if="item.copy" bottom>
            <template v-slot:activator="{on, attrs}">
              <v-btn @click="copy(item.copy.value)"
                     icon
                     v-bind="attrs"
                     v-on="on"
                     small
              >
                <v-icon small>mdi-content-copy</v-icon>
              </v-btn>
            </template>

            <span>Copy {{item.copy.label}}</span>
          </v-tooltip>
        </template>
      </v-breadcrumbs>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import AppBar from '@/components/layout/AppBar.vue';
import AuthDialog from '@/components/auth/AuthDialog.vue';
import {getEnvVar} from '@/utils/env';
import {getFerdigClient} from '@/api';
import SplashScreen from '@/components/layout/SplashScreen.vue';
import AnimatedLogo from '@/components/Logo/AnimatedLogo.vue';
import AppNavigationDrawer from '@/components/layout/AppNavigationDrawer.vue';
import {State} from 'vuex-class';
import {Breadcrumb} from '@/store/RootState';
import FerdigUpdateBanner from '@/components/layout/FerdigUpdateBanner.vue';

@Component({
  components: {
    FerdigUpdateBanner,
    AppNavigationDrawer,
    AnimatedLogo,
    SplashScreen,
    AuthDialog,
    AppBar,
  },
})
export default class App extends Vue {
  @State('loadingCount')
  private loadingCount!: number;

  @State('breadcrumbs')
  private breadcrumbs!: Breadcrumb[];

  private showAppNavigation: boolean | null = null;

  // noinspection JSUnusedLocalSymbols
  private mounted() {
    this.initFerdig();
  }

  private async initFerdig() {
    const tokenLocalStorageKey = getEnvVar('VUE_APP_FERDIG_TOKEN_LOCAL_STORAGE_KEY', 'string');
    const previousToken = localStorage.getItem(tokenLocalStorageKey);

    if (!previousToken) {
      return;
    }

    const client = await getFerdigClient();
    client.setToken(previousToken);

    const user = await client.auth.getCurrentUser();
    await this.$store.dispatch('auth/setSession', {user, token: previousToken});
  }

  // noinspection JSMethodCanBeStatic
  private async copy(value: string): Promise<void> {
    await navigator.clipboard.writeText(value);

    await this.$dialog.notify.success('Copied!');
  }
}
</script>
