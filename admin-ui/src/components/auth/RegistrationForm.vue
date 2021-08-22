<template>
  <v-form @submit.prevent="registrate"
          ref="form"
  >
    <v-card-text>
      <v-text-field label="E-Mail"
                    :rules="[rules.isRequired]"
                    v-model="email"
      />
      <v-text-field v-model="password"
                    :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    :rules="[rules.isRequired]"
                    :type="showPassword ? 'text' : 'password'"
                    label="Password"
                    @click:append="showPassword = !showPassword"
      />

      <v-alert v-model="showError"
               dismissible
               type="error"
      >
        {{ error }}
      </v-alert>

      <v-card-actions>
        <v-layout wrap>
          <v-flex grow>
            <v-btn text @click="$emit('has-account')">
              You have an Account?
            </v-btn>
          </v-flex>
          <v-flex shrink>
            <v-btn type="submit"
                   color="primary"
                   :loading="isRegistrating"
            >
              Registrate
              <v-icon right>mdi-account-plus</v-icon>
            </v-btn>
          </v-flex>
        </v-layout>
      </v-card-actions>
    </v-card-text>
  </v-form>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {isRequired} from '@/utils/inputRules';
import {getFerdigClient} from '@/api';

@Component({})
export default class RegistrationForm extends Vue {
  private isRegistrating = false;
  private error: string | null = null;
  private showError = false;
  private email = '';
  private password = '';
  private showPassword = false;

  private rules = {
    isRequired,
  };

  private async registrate() {
    const form = this.$refs.form as unknown as { validate: () => boolean };
    if (!form.validate()) {
      return;
    }

    try {
      this.isRegistrating = true;

      await (await getFerdigClient())
          .auth
          .signUp({
            email: this.email,
            password: this.password,
            applicationId: null,
          });

      await this.$store.dispatch('auth/login', {
        email: this.email,
        password: this.password,
      });
    } catch (e) {
      this.error = e.message;
      this.showError = true;
    } finally {
      this.isRegistrating = false;
    }
  }
}
</script>
