<template>
  <v-dialog fullscreen
            :value="show"
            persistent
  >
    <v-card tile>
      <animated-logo class="animated-logo"/>
    </v-card>
  </v-dialog>
</template>

<style lang="sass" scoped>
.animated-logo
  position: absolute
  top: 50vh
  left: 50vw
  width: 100%
  height: 100%
  max-height: 33vh
  max-width: 33vw
  transform: translate(-50%, -50%)
</style>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import AnimatedLogo from '@/components/Logo/AnimatedLogo.vue';

@Component({
  components: {AnimatedLogo},
})
export default class SplashScreen extends Vue {
  private show = true;

  // noinspection JSUnusedLocalSymbols
  private mounted() {
    const hideAfterSeconds = 2;
    setTimeout(() => this.show = false, hideAfterSeconds * 1000);
  }
}
</script>
