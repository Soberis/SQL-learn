<template>
  <div class="loading-spinner" :class="{ 'loading-spinner--overlay': overlay }">
    <div class="loading-spinner__container">
      <div class="loading-spinner__icon" :style="{ width: size, height: size }">
        <svg viewBox="0 0 50 50" class="loading-spinner__svg">
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="currentColor"
            stroke-width="4"
            stroke-linecap="round"
            stroke-dasharray="31.416"
            class="loading-spinner__circle"
          />
        </svg>
      </div>
      <div v-if="text" class="loading-spinner__text">{{ text }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 加载动画组件
 * 提供可自定义的加载指示器，支持覆盖层模式和自定义文本
 */

interface Props {
  /** 是否显示覆盖层 */
  overlay?: boolean
  /** 加载文本 */
  text?: string
  /** 图标大小 */
  size?: string
  /** 颜色 */
  color?: string
}

withDefaults(defineProps<Props>(), {
  overlay: false,
  text: '',
  size: '40px',
  color: 'var(--el-color-primary)',
})
</script>

<style scoped>
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.loading-spinner--overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
  z-index: 9999;
}

.loading-spinner__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.loading-spinner__icon {
  color: v-bind(color);
}

.loading-spinner__svg {
  width: 100%;
  height: 100%;
  animation: loading-spinner-rotate 2s linear infinite;
}

.loading-spinner__circle {
  animation: loading-spinner-dash 1.5s ease-in-out infinite;
}

.loading-spinner__text {
  font-size: 14px;
  color: var(--el-text-color-regular);
  text-align: center;
}

@keyframes loading-spinner-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes loading-spinner-dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

/* 深色模式适配 */
.dark .loading-spinner--overlay {
  background-color: rgba(0, 0, 0, 0.8);
}
</style>
