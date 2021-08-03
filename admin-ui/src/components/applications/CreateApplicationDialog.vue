<template>
  <v-dialog v-model="showVal"
            max-width="350px"
  >
    <v-card>
      <v-overlay absolute
                 :value="isCreating"
      >
        <v-progress-circular indeterminate/>
      </v-overlay>

      <v-card-title>Create a new Application</v-card-title>

      <v-form @submit.prevent="createApp">
        <v-card-text>
          <v-text-field label="Internal Name"
                        v-model="appCreateData.internalName"
                        :rules="[inputRules.isRequired]"
                        autofocus
          />

          <v-alert type="error"
                   v-model="showCreateError"
                   dismissible
          >
            {{ createError }}
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-layout wrap>
            <v-flex grow>
              <v-btn text
                     color="error"
                     @click="$emit('close')"
              >
                Cancel
              </v-btn>
            </v-flex>

            <v-flex shrink>
              <v-btn color="primary"
                     type="submit"
              >
                Create App
              </v-btn>
            </v-flex>
          </v-layout>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {Prop} from 'vue-property-decorator';
import {isRequired} from '@/utils/inputRules';
import {getFerdigClient} from '@/api';
import {FerdigApplicationCreateData} from '@ferdig/client-js';

@Component({})
export default class CreateApplicationDialog extends Vue {
  @Prop()
  private show!: boolean;

  private appCreateData: FerdigApplicationCreateData = {
    internalName: '',
  };
  private inputRules = {
    isRequired,
  };
  private isCreating = false;
  private createError: null | string = null;
  private showCreateError = false;

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

  private async createApp() {
    try {
      this.isCreating = true;

      const app = await getFerdigClient().applications.create(this.appCreateData);
      this.$store.commit('applications/save', app);
      await this.$router.push(`/applications/${app.id}`);
    } catch (e) {
      this.createError = e.message;
      this.showCreateError = true;
    } finally {
      this.isCreating = false;
    }
  }
}
</script>
