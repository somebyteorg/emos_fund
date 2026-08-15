import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/in',
      name: 'in',
      component: () => import('@/views/In.vue'),
    },
    {
      path: '/order/:orderNo?',
      name: 'orders',
      component: () => import('@/views/Order.vue'),
    },
    {
      path: '/anniv-1',
      name: 'activity-anniv-1',
      component: () => import('@/activities/anniv-1/index.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

export default router
