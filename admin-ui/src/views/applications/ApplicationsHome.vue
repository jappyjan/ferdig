<template>
  <div>
    <v-container>
      <v-btn fab
             absolute bottom right
             color="primary"
             style="margin-bottom: 3rem"
             @click="showCreateDialog = true"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <v-row>
        <v-col xs="12" sm="6" md="4" lg="4">
          <application-create-card @click="showCreateDialog = true"/>
        </v-col>

        <v-col xs="12" sm="6" md="4" lg="4"
               v-for="application in applications"
               :key="application.id"
        >
          <application-card :application="application"
                            action-label="Open"
                            :action-to="`/applications/${application.id}`"
          />
        </v-col>
      </v-row>
    </v-container>
    <create-application-dialog :show="showCreateDialog"
                               @close="showCreateDialog = false"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component';
import {State} from 'vuex-class';
import {FerdigApplication} from '@ferdig/client-js';
import CreateApplicationDialog from '@/components/applications/CreateApplicationDialog.vue';
import ApplicationCard from '@/components/applications/ApplicationCard.vue';
import ApplicationCreateCard from '@/components/applications/ApplicationCreateCard.vue';
import {StateStatus} from '@/store/StateStatus';

@Component({
  components: {ApplicationCreateCard, ApplicationCard, CreateApplicationDialog},
})
export default class ApplicationsHome extends Vue {
  @State('items', {namespace: 'applications'})
  private applications!: FerdigApplication[];

  @State('token', {namespace: 'auth'})
  private authToken!: string | null;

  @State('status', {namespace: 'applications'})
  private status!: StateStatus;

  private showCreateDialog = false;
}
</script>
