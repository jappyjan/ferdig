<template>
  <v-container>
    <v-card>
      <v-btn fab
             absolute top right
             color="success"
             @click="createCollection()"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>

      <v-card-title>
        Collections
      </v-card-title>


      <v-alert :value="status === 'error'"
               type="error"
      >
        {{ error }}
      </v-alert>

      <v-data-table :headers="tableHeaders"
                    :items="collections"
                    :loading="status === 'loading'"
                    :items-per-page="15"
                    v-if="activeApplication"
                    @click:row="collection => $router.push(`/applications/${activeApplication.id}/collections/${collection.id}`)"
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
import {FerdigApplicationCollection, FerdigApplicationCollectionDocumentAccessRuleOperator} from '@ferdig/client-js';
import {getFerdigClient} from '@/api';
import {State} from 'vuex-class';
import {StateStatus} from '@/store/StateStatus';
import {Breadcrumb} from '@/store/RootState';
import {Watch} from 'vue-property-decorator';

@Component({})
export default class UsersHome extends Vue {
  @State('activeApplication', {namespace: 'applications'})
  private activeApplication!: FerdigApplicationCollection | null;

  @State('items', {namespace: 'collections'})
  private collections!: FerdigApplicationCollection[];

  @State('status', {namespace: 'collections'})
  private status!: StateStatus;

  @State('error', {namespace: 'collections'})
  private error!: string;

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
        to: `/applications/${this.activeApplication?.id}/collections`,
        text: 'Collections',
        exact: true,
      }
    ] as Breadcrumb[])
  }

  private async createCollection() {
    if (!this.activeApplication) {
      return;
    }

    const internalName = await this.$dialog.prompt({
      text: 'How do you wanna call the new Collection?',
    });

    if (!internalName) {
      return;
    }

    const collection = await (await getFerdigClient())
        .applications
        .collections(this.activeApplication.id)
        .create({
          internalName,
          readAccessRule: {
            leftSide: '1',
            operator: FerdigApplicationCollectionDocumentAccessRuleOperator.EQUAL,
            rightSide: '1',
            and: [],
            or: [],
          },
          writeAccessRule: {
            leftSide: '1',
            operator: FerdigApplicationCollectionDocumentAccessRuleOperator.EQUAL,
            rightSide: '1',
            and: [],
            or: [],
          },
        });

    await this.$router.push(`/applications/${this.activeApplication.id}/collections/${collection.id}?tab=columns`);
  }
}
</script>
