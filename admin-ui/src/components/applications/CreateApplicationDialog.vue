<template>
  <v-dialog v-model="showVal"
            max-width="800px"
  >
    <v-card>
      <v-overlay absolute
                 :value="isCreating"
      >
        <v-progress-circular indeterminate/>
      </v-overlay>

      <v-card-title>Create a new Application</v-card-title>

      <v-form @submit.prevent="createApp" ref="form">
        <v-container grid-list-md>
          <v-layout wrap>
            <v-flex xs12 md5>
              <v-card outlined width="100%">
                <v-card-subtitle>General Information</v-card-subtitle>
                <v-card-text>
                  <v-text-field label="Internal Name"
                                v-model="appCreateData.internalName"
                                :rules="[inputRules.isRequired]"
                                autofocus
                  />
                </v-card-text>
              </v-card>
            </v-flex>

            <v-flex xs12 md7>
              <v-card width="100%" outlined>
                <v-card-subtitle>E-Mail</v-card-subtitle>
                <v-container grid-list-md>
                  <v-layout wrap>
                    <v-flex xs12 md8 lg6>
                      <v-text-field label="Host"
                                    v-model="appCreateData.configuration.email.host"
                                    :rules="[inputRules.isRequired]"
                      />
                    </v-flex>
                    <v-flex xs12 md4 lg3>
                      <v-text-field label="Port"
                                    v-model.number="appCreateData.configuration.email.port"
                                    :rules="[inputRules.isRequired]"
                                    type="number"
                      />
                    </v-flex>

                    <v-flex xs12 md12 lg3>
                      <v-switch label="SSL"
                                v-model="appCreateData.configuration.email.ssl"
                      />
                    </v-flex>

                    <v-flex xs12 md6>
                      <v-text-field label="Auth User"
                                    v-model="appCreateData.configuration.email.authUser"
                      />
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-text-field label="Auth Password"
                                    v-model="appCreateData.configuration.email.authPassword"
                      />
                    </v-flex>

                    <v-flex xs12 md6>
                      <v-text-field label="From Name"
                                    v-model="appCreateData.configuration.email.fromName"
                                    :rules="[inputRules.isRequired]"
                      />
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-text-field label="From Address"
                                    v-model="appCreateData.configuration.email.fromAddress"
                                    :rules="[inputRules.isRequired, inputRules.isEmail]"
                                    type="email"
                      />
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card>
            </v-flex>

            <v-flex xs12>
              <v-alert type="error"
                       v-model="showCreateError"
                       dismissible
                       width="100%"
              >
                {{ createError }}
              </v-alert>
            </v-flex>
          </v-layout>
        </v-container>

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
import {isEmail, isRequired} from '@/utils/inputRules';
import {getFerdigClient} from '@/api';
import {FerdigApplicationCreateData} from '@ferdig/client-js';

@Component({})
export default class CreateApplicationDialog extends Vue {
  @Prop()
  private show!: boolean;

  private appCreateData: FerdigApplicationCreateData = {
    internalName: '',
    configuration: {
      email: {
        host: 'localhost',
        port: 1025,
        ssl: false,
        authUser: '',
        authPassword: '',
        fromName: '',
        fromAddress: '',
      },
    },
  };
  private inputRules = {
    isRequired,
    isEmail,
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
    const form = this.$refs.form as unknown as { validate: () => boolean };
    if (!form.validate()) {
      return;
    }

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
