<template>
  <app-layout title="詳細" back-href="/items">
    <div v-if="isLoading" class="ion-text-center"><ion-spinner /></div>
    <ion-text color="danger" v-else-if="isError">
      <p>項目が見つかりません（404）。</p>
    </ion-text>
    <template v-else-if="data">
      <ion-input label="タイトル" label-placement="stacked" v-model="form.title" />
      <ion-textarea label="説明" label-placement="stacked" v-model="form.description" />
      <ion-select label="状態" label-placement="stacked" v-model="form.status">
        <ion-select-option value="todo">todo</ion-select-option>
        <ion-select-option value="doing">doing</ion-select-option>
        <ion-select-option value="done">done</ion-select-option>
      </ion-select>

      <ion-button expand="block" class="ion-margin-top" :disabled="!form.title" @click="save">保存</ion-button>
      <ion-button expand="block" color="danger" @click="remove">削除</ion-button>
    </template>
  </app-layout>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  IonSpinner, IonText, IonInput, IonTextarea, IonSelect, IonSelectOption, IonButton,
} from '@ionic/vue'
import { useQueryClient } from '@tanstack/vue-query'
import AppLayout from '@/layouts/AppLayout.vue'
import { useGetItem, useUpdateItem, useDeleteItem, getListItemsQueryKey } from '@/api/generated/endpoints'
import type { ItemInputStatus } from '@/api/generated/model'

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()
const id = String(route.params.id)

const { data, isLoading, isError } = useGetItem(id)
const form = reactive({ title: '', description: '', status: 'todo' as ItemInputStatus })

watch(data, (v) => {
  if (v) {
    form.title = v.title
    form.description = v.description ?? ''
    form.status = v.status as unknown as ItemInputStatus
  }
}, { immediate: true })

const updateMutation = useUpdateItem({
  mutation: {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListItemsQueryKey() })
      router.back()
    },
  },
})
const deleteMutation = useDeleteItem({
  mutation: {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListItemsQueryKey() })
      router.replace('/items')
    },
  },
})

function save() {
  updateMutation.mutate({ id, data: { title: form.title, description: form.description || undefined, status: form.status } })
}
function remove() {
  deleteMutation.mutate({ id })
}
</script>
