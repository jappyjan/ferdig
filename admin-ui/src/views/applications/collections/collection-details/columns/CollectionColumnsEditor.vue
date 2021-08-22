<template>
  <div>
    <v-card-text>
      <v-alert type="info"
               :value="columns.length === 0"
      >
        Seems like this collection is not having any columns...<br>
        Might be a good idea to add some!
      </v-alert>
      <v-expansion-panels focusable
                          popout
      >
        <v-expansion-panel v-for="column in sortedColumns"
                           :key="column.id"
        >
          <v-expansion-panel-header>
            <template v-slot:default>
              <v-layout>
                <v-flex grow style="transform: translate(0, 25%)">
                  {{ column.internalName }}
                </v-flex>
                <v-flex shrink>
                  <v-btn color="error"
                         icon
                         small
                         @click.prevent.stop="removeColumn(column.id)"
                  >
                    <v-icon>mdi-minus</v-icon>
                  </v-btn>
                </v-flex>
              </v-layout>
            </template>
          </v-expansion-panel-header>

          <v-expansion-panel-content>
            <single-collection-column-editor :application-id="applicationId"
                                             :collection="collection"
                                             :column="column"
                                             @change="data => onColumnChange(column.id, data)"
            />
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>

    <v-card-actions>
      <v-layout wrap>
        <v-flex xs12>
          <v-alert v-model="showError"
                   type="error"
          >
            {{ error }}
          </v-alert>
        </v-flex>

        <v-flex xs12>
          <v-layout wrap>
            <v-flex grow>
            </v-flex>

            <v-flex shrink>
              <v-btn color="success"
                     @click="addColumn()"
                     :loading="isAddingColumn"
              >
                Add Column
                <v-icon right>mdi-plus</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-card-actions>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {
  FerdigApplicationCollection,
  FerdigApplicationCollectionColumn,
  FerdigApplicationCollectionColumnValueType,
  FerdigApplicationCollectionDocumentAccessRuleOperator,
} from '@ferdig/client-js';
import {Prop, Watch} from 'vue-property-decorator';
import {getFerdigClient} from '@/api';
import SingleCollectionColumnEditor
  from '@/views/applications/collections/collection-details/columns/SingleCollectionColumnEditor.vue';

@Component({
  components: {SingleCollectionColumnEditor},
})
export default class CollectionColumnsEditor extends Vue {
  @Prop({required: true})
  private applicationId!: string;

  @Prop({required: true})
  private collection!: FerdigApplicationCollection;

  private columns: FerdigApplicationCollectionColumn[] = [];
  private error: string | null = null;
  private showError = false;
  private isAddingColumn = false;

  private get sortedColumns() {
    return this.columns.sort((a, b) => a.internalName > b.internalName ? 1 : -1);
  }

  @Watch('collection.columns', {deep: true, immediate: true})
  private syncColumnsWithProps() {
    this.columns = JSON.parse(JSON.stringify(this.collection.columns));
  }

  private async addColumn() {
    const internalName = await this.$dialog.prompt({
      text: 'How do you wanna name the new column?',
    });

    if (!internalName) {
      return;
    }

    try {
      const column = await (await getFerdigClient())
          .applications
          .collections(this.applicationId)
          .columns(this.collection.id)
          .create({
            internalName,
            valueType: FerdigApplicationCollectionColumnValueType.String,
            isArray: false,
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

      this.columns.push(column);

      this.$emit('update:column', {id: column.id, data: column});

      this.showError = false;
    } catch (e) {
      this.error = e.message;
      this.showError = true;
    } finally {
      this.isAddingColumn = false;
    }
  }

  private async removeColumn(columnId: string) {
    const confirmed = await this.$dialog.confirm({
      text: 'Are you sure you want to remove this column?',
      type: 'error',
    });

    if (!confirmed) {
      return;
    }

    try {
      await (await getFerdigClient())
          .applications
          .collections(this.applicationId)
          .columns(this.collection.id)
          .remove(columnId);

      this.columns = this.columns.filter((column) => column.id !== columnId);

      this.$emit('update:column', {id: columnId, data: null});

      this.showError = false;
    } catch (e) {
      this.error = e.message;
      this.showError = true;
    } finally {
      this.isAddingColumn = false;
    }
  }

  private onColumnChange(columnId: string, data: FerdigApplicationCollectionColumn) {
    let found = false;
    this.columns = this.columns.map((column) => {
      if (column.id === columnId) {
        found = true;
        return data;
      }

      return column;
    });

    if (!found) {
      this.columns.push(data);
    }

    this.$emit('update:column', {id: columnId, data});
  }
}
</script>
