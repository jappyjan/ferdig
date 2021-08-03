<template>
  <v-container grid-list-md>
    <v-card>
      <v-card-title>{{ collection ? collection.internalName : '-' }}</v-card-title>

      <v-btn fab
             absolute
             top
             right
             color="success"
             v-if="activeTab === null || activeTab === 0"
             @click="editDocument('new')"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>

      <v-card-text v-if="showError">
        <v-alert type="error"
                 v-model="showError"
        >
          {{ error }}
        </v-alert>
      </v-card-text>

      <v-tabs v-model="activeTab" grow>
        <v-tab>Documents</v-tab>
        <v-tab>Columns</v-tab>
        <v-tab>Settings</v-tab>

        <v-tab-item>
          <collection-documents :application-id="activeApplication.id"
                                v-if="activeApplication"
                                :collection="collection"
                                @click:document="editDocument"
          />
        </v-tab-item>

        <v-tab-item>
          <collection-columns-editor :collection="collection"
                                     :application-id="activeApplication.id"
                                     @update:column="onColumnEdit"
                                     v-if="activeApplication && collection"
          />
        </v-tab-item>

        <v-tab-item>
          <collection-editor :collection="collection"
                             :application-id="activeApplication.id"
                             @update="newData => collection = newData"
                             v-if="activeApplication && collection"
          />
        </v-tab-item>
      </v-tabs>
    </v-card>
    <collection-document-editor-bottom-sheet :application-id="activeApplication.id"
                                             v-if="activeApplication"
                                             :collection="collection"
                                             :document="documentToEdit"
                                             :show="showEditor"
                                             @close="showEditor = false"
                                             @save="showEditor = false"
    />
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {
  FerdigApplication,
  FerdigApplicationCollection,
  FerdigApplicationCollectionColumn,
  FerdigCollectionDocumentDefaultProperties,
} from '@ferdig/client-js';
import {Prop, Watch} from 'vue-property-decorator';
import {GenericDocumentType, getFerdigClient} from '@/api';
import CollectionEditor from '@/views/applications/collections/collection-details/settings/CollectionEditor.vue';
import CollectionColumnsEditor
  from '@/views/applications/collections/collection-details/columns/CollectionColumnsEditor.vue';
import CollectionDocuments from '@/views/applications/collections/collection-details/documents/CollectionDocuments.vue';
import CollectionDocumentEditorBottomSheet
  from '@/components/applications/collections/CollectionDocumentEditorBottomSheet.vue';
import {State} from 'vuex-class';
import {Breadcrumb} from '@/store/RootState';

@Component({
  components: {
    CollectionDocumentEditorBottomSheet,
    CollectionDocuments,
    CollectionColumnsEditor,
    CollectionEditor,
  },
})
export default class CollectionDetails extends Vue {
  @State('activeApplication', {namespace: 'applications'})
  private activeApplication!: FerdigApplication | null;

  @Prop({required: true})
  private collectionId!: string;

  private collection: FerdigApplicationCollection | null = null;
  private isLoadingCollection = true;
  private error: string | null = null;
  private showError = false;
  private readonly tabs = [
    'documents',
    'columns',
    'settings',
  ];
  private documentToEdit: null | GenericDocumentType & FerdigCollectionDocumentDefaultProperties = null;
  private showEditor = false;

  private get activeTab(): number | null {
    const tabName = this.$route.query.tab;

    const indexOfTab = this.tabs.findIndex((t) => t === tabName);
    if (indexOfTab === -1) {
      return null;
    }

    return indexOfTab;
  }

  // noinspection JSUnusedLocalSymbols
  private set activeTab(tabIndex: number | null) {
    const tabName = this.tabs[tabIndex || 0];

    this.$router.push({
      query: {
        ...this.$route.query,
        tab: tabName,
      },
    });
  }

  @Watch('activeApplication', {immediate: true})
  @Watch('collection')
  @Watch('activeTab')
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
        to: `/applications/${this.activeApplication?.id}/collections`,
        text: 'Collections',
        exact: true,
      },
      {
        to: `/applications/${this.activeApplication?.id}/collections/${this.collectionId}`,
        text: this.collection?.internalName ?? '-',
        exact: false,
      },
    ] as Breadcrumb[])
  }

  @Watch('collectionId', {immediate: true})
  @Watch('activeApplication')
  private async fetchCollection() {
    if (!this.activeApplication) {
      return;
    }

    try {
      this.isLoadingCollection = true;

      this.collection = await getFerdigClient()
          .applications
          .collections(this.activeApplication.id)
          .get(this.collectionId);

      this.showError = false;
    } catch (e) {
      this.error = e.message;
      this.showError = true;
    } finally {
      this.isLoadingCollection = false;
    }
  }

  private onColumnEdit({id, data}: { id: string, data: FerdigApplicationCollectionColumn | null }) {
    if (!this.collection) {
      return;
    }

    if (data === null) {
      this.collection.columns = this.collection.columns.filter((column) => column.id !== id);
      return;
    }

    let found = false;
    this.collection.columns = this.collection.columns.map((column) => {
      if (column.id === id) {
        found = true;
        return data;
      }

      return column;
    });

    if (!found) {
      this.collection.columns.push(data);
    }
  }

  private generateEmptyDocument(): GenericDocumentType & FerdigCollectionDocumentDefaultProperties {
    const document: GenericDocumentType & FerdigCollectionDocumentDefaultProperties = {
      id: 'new',
      updatedAt: new Date(),
      createdAt: new Date(),
    };

    this.collection?.columns.forEach((column) => {
      document[column.internalName] = '';
    });

    return document;
  }

  private editDocument(document: null | 'new' | GenericDocumentType & FerdigCollectionDocumentDefaultProperties) {
    if (document === 'new') {
      document = this.generateEmptyDocument();
    }

    this.documentToEdit = document;
    this.showEditor = document !== null;
  }
}
</script>
