<template>
  <v-bottom-sheet v-model="showVal"
                  inset
                  width="400px"
  >
    <v-card tile>
      <v-card-title>{{title}}</v-card-title>
      <collection-document-editor :document="document"
                                  v-on="$listeners"
                                  :application-id="applicationId"
                                  :collection="collection"
      />
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import CollectionDocumentEditor from '@/components/applications/collections/CollectionDocumentEditor.vue';
import {Prop} from 'vue-property-decorator';
import {GenericDocumentType} from '@/api';
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
  private document!: null | GenericDocumentType & FerdigCollectionDocumentDefaultProperties;

  @Prop()
  private show!: boolean;

  private get showVal() {
    return this.show;
  }

  // noinspection JSUnusedLocalSymbols
  private set showVal(val: boolean) {
    if (val) {
      return;
    }

    this.$emit('close');
  }

  private get title() {
    if (!this.document || this.document.id === 'new') {
      return 'Create a new Document';
    }

    return `Edit Document`;
  }
}
</script>
