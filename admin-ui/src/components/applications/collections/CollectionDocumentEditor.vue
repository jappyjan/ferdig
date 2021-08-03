<template>
  <v-container grid-list-md v-if="documentVal">
    <v-form @submit.prevent="save()">
      <v-text-field v-for="column in collection.columns"
                    :key="column.id"
                    :label="column.internalName"
                    v-model="documentVal[column.internalName]"
      />

      <v-alert type="error"
               v-model="showError"
      >
        {{ error }}
      </v-alert>

      <v-layout>
        <v-flex grow>
          <v-btn type="button"
                 color="error"
                 text
                 :loading="isDeleting"
                 @click="removeDocument()"
          >
            <span>Remove</span>
            <v-icon right>mdi-delete</v-icon>
          </v-btn>
        </v-flex>
        <v-flex shrink>
          <v-btn type="submit"
                 color="primary"
                 :loading="isSaving"
          >
            <span>Save</span>
            <v-icon right>mdi-floppy</v-icon>
          </v-btn>
        </v-flex>
      </v-layout>
    </v-form>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import CollectionDocumentEditor from '@/components/applications/collections/CollectionDocumentEditor.vue';
import {Prop, Watch} from 'vue-property-decorator';
import {GenericDocumentType, getFerdigClient} from '@/api';
import {FerdigApplicationCollection, FerdigCollectionDocumentDefaultProperties} from '@ferdig/client-js';

@Component({
  components: {CollectionDocumentEditor},
})
export default class CollectionDocumentEditorBottomSheet extends Vue {
  @Prop({required: true})
  private applicationId!: string;

  @Prop({required: true})
  private collection!: FerdigApplicationCollection;

  @Prop({required: true})
  private document!: GenericDocumentType & FerdigCollectionDocumentDefaultProperties;

  private documentId = '';
  private documentVal: GenericDocumentType = {};
  private isSaving = false;
  private error = '';
  private showError = false;
  private isDeleting = false;

  @Watch('document', {immediate: true, deep: true})
  private syncProp() {
    this.showError = false;
    this.error = '';
    this.documentVal = JSON.parse(JSON.stringify(this.document));
    this.documentId = this.document.id;

    delete this.documentVal.createdAt;
    delete this.documentVal.updatedAt;
    delete this.documentVal.id;
  }

  // noinspection JSMethodCanBeStatic
  private async save() {
    try {
      this.isSaving = true;

      const documentsClient = getFerdigClient()
          .applications
          .collections(this.applicationId)
          .documents<GenericDocumentType>(this.collection.id);

      let updatedDocument: GenericDocumentType & FerdigCollectionDocumentDefaultProperties;
      if (this.documentId === 'new') {
        updatedDocument = await documentsClient.create(this.documentVal);
      } else {
        updatedDocument = await documentsClient.update(this.documentId, this.documentVal);
      }

      this.$emit('save', updatedDocument);
      this.showError = false;
    } catch (e) {
      this.error = e.message;
      this.showError = true;
    } finally {
      this.isSaving = false;
    }
  }

  private async removeDocument() {
    const confirmed = await this.$dialog.confirm({
      text: 'Are you sure you want to remove this document?',
      type: 'error'
    });

    if (!confirmed) {
      return;
    }

    try {
      this.isDeleting = true;

      await getFerdigClient()
          .applications
          .collections(this.applicationId)
          .documents(this.collection.id)
          .remove(this.documentId);

      this.$emit('close');
    } catch (e) {
      this.error = e.message;
      this.showError = true;
    } finally {
      this.isDeleting = false;
    }
  }
}
</script>
