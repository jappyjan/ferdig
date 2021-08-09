<template>
  <v-container grid-list-md v-if="documentVal">
    <v-form @submit.prevent="save()">
      <template v-for="column in collection.columns">
        <div :key="column.id">
          <!-- String Editor -->
          <v-text-field :label="column.internalName"
                        v-model="documentVal[column.internalName]"
                        v-if="column.valueType === 'string'"
                        prepend-icon="mdi-text"
          />

          <!-- Number Editor -->
          <v-text-field :label="column.internalName"
                        v-model.number="documentVal[column.internalName]"
                        v-if="column.valueType === 'number'"
                        prepend-icon="mdi-numeric"
                        type="number"
          />

          <!-- Boolean Editor -->
          <v-switch :label="column.internalName"
                    v-model="documentVal[column.internalName]"
                    v-if="column.valueType === 'boolean'"
                    prepend-icon="mdi-checkbox-marked-outline"
          />

          <!-- Date Editor -->
          <v-layout wrap v-if="column.valueType === 'date'">
            <v-flex xs12 md6>
              <v-menu>
                <template v-slot:activator="{on}">
                  <v-text-field :label="column.internalName"
                                :value="getDatePart(column)"
                                prepend-icon="mdi-calendar"
                                readonly
                                v-on="on"
                  />
                </template>

                <v-date-picker :value="getDatePartForPicker(column)"
                               @change="(val) => setDatePart(column, val)"
                               color="primary"
                />
              </v-menu>
            </v-flex>

            <v-flex xs12 md6>
              <v-menu :close-on-content-click="false">
                <template v-slot:activator="{on}">
                  <v-text-field :label="column.internalName"
                                :value="getTimePart(column)"
                                prepend-icon="mdi-clock"
                                readonly
                                v-on="on"
                  />
                </template>

                <v-time-picker :value="getTimePart(column)"
                               @input="(val) => setTimePart(column, val)"
                               color="primary"
                               format="24hr"
                />
              </v-menu>
            </v-flex>

          </v-layout>

          <!-- File Editor -->
          <div v-if="column.valueType === 'file'">
            <input type="file"
                   style="display: none"
                   :ref="'fileInput-' + column.internalName"
                   @change="e => onSetFile(column, e)"
            />
            <v-text-field readonly
                          :value="fileName(documentVal[column.internalName])"
                          :label="column.internalName"
                          prepend-icon="mdi-file"
                          @click="() => clickFileInput(column)"
            />
          </div>
        </div>
      </template>

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
import {GenericDocumentType, GenericDocumentTypeTypes, getFerdigClient} from '@/api';
import {
  FerdigApplicationCollection,
  FerdigApplicationCollectionColumn,
  FerdigApplicationCollectionColumnValueType,
  FerdigCollectionDocumentDefaultProperties,
} from '@ferdig/client-js';
import {filename} from '@/utils/filename';

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
    this.documentVal = {};

    this.collection.columns.forEach((column) => {
      const valueAsString = JSON.stringify(this.document[column.internalName]);
      let value: GenericDocumentTypeTypes = '';
      if (valueAsString) {
        value = JSON.parse(valueAsString);
      }

      if (column.valueType !== FerdigApplicationCollectionColumnValueType.Date) {
        this.documentVal[column.internalName] = value;
        return;
      }

      this.documentVal[column.internalName] = new Date(value as string);
    });

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

      const mappedDocumentVal = Object.assign({}, this.documentVal);
      this.collection.columns.forEach((column) => {
        if (column.valueType !== FerdigApplicationCollectionColumnValueType.File) {
          return;
        }

        if (typeof mappedDocumentVal[column.internalName] === 'string') {
          delete mappedDocumentVal[column.internalName];
        }
      });


      let updatedDocument: GenericDocumentType & FerdigCollectionDocumentDefaultProperties;
      if (this.documentId === 'new') {
        updatedDocument = await documentsClient.create(mappedDocumentVal);
      } else {
        updatedDocument = await documentsClient.update(this.documentId, mappedDocumentVal);
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
      type: 'error',
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

  private fileName = filename;

  private getDatePart(column: FerdigApplicationCollectionColumn, lang?: string) {
    const date = this.documentVal[column.internalName] as Date | null;

    if (!date) {
      return '';
    }

    return new Intl.DateTimeFormat(lang ?? navigator.language, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }

  private getDatePartForPicker(column: FerdigApplicationCollectionColumn) {
    return this.getDatePart(column, 'en-EN')
  }

  private setDatePart(column: FerdigApplicationCollectionColumn, datePart: string) {
    const date = (this.documentVal[column.internalName] as Date | null) ?? new Date();

    const [year, month, day] = datePart.split('-');

    date.setFullYear(Number(year), Number(month) - 1, Number(day));

    this.documentVal[column.internalName] = date;
  }

  private getTimePart(column: FerdigApplicationCollectionColumn, lang?: string) {
    const date = this.documentVal[column.internalName] as Date | null;

    if (!date) {
      return '';
    }

    return new Intl.DateTimeFormat(lang ?? navigator.language, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  }

  private setTimePart(column: FerdigApplicationCollectionColumn, timePart: string) {
    const date: Date = (this.documentVal[column.internalName] as Date | null) ?? new Date();

    const [currentHours, currentMinutes] = this.getTimePart(column, 'en-EN').split(':');
    const [setHours, setMinutes] = timePart.split(':');

    const newHours = date.getHours() + (Number(setHours) - Number(currentHours));
    const newMinutes = date.getMinutes() + (Number(setMinutes) - Number(currentMinutes));

    date.setHours(newHours);
    date.setMinutes(newMinutes);

    this.documentVal[column.internalName] = date;
  }

  private clickFileInput(column: FerdigApplicationCollectionColumn) {
    let input = this.$refs['fileInput-' + column.internalName] as HTMLInputElement;

    if (Array.isArray(input)) {
      input = input[0];
    }

    input.click();
  }

  private onSetFile(column: FerdigApplicationCollectionColumn, event: InputEvent) {
    this.documentVal[column.internalName] = (event.target as HTMLInputElement).files?.item(0) ?? null;

    this.$nextTick(() => {
      const input = this.$refs['fileInput-' + column.internalName] as HTMLInputElement;
      input.value = '';
    });
  }
}
</script>
