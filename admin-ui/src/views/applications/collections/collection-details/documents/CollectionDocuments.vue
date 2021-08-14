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
                  :items="documentsForTableView"
                  :options.sync="tableOptions"
                  :loading="isLoadingDocuments"
                  disable-sort
                  @click:row="tableDoc => $emit('click:document', documents.find((doc) => doc.id === tableDoc.id))"
                  class="pointer"
                  :server-items-length="totalItems"
                  show-expand
                  single-expand
    >
      <template v-slot:item.createdAt="{ item }">
        {{ item.createdAt.toLocaleString() }}
      </template>
      <template v-slot:item.updatedAt="{ item }">
        {{ item.updatedAt.toLocaleString() }}
      </template>

      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length">
          <v-container>
            <template v-for="column in collection.columns">
              <v-btn :key="column.id"
                     v-if="column.valueType === 'file'"
                     block
                     color="primary"
                     :href="fileUrl(column, item)"
                     target="_blank"
              >
                <v-icon left>mdi-download</v-icon>
                Open {{column.internalName}} ({{ fileName(item[column.internalName]) }})
              </v-btn>
            </template>
          </v-container>
        </td>
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
  FerdigApplicationCollectionColumn,
  FerdigApplicationCollectionColumnValueType,
  FerdigCollectionDocumentDefaultProperties,
  FerdigListResult,
} from '@ferdig/client-js';
import {Prop, Watch} from 'vue-property-decorator';
import {GenericDocumentType, getFerdigClient} from '@/api';
import {BehaviorSubject} from 'rxjs';
import {filename} from '@/utils/filename';
import {State} from 'vuex-class';
import {getEnvVar} from '@/utils/env';

@Component({})
export default class CollectionDocuments extends Vue {
  @Prop({required: true})
  private applicationId!: string;

  @Prop({required: true})
  private collection!: FerdigApplicationCollection;

  @State('token', {namespace: 'auth'})
  private authToken!: string | null;

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
  private fileName = filename;

  private get tableHeaders() {
    if (!this.collection) {
      return [];
    }

    return [
      {
        text: 'Created At',
        value: 'createdAt',
      },
      {
        text: 'Updated At',
        value: 'updatedAt',
      },
      ...this.collection.columns.map((column) => ({
        text: column.internalName,
        value: column.internalName,
      })),
    ];
  }

  private get documentsForTableView() {
    return this.documents.map((document) => {
      const dateTimeFormatter = new Intl.DateTimeFormat(navigator.language, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      });

      const mappedDocument: GenericDocumentType & FerdigCollectionDocumentDefaultProperties = {
        ...document,
      }

      this.collection.columns.forEach((column) => {
        if (column.valueType === FerdigApplicationCollectionColumnValueType.File) {
          mappedDocument[column.internalName] = filename(mappedDocument[column.internalName] as string);
        }
        if (column.valueType === FerdigApplicationCollectionColumnValueType.Date) {
          mappedDocument[column.internalName] = dateTimeFormatter.format(mappedDocument[column.internalName] as Date);
        }
      });

      return mappedDocument;
    });
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

  // noinspection JSMethodCanBeStatic
  private fileUrl(column: FerdigApplicationCollectionColumn, documentInTable: GenericDocumentType) {
    const document = this.documents.find((doc) => doc.id === documentInTable.id) as GenericDocumentType;

    const filePath = document[column.internalName];

    if (!filePath) {
      return '';
    }

    // TODO: get a temporary token that can only access this file for a certain amount of time to prevent session hijacking
    return `${getEnvVar('VUE_APP_FERDIG_HOST', 'string')}/api${filePath}?auth=${this.authToken}`;
  }
}
</script>
