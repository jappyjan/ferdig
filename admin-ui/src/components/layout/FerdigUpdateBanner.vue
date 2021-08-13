<template>
  <v-banner color="warning"
            sticky
            app
            :value="updateIsAvailable"
            light
  >
    Ferdig V{{ latestApiVersion }} is available (you're running V{{ apiVersion }}). Please consider upgrading.
  </v-banner>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {getFerdigClient} from '@/api';

@Component({})
export default class FerdigUpdateBanner extends Vue {
  private apiVersion = '';
  private latestApiVersion = '';
  private updateIsAvailable = false;

  // noinspection JSUnusedLocalSymbols
  private async mounted() {
    await this.checkForUpdate();
  }

  private async checkForUpdate() {
    await Promise.all([
      this.getApiVersion(),
      this.getLatestApiVersion(),
    ]);

    this.updateIsAvailable = this.latestApiVersion !== this.apiVersion;
  }

  private async getApiVersion() {
    this.apiVersion = await getFerdigClient()
        .getVersion();
  }

  private async getLatestApiVersion() {
    const response = await fetch('https://raw.githubusercontent.com/jappyjan/ferdig/main/package.json');

    const data = await response.json();

    this.latestApiVersion = data.version as string;
  }
}
</script>

<style scoped>

</style>
