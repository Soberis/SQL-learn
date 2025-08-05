<template>
  <div class="empty-state">
    <div class="empty-state__icon">
      <component :is="iconComponent" :size="iconSize" />
    </div>
    <div class="empty-state__content">
      <h3 class="empty-state__title">{{ title }}</h3>
      <p class="empty-state__description">{{ description }}</p>
      <div v-if="$slots.action" class="empty-state__action">
        <slot name="action" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Search, Warning, CircleClose, Box, DataLine, Trophy, Notebook } from '@element-plus/icons-vue'

/**
 * 空状态组件
 * 用于显示无数据、搜索无结果等空状态场景
 */

interface Props {
  /** 空状态类型 */
  type?: 'empty' | 'search' | 'error' | 'network' | 'data' | 'achievement' | 'course'
  /** 标题 */
  title?: string
  /** 描述文本 */
  description?: string
  /** 图标大小 */
  iconSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'empty',
  title: '',
  description: '',
  iconSize: 64,
})

// 根据类型获取对应的图标组件
const iconComponent = computed(() => {
  const iconMap = {
    empty: Box,
    search: Search,
    error: CircleClose,
    network: Warning,
    data: DataLine,
    achievement: Trophy,
    course: Notebook,
  }
  return iconMap[props.type] || Box
})

// 根据类型获取默认标题
const title = computed(() => {
  if (props.title) return props.title

  const titleMap = {
    empty: '暂无数据',
    search: '搜索无结果',
    error: '出现错误',
    network: '网络连接失败',
    data: '暂无统计数据',
    achievement: '暂无成就',
    course: '暂无课程',
  }
  return titleMap[props.type] || '暂无数据'
})

// 根据类型获取默认描述
const description = computed(() => {
  if (props.description) return props.description

  const descriptionMap = {
    empty: '当前没有可显示的内容',
    search: '尝试调整搜索条件或关键词',
    error: '请刷新页面或稍后重试',
    network: '请检查网络连接后重试',
    data: '完成更多练习后查看统计数据',
    achievement: '继续学习以获得成就徽章',
    course: '暂时没有可用的课程内容',
  }
  return descriptionMap[props.type] || '当前没有可显示的内容'
})
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  min-height: 300px;
}

.empty-state__icon {
  margin-bottom: 24px;
  color: var(--el-text-color-placeholder);
  opacity: 0.6;
}

.empty-state__content {
  max-width: 400px;
}

.empty-state__title {
  font-size: 18px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.empty-state__description {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin: 0 0 24px 0;
  line-height: 1.6;
}

.empty-state__action {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .empty-state {
    padding: 40px 16px;
    min-height: 200px;
  }

  .empty-state__title {
    font-size: 16px;
  }

  .empty-state__description {
    font-size: 13px;
  }
}

/* 动画效果 */
.empty-state {
  animation: empty-state-fade-in 0.3s ease-out;
}

@keyframes empty-state-fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
