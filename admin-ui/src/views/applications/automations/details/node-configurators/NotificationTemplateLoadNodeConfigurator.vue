<template>
  <div>
    <v-select :items="templates"
              item-text="internalName"
              item-value="id"
              :loading="status === 'loading'"
              v-model="templateId"
    />

    <label style="display: block">This Template requires values for the following Placeholders:</label>
    <v-chip-group>
      <v-chip v-for="placeholder in placeholders"
              :key="placeholder"
      >
        {{ placeholder }}
      </v-chip>
    </v-chip-group>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {Prop, Watch} from 'vue-property-decorator';
import {
  FerdigApplicationAutomationFlowNodeConfigValueCreateData,
  FerdigApplicationNotificationTemplate,
} from '@ferdig/client-js';
import {State} from 'vuex-class';
import {StateStatus} from '@/store/StateStatus';

@Component({})
export default class NotificationTemplateLoadNodeConfigurator extends Vue {
  @Prop({required: true})
  private configValues!: FerdigApplicationAutomationFlowNodeConfigValueCreateData[];

  private internalConfigValues: FerdigApplicationAutomationFlowNodeConfigValueCreateData[] = JSON.parse(JSON.stringify(this.configValues));

  // noinspection JSUnusedLocalSymbols
  private mounted() {
    this.internalConfigValues = JSON.parse(JSON.stringify(this.configValues));
  }

  @Watch('internalConfigValues', {immediate: true, deep: true})
  private emitChanges() {
    this.$emit('change', this.internalConfigValues);
  }

  @Prop({required: true})
  private applicationId!: string;

  @State('items', {namespace: 'notificationTemplates'})
  private templates!: FerdigApplicationNotificationTemplate[];

  @State('status', {namespace: 'notificationTemplates'})
  private status!: StateStatus;

  private get templateId() {
    const config = this.internalConfigValues.find((c) => c.key === 'templateId');

    return config?.value ?? '';
  }

  private set templateId(value: string) {
    this.internalConfigValues = [{
      key: 'templateId',
      value,
    }];
  }

  private get placeholders() {
    const template = this.templates.find((t) => t.id === this.templateId);
    if (!template) {
      return [];
    }

    let matches: string[] = [];

    const matchPattern = new RegExp('[$][a-zA-Z0-9-_]*[$]', 'g');
    const addMatchesFromString = (value: string) => {
      const patternMatchResult = value.matchAll(matchPattern);
      matches.push(...Array.from(patternMatchResult).map((item) => {
        return item[0].substr(1, item[0].length - 2);
      }));
    }

    addMatchesFromString(template.subject);
    addMatchesFromString(template.body);

    return matches.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });
  }
}
</script>
