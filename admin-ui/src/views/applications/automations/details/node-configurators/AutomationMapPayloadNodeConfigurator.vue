<template>
  <div>
    <v-btn block
           color="primary"
           @click="addEmpty()"
           class="mb-2"
    >
      <span>Add new Key-Mapping</span>
      <v-icon right>mdi-plus</v-icon>
    </v-btn>

    <v-layout v-for="(config, index) in internalConfigValues"
              :key="index"
    >
      <v-flex xs6>
        <v-text-field label="Original Key"
                      v-model="config.key"
        />
      </v-flex>
      <v-flex xs6>
        <v-text-field label="New Key"
                      v-model="config.value"
                      append-outer-icon="mdi-delete"
                      @click:append-outer="removeByIndex(index)"
        />
      </v-flex>
    </v-layout>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {Prop, Watch} from 'vue-property-decorator';
import {FerdigApplicationAutomationFlowNodeConfigValueCreateData} from '@ferdig/client-js';

@Component({})
export default class AutomationMapPayloadNodeConfigurator extends Vue {
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

  private addEmpty() {
    this.internalConfigValues.push({
      key: '',
      value: '',
    });
  }

  private removeByIndex(index: number) {
    this.internalConfigValues = this.internalConfigValues.filter((_, configIndex) => configIndex !== index);
  }
}
</script>
