<template>
  <v-layout wrap>
    <!-- Email Connection -->
    <v-flex xs12>
      <v-card width="100%" outlined>
        <v-card-subtitle>E-Mail Connection</v-card-subtitle>
        <v-container grid-list-md>
          <v-layout wrap>
            <!-- Host -->
            <v-flex xs12 md8 lg6>
              <v-text-field label="Host"
                            v-model="hostProp"
                            :rules="[inputRules.isRequired]"
              />
            </v-flex>
            <!-- Port -->
            <v-flex xs12 md4 lg3>
              <v-text-field label="Port"
                            v-model.number="portProp"
                            :rules="[inputRules.isRequired]"
                            type="number"
              />
            </v-flex>

            <!-- SSL -->
            <v-flex xs12 md12 lg3>
              <v-switch label="SSL"
                        v-model="sslProp"
              />
            </v-flex>

            <!-- User -->
            <v-flex xs12 md6>
              <v-text-field label="Auth User"
                            v-model="authUserProp"
              />
            </v-flex>
            <!-- Password -->
            <v-flex xs12 md6>
              <v-text-field label="Auth Password"
                            v-model="authPasswordProp"
              />
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>

    <!-- Email Envelope -->
    <v-flex xs12>
      <v-card width="100%" outlined>
        <v-card-subtitle>E-Mail Envelope</v-card-subtitle>

        <v-container grid-list-md>
          <v-layout wrap>
            <!-- From-Name -->
            <v-flex xs12 md6>
              <v-text-field label="From Name"
                            v-model="fromNameProp"
                            :rules="[inputRules.isRequired]"
              />
            </v-flex>
            <!-- From-Address -->
            <v-flex xs12 md6>
              <v-text-field label="From Address"
                            v-model="fromAddressProp"
                            :rules="[inputRules.isRequired, inputRules.isEmail]"
                            type="email"
              />
            </v-flex>

            <!-- ReplyTo-Name -->
            <v-flex xs12 md6>
              <v-text-field label="ReplyTo Name"
                            v-model="replyToNameProp"
                            :rules="[inputRules.isRequired]"
              />
            </v-flex>
            <!-- ReplyTo-Address -->
            <v-flex xs12 md6>
              <v-text-field label="ReplyTo Address"
                            v-model="replyToAddressProp"
                            :rules="[inputRules.isRequired, inputRules.isEmail]"
                            type="email"
              />
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {PropSync} from 'vue-property-decorator';
import {isEmail, isRequired} from '@/utils/inputRules';

@Component({})
export default class SmtpClientForm extends Vue {
  @PropSync('host', {required: true})
  private hostProp!: string;

  @PropSync('port', {required: true})
  private portProp!: number;

  @PropSync('ssl', {required: true})
  private sslProp!: boolean;

  @PropSync('authUser', {required: true})
  private authUserProp!: string;

  @PropSync('authPassword', {required: true})
  private authPasswordProp!: string;

  @PropSync('fromName', {required: true})
  private fromNameProp!: string;

  @PropSync('fromAddress', {required: true})
  private fromAddressProp!: string;

  @PropSync('replyToName', {required: true})
  private replyToNameProp!: string;

  @PropSync('replyToAddress', {required: true})
  private replyToAddressProp!: string;

  private inputRules = {
    isRequired,
    isEmail,
  };
}
</script>
