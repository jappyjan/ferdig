<template>
  <div>
    <router-view v-if="activeApplication"/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {Prop, Watch} from 'vue-property-decorator';
import {State} from 'vuex-class';
import {FerdigApplication} from '@ferdig/client-js';
import {StateStatus} from '@/store/StateStatus';

@Component({})
export default class ApplicationRouterParent extends Vue {
  @Prop({required: true})
  private applicationId!: string;

  @State('items', {namespace: 'applications'})
  private applications!: FerdigApplication[];

  @State('status', {namespace: 'applications'})
  private applicationsStatus!: StateStatus;

  @State('activeApplication', {namespace: 'applications'})
  private activeApplication!: FerdigApplication | null;

  @Watch('applicationId', {immediate: true})
  @Watch('applications')
  @Watch('applicationsStatus')
  private async setActiveApplication() {
    if (this.applicationsStatus !== StateStatus.success) {
      return;
    }

    this.$store.commit('applications/setActiveApplication', this.applicationId);

    this.$nextTick(async () => {
      if (this.applicationId && (this.applicationId !== this.activeApplication?.id)) {
        await this.$router.push('/applications');
        return;
      }

      await Promise.all([
        this.$store.dispatch('collections/fetchAll'),
        this.$store.dispatch('notificationTemplates/fetchAll'),
        this.$store.dispatch('automations/fetchAll'),
        this.$store.dispatch('users/fetchAll'),
      ]);
    });
  }
}
</script>
