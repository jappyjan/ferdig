<template>
  <v-tooltip top color="primary">
    <template v-slot:activator="{ on, attrs }">
      <v-btn v-bind="attrs"
             v-on="{...on, ...$listeners}"
             :color="acceptsParents ? 'accent' : 'secondary'"
             :style="`cursor: ${cursor}`"
      >
        <v-icon left v-if="icon">{{ icon }}</v-icon>
        <span>{{ label }}</span>
      </v-btn>
    </template>
    <span>{{ description }}</span>
  </v-tooltip>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {Prop} from 'vue-property-decorator';

@Component({})
export default class AutomationBlock extends Vue {
  @Prop({required: false})
  private remove!: () => void;

  @Prop({required: false})
  private node!: unknown;

  @Prop({required: true})
  private label!: string;

  @Prop({required: true})
  private description!: string;

  @Prop({required: true})
  private nodeType!: string;

  @Prop({required: true})
  private icon!: string;

  @Prop({required: true})
  private acceptsParents!: boolean;

  @Prop({default: 'pointer'})
  private cursor!: string;
}
</script>
