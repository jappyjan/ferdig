<template>
  <v-bottom-sheet v-model="showVal"
                  inset
  >
    <v-card tile>
      <v-card-title>{{ label }}</v-card-title>
      <v-card-subtitle v-if="editorDescription">{{ editorDescription }}</v-card-subtitle>

      <v-form @submit.prevent="save()">
        <v-card-text>
          <v-layout wrap>
            <v-flex xs6 class="pl-2 pr-2">
              <v-card outlined width="100%">
                <v-card-title>Configuration</v-card-title>
                <v-card-text>
                  <component :is="configurator"
                             :config-values="internalConfigValues"
                             @change="val => internalConfigValues = val"
                             :application-id="applicationId"
                  />
                </v-card-text>
              </v-card>
            </v-flex>
            <v-flex xs6 class="pl-2 pr-2">
              <v-card outlined width="100%">
                <v-card-title>Returns</v-card-title>
                <v-card-text style="max-height: 400px; overflow: auto">
                  <v-list>
                    <v-list-item v-for="payloadKey in returnedPayloadKeys"
                                 :key="payloadKey.key"
                    >
                      <v-list-item-content>
                        <v-list-item-title>{{ payloadKey.key }}</v-list-item-title>
                        <v-list-item-subtitle>{{ payloadKey.type }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-flex>
          </v-layout>
        </v-card-text>

        <v-card-actions>
          <v-layout>
            <v-flex grow></v-flex>
            <v-flex shrink>
              <v-btn color="success"
                     type="submit"
                     :disabled="!hasChanges"
              >
                Update Config
                <v-icon right>mdi-floppy</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {Prop, Watch} from 'vue-property-decorator';
import {
  FerdigApplicationAutomationFlowNodeConfigValue,
  FerdigApplicationAutomationFlowNodeConfigValueCreateData,
  FerdigApplicationAutomationFlowNodeType,
} from '@ferdig/client-js';
import NotificationTemplateLoadNodeConfigurator
  from '@/views/applications/automations/details/node-configurators/NotificationTemplateLoadNodeConfigurator.vue';
import AutomationChangePayloadNodeConfigurator
  from '@/views/applications/automations/details/node-configurators/AutomationChangePayloadNodeConfigurator.vue';
import NotificationsSendNodeConfigurator
  from '@/views/applications/automations/details/node-configurators/NotificationsSendNodeConfigurator.vue';
import AutomationMapPayloadNodeConfigurator
  from '@/views/applications/automations/details/node-configurators/AutomationMapPayloadNodeConfigurator.vue';
import {PayloadObjectType} from '@/views/applications/automations/details/FlowyBlock';

@Component({
  components: {
    AutomationMapPayloadNodeConfigurator,
    NotificationsSendNodeConfigurator,
    AutomationChangePayloadNodeConfigurator,
    NotificationTemplateLoadNodeConfigurator,
  },
})
export default class AutomationNodeConfigValueEditor extends Vue {
  @Prop({required: true})
  private show!: boolean;

  @Prop({required: true})
  private nodeId!: string;

  @Prop({required: true})
  private applicationId!: string;

  @Prop({required: true})
  private label!: string;

  @Prop({required: false})
  private editorDescription!: string;

  @Prop({required: true})
  private configurator!: string | null;

  @Prop({required: true})
  private nodeType!: FerdigApplicationAutomationFlowNodeType;

  @Prop({required: true})
  private configValues!: FerdigApplicationAutomationFlowNodeConfigValue[];

  @Prop({required: true})
  private returnedPayload!: PayloadObjectType;

  private internalConfigValues: FerdigApplicationAutomationFlowNodeConfigValueCreateData[] = [];

  private get returnedPayloadKeys() {
    const keys: Array<{ key: string, type: string }> = [];

    const objectToKeys = (o: PayloadObjectType, baseKey = ''): void => {
      Object.entries(o).forEach(([key, value]) => {
        if (typeof value === 'object') {
          return objectToKeys(value, `${baseKey}${key}.`);
        }

        keys.push({
          key: baseKey + key,
          type: value as string,
        });
      });
    };

    objectToKeys(this.returnedPayload);

    return keys;
  }

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

  private get hasChanges() {
    return JSON.stringify(this.internalConfigValues) !== JSON.stringify(this.configValues);
  }

  @Watch('configValues', {immediate: true})
  private syncConfigValuesProp() {
    this.internalConfigValues = JSON.parse(JSON.stringify(this.configValues));
  }

  private save() {
    this.$root.$emit('automation-flow-editor-config-value-save', {
      nodeId: this.nodeId,
      configValues: this.internalConfigValues,
    });
    this.$emit('close');
  }
}
</script>
