<template>
  <div class="sql-result-table">
    <!-- 执行信息 -->
    <div class="sql-result-table__info">
      <div class="sql-result-table__stats">
        <el-tag v-if="result.success" type="success" size="small">
          <el-icon><SuccessFilled /></el-icon>
          执行成功
        </el-tag>
        <el-tag v-else type="danger" size="small">
          <el-icon><CircleCloseFilled /></el-icon>
          执行失败
        </el-tag>

        <span class="sql-result-table__stat-item">耗时: {{ result.executionTime }}ms</span>

        <span v-if="result.rowCount !== undefined" class="sql-result-table__stat-item">
          {{ result.rowCount }} 行记录
        </span>

        <span v-if="result.affectedRows !== undefined" class="sql-result-table__stat-item">
          影响 {{ result.affectedRows }} 行
        </span>
      </div>

      <div class="sql-result-table__actions">
        <el-button-group size="small">
          <el-button :icon="CopyDocument" @click="handleCopyData">复制数据</el-button>
          <el-button :icon="Download" @click="handleExportCSV">导出CSV</el-button>
          <el-button :icon="View" @click="toggleFullscreen">
            {{ isFullscreen ? '退出全屏' : '全屏查看' }}
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 错误信息 -->
    <div v-if="!result.success && result.error" class="sql-result-table__error">
      <el-alert :title="result.error" type="error" :closable="false" show-icon>
        <template v-if="result.errorDetails">
          <pre class="sql-result-table__error-details">{{ result.errorDetails }}</pre>
        </template>
      </el-alert>
    </div>

    <!-- 数据表格 -->
    <div
      v-if="result.success && result.data && result.data.length > 0"
      class="sql-result-table__content"
      :class="{ 'sql-result-table__content--fullscreen': isFullscreen }"
    >
      <el-table
        :data="paginatedData"
        stripe
        border
        size="small"
        :max-height="tableMaxHeight"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <!-- 选择列 -->
        <el-table-column v-if="showSelection" type="selection" width="55" align="center" />

        <!-- 序号列 -->
        <el-table-column v-if="showIndex" type="index" label="#" width="60" align="center" :index="getRowIndex" />

        <!-- 数据列 -->
        <el-table-column
          v-for="column in columns"
          :key="column.key"
          :prop="column.key"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth || 120"
          :sortable="column.sortable !== false"
          :show-overflow-tooltip="true"
        >
          <template #default="{ row }">
            <div class="sql-result-table__cell">
              <span
                v-if="row[column.key] !== null && row[column.key] !== undefined"
                :class="getCellClass(row[column.key])"
              >
                {{ formatCellValue(row[column.key]) }}
              </span>
              <span v-else class="sql-result-table__null">NULL</span>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <div v-if="showPagination && totalRows > pageSize" class="sql-result-table__pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100, 200]"
          :total="totalRows"
          layout="total, sizes, prev, pager, next, jumper"
          background
          small
        />
      </div>
    </div>

    <!-- 空数据状态 -->
    <div v-else-if="result.success && (!result.data || result.data.length === 0)" class="sql-result-table__empty">
      <EmptyState type="data" title="查询结果为空" description="SQL语句执行成功，但没有返回数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { SuccessFilled, CircleCloseFilled, CopyDocument, Download, View } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import EmptyState from '../common/EmptyState.vue'
import type { SQLExecutionResult, TableColumn } from '../../types'

/**
 * SQL结果表格组件
 * 用于显示SQL查询结果，支持分页、排序、导出等功能
 */

interface Props {
  /** SQL执行结果 */
  result: SQLExecutionResult
  /** 是否显示选择列 */
  showSelection?: boolean
  /** 是否显示序号列 */
  showIndex?: boolean
  /** 是否显示分页 */
  showPagination?: boolean
  /** 每页显示数量 */
  defaultPageSize?: number
  /** 表格最大高度 */
  maxHeight?: number
}

interface Emits {
  /** 选择变化事件 */
  (_e: 'selection-change', _selection: any[]): void
  /** 导出事件 */
  (_e: 'export', _data: any[], _format: string): void
}

const props = withDefaults(defineProps<Props>(), {
  showSelection: false,
  showIndex: true,
  showPagination: true,
  defaultPageSize: 50,
  maxHeight: 400,
})

const emit = defineEmits<Emits>()

// 分页状态
const currentPage = ref(1)
const pageSize = ref(props.defaultPageSize)
const isFullscreen = ref(false)
const selectedRows = ref<any[]>([])

// 计算属性
const columns = computed<TableColumn[]>(() => {
  if (!props.result.data || props.result.data.length === 0) return []

  const firstRow = props.result.data[0]
  return Object.keys(firstRow as any).map(key => ({
    key,
    title: key,
    label: key,
    sortable: true,
    minWidth: Math.max(key.length * 12, 120),
  }))
})

const totalRows = computed(() => props.result.data?.length || 0)

const paginatedData = computed(() => {
  if (!props.result.data || !props.showPagination) {
    return props.result.data || []
  }

  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return props.result.data.slice(start, end)
})

const tableMaxHeight = computed(() => {
  return isFullscreen.value ? 'calc(100vh - 200px)' : `${props.maxHeight}px`
})

/**
 * 获取行索引
 * @param index 当前页内索引
 * @returns 全局索引
 */
const getRowIndex = (index: number): number => {
  return (currentPage.value - 1) * pageSize.value + index + 1
}

/**
 * 格式化单元格值
 * @param value 原始值
 * @returns 格式化后的值
 */
const formatCellValue = (value: any): string => {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE'
  if (typeof value === 'number') {
    // 格式化数字，保留适当的小数位
    return Number.isInteger(value) ? value.toString() : value.toFixed(2)
  }
  if (value instanceof Date) {
    return value.toLocaleString('zh-CN')
  }
  return String(value)
}

/**
 * 获取单元格样式类
 * @param value 单元格值
 * @returns CSS类名
 */
const getCellClass = (value: any): string => {
  if (value === null || value === undefined) return 'sql-result-table__null'
  if (typeof value === 'number') return 'sql-result-table__number'
  if (typeof value === 'boolean') return 'sql-result-table__boolean'
  if (value instanceof Date) return 'sql-result-table__date'
  return 'sql-result-table__text'
}

/**
 * 处理选择变化
 * @param selection 选中的行
 */
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
  emit('selection-change', selection)
}

/**
 * 复制数据到剪贴板
 */
const handleCopyData = async () => {
  if (!props.result.data || props.result.data.length === 0) {
    ElMessage.warning('没有数据可复制')
    return
  }

  try {
    const dataToUse = selectedRows.value.length > 0 ? selectedRows.value : props.result.data
    const headers = columns.value.map(col => col.label).join('\t')
    const rows = dataToUse.map(row => columns.value.map(col => formatCellValue(row[col.key])).join('\t')).join('\n')

    const text = `${headers}\n${rows}`
    await navigator.clipboard.writeText(text)

    ElMessage.success(`已复制 ${dataToUse.length} 行数据到剪贴板`)
  } catch {
    ElMessage.error('复制失败，请手动选择复制')
  }
}

/**
 * 导出CSV文件
 */
const handleExportCSV = () => {
  if (!props.result.data || props.result.data.length === 0) {
    ElMessage.warning('没有数据可导出')
    return
  }

  try {
    const dataToUse = selectedRows.value.length > 0 ? selectedRows.value : props.result.data
    const headers = columns.value.map(col => col.label)
    const csvContent = [
      headers.join(','),
      ...dataToUse.map(row =>
        columns.value
          .map(col => {
            const value = formatCellValue(row[col.key])
            // 处理包含逗号的值
            return value.includes(',') ? `"${value}"` : value
          })
          .join(',')
      ),
    ].join('\n')

    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `sql_result_${Date.now()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    ElMessage.success(`已导出 ${dataToUse.length} 行数据`)
    emit('export', dataToUse, 'csv')
  } catch {
    ElMessage.error('导出失败')
  }
}

/**
 * 切换全屏模式
 */
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

// 监听分页变化，重置选择
watch([currentPage, pageSize], () => {
  selectedRows.value = []
})
</script>

<style scoped>
.sql-result-table {
  background: var(--el-bg-color);
}

.sql-result-table__info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--el-bg-color-page);
  border-bottom: 1px solid var(--el-border-color);
}

.sql-result-table__stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sql-result-table__stat-item {
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.sql-result-table__actions {
  display: flex;
  align-items: center;
}

.sql-result-table__error {
  padding: 16px;
}

.sql-result-table__error-details {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-regular);
  background: var(--el-bg-color-page);
  padding: 8px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-all;
}

.sql-result-table__content {
  position: relative;
}

.sql-result-table__content--fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: var(--el-bg-color);
  padding: 20px;
}

.sql-result-table__cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sql-result-table__null {
  color: var(--el-text-color-placeholder);
  font-style: italic;
}

.sql-result-table__number {
  color: var(--el-color-primary);
  font-family: 'Consolas', 'Monaco', monospace;
}

.sql-result-table__boolean {
  color: var(--el-color-success);
  font-weight: 500;
}

.sql-result-table__date {
  color: var(--el-color-warning);
  font-family: 'Consolas', 'Monaco', monospace;
}

.sql-result-table__text {
  color: var(--el-text-color-primary);
}

.sql-result-table__pagination {
  padding: 16px;
  display: flex;
  justify-content: center;
  background: var(--el-bg-color-page);
  border-top: 1px solid var(--el-border-color);
}

.sql-result-table__empty {
  padding: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sql-result-table__info {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .sql-result-table__stats {
    justify-content: center;
    flex-wrap: wrap;
  }

  .sql-result-table__actions {
    justify-content: center;
  }

  .sql-result-table__cell {
    max-width: 150px;
  }
}

/* 表格样式优化 */
:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-table th) {
  background: var(--el-bg-color-page);
  font-weight: 500;
}

:deep(.el-table td) {
  padding: 8px 0;
}

:deep(.el-table--border::after) {
  background-color: var(--el-border-color);
}

:deep(.el-table--border td) {
  border-right: 1px solid var(--el-border-color-lighter);
}
</style>
