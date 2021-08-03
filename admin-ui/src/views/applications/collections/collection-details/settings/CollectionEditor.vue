<template>
  <div>
    <v-card-text>
      <!-- Meta -->
      <v-form @submit.prevent="saveCollection" ref="form">
        <v-text-field label="Internal Name"
                      v-model="collectionData.internalName"
                      :rules="[rules.isRequired]"
                      outlined
        />
      </v-form>

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
            <collection-document-access-rule-editor :rule="collectionData[ruleType + 'AccessRule']"
                                                    :collection="collection"
                                                    @change="data => onRuleChange(ruleType + 'AccessRule', data)"
            />
          </v-card-text>
        </v-expand-transition>
      </v-card>
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

        <!-- Actions -->
        <v-flex xs12>
          <v-layout>
            <v-flex grow>
              <v-btn @click="removeCollection()"
                     color="error"
                     text
                     :loading="isDeleting"
              >
                <span>Remove Collection</span>
                <v-icon right>mdi-delete</v-icon>
              </v-btn>
            </v-flex>
            <v-flex shrink>
              <v-btn @click="saveCollection()"
                     color="primary"
                     :loading="isSaving"
              >
                <span>Update</span>
                <v-icon right>mdi-floppy</v-icon>
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
  FerdigApplicationCollectionDocumentAccessRuleData,
  FerdigApplicationCollectionDocumentAccessRuleOperator,
  FerdigCollectionCreateData,
} from '@ferdig/client-js';
import {isRequired} from '@/utils/inputRules';
import {getFerdigClient} from '@/api';
import CollectionDocumentAccessRuleEditor
  from '@/components/applications/collections/CollectionDocumentAccessRuleEditor.vue';
import {Prop, Watch} from 'vue-property-decorator';

@Component({
  components: {CollectionDocumentAccessRuleEditor},
})
export default class CollectionEditor extends Vue {
  @Prop({required: true})
  private applicationId!: string;

  @Prop({required: true})
  private collection!: FerdigApplicationCollection;

  private collectionData: FerdigCollectionCreateData = {
    internalName: '',
    readAccessRule: {
      leftSide: '1',
      operator: FerdigApplicationCollectionDocumentAccessRuleOperator.EQUAL,
      rightSide: '1',
      or: [],
      and: [],
    },
    writeAccessRule: {
      leftSide: '1',
      operator: FerdigApplicationCollectionDocumentAccessRuleOperator.EQUAL,
      rightSide: '1',
      or: [],
      and: [],
    },
  };
  private rules = {
    isRequired,
  };
  private error: string | null = null;
  private showError = false;
  private isSaving = false;
  private showRule: 'write' | 'read' | null = null;
  private isDeleting = false;

  @Watch('collection', {deep: true, immediate: true})
  private syncDataWithProp() {
    this.collectionData = JSON.parse(JSON.stringify(this.collection));
  }

  private async saveCollection() {
    document.body.click();

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 200);
    });

    const form = this.$refs.form as unknown as { validate: () => boolean };
    if (!form.validate()) {
      return;
    }

    try {
      this.isSaving = true;

      this.collectionData = await getFerdigClient()
          .applications
          .collections(this.applicationId)
          .update(
              this.collection.id,
              this.collectionData,
          );

      this.$emit('update', this.collectionData);

      this.showError = false;
    } catch (e) {
      this.error = e.message;
      this.showError = true;
    } finally {
      this.isSaving = false;
    }
  }

  private onRuleChange(rule: 'readAccessRule' | 'writeAccessRule', data: FerdigApplicationCollectionDocumentAccessRuleData) {
    this.collectionData[rule] = data;
  }

  private async removeCollection() {
    const confirmed = await this.$dialog.confirm({
      text: 'Are you sure you want to remove this collection?',
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
          .remove(this.collection.id);

      this.$store.commit('collections/remove', this.collection.id);

      await this.$router.push(`/applications/${this.applicationId}/collections`);
    } catch (e) {
      this.error = e.message;
      this.showError = true;
    } finally {
      this.isDeleting = false;
    }
  }
}
</script>
