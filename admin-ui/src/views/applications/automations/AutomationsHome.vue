<template>
  <div>
    <v-container>
      <v-card>
        <v-btn fab
               absolute top right
               color="success"
               @click="createAutomation()"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>

        <v-card-title>
          Automations
        </v-card-title>

        <v-alert :value="status === 'error'"
                 type="error"
        >
          {{ error }}
        </v-alert>

        <v-alert v-model="showError"
                 type="error"
                 dismissible
        >
          {{ internalError }}
        </v-alert>

        <v-data-table :headers="tableHeaders"
                      :items="automations"
                      :items-per-page="15"
                      v-if="activeApplication"
                      @click:row="automation => $router.push(`/applications/${activeApplication.id}/automations/${automation.id}`)"
                      class="pointer"
                      :loading="status === 'loading'"
        >
          <template v-slot:item.createdAt="{ item }">
            {{ item.createdAt.toLocaleString() }}
          </template>
          <template v-slot:item.updatedAt="{ item }">
            {{ item.updatedAt.toLocaleString() }}
          </template>
          <template v-slot:item.internalName="{ item }">
            {{ item.internalName }}
            <v-btn @click.stop="updateName(item)" icon small>
              <v-icon small>mdi-pencil</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card>
    </v-container>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {FerdigApplication, FerdigApplicationAutomation} from '@ferdig/client-js';
import {getFerdigClient} from '@/api';
import {State} from 'vuex-class';
import {StateStatus} from '@/store/StateStatus';
import {Breadcrumb} from '@/store/RootState';

@Component({})
export default class AutomationsHome extends Vue {
  @State('activeApplication', {namespace: 'applications'})
  private activeApplication!: FerdigApplication | null;

  @State('items', {namespace: 'automations'})
  private automations!: FerdigApplicationAutomation[];

  @State('status', {namespace: 'automations'})
  private status!: StateStatus;

  @State('error', {namespace: 'automations'})
  private error!: StateStatus;

  private internalError: string | null = null;
  private showError = false;

  // noinspection JSMethodCanBeStatic
  private get tableHeaders() {
    return [
      {
        text: 'Internal Name',
        align: 'start',
        value: 'internalName',
      },
      {text: 'Created At', value: 'createdAt'},
      {text: 'Updated At', value: 'updatedAt'},
    ];
  }

  // noinspection JSUnusedLocalSymbols
  private mounted() {
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
    ] as Breadcrumb[])
  }

  private async createAutomation() {
    if (!this.activeApplication) {
      return;
    }

    const internalName = await this.$dialog.prompt({
      text: 'How do you wanna call the new Automation?',
    });

    if (!internalName) {
      return;
    }

    const automation = await (await getFerdigClient())
        .applications
        .automations(this.activeApplication.id)
        .create({
          internalName,
        });

    this.$store.commit('automations/save', automation);

    await this.$router.push(`/applications/${this.activeApplication.id}/automations/${automation.id}`);
  }

  private async updateName(automation: FerdigApplicationAutomation) {
    if (!this.activeApplication) {
      return;
    }

    const newName = await this.$dialog.prompt({
      title: 'Give it a name',
      text: 'How shall we name the automation?',
    });

    if (!newName) {
      return;
    }

    try {
      const updatedAutomation = await (await getFerdigClient())
          .applications
          .automations(this.activeApplication.id)
          .update(automation.id, {
            ...automation,
            internalName: newName,
          });

      this.$store.commit('automations/save', updatedAutomation);
    } catch (e) {
      this.internalError = e.message;
      this.showError = true;
    }
  }
}
</script>
