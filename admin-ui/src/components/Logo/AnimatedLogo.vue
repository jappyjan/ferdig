<template>
  <div class="logo" :class="$vuetify.theme.dark ? 'dark' : 'light'">
    <logo-light-text v-if="$vuetify.theme.dark"/>
    <logo-dark-text v-else/>
  </div>
</template>

<style lang="sass">
.logo
  svg
    max-height: 100%
    max-width: 100%

  #Title
    stroke-linejoin: round
    fill: none !important
    fill-opacity: 0 !important
    stroke-width: .25

    stroke-dasharray: 1000
    stroke-dashoffset: 0
    animation: draw-title 2.5s linear 1

  &.light
    #Title
      stroke: black

  &.dark
    #Title
      stroke: white

  #Slogan
    stroke-linejoin: round
    stroke-opacity: .5
    fill: none !important
    stroke-width: 1

    stroke-dasharray: 200
    stroke-dashoffset: 0
    animation: draw-slogan 2.5s linear 1

  &.light
    #Slogan
      stroke: black

  &.dark
    #Slogan
      stroke: white

@keyframes draw-title
  from
    stroke-dasharray: 1000
    stroke-dashoffset: 1000

  to
    stroke-dasharray: 1000
    stroke-dashoffset: 0

@keyframes draw-slogan
  from
    stroke-dasharray: 200
    stroke-dashoffset: 200

  to
    stroke-dasharray: 200
    stroke-dashoffset: 0
</style>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import LogoDarkText from './logo-dark-text.svg';
import LogoLightText from './logo-light-text.svg';

@Component({
  components: {LogoDarkText, LogoLightText},
})
export default class AnimatedLogo extends Vue {
}
</script>
