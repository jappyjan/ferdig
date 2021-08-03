<template>
  <div>
    <v-layout wrap>
      <v-flex xs12 sm4>
        <v-combobox
            v-model="rule.leftSide"
            :items="availableValues"
            label="Left-Side"
            :rules="[inputRules.isRequired]"
            hint="You can also use plain text for comparison"
        />
      </v-flex>
      <v-flex xs12 sm4>
        <v-select
            :items="operators.map((o) => ({text: o.split('_').join(' '), value: o}))"
            label="Operator"
            v-model="rule.operator"
            :rules="[inputRules.isRequired]"
        />
      </v-flex>
      <v-flex xs12 sm4>
        <v-combobox
            v-model="rule.rightSide"
            :items="availableValues"
            label="Right-Side"
            :rules="[inputRules.isRequired]"
            hint="You can also use plain text for comparison"
        />
      </v-flex>

      <v-flex xs12>
        <v-card raised
                outlined
                v-for="(ruleType, ruleTypeIndex) in ['and', 'or']"
                :key="ruleType"
                :style="ruleTypeIndex !== 0 ? 'margin-top: 2rem' : ''"
        >
          <v-btn fab
                 absolute top right
                 color="success"
                 small
                 @click="addRule(ruleType)"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>

          <v-card-title>{{ ruleType }}</v-card-title>
          <v-card-text>
            <span v-if="rule[ruleType].length === 0">No {{ ruleType }}-rules</span>

            <v-expansion-panels v-else
                                focusable
                                popout
            >
              <v-expansion-panel v-for="(subRule, subRuleIndex) in rule[ruleType]"
                                 :key="`${ruleType}-${subRuleIndex}`"
              >
                <v-expansion-panel-header>
                  <template v-slot:default>
                    <v-layout>
                      <v-flex grow style="transform: translate(0, 25%)">
                        {{ subRule.leftSide }} {{ subRule.operator.split('_').join(' ') }} {{ subRule.rightSide }}
                      </v-flex>
                      <v-flex shrink>
                        <v-btn color="error"
                               icon
                               small
                               @click.prevent.stop="removeRule(ruleType, subRuleIndex)"
                        >
                          <v-icon>mdi-minus</v-icon>
                        </v-btn>
                      </v-flex>
                    </v-layout>
                  </template>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <collection-document-access-rule-editor :rule="subRule"
                                                          :collection="collection"
                                                          @change="data => onSubChange(ruleType, subRuleIndex, data)"
                                                          style="margin-top: 1.5rem"
                  />
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {Prop} from 'vue-property-decorator';
import {
  FerdigApplicationCollection,
  FerdigApplicationCollectionColumn,
  FerdigApplicationCollectionDocumentAccessRuleData,
  FerdigApplicationCollectionDocumentAccessRuleOperator,
} from '@ferdig/client-js';
import {isRequired} from '@/utils/inputRules';

@Component({
  name: 'CollectionDocumentAccessRuleEditor',
})
export default class CollectionDocumentAccessRuleEditor extends Vue {
  @Prop({required: true})
  private rule!: FerdigApplicationCollectionDocumentAccessRuleData;

  @Prop({required: true})
  private collection!: FerdigApplicationCollection;

  private inputRules = {
    isRequired,
  };

  private operators = Object.keys(FerdigApplicationCollectionDocumentAccessRuleOperator);

  private get availableValues(): string[] {
    const userKeys = [
      'id',
      'email',
      'createdAt',
      'updatedAt',
      'isDisabled',
      'emailVerified',
    ];

    const documentKeys = this.collection.columns.map((column: FerdigApplicationCollectionColumn) => column.internalName);

    return [
      ...documentKeys.map((key) => 'document.' + key.split(' ').join('_')),
      ...userKeys.map((key) => 'user.' + key),
    ];
  }

  private addRule(side: 'and' | 'or') {
    this.$emit('change', {
      ...this.rule,
      [side]: [
        ...this.rule[side],
        {
          leftSide: '1',
          operator: FerdigApplicationCollectionDocumentAccessRuleOperator.EQUAL,
          rightSide: '1',
          or: [],
          and: [],
        },
      ],
    });
  }

  private async removeRule(side: 'and' | 'or', index: number) {
    const confirmed = await this.$dialog.confirm({
      text: 'Are you sure you want to remove this rule?',
      type: 'error',
    });

    if (!confirmed) {
      return;
    }

    this.$emit('change', {
      ...this.rule,
      [side]: this.rule[side].filter((_, ruleIndex) => ruleIndex !== index),
    });
  }

  private onSubChange(side: 'and' | 'or', ruleIndex: number, ruleData: FerdigApplicationCollectionDocumentAccessRuleData) {
    this.$emit('change', {
      ...this.rule,
      [side]: this.rule[side].map((originalRule, indexOfOriginalRule) => {
        if (indexOfOriginalRule === ruleIndex) {
          return ruleData;
        }

        return originalRule;
      }),
    });
  }
}
</script>
