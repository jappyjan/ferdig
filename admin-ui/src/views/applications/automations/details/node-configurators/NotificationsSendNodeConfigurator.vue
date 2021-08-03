<template>
  <div>
    <v-text-field label="User ID"
                  v-model="userId"
    />
    <v-text-field label="Subject"
                  v-model="subject"
    />
    <v-text-field label="Body"
                  v-model="body"
    />
    <v-select label="Medium"
              v-model="medium"
              :items="notificationMediums"
              item-value="value"
              item-text="text"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {Prop, Watch} from 'vue-property-decorator';
import {FerdigApplicationAutomationFlowNodeConfigValueCreateData} from '@ferdig/client-js';

@Component({})
export default class NotificationsSendNodeConfigurator extends Vue {
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

  private notificationMediums = [
    {value: 'Email', text: 'E-Mail'},
    {value: 'Push', text: 'Push-Notification'},
  ];

  private get userId() {
    const config = this.internalConfigValues.find((c) => c.key === 'userId');

    return config?.value ?? '';
  }

  private set userId(value: string) {
    this.internalConfigValues = this.internalConfigValues.filter((c) => c.key !== 'userId');
    this.internalConfigValues.push({
      key: 'userId',
      value,
    });
  }

  private get subject() {
    const config = this.internalConfigValues.find((c) => c.key === 'notification.subject');

    return config?.value ?? '';
  }

  // noinspection JSUnusedLocalSymbols
  private set subject(value: string) {
    this.internalConfigValues = this.internalConfigValues.filter((c) => c.key !== 'notification.subject');
    this.internalConfigValues.push({
      key: 'notification.subject',
      value,
    });
  }

  private get body() {
    const config = this.internalConfigValues.find((c) => c.key === 'notification.body');

    return config?.value ?? '';
  }

  // noinspection JSUnusedLocalSymbols
  private set body(value: string) {
    this.internalConfigValues = this.internalConfigValues.filter((c) => c.key !== 'notification.body');
    this.internalConfigValues.push({
      key: 'notification.body',
      value,
    });
  }

  private get medium() {
    const config = this.internalConfigValues.find((c) => c.key === 'notificationMedium');

    return config?.value ?? '';
  }

  // noinspection JSUnusedLocalSymbols
  private set medium(value: string) {
    this.internalConfigValues = this.internalConfigValues.filter((c) => c.key !== 'notificationMedium');
    this.internalConfigValues.push({
      key: 'notificationMedium',
      value,
    });
  }
}
</script>
