<template>
  <v-container grid-list-md>
    <v-layout wrap>
      <v-flex xs12 md8>
        <v-card width="100%">
          <v-card-title>Settings</v-card-title>
          <v-card-text>
            <v-switch label="Users need to verify E-Mail to login"
                      v-model="verifyEmailForLogin"
                      :disabled="!activeApplication"
                      :loading="isSettingVerifyEmailForLogin"
            />
          </v-card-text>
        </v-card>
      </v-flex>

      <v-flex xs12 md4>
        <v-card color="error" width="100%">
          <v-card-title>Danger-Zone</v-card-title>

          <v-card-actions>
            <v-btn @click="remove"
                   :loading="isRemoving"
            >
              Remove Application
              <v-icon right>mdi-delete</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {State} from 'vuex-class';
import {FerdigApplication} from '@ferdig/client-js';
import {Watch} from 'vue-property-decorator';
import {getFerdigClient} from '@/api';
import {Breadcrumb} from '@/store/RootState';
import {errorMessage} from '@/utils/dialog';

@Component({})
export default class SettingsHome extends Vue {
  @State('activeApplication', {namespace: 'applications'})
  private activeApplication!: FerdigApplication | null;

  private isSettingVerifyEmailForLogin = false;
  private _verifyEmailForLogin = false;
  private isRemoving = false;

  private get verifyEmailForLogin() {
    return this._verifyEmailForLogin;
  }

  // noinspection JSUnusedLocalSymbols
  private set verifyEmailForLogin(val: boolean) {
    this.setVerifyEmailForLogin(val)
  }

  @Watch('activeApplication', {immediate: true})
  private setBreadcrumbs() {
    this.$store.commit('setBreadcrumbs', [
      {
        to: '/applications',
        exact: true,
        text: 'Applications',
      },
      {
        to: `/applications/${this.activeApplication?.id}`,
        text: this.activeApplication?.internalName ?? '-',
        exact: true,
      },
      {
        to: `/applications/${this.activeApplication?.id}/settings`,
        text: 'Settings',
        exact: true,
      },
    ] as Breadcrumb[])
  }

  @Watch('activeApplication', {immediate: true, deep: true})
  private onActiveAppChange() {
    this._verifyEmailForLogin = this.activeApplication?.configuration.loginRequiresValidEmail ?? false;
  }

  private async setVerifyEmailForLogin(val: boolean) {
    if (!this.activeApplication) {
      return;
    }

    const previousVal = this._verifyEmailForLogin;
    this._verifyEmailForLogin = val;

    try {
      this.isSettingVerifyEmailForLogin = true;
      await (await getFerdigClient())
          .applications
          .configuration(this.activeApplication.id)
          .setLoginRequiresValidEmail(val);
    } catch (e) {
      this.$nextTick(() => {
        this._verifyEmailForLogin = previousVal;
      });
    } finally {
      this.isSettingVerifyEmailForLogin = false;
    }
  }

  private async remove() {
    if (!this.activeApplication) {
      return;
    }

    const confirmed = await this.$dialog.confirm({
      text: 'Are you sure you want to remove this application?',
      type: 'error',
    });

    if (!confirmed) {
      return;
    }

    try {
      this.isRemoving = true;
      await (await getFerdigClient())
          .applications
          .remove(this.activeApplication.id);

      this.$store.commit('applications/remove', this.activeApplication.id);
      this.$store.commit('applications/setActiveApplication', null);
      await this.$router.push('/');
    } catch (e) {
      await errorMessage(e);
    } finally {
      this.isRemoving = false;
    }
  }
}
</script>
