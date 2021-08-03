<template>
  <v-form @submit.prevent="startSession"
          ref="form"
  >
    <v-container grid-list-md>
      <v-layout wrap>
        <v-flex xs12 sm6 md12>
          <v-text-field label="E-Mail"
                        :rules="[rules.isRequired]"
                        v-model="email"
          />
        </v-flex>
        <v-flex xs12 sm6 md12>
          <v-text-field v-model="password"
                        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                        :rules="[rules.isRequired]"
                        :type="showPassword ? 'text' : 'password'"
                        label="Password"
                        @click:append="showPassword = !showPassword"
          />
        </v-flex>
      </v-layout>

      <v-alert v-model="showError"
               dismissible
               type="error"
      >
        {{ error }}
      </v-alert>

      <v-card-actions>
        <v-layout wrap>
          <v-flex grow>
            <v-btn text @click="$emit('needs-account')">
              Don't have an Account?
            </v-btn>
          </v-flex>
          <v-flex shrink>
            <v-btn type="submit"
                   color="primary"
                   :loading="isStartingSession"
            >
              Login
              <v-icon right>mdi-login</v-icon>
            </v-btn>
          </v-flex>
        </v-layout>
      </v-card-actions>
    </v-container>
  </v-form>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {isRequired} from '@/utils/inputRules';

@Component({})
export default class LoginForm extends Vue {
  private isStartingSession = false;
  private error: string | null = null;
  private showError = false;
  private email = '';
  private password = '';
  private showPassword = false;

  private rules = {
    isRequired,
  };

  private async startSession() {
    const form = this.$refs.form as unknown as { validate: () => boolean };
    if (!form.validate()) {
      return;
    }

    try {
      this.isStartingSession = true;
      await this.$store.dispatch('auth/login', {
        email: this.email,
        password: this.password,
      });
    } catch (e) {
      this.error = e.message;
      this.showError = true;
    } finally {
      this.isStartingSession = false;
    }
  }
}
</script>
