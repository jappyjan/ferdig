<template>
  <v-container>
    <v-alert type="error">
      <p>The page you're looking for does not exist...</p>
      <v-btn to="/"
             color="primary"
      >
        <v-icon left>mdi-home</v-icon>
        Back to Home
      </v-btn>
    </v-alert>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({})
export default class PageNotFound extends Vue {
}
</script>
