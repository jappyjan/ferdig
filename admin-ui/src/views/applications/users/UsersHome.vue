<template>
  <v-container>
    <v-card>
      <v-card-title>Users</v-card-title>

      <v-alert :value="status === 'error'"
               type="error"
      >
        {{ error }}
      </v-alert>

      <v-data-table :headers="tableHeaders"
                    :items="users"
                    :loading="status === 'loading'"
      >
        <template v-slot:item.createdAt="{ item }">
          {{ item.createdAt.toLocaleString() }}
        </template>
        <template v-slot:item.updatedAt="{ item }">
          {{ item.updatedAt.toLocaleString() }}
        </template>
        <template v-slot:item.disabled="{ item }">
          {{ item.disabled ? 'Yes' : 'No' }}
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {FerdigApplication, FerdigUser} from '@ferdig/client-js';
import {State} from 'vuex-class';
import {StateStatus} from '@/store/StateStatus';
import {Watch} from 'vue-property-decorator';
import {Breadcrumb} from '@/store/RootState';

@Component({})
export default class UsersHome extends Vue {
  @State('activeApplication', {namespace: 'applications'})
  private activeApplication!: FerdigApplication | null;

  @State('items', {namespace: 'users'})
  private users!: FerdigUser[];

  @State('status', {namespace: 'users'})
  private status!: StateStatus;

  @State('error', {namespace: 'users'})
  private error!: string;

  // noinspection JSMethodCanBeStatic
  private get tableHeaders() {
    return [
      {
        text: 'E-Mail',
        align: 'start',
        value: 'email',
      },
      {text: 'Created At', value: 'createdAt'},
      {text: 'Updated At', value: 'updatedAt'},
      {text: 'Disabled', value: 'disabled'},
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
        to: `/applications/${this.activeApplication?.id}/users`,
        text: 'Users',
        exact: true,
      },
    ] as Breadcrumb[])
  }
}
</script>
