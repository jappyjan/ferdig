<template>
  <v-layout wrap>
    <v-flex xs12>
      <v-card width="100%" outlined>
        <v-card-subtitle>AWS Region</v-card-subtitle>

        <v-container grid-list-md>
          <v-layout wrap>
            <!-- Region -->
            <v-flex xs12>
              <v-text-field label="Region"
                            v-model="regionProp"
                            :rules="[inputRules.isRequired]"
                            type="text"
              />
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>

    <v-flex xs12>
      <v-card width="100%" outlined>
        <v-card-subtitle>E-Mail Envelope</v-card-subtitle>

        <v-container grid-list-md>
          <v-layout wrap>
            <!-- From-Address -->
            <v-flex xs12 md6>
              <v-text-field label="From Address"
                            v-model="fromAddressProp"
                            :rules="[inputRules.isRequired, inputRules.isEmail]"
                            type="email"
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
export default class AwsSesClientForm extends Vue {
  private inputRules = {
    isRequired,
    isEmail,
  };

  @PropSync('fromAddress', {required: true})
  private fromAddressProp!: string;

  @PropSync('replyToAddress', {required: true})
  private replyToAddressProp!: string;

  @PropSync('region', {required: true})
  private regionProp!: string;
}
</script>
