import { createRouter, createWebHistory } from '@ionic/vue-router'
import type { RouteRecordRaw } from 'vue-router'
import TabsView from '@/views/TabsView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/tabs/home',
  },
  {
    path: '/tabs/',
    component: TabsView,
    children: [
      { path: '', redirect: '/tabs/home' },
      { path: 'home', component: () => import('@/views/HomeView.vue') },
      { path: 'scan', component: () => import('@/views/ScanView.vue') },
      { path: 'account', component: () => import('@/views/AccountView.vue') },
    ],
  },
  {
    path: '/bill/:id',
    component: () => import('@/views/BillView.vue'),
  },
  {
    path: '/receipt',
    component: () => import('@/views/ReceiptView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
