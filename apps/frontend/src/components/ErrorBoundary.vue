<template>
  <div v-if="hasError" class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
      <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
        <el-icon class="text-red-600" :size="24">
          <WarningFilled />
        </el-icon>
      </div>

      <h2 class="text-xl font-semibold text-gray-900 text-center mb-2">应用程序出错了</h2>

      <p class="text-gray-600 text-center mb-6">
        很抱歉，应用程序遇到了一个错误。您可以尝试重新加载页面或联系技术支持。
      </p>

      <details v-if="isDev && error" class="mb-4 p-3 bg-gray-100 rounded text-sm">
        <summary class="cursor-pointer font-medium text-gray-700 mb-2">错误详情（开发模式）</summary>
        <div class="text-red-600 whitespace-pre-wrap">
          {{ error.toString() }}
          <div v-if="errorInfo">组件堆栈: {{ errorInfo }}</div>
        </div>
      </details>

      <div class="flex space-x-3">
        <el-button type="primary" class="flex-1" @click="handleRetry">重试</el-button>
        <el-button class="flex-1" @click="handleReload">刷新页面</el-button>
      </div>
    </div>
  </div>

  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { ElMessage, ElButton, ElIcon } from 'element-plus'
import { WarningFilled } from '@element-plus/icons-vue'
// import { ApiError } from '../utils/apiClient' // 暂时注释掉未使用的导入

interface Props {
  onError?: (error: Error, info: string) => void
}

const props = withDefaults(defineProps<Props>(), {
  onError: undefined,
})

const hasError = ref(false)
const error = ref<Error | null>(null)
const errorInfo = ref<string | null>(null)
const isDev = import.meta.env.DEV

// 捕获子组件错误
onErrorCaptured((err: Error, _instance, info: string) => {
  console.error('ErrorBoundary捕获到错误:', err, info)

  hasError.value = true
  error.value = err
  errorInfo.value = info

  // 调用自定义错误处理函数
  if (props.onError) {
    props.onError(err, info)
  }

  // 显示错误提示
  // 简化错误处理，不再区分ApiError类型
  if (err.message) {
    ElMessage.error(`错误: ${err.message}`)
  } else {
    ElMessage.error('应用程序发生错误，请刷新页面重试')
  }

  // 返回false阻止错误继续传播
  return false
})

const handleRetry = () => {
  hasError.value = false
  error.value = null
  errorInfo.value = null
}

const handleReload = () => {
  window.location.reload()
}
</script>

<style scoped>
.space-x-3 > * + * {
  margin-left: 0.75rem;
}
</style>
