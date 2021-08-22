<template>
  <v-container grid-list-md>
    <v-form @submit.prevent="saveTemplate()" ref="form">
      <v-layout wrap>
        <v-flex xs12>
          <v-card width="100%">
            <v-card-title>Notification-Template</v-card-title>
            <v-card-text>
              Just put placeholder wherever you want by wrapping a custom placeholder name inside two curly dollar
              signs
              ($).<br>
              e.g. if you want a placeholder named "firstName" just put "$firstName$"<br>
              <br>
              Be aware. Placeholders may only contain letters, numbers, dashes (-) and/or underscores (_)
            </v-card-text>
          </v-card>
        </v-flex>

        <!-- Internal Name -->
        <v-flex xs12 md6>
          <v-card width="100%">
            <v-card-title>Internal Name</v-card-title>
            <v-card-text>
              <v-text-field v-model="template.internalName"
                            outlined
                            :rules="[rules.isRequired]"
              />
            </v-card-text>
          </v-card>
        </v-flex>

        <!-- Subject -->
        <v-flex xs12 md6>
          <v-card width="100%">
            <v-card-title>Subject</v-card-title>
            <v-card-text>
              <v-text-field v-model="template.subject"
                            outlined
              />
            </v-card-text>
          </v-card>
        </v-flex>

        <!-- Body -->
        <v-flex xs12 md6>
          <v-card width="100%">
            <v-card-title>Body</v-card-title>
            <v-card-subtitle>You may use HTML inside the body</v-card-subtitle>
            <v-card-text>
              <v-textarea v-model="template.body"
                          outlined
                          height="400px"
              />
            </v-card-text>
          </v-card>
        </v-flex>

        <!-- Preview -->
        <v-flex xs12 md6>
          <v-card width="100%">
            <v-card-title>Preview</v-card-title>
            <v-card-subtitle v-html="template.subject"/>
            <v-card-text>
              <div v-html="template.body" class="email-preview"/>
            </v-card-text>
          </v-card>
        </v-flex>

        <!-- Error -->
        <v-flex xs12 v-if="showError">
          <v-alert v-model="showError"
                   type="error"
                   width="100%"
                   dismissible
          >
            {{ error }}
          </v-alert>
        </v-flex>

        <v-flex grow>
          <v-btn color="error"
                 outlined
                 :loading="isRemoving"
                 @click="remove"
          >
            Remove
            <v-icon right>mdi-delete</v-icon>
          </v-btn>
        </v-flex>
        <v-flex shrink>
          <v-btn color="primary"
                 :loading="isSaving"
                 type="submit"
          >
            Save
            <v-icon right>mdi-floppy</v-icon>
          </v-btn>
        </v-flex>
      </v-layout>
    </v-form>
  </v-container>
</template>

<style lang="sass" scoped>
.email-preview
  all: unset
</style>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {
  FerdigApplication,
  FerdigApplicationNotificationTemplate,
  FerdigApplicationNotificationTemplateCreateData,
} from '@ferdig/client-js';
import {isRequired} from '@/utils/inputRules';
import {getFerdigClient} from '@/api';
import {Prop, Watch} from 'vue-property-decorator';
import {State} from 'vuex-class';
import {Breadcrumb} from '@/store/RootState';
import {errorMessage} from '@/utils/dialog';

const makeEmptyTemplate = (): FerdigApplicationNotificationTemplateCreateData => {
  return {
    internalName: '',
    subject: '',
    body: '',
  };
}

@Component({})
export default class NotificationTemplateEditor extends Vue {
  @State('activeApplication', {namespace: 'applications'})
  private activeApplication!: FerdigApplication | null;

  @State('items', {namespace: 'notificationTemplates'})
  private templates!: FerdigApplicationNotificationTemplate[];

  @Prop({required: true})
  private templateId!: string;

  private template: FerdigApplicationNotificationTemplateCreateData = makeEmptyTemplate();
  private rules = {
    isRequired,
  };
  private isSaving = false;
  private error = '';
  private showError = false;
  private isRemoving = false;

  @Watch('activeApplication', {immediate: true})
  @Watch('template')
  private setBreadcrumbs() {
    this.$store.commit('setBreadcrumbs', [
      {
        to: '/applications',
        exact: true,
        text: 'Applications',
      },
      {
        to: `/applications/${this.activeApplication?.id}`,
        text: this.activeApplication?.internalName ?? '-',
        exact: true,
      },
      {
        to: `/applications/${this.activeApplication?.id}/notification-templates`,
        text: 'Notification-Templates',
        exact: true,
      },
      {
        to: `/applications/${this.activeApplication?.id}/notification-templates/${this.templateId}`,
        text: this.template.internalName ?? '-',
        exact: false,
      },
    ] as Breadcrumb[])
  }

  @Watch('templateId', {immediate: true})
  @Watch('templates')
  private loadTemplate() {
    this.template = this.templates.find((template) => template.id === this.templateId) ?? makeEmptyTemplate();
  }

  private async saveTemplate() {
    if (!this.activeApplication) {
      return;
    }

    const form = this.$refs.form as unknown as { validate: () => boolean };
    if (!form.validate()) {
      return;
    }

    try {
      this.isSaving = true;
      this.template = await (await getFerdigClient())
          .applications
          .notificationTemplates(this.activeApplication.id)
          .update(this.templateId, this.template);

      this.$store.commit('notificationTemplates/save', this.template);

      this.showError = false;
    } catch (e) {
      this.error = e.message;
      this.showError = true;
    } finally {
      this.isSaving = false;
    }
  }

  private async remove() {
    if (!this.activeApplication) {
      return;
    }

    const confirmed = await this.$dialog.confirm({
      text: 'Are you sure you want to remove this template?',
      type: 'error'
    });

    if (!confirmed) {
      return;
    }

    try {
      this.isRemoving = true;
      await (await getFerdigClient())
          .applications
          .notificationTemplates(this.activeApplication.id)
          .remove(this.templateId);

      this.$store.commit('notificationTemplates/remove', this.templateId);

      await this.$router.push(`/applications/${this.activeApplication.id}/notification-templates`);
    } catch (e) {
      await errorMessage(e)
    } finally {
      this.isRemoving = false;
    }
  }
}
</script>
