<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start" v-if="backHref">
          <ion-back-button :default-href="backHref" />
        </ion-buttons>
        <ion-title>{{ title }}</ion-title>
        <ion-buttons slot="end">
          <slot name="actions" />
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <slot />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
} from '@ionic/vue'

defineProps<{ title: string; backHref?: string }>()
</script>
