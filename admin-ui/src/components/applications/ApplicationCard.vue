<template>
  <v-card>
    <v-toolbar flat dense :color="isActiveApplication ? 'primary' : ''" style="z-index: 5;">
      <v-toolbar-title>
        <v-icon left>mdi-monitor</v-icon>
        {{ application.internalName }}
      </v-toolbar-title>
    </v-toolbar>
    <v-hover>
      <template v-slot:default="{ hover }">
        <div>
          <v-img
              height="200px"
              :src="application.logo"
              class="d-flex align-end"
          >
            <v-card-title class="white--text py-2"
                          style="background-color: rgba(0,0,0,0.3); backdrop-filter: blur(3px);"
            >
              <div>
                <div class="subtitle-2 text-truncate px-0 text--disabled d-block align-center">
                  <v-icon small>mdi-floppy</v-icon>
                  {{ formatDateTime(application.createdAt) }}
                </div>
                <div class="subtitle-2 text-truncate px-0 text--disabled d-block align-center">
                  <v-icon small>mdi-update</v-icon>
                  {{ formatDateTime(application.updatedAt) }}
                </div>
              </div>
            </v-card-title>
          </v-img>
          <v-fade-transition>
            <v-overlay v-if="hover" absolute :z-index="4">
              <v-btn color="primary" :to="actionTo" @click="$emit('click')">{{ actionLabel }}</v-btn>
            </v-overlay>
          </v-fade-transition>
        </div>
      </template>
    </v-hover>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {Prop} from 'vue-property-decorator';
import {FerdigApplication} from '@ferdig/client-js';
import {State} from 'vuex-class';

@Component({})
export default class ApplicationCard extends Vue {
  @State('activeApplication', {namespace: 'applications'})
  private activeApplication!: FerdigApplication | null;

  @Prop({required: true})
  private application!: FerdigApplication;

  @Prop({required: true})
  private actionLabel!: string;

  @Prop({required: false})
  private actionTo!: string;

  private get isActiveApplication() {
    return this.application.id === this.activeApplication?.id;
  }

  // noinspection JSMethodCanBeStatic
  private formatDateTime(time: Date) {
    return new Intl.DateTimeFormat(navigator.language, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(time);
  }
}
</script>
