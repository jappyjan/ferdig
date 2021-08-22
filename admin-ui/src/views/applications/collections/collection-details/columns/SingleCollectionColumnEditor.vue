<template>
  <div>
    <!-- Configuration -->
    <v-card-text>
      <v-form @submit.prevent="saveConfiguration()">
        <v-layout wrap>
          <v-flex xs12>
            <v-text-field v-model="columnData.internalName"
                          label="Internal Name"
                          outlined
                          :rules="[rules.isRequired]"
            />
          </v-flex>
          <v-flex grow>
            <v-select label="Type"
                      outlined
                      v-model="columnData.valueType"
                      :rules="[rules.isRequired]"
                      :items="valueTypeSelectorItems"
            />
          </v-flex>
          <v-flex shrink>
            <v-switch v-model="columnData.isArray"
                      label="is an Array"
            />
          </v-flex>
        </v-layout>

        <v-btn type="submit" style="display: none" />
      </v-form>

      <!-- Access Control -->
      <v-divider/>

      <v-subheader>Access-Control</v-subheader>

      <!-- Access Rules -->
      <v-card v-for="(ruleType, ruleTypeIndex) in ['read', 'write']"
              :key="ruleType"
              outlined
              :style="ruleTypeIndex !== 0 ? 'margin-top: 1rem' : ''"
      >
        <v-card-title @click="showRule === ruleType ? (showRule = null) : (showRule = ruleType)"
                      style="cursor: pointer"
        >
          <v-layout>
            <v-flex grow>{{ ruleType.split('').map((c, i) => i === 0 ? c.toUpperCase() : c).join('') }} Access Rule
            </v-flex>
            <v-flex shrink>
              <v-icon>{{ showRule === ruleType ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-flex>
          </v-layout>
        </v-card-title>

        <v-expand-transition>
          <v-card-text v-show="showRule === ruleType">
            <collection-document-access-rule-editor :rule="column[ruleType + 'AccessRule']"
                                                    :collection="collection"
                                                    @change="data => onRuleChange(ruleType + 'AccessRule', data)"
            />
          </v-card-text>
        </v-expand-transition>
      </v-card>
    </v-card-text>

    <v-card-actions>
      <v-layout wrap>
        <v-flex grow></v-flex>
        <v-flex shrink>
          <v-btn color="primary"
                 :loading="isSavingConfiguration"
                 @click="saveConfiguration()"
          >
            Save
            <v-icon right>mdi-floppy</v-icon>
          </v-btn>
        </v-flex>
      </v-layout>
    </v-card-actions>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {Prop, Watch} from 'vue-property-decorator';
import {
  FerdigApplicationCollection,
  FerdigApplicationCollectionColumn,
  FerdigApplicationCollectionColumnValueType,
  FerdigApplicationCollectionDocumentAccessRule,
  FerdigApplicationCollectionDocumentAccessRuleOperator,
} from '@ferdig/client-js';
import CollectionDocumentAccessRuleEditor
  from '@/components/applications/collections/CollectionDocumentAccessRuleEditor.vue';
import {isRequired} from '@/utils/inputRules';
import {getFerdigClient} from '@/api';

@Component({
  components: {CollectionDocumentAccessRuleEditor},
})
export default class SingleCollectionColumnEditor extends Vue {
  @Prop({required: true})
  private applicationId!: string;

  @Prop({required: true})
  private collection!: FerdigApplicationCollection;

  @Prop({required: true})
  private column!: FerdigApplicationCollectionColumn;

  private columnData: FerdigApplicationCollectionColumn = {
    id: '',
    internalName: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    valueType: FerdigApplicationCollectionColumnValueType.String,
    isArray: false,
    readAccessRule: {
      id: '',
      or: [],
      and: [],
      rightSide: '',
      operator: FerdigApplicationCollectionDocumentAccessRuleOperator.EQUAL,
      leftSide: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    writeAccessRule: {
      id: '',
      or: [],
      and: [],
      rightSide: '',
      operator: FerdigApplicationCollectionDocumentAccessRuleOperator.EQUAL,
      leftSide: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
  private showRule: null | 'read' | 'write' = null;
  private rules = {
    isRequired,
  };
  private isSavingConfiguration = false;
  private error: null | string = null;
  private showError = false;

  // noinspection JSMethodCanBeStatic
  private get valueTypeSelectorItems() {
    return Object.values(FerdigApplicationCollectionColumnValueType);
  }

  @Watch('column', {deep: true, immediate: true})
  private syncColumnDataWithProps() {
    this.columnData = JSON.parse(JSON.stringify(this.column));
  }

  private onRuleChange(ruleType: 'readAccessRule' | 'writeAccessRule', rule: FerdigApplicationCollectionDocumentAccessRule) {
    this.columnData[ruleType] = rule;
  }

  private async saveConfiguration() {
    try {
      this.isSavingConfiguration = true;

      const updatedColumn = await (await getFerdigClient())
          .applications
          .collections(this.applicationId)
          .columns(this.collection.id)
          .update(this.column.id, this.columnData);

      this.columnData = updatedColumn;

      this.$emit('change', updatedColumn);
    } catch (e) {
      this.error = e.message;
      this.showError = true;
    } finally {
      this.isSavingConfiguration = false;
    }
  }
}
</script>
