<template>
  <v-app-bar app
             elevate-on-scroll
  >
    <v-app-bar-nav-icon @click="$emit('toggle-drawer')"/>

    <v-spacer></v-spacer>

    <v-btn icon
           href="https://github.com/jappyjan/ferdig"
           target="_blank"
    >
      <v-icon small>mdi-github</v-icon>
    </v-btn>

    <v-btn icon
           :href="apiDocumentationHref"
           target="_blank"
    >
      <v-icon small>mdi-api</v-icon>
    </v-btn>

    <v-menu v-if="currentUser" left bottom>
      <template v-slot:activator="{on, attrs}">
        <v-btn icon
               v-bind="attrs"
               v-on="on"
        >
          <v-icon small>mdi-account</v-icon>
        </v-btn>
      </template>

      <v-card width="300px">
        <v-card-title>
          <v-icon left>mdi-account</v-icon>
          <span>{{ currentUser.email }}</span>
        </v-card-title>
        <v-card-actions>
          <v-btn color="error"
                 block
                 @click="logout()"
          >
            Logout
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </v-app-bar>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {State} from 'vuex-class';
import {FerdigUser} from '@ferdig/client-js';

@Component({
  components: {},
})
export default class AppBar extends Vue {
  @State('user', {namespace: 'auth'})
  private currentUser!: FerdigUser | null;

  // noinspection JSMethodCanBeStatic
  private get apiDocumentationHref() {
    return `${location.origin}/api-docs/v1`;
  }

  // noinspection JSMethodCanBeStatic
  private logout() {
    localStorage.clear();
    location.href = location.origin;
    location.reload();
  }
}
</script>
