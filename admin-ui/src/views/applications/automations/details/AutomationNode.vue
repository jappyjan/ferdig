<template>
  <flowy-drag-handle>
    <v-card outlined
            bordered
            :color="acceptsParents ? 'accent' : 'secondary'"
            min-width="250px"
    >
      <v-card-title style="white-space: normal; word-break: normal">
        <v-layout>
          <v-flex grow class="pr-4">
            <v-icon v-if="icon" left>{{ icon }}</v-icon>
            {{ label }}
          </v-flex>
          <v-flex shrink>
            <v-btn @click="remove()"
                   icon
                   small
                   color="error"
            >
              <v-icon small>mdi-delete</v-icon>
            </v-btn>
          </v-flex>
          <v-flex shrink>
            <automation-node-logs :node="node"
                                  :show="showLogs"
                                  @close="showLogs = false"
                                  style="margin-top: -4px"
            >
              <template v-slot:activator="{lastLogLevel}">
                <v-btn icon
                       small
                       :outlined="lastLogLevel === 'error'"
                       @click="showLogs = true"
                       :color="lastLogLevel === 'error' ? 'error' : ''"
                >
                  <v-icon small>{{ lastLogLevel === 'error' ? 'mdi-bug' : 'mdi-console' }}</v-icon>
                </v-btn>
              </template>
            </automation-node-logs>
          </v-flex>
          <v-flex shrink>
            <v-btn icon
                   small
                   @click="showEditor = true"
            >
              <v-icon small>mdi-cog</v-icon>
            </v-btn>
          </v-flex>
        </v-layout>
      </v-card-title>

      <v-card-text v-html="description"/>
    </v-card>

    <automation-node-config-value-editor :node-id="node.id"
                                         :application-id="node.applicationId"
                                         :show="showEditor"
                                         :configurator="configurator"
                                         :config-values="configValues"
                                         @close="showEditor = false"
                                         :label="label"
                                         :node-type="nodeType"
                                         :editor-description="editorDescription"
                                         :returned-payload="returnedPayload"
    />
  </flowy-drag-handle>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {Prop} from 'vue-property-decorator';
import {FlowyNode} from '@/views/applications/automations/details/FlowyNode';
import AutomationNodeConfigValueEditor
  from '@/views/applications/automations/details/AutomationNodeConfigValueEditor.vue';
import AutomationNodeLogs from '@/views/applications/automations/details/AutomationNodeLogs.vue';
import {PayloadObjectType} from '@/views/applications/automations/details/FlowyBlock';

@Component({
  components: {AutomationNodeLogs, AutomationNodeConfigValueEditor},
})
export default class AutomationNode extends Vue {
  @Prop({required: false})
  private remove!: () => void;

  @Prop({required: false})
  private node!: FlowyNode & { applicationId: string };

  @Prop({required: true})
  private label!: string;

  @Prop({required: true})
  private description!: string;

  @Prop({required: false})
  private editorDescription!: string;

  @Prop({required: true})
  private nodeType!: string;

  @Prop({required: true})
  private icon!: string;

  @Prop({required: true})
  private acceptsParents!: boolean;

  @Prop({required: true})
  private configurator!: string | null;

  @Prop({required: true})
  private configValues!: Record<string, string>;

  @Prop({required: true})
  private returnedPayload!: PayloadObjectType;

  private showEditor = false;
  private showLogs = false;
}
</script>
