<template>
  <v-navigation-drawer v-model="showVal"
                       app
                       persistent
                       mobile-breakpoint="800"
                       class="drawer"
  >
    <template v-if="activeApplicationLogoSrc">
      <img :src="activeApplicationLogoSrc" class="mr-3 ml-3 mt-3" alt="Logo"/>
    </template>
    <template v-else>
      <animated-logo class="mr-3 ml-3 mt-3"/>
    </template>

    <v-divider/>

    <v-list>
      <v-list-item to="/applications" exact>
        <v-list-item-content>
          <v-list-item-title>
            {{ activeApplication ? activeApplication.internalName : 'Select an Application' }}
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-action>
          <v-icon right>mdi-chevron-right</v-icon>
        </v-list-item-action>
      </v-list-item>
    </v-list>

    <v-divider/>

    <v-list>
      <v-list-item v-for="appArea in appAreas"
                   :key="appArea.path"
                   :to="!appArea.path.startsWith('http') ? appArea.path : undefined"
                   :href="appArea.path.startsWith('http') ? appArea.path : undefined"
                   :target="appArea.target"
                   :disabled="appArea.disabled"
      >
        <v-list-item-icon>
          <v-icon>{{ appArea.icon }}</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ appArea.label }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {Prop, Watch} from 'vue-property-decorator';
import AnimatedLogo from '@/components/Logo/AnimatedLogo.vue';
import {State} from 'vuex-class';
import {FerdigApplication} from '@ferdig/client-js';
import {getFerdigClient} from '@/api';
import {errorMessage} from '@/utils/dialog';

interface AppArea {
  path: string;
  label: string;
  icon: string;
  target?: string;
  disabled?: boolean;
}

@Component({
  components: {AnimatedLogo},
})
export default class AppNavigationDrawer extends Vue {
  @Prop()
  private show!: boolean | null;

  @State('activeApplication', {namespace: 'applications'})
  private activeApplication!: FerdigApplication | null;

  private activeApplicationLogoSrc = '';

  private get showVal() {
    return this.show;
  }

  // noinspection JSUnusedLocalSymbols
  private set showVal(val: boolean | null) {
    if (!val) {
      this.$emit('close');
    }
  }

  public get appAreas(): Array<AppArea> {
    return [
      {
        path: `/applications/${this.activeApplication?.id}/users`,
        label: 'Users',
        icon: 'mdi-account-multiple',
        disabled: !this.activeApplication,
      },
      {
        path: `/applications/${this.activeApplication?.id}/collections`,
        label: 'Collections',
        icon: 'mdi-database',
        disabled: !this.activeApplication,
      },
      {
        path: `/applications/${this.activeApplication?.id}/automations`,
        label: 'Automations',
        icon: 'mdi-graph',
        disabled: !this.activeApplication,
      },
      {
        path: `/applications/${this.activeApplication?.id}/notification-templates`,
        label: 'Notification-Templates',
        icon: 'mdi-bell',
        disabled: !this.activeApplication,
      },
      {
        path: `/applications/${this.activeApplication?.id}/settings`,
        label: 'Settings',
        icon: 'mdi-cog',
        disabled: !this.activeApplication,
      },
    ];
  }

  @Watch('activeApplication', {immediate: true})
  private async fetchLogo() {
    if (this.activeApplicationLogoSrc) {
      URL.revokeObjectURL(this.activeApplicationLogoSrc);
    }

    if (!this.activeApplication) {
      return;
    }

    try {
      // TODO: implement logo on server side
      const logoBlob = await (await getFerdigClient())
          .applications
          .getLogo(this.activeApplication.id);
      this.activeApplicationLogoSrc = URL.createObjectURL(logoBlob);
    } catch (e) {
      await errorMessage(e);
    }
  }
}
</script>
