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
                                v-model="internalName"
                                :rules="[inputRules.isRequired]"
                                autofocus
                  />
                </v-card-text>
              </v-card>
            </v-flex>

            <v-flex xs12 md7>
              <v-layout wrap>
                <!-- Client Type -->
                <v-flex xs12>
                  <v-card width="100%" outlined>
                    <v-card-subtitle>E-Mail Type</v-card-subtitle>
                    <v-container grid-list-md>
                      <v-layout wrap>
                        <v-flex xs12>
                          <v-select v-model="emailClientType"
                                    :items="emailClientTypeOptions"
                                    label="Client-Type"
                          />
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-card>
                </v-flex>

                <v-flex xs12>
                  <smtp-client-form v-if="emailClientType === 'smtp'"
                                    :host.sync="smtpClientConfig.host"
                                    :port.sync="smtpClientConfig.port"
                                    :ssl.sync="smtpClientConfig.ssl"
                                    :auth-user.sync="smtpClientConfig.authUser"
                                    :auth-password.sync="smtpClientConfig.authPassword"
                                    :from-name.sync="smtpClientConfig.fromName"
                                    :from-address.sync="smtpClientConfig.fromAddress"
                                    :reply-to-name.sync="smtpClientConfig.replyToName"
                                    :reply-to-address.sync="smtpClientConfig.replyToAddress"
                  />
                  <aws-ses-client-form v-if="emailClientType === 'aws_ses'"
                                       :from-address.sync="sesClientConfig.fromAddress"
                                       :reply-to-address.sync="sesClientConfig.replyToAddress"
                                       :region.sync="sesClientConfig.region"
                  />
                </v-flex>
              </v-layout>
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
import {getFerdigClient} from '@/api';
import {
  FerdigApplicationConfigurationEmailAWSSESClientConfig,
  FerdigApplicationConfigurationEmailClientType,
  FerdigApplicationConfigurationEmailSMTPClientConfig,
} from '@ferdig/client-js';
import SmtpClientForm from '@/components/applications/MailClientForms/SmtpClientForm.vue';
import {isRequired} from '@/utils/inputRules';
import AwsSesClientForm from '@/components/applications/MailClientForms/AwsSesClientForm.vue';

@Component({
  components: {AwsSesClientForm, SmtpClientForm},
})
export default class CreateApplicationDialog extends Vue {
  @Prop()
  private show!: boolean;

  private inputRules = {
    isRequired,
  };

  private internalName = '';
  private emailClientType: FerdigApplicationConfigurationEmailClientType = FerdigApplicationConfigurationEmailClientType.SMTP;
  private smtpClientConfig: FerdigApplicationConfigurationEmailSMTPClientConfig = {
    host: 'localhost',
    port: 1025,
    ssl: false,
    authUser: '',
    authPassword: '',
    fromName: '',
    fromAddress: '',
    replyToName: '',
    replyToAddress: '',
  }
  private sesClientConfig: FerdigApplicationConfigurationEmailAWSSESClientConfig = {
    fromAddress: '',
    replyToAddress: '',
    region: 'eu-central-1',
  }

  private isCreating = false;
  private createError: null | string = null;
  private showCreateError = false;
  private emailClientTypeOptions = [
    {value: FerdigApplicationConfigurationEmailClientType.SMTP, text: 'SMTP'},
    {value: FerdigApplicationConfigurationEmailClientType.AWS_SES, text: 'AWS SES'},
  ]

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

      let clientConfig: FerdigApplicationConfigurationEmailSMTPClientConfig | FerdigApplicationConfigurationEmailAWSSESClientConfig;
      switch (this.emailClientType) {
        case FerdigApplicationConfigurationEmailClientType.SMTP:
          clientConfig = this.smtpClientConfig;
          break;

        case FerdigApplicationConfigurationEmailClientType.AWS_SES:
          clientConfig = this.sesClientConfig;
          break;

        default:
          // noinspection ExceptionCaughtLocallyJS
          throw new Error('Unknown Email ClientType');
      }

      const app = await (await getFerdigClient())
          .applications
          .create({
            internalName: this.internalName,
            configuration: {
              email: {
                clientType: this.emailClientType,
                clientConfig,
              },
            },
          });
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
