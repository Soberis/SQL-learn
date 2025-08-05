<template>
  <div class="instant-feedback">
    <!-- 执行状态 -->
    <div class="feedback__status" :class="`feedback__status--${status}`">
      <div class="feedback__status-icon">
        <component :is="statusIcon" :size="20" />
      </div>
      <div class="feedback__status-text">
        <span class="feedback__status-title">{{ statusTitle }}</span>
        <span v-if="executionTime" class="feedback__execution-time">执行时间: {{ executionTime }}ms</span>
      </div>
    </div>

    <!-- 查询结果 -->
    <div v-if="status === 'success' && result" class="feedback__result">
      <div class="feedback__result-header">
        <h4>查询结果</h4>
        <span class="feedback__result-count">{{ result.rows?.length || 0 }} 行数据</span>
      </div>

      <div v-if="result.rows && result.rows.length > 0" class="feedback__result-table">
        <table>
          <thead>
            <tr>
              <th v-for="column in result.columns" :key="column">
                {{ column }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in displayRows" :key="index">
              <td v-for="column in result.columns" :key="column">
                {{ formatCellValue(row[column]) }}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 分页控制 -->
        <div v-if="result.rows.length > pageSize" class="feedback__pagination">
          <button :disabled="currentPage === 1" class="feedback__page-btn" @click="currentPage--">
            <ChevronLeft :size="16" />
          </button>
          <span class="feedback__page-info">{{ currentPage }} / {{ totalPages }}</span>
          <button :disabled="currentPage === totalPages" class="feedback__page-btn" @click="currentPage++">
            <ChevronRight :size="16" />
          </button>
        </div>
      </div>

      <div v-else class="feedback__empty">
        <Database :size="48" class="feedback__empty-icon" />
        <p>查询执行成功，但没有返回数据</p>
      </div>
    </div>

    <!-- 错误信息 -->
    <div v-if="status === 'error' && error" class="feedback__error">
      <div class="feedback__error-header">
        <h4>执行错误</h4>
        <button class="feedback__toggle-btn" @click="showErrorDetails = !showErrorDetails">
          <ChevronDown :size="16" :class="{ rotated: showErrorDetails }" />
        </button>
      </div>

      <div class="feedback__error-message">
        {{ error.message }}
      </div>

      <div v-if="showErrorDetails" class="feedback__error-details">
        <div v-if="error.line" class="feedback__error-location">
          <MapPin :size="16" />
          <span>错误位置: 第 {{ error.line }} 行</span>
        </div>

        <div v-if="error.suggestion" class="feedback__error-suggestion">
          <Lightbulb :size="16" />
          <div>
            <strong>建议修复:</strong>
            <p>{{ error.suggestion }}</p>
          </div>
        </div>

        <div v-if="error.examples && error.examples.length > 0" class="feedback__error-examples">
          <BookOpen :size="16" />
          <div>
            <strong>正确示例:</strong>
            <div v-for="(example, index) in error.examples" :key="index" class="feedback__example-code">
              <pre><code>{{ example }}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 智能提示 -->
    <div v-if="hints && hints.length > 0" class="feedback__hints">
      <div class="feedback__hints-header">
        <Zap :size="16" />
        <h4>智能提示</h4>
      </div>

      <div class="feedback__hints-list">
        <div
          v-for="(hint, index) in hints"
          :key="index"
          class="feedback__hint-item"
          :class="`feedback__hint-item--${hint.type}`"
        >
          <component :is="getHintIcon(hint.type)" :size="16" />
          <div class="feedback__hint-content">
            <span class="feedback__hint-title">{{ hint.title }}</span>
            <p class="feedback__hint-description">{{ hint.description }}</p>
            <button v-if="hint.action" class="feedback__hint-action" @click="$emit('applyHint', hint)">
              {{ hint.action.text }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 性能分析 -->
    <div v-if="status === 'success' && performance" class="feedback__performance">
      <div class="feedback__performance-header">
        <Activity :size="16" />
        <h4>性能分析</h4>
        <button class="feedback__toggle-btn" @click="showPerformance = !showPerformance">
          <ChevronDown :size="16" :class="{ rotated: showPerformance }" />
        </button>
      </div>

      <div v-if="showPerformance" class="feedback__performance-details">
        <div class="feedback__performance-metrics">
          <div class="feedback__metric">
            <span class="feedback__metric-label">执行时间</span>
            <span class="feedback__metric-value">{{ performance.executionTime }}ms</span>
          </div>
          <div class="feedback__metric">
            <span class="feedback__metric-label">扫描行数</span>
            <span class="feedback__metric-value">{{ performance.rowsScanned }}</span>
          </div>
          <div class="feedback__metric">
            <span class="feedback__metric-label">返回行数</span>
            <span class="feedback__metric-value">{{ performance.rowsReturned }}</span>
          </div>
        </div>

        <div
          v-if="performance.suggestions && performance.suggestions.length > 0"
          class="feedback__performance-suggestions"
        >
          <h5>优化建议</h5>
          <ul>
            <li v-for="(suggestion, index) in performance.suggestions" :key="index">
              {{ suggestion }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Database,
  MapPin,
  Lightbulb,
  BookOpen,
  Zap,
  Activity,
  TrendingUp,
  Shield,
  Target,
} from 'lucide-vue-next'

interface QueryResult {
  columns: string[]
  rows: Record<string, any>[]
  totalRows?: number
}

interface QueryError {
  message: string
  line?: number
  column?: number
  suggestion?: string
  examples?: string[]
}

interface Hint {
  type: 'optimization' | 'security' | 'best-practice' | 'syntax'
  title: string
  description: string
  action?: {
    text: string
    code?: string
  }
}

interface Performance {
  executionTime: number
  rowsScanned: number
  rowsReturned: number
  suggestions?: string[]
}

interface Props {
  status: 'idle' | 'running' | 'success' | 'error'
  result?: QueryResult | null
  error?: QueryError | null
  hints?: Hint[]
  performance?: Performance | null
  executionTime?: number
}

const props = withDefaults(defineProps<Props>(), {
  status: 'idle',
  result: null,
  error: null,
  hints: () => [],
  performance: null,
  executionTime: undefined,
})

// 响应式数据
const showErrorDetails = ref(false)
const showPerformance = ref(false)
const currentPage = ref(1)
const pageSize = 10

// 计算属性
const statusIcon = computed(() => {
  switch (props.status) {
    case 'running':
      return Clock
    case 'success':
      return CheckCircle
    case 'error':
      return XCircle
    default:
      return AlertTriangle
  }
})

const statusTitle = computed(() => {
  switch (props.status) {
    case 'running':
      return '正在执行...'
    case 'success':
      return '执行成功'
    case 'error':
      return '执行失败'
    default:
      return '等待执行'
  }
})

const totalPages = computed(() => {
  if (!props.result?.rows) return 0
  return Math.ceil(props.result.rows.length / pageSize)
})

const displayRows = computed(() => {
  if (!props.result?.rows) return []
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return props.result.rows.slice(start, end)
})

// 方法
const formatCellValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return 'NULL'
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  if (typeof value === 'string' && value.length > 100) {
    return value.substring(0, 100) + '...'
  }
  return String(value)
}

const getHintIcon = (type: string) => {
  switch (type) {
    case 'optimization':
      return TrendingUp
    case 'security':
      return Shield
    case 'best-practice':
      return Target
    default:
      return Zap
  }
}

// 监听状态变化，重置分页
watch(
  () => props.result,
  () => {
    currentPage.value = 1
  }
)
</script>

<style scoped>
.instant-feedback {
  @apply bg-white rounded-lg border border-gray-200 overflow-hidden;
}

.feedback__status {
  @apply flex items-center gap-3 p-4 border-b border-gray-100;
}

.feedback__status--idle {
  @apply bg-gray-50;
}

.feedback__status--running {
  @apply bg-blue-50;
}

.feedback__status--success {
  @apply bg-green-50;
}

.feedback__status--error {
  @apply bg-red-50;
}

.feedback__status-icon {
  @apply flex-shrink-0;
}

.feedback__status--idle .feedback__status-icon {
  @apply text-gray-500;
}

.feedback__status--running .feedback__status-icon {
  @apply text-blue-500 animate-spin;
}

.feedback__status--success .feedback__status-icon {
  @apply text-green-500;
}

.feedback__status--error .feedback__status-icon {
  @apply text-red-500;
}

.feedback__status-text {
  @apply flex flex-col gap-1;
}

.feedback__status-title {
  @apply font-medium text-gray-900;
}

.feedback__execution-time {
  @apply text-sm text-gray-500;
}

.feedback__result {
  @apply p-4;
}

.feedback__result-header {
  @apply flex items-center justify-between mb-4;
}

.feedback__result-header h4 {
  @apply text-lg font-semibold text-gray-900;
}

.feedback__result-count {
  @apply text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded;
}

.feedback__result-table {
  @apply border border-gray-200 rounded-lg overflow-hidden;
}

.feedback__result-table table {
  @apply w-full;
}

.feedback__result-table th {
  @apply bg-gray-50 px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200;
}

.feedback__result-table td {
  @apply px-4 py-3 text-sm text-gray-900 border-b border-gray-100;
}

.feedback__result-table tr:last-child td {
  @apply border-b-0;
}

.feedback__pagination {
  @apply flex items-center justify-center gap-4 p-4 bg-gray-50;
}

.feedback__page-btn {
  @apply p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
}

.feedback__page-info {
  @apply text-sm text-gray-600;
}

.feedback__empty {
  @apply flex flex-col items-center justify-center py-12 text-gray-500;
}

.feedback__empty-icon {
  @apply mb-4 text-gray-300;
}

.feedback__error {
  @apply p-4;
}

.feedback__error-header {
  @apply flex items-center justify-between mb-3;
}

.feedback__error-header h4 {
  @apply text-lg font-semibold text-red-700;
}

.feedback__toggle-btn {
  @apply p-1 rounded hover:bg-gray-100 transition-colors;
}

.feedback__toggle-btn .rotated {
  @apply transform rotate-180;
}

.feedback__error-message {
  @apply text-red-600 bg-red-50 p-3 rounded-lg mb-4 font-mono text-sm;
}

.feedback__error-details {
  @apply space-y-4;
}

.feedback__error-location {
  @apply flex items-center gap-2 text-sm text-gray-600;
}

.feedback__error-suggestion {
  @apply flex gap-3 p-3 bg-yellow-50 rounded-lg;
}

.feedback__error-suggestion svg {
  @apply text-yellow-600 flex-shrink-0 mt-0.5;
}

.feedback__error-suggestion strong {
  @apply text-yellow-800;
}

.feedback__error-suggestion p {
  @apply text-yellow-700 mt-1;
}

.feedback__error-examples {
  @apply flex gap-3 p-3 bg-blue-50 rounded-lg;
}

.feedback__error-examples svg {
  @apply text-blue-600 flex-shrink-0 mt-0.5;
}

.feedback__error-examples strong {
  @apply text-blue-800;
}

.feedback__example-code {
  @apply mt-2 bg-gray-900 text-gray-100 p-3 rounded text-sm font-mono overflow-x-auto;
}

.feedback__hints {
  @apply p-4 border-t border-gray-100;
}

.feedback__hints-header {
  @apply flex items-center gap-2 mb-4;
}

.feedback__hints-header svg {
  @apply text-yellow-500;
}

.feedback__hints-header h4 {
  @apply text-lg font-semibold text-gray-900;
}

.feedback__hints-list {
  @apply space-y-3;
}

.feedback__hint-item {
  @apply flex gap-3 p-3 rounded-lg;
}

.feedback__hint-item--optimization {
  @apply bg-green-50;
}

.feedback__hint-item--security {
  @apply bg-red-50;
}

.feedback__hint-item--best-practice {
  @apply bg-blue-50;
}

.feedback__hint-item--syntax {
  @apply bg-yellow-50;
}

.feedback__hint-item svg {
  @apply flex-shrink-0 mt-0.5;
}

.feedback__hint-item--optimization svg {
  @apply text-green-600;
}

.feedback__hint-item--security svg {
  @apply text-red-600;
}

.feedback__hint-item--best-practice svg {
  @apply text-blue-600;
}

.feedback__hint-item--syntax svg {
  @apply text-yellow-600;
}

.feedback__hint-content {
  @apply flex-1;
}

.feedback__hint-title {
  @apply font-medium text-gray-900;
}

.feedback__hint-description {
  @apply text-sm text-gray-600 mt-1;
}

.feedback__hint-action {
  @apply mt-2 px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors;
}

.feedback__performance {
  @apply p-4 border-t border-gray-100;
}

.feedback__performance-header {
  @apply flex items-center gap-2 mb-4;
}

.feedback__performance-header svg {
  @apply text-purple-500;
}

.feedback__performance-header h4 {
  @apply text-lg font-semibold text-gray-900 flex-1;
}

.feedback__performance-details {
  @apply space-y-4;
}

.feedback__performance-metrics {
  @apply grid grid-cols-3 gap-4;
}

.feedback__metric {
  @apply bg-gray-50 p-3 rounded-lg text-center;
}

.feedback__metric-label {
  @apply block text-sm text-gray-600;
}

.feedback__metric-value {
  @apply block text-lg font-semibold text-gray-900 mt-1;
}

.feedback__performance-suggestions {
  @apply bg-purple-50 p-3 rounded-lg;
}

.feedback__performance-suggestions h5 {
  @apply font-medium text-purple-800 mb-2;
}

.feedback__performance-suggestions ul {
  @apply space-y-1;
}

.feedback__performance-suggestions li {
  @apply text-sm text-purple-700;
}

@media (max-width: 768px) {
  .feedback__performance-metrics {
    @apply grid-cols-1;
  }

  .feedback__result-table {
    @apply text-xs;
  }

  .feedback__result-table th,
  .feedback__result-table td {
    @apply px-2 py-2;
  }
}
</style>
