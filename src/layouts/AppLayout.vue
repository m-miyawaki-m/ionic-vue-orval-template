<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start" v-if="backHref">
          <ion-back-button :default-href="backHref" />
        </ion-buttons>
        <ion-title>{{ title }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="showSheet = true" aria-label="テーマを切り替える">
            <ion-icon :icon="colorPaletteOutline" slot="icon-only" />
          </ion-button>
          <slot name="actions" />
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <slot />
    </ion-content>
  </ion-page>

  <ion-action-sheet
    :is-open="showSheet"
    header="テーマを選択"
    :buttons="sheetButtons"
    @did-dismiss="showSheet = false"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonButton, IonIcon, IonActionSheet,
} from '@ionic/vue'
import { colorPaletteOutline } from 'ionicons/icons'
import { useTheme } from '@/composables/useTheme'

defineProps<{ title: string; backHref?: string }>()

const { setTheme } = useTheme()
const showSheet = ref(false)

const sheetButtons = [
  { text: 'Default', handler: () => setTheme('default') },
  { text: 'Dark',    handler: () => setTheme('dark') },
  { text: 'Blue',    handler: () => setTheme('blue') },
  { text: '練習',    handler: () => setTheme('practice') },
  { text: 'キャンセル', role: 'cancel' },
]
</script>
