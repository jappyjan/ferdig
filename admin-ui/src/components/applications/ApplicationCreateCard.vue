<template>
  <v-hover>
    <template v-slot:default="{hover}">
      <v-card height="248px"
              @click="$emit('click')"
              :raised="hover"
              :elevation="hover ? 5 : 0"
      >
        <v-layout fill-height>
          <v-flex align-self-center grow>
            <div class="text-center"
                 style="width: 100%; position:relative;"
                 :class="hover ? '' : 'text--disabled'"
            >
              <v-fade-transition group>
                <h2 class="subtitle-1 absolute-center"
                    key="text"
                    v-if="hover"
                >
                  Create a new Application</h2>
                <v-icon x-large
                        key="icon"
                        class="text--disabled absolute-center"
                        v-if="!hover"
                >
                  mdi-plus
                </v-icon>
              </v-fade-transition>
            </div>
          </v-flex>
        </v-layout>
      </v-card>
    </template>
  </v-hover>
</template>

<style lang="sass" scoped>
.absolute-center
  position: absolute
  left: 50%
  top: 50%
  transform: translate(-50%, -50%)
</style>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({})
export default class ApplicationCard extends Vue {
}
</script>
