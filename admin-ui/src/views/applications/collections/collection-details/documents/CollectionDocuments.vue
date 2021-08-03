<template>
  <div>
    <v-card-text v-if="showError">
      <v-alert type="error"
               v-model="showError"
      >
        {{ error }}
      </v-alert>
    </v-card-text>
    <v-data-table :headers="tableHeaders"
                  :items="documents"
                  :options.sync="tableOptions"
                  :loading="isLoadingDocuments"
                  disable-sort
                  @click:row="document => $emit('click:document', document)"
                  class="pointer"
                  :server-items-length="totalItems"
    >
      <template v-slot:item.createdAt="{ item }">
        {{ item.createdAt.toLocaleString() }}
      </template>
      <template v-slot:item.updatedAt="{ item }">
        {{ item.updatedAt.toLocaleString() }}
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {VuetifyDataTableOptions} from '@/shared-types/vuetify-data-table-options';
import {
  FerdigApplicationCollection,
  FerdigCollectionDocumentDefaultProperties,
  FerdigListResult,
} from '@ferdig/client-js';
import {Prop, Watch} from 'vue-property-decorator';
import {GenericDocumentType, getFerdigClient} from '@/api';
import {BehaviorSubject} from 'rxjs';

@Component({})
export default class CollectionDocuments extends Vue {
  @Prop({required: true})
  private applicationId!: string;

  @Prop({required: true})
  private collection!: FerdigApplicationCollection;

  private tableOptions: VuetifyDataTableOptions = {
    sortBy: [],
    sortDesc: [],
    page: 1,
    itemsPerPage: 10,
  }
  private isLoadingDocuments = true;
  // noinspection JSMismatchedCollectionQueryUpdate
  private documents: (GenericDocumentType & FerdigCollectionDocumentDefaultProperties)[] = [];
  private error: string | null = null;
  private showError = false;
  private listObserver: BehaviorSubject<FerdigListResult<GenericDocumentType & FerdigCollectionDocumentDefaultProperties>> | null = null;
  private totalItems = 0;

  private get tableHeaders() {
    if (!this.collection) {
      return [];
    }

    return this.collection.columns.map((column) => ({
      text: column.internalName,
      value: column.internalName,
    }));
  }

  @Watch('tableOptions', {deep: true})
  @Watch('collection.id')
  private async fetchDocuments() {
    if (!this.collection) {
      return;
    }

    try {
      this.isLoadingDocuments = true;

      const {itemsPerPage, page} = this.tableOptions;
      const skip = itemsPerPage * (page - 1);

      if (this.listObserver) {
        this.listObserver.complete();
      }

      this.listObserver = await getFerdigClient().applications
          .collections(this.applicationId)
          .documents<GenericDocumentType>(this.collection.id)
          .listAndObserve({
            filter: null,
            pagination: {
              skip,
              take: itemsPerPage,
            },
          });

      // eslint-disable-next-line
      this.listObserver!.subscribe((result) => {
        this.documents = result.items;
        this.totalItems = result.items.length + (result.moreAvailable ? 1 : 0);
      });

      this.showError = false;
    } catch (e) {
      this.error = e.message;
      this.showError = true;
    } finally {
      this.isLoadingDocuments = false;
    }
  }
}
</script>
