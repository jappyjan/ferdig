<template>
  <div>
    <slot name="activator" v-bind="{lastLogLevel}"></slot>
    <v-bottom-sheet v-model="showVal"
                    inset
    >
      <v-card tile>
        <v-card-title>Logs</v-card-title>
        <v-card-subtitle>{{ node.data.label }}</v-card-subtitle>

        <v-card-text>
          <v-alert type="error"
                   v-model="showError"
                   dismissible
          >
            {{ error }}
          </v-alert>

          <v-data-table :headers="tableHeaders"
                        :items="logs"
                        :items-per-page="15"
                        :loading="isFetching"
                        show-expand
                        single-expand
          >
            <template v-slot:item.level="{ item }">
              <v-chip
                  :color="getLevelColor(item.level)"
                  dark
              >
                {{ item.level }}
              </v-chip>
            </template>
            <template v-slot:expanded-item="{ headers, item }">
              <td :colspan="headers.length">
                <label style="display: block">Received Payload</label>
                <pre style="max-height: 400px; overflow: auto"
                     v-text="JSON.stringify(JSON.parse(item.receivedPayload), null, 4)"/>
              </td>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {Prop, Watch} from 'vue-property-decorator';
import {FerdigApplicationAutomationFlowNodeLog} from '@ferdig/client-js';
import {getFerdigClient} from '@/api';
import {FlowyNode} from '@/views/applications/automations/details/FlowyNode';

@Component({})
export default class AutomationNodeLogs extends Vue {
  @Prop({required: true})
  private show!: boolean;

  @Prop({required: true})
  private node!: FlowyNode & { applicationId: string, automationId: string };

  private logs: FerdigApplicationAutomationFlowNodeLog[] = [];
  private isFetching = false;
  private showError = false;
  private error = '';

  private get lastLogLevel() {
    const lastLog: undefined | FerdigApplicationAutomationFlowNodeLog = this.logs[0];

    return lastLog?.level ?? '';
  }

  @Watch('nodeId', {immediate: true})
  @Watch('applicationId')
  @Watch('show')
  private async fetchLogs() {
    try {
      this.isFetching = true;
      this.logs = await getFerdigClient()
          .applications
          .automations(this.node.applicationId)
          .getLogsOfNode(this.node.automationId, this.node.id);
      this.logs.reverse();

      this.showError = false;
    } catch (e) {
      this.error = e.message;
      this.showError = true;
    } finally {
      this.isFetching = false;
    }
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

  // noinspection JSMethodCanBeStatic
  private get tableHeaders() {
    return [
      {
        text: 'Timestamp',
        value: 'createdAt',
      },
      {
        text: 'Level',
        value: 'level',
      },
      {
        text: 'Message',
        value: 'message',
      },
    ];
  }

  // noinspection JSMethodCanBeStatic
  private getLevelColor(level: string) {
    switch (level) {
      case 'error':
        return 'error';

      case 'info':
        return 'info';

      default:
        return '';
    }
  }
}
</script>
