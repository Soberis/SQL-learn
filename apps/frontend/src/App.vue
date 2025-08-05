<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, ArrowDown, Setting, SwitchButton } from '@element-plus/icons-vue'
import { usePreferencesStore } from './stores/preferences'
import { useAuthStore } from './stores/auth'
import ErrorBoundary from '@/components/ErrorBoundary.vue'

/**
 * 主应用组件
 * 提供整体布局和导航结构
 */
const router = useRouter()
const route = useRoute()
const preferencesStore = usePreferencesStore()
const authStore = useAuthStore()

// 导航菜单项 - 实战导向的5个核心页面
const menuItems = [
  { path: '/quickstart', title: '快速开始', icon: 'Lightning', description: '5分钟快速入门' },
  { path: '/practice', title: '实战练习场', icon: 'EditPen', description: '真实业务场景练习' },
  { path: '/project', title: '项目实战室', icon: 'Suitcase', description: '完整项目案例' },
  { path: '/dashboard', title: '进度看板', icon: 'TrendCharts', description: '学习进度可视化' },
  { path: '/handbook', title: '速查手册', icon: 'Collection', description: 'SQL语法速查' },
]

// 当前激活的菜单项
const activeIndex = computed(() => route.path)

/**
 * 处理菜单选择
 * @param index 菜单索引(路径)
 */
const handleMenuSelect = (index: string) => {
  router.push(index)
}

/**
 * 切换主题
 */
const toggleTheme = () => {
  const currentTheme = preferencesStore.settings.theme
  const newTheme = currentTheme === 'light' ? 'dark' : 'light'
  preferencesStore.updateTheme(newTheme)
}

/**
 * 处理用户登出
 */
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await authStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch (error) {
    // 用户取消操作
  }
}

/**
 * 处理用户下拉菜单命令
 */
const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人资料功能开发中')
      break
    case 'settings':
      ElMessage.info('用户设置功能开发中')
      break
    case 'logout':
      handleLogout()
      break
  }
}

/**
 * 组件挂载时初始化认证状态
 */
onMounted(async () => {
  // 初始化认证状态
  await authStore.initAuth()
})
</script>

<template>
  <el-container class="app-container">
    <!-- 侧边导航栏 -->
    <el-aside width="240px" class="app-aside">
      <div class="logo-section">
        <h2 class="app-title">
          <el-icon><Lightning /></el-icon>
          SQL实战学习平台
        </h2>
      </div>

      <el-menu :default-active="activeIndex" class="app-menu" router @select="handleMenuSelect">
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path" class="menu-item">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区域 -->
    <el-container class="main-container">
      <!-- 顶部工具栏 -->
      <el-header class="app-header">
        <div class="header-left">
          <h3 class="page-title">
            {{ menuItems.find(item => item.path === route.path)?.title || '快速开始' }}
          </h3>
        </div>

        <div class="header-right">
          <!-- 未登录状态 -->
          <div v-if="!authStore.isAuthenticated" class="header-auth">
            <el-button type="primary" @click="router.push('/login')">登录</el-button>
          </div>

          <!-- 已登录状态 -->
          <div v-else class="header-user">
            <el-dropdown @command="handleUserCommand">
              <div class="user-info">
                <el-avatar :size="32" :src="authStore.user?.avatar_url">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span class="user-name">{{ authStore.user?.username || '用户' }}</span>
                <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>
                    个人资料
                  </el-dropdown-item>
                  <el-dropdown-item command="settings">
                    <el-icon><Setting /></el-icon>
                    设置
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <el-button
            circle
            :icon="preferencesStore.settings.theme === 'dark' ? 'Sunny' : 'Moon'"
            @click="toggleTheme"
          />
        </div>
      </el-header>

      <!-- 页面内容 -->
      <el-main class="app-main">
        <ErrorBoundary>
          <router-view />
        </ErrorBoundary>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.app-container {
  height: 100vh;
  background-color: var(--el-bg-color-page);
}

.app-aside {
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-light);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.logo-section {
  padding: 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.app-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-menu {
  border: none;
  background-color: transparent;
}

.menu-item {
  margin: 4px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background-color: var(--el-color-primary-light-9);
}

.menu-item.is-active {
  background-color: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
}

.main-container {
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: var(--el-bg-color-page);
}

/* 深色主题适配 */
:global(.dark) .app-aside {
  background-color: var(--el-bg-color);
}

:global(.dark) .app-header {
  background-color: var(--el-bg-color);
}

:global(.dark) .menu-item:hover {
  background-color: var(--el-color-primary-dark-2);
}

:global(.dark) .menu-item.is-active {
  background-color: var(--el-color-primary-dark-2);
}

/* 用户信息样式 */
.header-auth {
  display: flex;
  align-items: center;
  margin-right: 12px;
}

.header-user {
  display: flex;
  align-items: center;
  margin-right: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.user-info:hover {
  background-color: var(--el-fill-color-light);
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  font-size: 12px;
  color: var(--el-text-color-regular);
  transition: transform 0.3s ease;
}

.user-info:hover .dropdown-icon {
  transform: rotate(180deg);
}

/* 深色主题下的用户信息样式 */
:global(.dark) .user-info:hover {
  background-color: var(--el-fill-color-dark);
}
</style>
