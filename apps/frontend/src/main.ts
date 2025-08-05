import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { globalErrorHandler } from './utils/errorHandler'

/**
 * 创建Vue应用实例并配置所有插件
 * 包括路由、状态管理、UI组件库等
 */
const app = createApp(App)

// 创建状态管理实例
const pinia = createPinia()

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 安装插件
app.use(router)
app.use(pinia)
app.use(ElementPlus)

// 配置全局错误处理
app.config.errorHandler = (err, _instance, info) => {
  console.error('Vue全局错误:', err, info)
  globalErrorHandler.reportError(err as Error, info)
}

// 挂载应用
app.mount('#app')
