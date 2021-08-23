<template>
  <v-container>
    <v-card>
      <v-btn fab
             absolute top right
             color="success"
             @click="createTemplate()"
             :loading="isCreating"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>

      <v-card-title>
        Notification-Templates
      </v-card-title>

      <v-alert :value="status === 'error'"
               type="error"
      >
        {{ error }}
      </v-alert>

      <v-alert :value="showError"
               type="error"
      >
        {{ localError }}
      </v-alert>

      <v-data-table :headers="tableHeaders"
                    :items="templates"
                    :items-per-page="15"
                    :loading="status === 'loading'"
                    v-if="activeApplication"
                    @click:row="template => $router.push(`/applications/${activeApplication.id}/notification-templates/${template.id}`)"
                    class="pointer"
      >
        <template v-slot:item.createdAt="{ item }">
          {{ item.createdAt.toLocaleString() }}
        </template>
        <template v-slot:item.updatedAt="{ item }">
          {{ item.updatedAt.toLocaleString() }}
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {getFerdigClient} from '@/api';
import {FerdigApplication, FerdigApplicationNotificationTemplate} from '@ferdig/client-js';
import {State} from 'vuex-class';
import {StateStatus} from '@/store/StateStatus';
import {Watch} from 'vue-property-decorator';
import {Breadcrumb} from '@/store/RootState';

@Component({})
export default class NotificationTemplatesHome extends Vue {
  @State('activeApplication', {namespace: 'applications'})
  private activeApplication!: FerdigApplication | null;

  @State('items', {namespace: 'notificationTemplates'})
  private templates!: FerdigApplicationNotificationTemplate[];

  @State('status', {namespace: 'notificationTemplates'})
  private status!: StateStatus;

  @State('error', {namespace: 'notificationTemplates'})
  private error!: string;

  private isCreating = false;
  private localError = '';
  private showError = false;

  // noinspection JSMethodCanBeStatic
  private get tableHeaders() {
    return [
      {
        text: 'Internal Name',
        align: 'start',
        value: 'internalName',
      },
      {text: 'Created At', value: 'createdAt'},
      {text: 'Updated At', value: 'updatedAt'},
    ];
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
        copy: {
          value: String(this.activeApplication?.id),
          label: 'Application ID'
        }
      },
      {
        to: `/applications/${this.activeApplication?.id}/notification-templates`,
        text: 'Notification-Templates',
        exact: false,
      }
    ] as Breadcrumb[])
  }

  private async createTemplate() {
    if (!this.activeApplication) {
      return;
    }

    const internalName = await this.$dialog.prompt({
      title: 'Give it a name...',
      text: 'How do you wanna call the new Template?',
    });

    if (!internalName) {
      return;
    }

    try {
      this.isCreating = true;
      const template = await (await getFerdigClient())
          .applications
          .notificationTemplates(this.activeApplication.id)
          .create({
            internalName,
            subject: '',
            body: '',
          });

      await this.$router.push(`/applications/${this.activeApplication.id}/notification-templates/${template.id}`)
    } catch (e) {
      this.localError = e.message;
      this.showError = true;
    } finally {
      this.isCreating = false;
    }
  }
}
</script>
