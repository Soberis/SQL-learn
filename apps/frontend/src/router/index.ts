import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * 路由配置 - 简化版本
 * 定义SQL学习平台的核心页面路由
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/quickstart',
  },
  {
    path: '/quickstart',
    name: 'QuickStart',
    component: () => import('../pages/QuickStart.vue'),
    meta: {
      title: '快速开始',
      icon: 'Lightning',
    },
  },
  {
    path: '/practice',
    name: 'Practice',
    component: () => import('../pages/Practice.vue'),
    meta: {
      title: '实战练习',
      icon: 'EditPen',
    },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../pages/Dashboard.vue'),
    meta: {
      title: '学习进度',
      icon: 'TrendCharts',
      requiresAuth: true,
    },
  },
  {
    path: '/handbook',
    name: 'Handbook',
    component: () => import('../pages/Handbook.vue'),
    meta: {
      title: '速查手册',
      icon: 'Collection',
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/Login.vue'),
    meta: {
      title: '用户登录',
      hideInMenu: true,
    },
  },
]

/**
 * 创建路由实例
 */
const router = createRouter({
  history: createWebHistory(),
  routes,
})

/**
 * 简化的路由守卫
 * 只进行基本的认证检查
 */
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !authStore.isAuthenticated) {
    // 需要认证但未登录，跳转到登录页
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    // 已登录用户访问登录页，重定向到首页
    next('/dashboard')
  } else {
    // 其他情况正常通过
    next()
  }
})

export default router
