import { createRouter, createWebHistory } from '@ionic/vue-router'
import type { RouteRecordRaw } from 'vue-router'
import ItemListPage from '@/views/ItemListPage.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/items' },
  { path: '/items', component: ItemListPage },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
