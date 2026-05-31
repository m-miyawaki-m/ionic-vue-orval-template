import { createRouter, createWebHistory } from '@ionic/vue-router'
import type { RouteRecordRaw } from 'vue-router'
import ItemListPage from '@/views/ItemListPage.vue'
import ItemDetailPage from '@/views/ItemDetailPage.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/items' },
  { path: '/items', component: ItemListPage },
  { path: '/items/:id', component: ItemDetailPage },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
