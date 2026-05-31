<template>
  <app-layout title="Items">
    <template #actions>
      <ion-button @click="openCreate">追加</ion-button>
    </template>

    <div v-if="isLoading" class="ion-text-center">
      <ion-spinner />
    </div>
    <ion-text color="danger" v-else-if="isError">
      <p>読み込みに失敗しました。</p>
    </ion-text>
    <ion-list v-else>
      <ion-item
        v-for="item in items"
        :key="item.id"
        button
        :router-link="`/items/${item.id}`"
      >
        <ion-label>
          <h2>{{ item.title }}</h2>
          <p>{{ item.status }}</p>
        </ion-label>
      </ion-item>
      <ion-text v-if="items && items.length === 0" color="medium">
        <p>項目がありません。</p>
      </ion-text>
    </ion-list>

    <ion-modal :is-open="showCreate" @did-dismiss="showCreate = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>追加</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showCreate = false">閉じる</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-input label="タイトル" label-placement="stacked" v-model="form.title" />
        <ion-textarea label="説明" label-placement="stacked" v-model="form.description" />
        <ion-select label="状態" label-placement="stacked" v-model="form.status">
          <ion-select-option value="todo">todo</ion-select-option>
          <ion-select-option value="doing">doing</ion-select-option>
          <ion-select-option value="done">done</ion-select-option>
        </ion-select>
        <ion-button expand="block" class="ion-margin-top" :disabled="!form.title" @click="submitCreate">
          保存
        </ion-button>
      </ion-content>
    </ion-modal>
  </app-layout>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import {
  IonButton, IonList, IonItem, IonLabel, IonSpinner, IonText, IonModal,
  IonHeader, IonToolbar, IonTitle, IonButtons, IonContent,
  IonInput, IonTextarea, IonSelect, IonSelectOption,
} from '@ionic/vue'
import { useQueryClient } from '@tanstack/vue-query'
import AppLayout from '@/layouts/AppLayout.vue'
import { useListItems, useCreateItem, getListItemsQueryKey } from '@/api/generated/endpoints'
import type { ItemInputStatus } from '@/api/generated/model'

const queryClient = useQueryClient()
const { data, isLoading, isError } = useListItems()
const items = computed(() => data.value)

const showCreate = ref(false)
const form = reactive({ title: '', description: '', status: 'todo' as ItemInputStatus })

function openCreate() {
  form.title = ''
  form.description = ''
  form.status = 'todo' as ItemInputStatus
  showCreate.value = true
}

const createMutation = useCreateItem({
  mutation: {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListItemsQueryKey() })
      showCreate.value = false
    },
  },
})

function submitCreate() {
  createMutation.mutate({ data: { title: form.title, description: form.description, status: form.status } })
}
</script>
