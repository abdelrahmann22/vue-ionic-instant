import { createRouter, createWebHistory } from '@ionic/vue-router'
import type { RouteRecordRaw } from 'vue-router'
import TabsView from '@/views/TabsView.vue'
import { getToken, setUnauthorizedHandler } from '@/services/api'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/tabs/home' },
  { path: '/login', component: () => import('@/views/LoginView.vue'), meta: { public: true } },
  { path: '/signup', component: () => import('@/views/SignupView.vue'), meta: { public: true } },
  {
    path: '/tabs/',
    component: TabsView,
    meta: { requiresAuth: true },
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
    meta: { requiresAuth: true },
  },
  {
    path: '/processing',
    component: () => import('@/views/ProcessingView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/receipt',
    component: () => import('@/views/ReceiptView.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to) => {
  const token = await getToken()
  if (to.meta.requiresAuth && !token) {
    return { path: '/login' }
  }
  if (to.meta.public && token) {
    return { path: '/tabs/home' }
  }
  return true
})

setUnauthorizedHandler(() => {
  router.replace('/login')
})

export default router
