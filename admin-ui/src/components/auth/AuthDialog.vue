<template>
  <v-dialog :value="showOverlay"
            fullscreen
  >
    <v-card tile>
      <Particles id="auth-dialog-particles"
                 :options="nyanCatOptions"
      />
      <v-container class="login-card-container">
        <v-row justify="center" align-content="center" style="height: 100%">
          <v-col xs="9" sm="9" md="6" lg="5">
            <v-card width="100%">
              <v-card-title>
                Welcome to Fertig!
              </v-card-title>

              <v-card-subtitle>
                Please {{ action }} to proceed
              </v-card-subtitle>

              <login-form v-if="action === 'login'" @needs-account="action = 'registrate'"/>
              <registration-form v-else @has-account="action = 'login'"/>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="sass">
#auth-dialog-particles
  position: absolute
  top: 0
  right: 0
  left: 0
  bottom: 0

.login-card-container
  position: absolute
  z-index: 90
  left: 0
  right: 0
  top: 0
  bottom: 0
</style>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import LoginForm from '@/components/auth/LoginForm.vue';
import RegistrationForm from '@/components/auth/RegistrationForm.vue';
import nyanCatOptions from '@/particles/nyan-cat.json';

@Component({
  components: {RegistrationForm, LoginForm},
})
export default class AuthDialog extends Vue {
  private action: 'login' | 'registrate' = 'login';
  private nyanCatOptions = nyanCatOptions;

  private get showOverlay() {
    return !this.$store.state.auth.user;
  }
}
</script>
