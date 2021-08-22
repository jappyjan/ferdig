<template>
  <v-container>
    <v-card>
      <v-card-title>{{ automation ? automation.internalName : '-' }}</v-card-title>

      <v-card-text>
        <div class="flowy-blocks-container mb-4">
          <label style="display: block" class="mb-2">
            Trigger (click to Add)
          </label>
          <div class="overflow-container">
            <div v-for="block in triggerBlocks"
                 :key="block.nodeType"
                 class="mr-4"
                 style="display: inline-block"
            >
              <automation-block v-bind="block"
                                @mousedown="addBlock(block)"
              />
            </div>
          </div>
        </div>

        <div class="flowy-blocks-container">
          <label style="display: block" class="mb-2">
            Tasks (Drag to add)
          </label>
          <div class="overflow-container">
            <flowy-new-block v-for="block in taskBlocks"
                             :key="block.nodeType"
                             style="display: inline-block"
            >
              <template v-slot:preview="{}">
                <flowy-drag-handle>
                  <automation-block v-bind="block" cursor="grab"/>
                </flowy-drag-handle>
              </template>
              <template v-slot:node="{}">
                <automation-node v-bind="block"/>
              </template>
            </flowy-new-block>
          </div>
        </div>
      </v-card-text>

      <v-card-text>
        <flowy :nodes="flowNodes"
               :beforeMove="beforeMove"
               @add="addNode"
               @move="moveNode"
               @remove="removeNode"
        />

        <v-alert type="info"
                 :value="flowNodes.length === 0"
                 prominent
        >
          Go ahead and add you first Block...
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-layout>
          <v-flex grow>
            <v-btn @click="remove"
                   :loading="isRemoving"
                   color="error"
                   outlined
            >
              <span>Remove</span>
              <v-icon right>mdi-delete</v-icon>
            </v-btn>
          </v-flex>
          <v-flex shrink>
            <v-btn @click="save"
                   :loading="isSaving"
                   color="primary"
                   :disabled="!automationWasChanged"
            >
              <span>Save</span>
              <v-icon right>mdi-floppy</v-icon>
            </v-btn>
          </v-flex>
        </v-layout>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<style scoped lang="sass">
.flowy-blocks-container
  background: rgba(0, 0, 0, .3)
  border-radius: 4px
  padding: 16px

.overflow-container
  overflow-x: auto
  white-space: nowrap
  word-break: keep-all
</style>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {FlowyBlock} from './FlowyBlock';
import {FlowyNode} from './FlowyNode';
import {getFerdigClient} from '@/api';
import {
  FerdigApplication,
  FerdigApplicationAutomation,
  FerdigApplicationAutomationFlowNodeConfigValueCreateData,
  FerdigApplicationAutomationFlowNodeCreateData,
} from '@ferdig/client-js';
import {Prop, Watch} from 'vue-property-decorator';
import {blocks, nodeTypeToFlowBlockData} from '@/views/applications/automations/details/blocks';
import AutomationBlock from '@/views/applications/automations/details/AutomationBlock.vue';
import AutomationNode from '@/views/applications/automations/details/AutomationNode.vue';
import {State} from 'vuex-class';
import {Breadcrumb} from '@/store/RootState';
import {errorMessage} from '@/utils/dialog';

Vue.component('automation-block', AutomationBlock)
Vue.component('automation-node', AutomationNode)

@Component({
  components: {},
})
export default class AutomationFlowEditor extends Vue {
  @Prop({required: true})
  private automationId!: string;

  @State('activeApplication', {namespace: 'applications'})
  private activeApplication!: FerdigApplication | null;

  @State('items', {namespace: 'automations'})
  private automations!: FerdigApplicationAutomation[];

  private flowNodes: FlowyNode[] = [];
  private automation: FerdigApplicationAutomation | null = null;
  private automationWasChanged = false;
  private isSaving = false;
  private isRemoving = false;

  private triggerBlocks = blocks.filter((block) => !block.acceptsParents);
  private taskBlocks = blocks.filter((block) => block.acceptsParents);

  // noinspection JSUnusedLocalSymbols
  private mounted() {
    this.$root.$on(
        'automation-flow-editor-config-value-save',
        this.onNodeConfigChanges,
    );
    this.setBreadcrumbs();
  }

  // noinspection JSUnusedLocalSymbols
  private destroyed() {
    this.$root.$off(
        'automation-flow-editor-config-value-save',
        this.onNodeConfigChanges,
    );
  }

  private onNodeConfigChanges(payload: {
    nodeId: string,
    configValues: FerdigApplicationAutomationFlowNodeConfigValueCreateData[]
  }) {
    this.flowNodes = this.flowNodes.map((node) => {
      if (node.id !== payload.nodeId) {
        return node;
      }

      this.automationWasChanged = true;
      return {
        ...node,
        data: {
          ...node.data,
          configValues: payload.configValues,
        },
      };
    });
  }

  private setBreadcrumbs() {
    this.$store.commit('setBreadcrumbs', [
      {
        to: '/applications',
        exact: true,
        text: 'Applications',
      },
      {
        to: `/applications/${this.activeApplication?.id}`,
        text: this.activeApplication?.internalName ?? '-',
        exact: true,
      },
      {
        to: `/applications/${this.activeApplication?.id}/automations`,
        text: 'Automations',
        exact: true,
      },
      {
        to: `/applications/${this.activeApplication?.id}/automations/${this.automationId}`,
        text: this.automation?.internalName ?? '-',
        exact: true,
      },
    ] as Breadcrumb[])
  }

  @Watch('automations', {immediate: true})
  @Watch('automationId')
  private setAutomation() {
    this.automation = this.automations.find((automation) => automation.id === this.automationId) ?? null;
    this.automationWasChanged = false;
    this.$nextTick(() => {
      this.convertAutomationToFlowNodes();
      this.setBreadcrumbs();
    });
  }

  private convertAutomationToFlowNodes() {
    if (!this.automation || !this.activeApplication) {
      this.flowNodes = [];
      return;
    }

    this.flowNodes = this.automation.flowNodes.map((node) => {
      return {
        id: node.id,
        applicationId: this.activeApplication!.id,
        automationId: this.automationId,
        parentId: node.parentId || -1,
        nodeComponent: 'automation-node',
        data: nodeTypeToFlowBlockData(node),
      } as FlowyNode & { applicationId: string, automationId: string };
    })
  }

  // noinspection JSMethodCanBeStatic
  private beforeMove({from: child, to: parent}: { to: FlowyNode, from: FlowyNode | null }): boolean {
    return Boolean(child?.data.acceptsParents) && Boolean(parent.data.acceptsChildren);
  }

  private async removeNode(event: { node: FlowyNode }) {
    this.automationWasChanged = true;
    // node we're dragging to
    const {node} = event;

    const children = this.flowNodes.filter((child) => child.parentId === node.id);

    if (children.length > 0) {
      const confirmed = await this.$dialog.confirm({
        text: 'Are you sure you want to remove this node?',
        type: 'warning',
      });

      if (!confirmed) {
        return;
      }
    }

    const nodeIndex = this.flowNodes.findIndex((item) => item.id === node.id);

    this.flowNodes.splice(nodeIndex, 1);
  }

  // noinspection JSMethodCanBeStatic
  private moveNode(event: { dragged: FlowyNode, to: FlowyNode }) {
    this.automationWasChanged = true;
    // node we're dragging to and node we've just dragged
    const {dragged, to} = event;

    // change parentId to id of node we're dragging to
    dragged.parentId = to.id;
  }

  private addBlock(block: FlowyBlock) {
    this.automationWasChanged = true;
    this.addNode({
      node: {
        parentId: -1,
        nodeComponent: 'automation-node',
        data: block,
      },
    });
  }

  private addNode({node}: { node: Omit<FlowyNode, 'id'> }) {
    this.automationWasChanged = true;
    const makeId = () => '__new__' + (Math.floor(Math.random() * 10000) + 1).toString();
    let id = makeId();

    while (this.flowNodes.find((node) => node.id === id) !== undefined) {
      id = makeId();
    }

    // add to array of nodes
    this.flowNodes.push({
      ...node,
      id,
    });
  }

  private async save() {
    if (!this.automation || !this.activeApplication) {
      return;
    }

    try {
      this.isSaving = true;
      await (await getFerdigClient())
          .applications
          .automations(this.activeApplication.id)
          .update(this.automationId, {
            internalName: this.automation.internalName,
            flowNodes: this.flowNodes.map((node) => {
              return {
                id: node.id,
                type: node.data.nodeType,
                parentId: node.parentId === -1 ? null : node.parentId,
                configValues: node.data.configValues,
              } as FerdigApplicationAutomationFlowNodeCreateData;
            }),
          });
      this.automationWasChanged = false;
    } catch (e) {
      await errorMessage(e);
    } finally {
      this.isSaving = false;
    }
  }

  private async remove() {
    if (!this.activeApplication) {
      return;
    }

    const confirmed = await this.$dialog.confirm({
      text: 'Are you sure you want to remove this automation?',
      type: 'error',
    });

    if (!confirmed) {
      return;
    }

    try {
      this.isRemoving = true;
      await (await getFerdigClient())
          .applications
          .automations(this.activeApplication.id)
          .remove(this.automationId);

      this.$store.commit('automations/remove', this.automationId);

      await this.$router.push(`/applications/${this.activeApplication.id}/automations`);
    } catch (e) {
      await errorMessage(e);
    } finally {
      this.isRemoving = false;
    }
  }
}
</script>
