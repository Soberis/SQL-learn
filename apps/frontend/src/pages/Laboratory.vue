<template>
  <div class="laboratory">
    <!-- 页面头部 -->
    <div class="laboratory__header">
      <div class="laboratory__header-content">
        <div class="laboratory__breadcrumb">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>SQL实验室</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="laboratory__header-actions">
          <el-button-group>
            <el-button :icon="FolderOpened" @click="showTemplateDialog = true">模板库</el-button>
            <el-button :icon="Upload" @click="importSQL">导入SQL</el-button>
            <el-button :icon="Download" @click="exportSQL">导出SQL</el-button>
            <el-button :icon="Share" @click="shareSQL">分享</el-button>
          </el-button-group>
        </div>
      </div>
    </div>

    <div class="laboratory__content">
      <el-row :gutter="16">
        <!-- 左侧工具面板 -->
        <el-col :xs="24" :md="6" :lg="5">
          <div class="laboratory__sidebar">
            <!-- 数据库连接 -->
            <el-card class="laboratory__tool-card" shadow="hover">
              <template #header>
                <h3 class="laboratory__card-title">
                  <el-icon><Connection /></el-icon>
                  数据库连接
                </h3>
              </template>

              <div class="laboratory__connection">
                <el-select
                  v-model="selectedDatabase"
                  placeholder="选择数据库"
                  size="small"
                  style="width: 100%"
                  @change="handleDatabaseChange"
                >
                  <el-option v-for="db in databases" :key="db.id" :label="db.name" :value="db.id">
                    <div class="laboratory__db-option">
                      <span class="laboratory__db-name">{{ db.name }}</span>
                      <el-tag :type="db.status === 'connected' ? 'success' : 'info'" size="small">
                        {{ db.status === 'connected' ? '已连接' : '未连接' }}
                      </el-tag>
                    </div>
                  </el-option>
                </el-select>

                <div v-if="currentDatabase" class="laboratory__db-info">
                  <div class="laboratory__db-detail">
                    <span class="laboratory__db-label">类型：</span>
                    <span class="laboratory__db-value">{{ currentDatabase.type }}</span>
                  </div>
                  <div class="laboratory__db-detail">
                    <span class="laboratory__db-label">版本：</span>
                    <span class="laboratory__db-value">{{ currentDatabase.version }}</span>
                  </div>
                  <div class="laboratory__db-detail">
                    <span class="laboratory__db-label">表数量：</span>
                    <span class="laboratory__db-value">{{ currentDatabase.tableCount }}</span>
                  </div>
                </div>
              </div>
            </el-card>

            <!-- 数据库结构 -->
            <el-card class="laboratory__tool-card" shadow="hover">
              <template #header>
                <div class="laboratory__card-header">
                  <h3 class="laboratory__card-title">
                    <el-icon><DataBoard /></el-icon>
                    数据库结构
                  </h3>
                  <el-button size="small" text @click="refreshSchema">
                    <el-icon><Refresh /></el-icon>
                  </el-button>
                </div>
              </template>

              <div class="laboratory__schema">
                <div v-if="loading.schema" class="laboratory__schema-loading">
                  <el-skeleton :rows="3" animated />
                </div>

                <div v-else class="laboratory__schema-content">
                  <div
                    v-for="table in databaseSchema[0]?.tables || []"
                    :key="table.name"
                    class="laboratory__table-item"
                  >
                    <div class="laboratory__table-header" @click="toggleTable(table.name)">
                      <el-icon class="laboratory__table-icon">
                        <component :is="expandedTables.includes(table.name) ? 'ArrowDown' : 'ArrowRight'" />
                      </el-icon>
                      <el-icon class="laboratory__table-type-icon">
                        <Grid />
                      </el-icon>
                      <span class="laboratory__table-name">{{ table.name }}</span>
                      <span class="laboratory__table-count">({{ table.rowCount }})</span>
                    </div>

                    <div v-if="expandedTables.includes(table.name)" class="laboratory__table-columns">
                      <div
                        v-for="column in table.columns"
                        :key="column.name"
                        class="laboratory__column-item"
                        @click="insertColumnName(table.name, column.name)"
                      >
                        <el-icon class="laboratory__column-icon">
                          <Key v-if="column.primaryKey" />
                          <Link v-else-if="column.foreignKey" />
                          <Document v-else />
                        </el-icon>
                        <span class="laboratory__column-name">{{ column.name }}</span>
                        <span class="laboratory__column-type">{{ column.type }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>

            <!-- 查询历史 -->
            <el-card class="laboratory__tool-card" shadow="hover">
              <template #header>
                <div class="laboratory__card-header">
                  <h3 class="laboratory__card-title">
                    <el-icon><Clock /></el-icon>
                    查询历史
                  </h3>
                  <el-button size="small" text @click="clearHistory">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </template>

              <div class="laboratory__history">
                <div v-if="queryHistory.length === 0" class="laboratory__history-empty">
                  <el-empty description="暂无查询历史" :image-size="60" />
                </div>

                <div v-else class="laboratory__history-list">
                  <div
                    v-for="(query, index) in queryHistory.slice(0, 10)"
                    :key="index"
                    class="laboratory__history-item"
                    @click="loadHistoryQuery(query)"
                  >
                    <div class="laboratory__history-sql">{{ truncateSQL(query.sql) }}</div>
                    <div class="laboratory__history-meta">
                      <span class="laboratory__history-time">{{ formatTime(query.timestamp) }}</span>
                      <el-tag :type="query.success ? 'success' : 'danger'" size="small" effect="plain">
                        {{ query.success ? '成功' : '失败' }}
                      </el-tag>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </el-col>

        <!-- 主要工作区域 -->
        <el-col :xs="24" :md="18" :lg="19">
          <div class="laboratory__workspace">
            <!-- 编辑器区域 -->
            <el-card class="laboratory__editor-card" shadow="hover">
              <template #header>
                <div class="laboratory__editor-header">
                  <div class="laboratory__editor-title">
                    <h3 class="laboratory__card-title">
                      <el-icon><Edit /></el-icon>
                      SQL编辑器
                    </h3>
                    <div class="laboratory__editor-info">
                      <span class="laboratory__editor-lines">{{ editorLines }} 行</span>
                      <span class="laboratory__editor-chars">{{ editorChars }} 字符</span>
                    </div>
                  </div>

                  <div class="laboratory__editor-actions">
                    <el-button-group size="small">
                      <el-button @click="formatSQL">
                        <el-icon><MagicStick /></el-icon>
                        格式化
                      </el-button>
                      <el-button @click="validateSQL">
                        <el-icon><Check /></el-icon>
                        验证
                      </el-button>
                      <el-button @click="clearEditor">
                        <el-icon><Delete /></el-icon>
                        清空
                      </el-button>
                    </el-button-group>

                    <el-button type="primary" :loading="executing" @click="executeSQL">
                      <el-icon><CaretRight /></el-icon>
                      执行 (Ctrl+Enter)
                    </el-button>
                  </div>
                </div>
              </template>

              <div class="laboratory__editor-container">
                <SQLEditor
                  v-model="sqlCode"
                  :height="editorHeight"
                  @execute="executeSQL"
                  @change="handleEditorChange"
                />

                <!-- 编辑器底部状态栏 -->
                <div class="laboratory__editor-status">
                  <div class="laboratory__status-left">
                    <span class="laboratory__status-item">
                      <el-icon><Position /></el-icon>
                      行 {{ cursorPosition.line }}, 列 {{ cursorPosition.column }}
                    </span>
                    <span v-if="selectedText" class="laboratory__status-item">
                      已选择 {{ selectedText.length }} 个字符
                    </span>
                  </div>

                  <div class="laboratory__status-right">
                    <span class="laboratory__status-item">
                      <el-icon><Timer /></el-icon>
                      {{ lastExecutionTime ? `上次执行: ${lastExecutionTime}ms` : '未执行' }}
                    </span>
                  </div>
                </div>
              </div>
            </el-card>

            <!-- 结果面板 -->
            <el-card class="laboratory__result-card" shadow="hover">
              <template #header>
                <div class="laboratory__result-header">
                  <h3 class="laboratory__card-title">
                    <el-icon><DataAnalysis /></el-icon>
                    执行结果
                  </h3>

                  <div class="laboratory__result-actions">
                    <el-button-group size="small">
                      <el-button :type="resultTab === 'data' ? 'primary' : 'default'" @click="resultTab = 'data'">
                        数据
                      </el-button>
                      <el-button
                        :type="resultTab === 'messages' ? 'primary' : 'default'"
                        @click="resultTab = 'messages'"
                      >
                        消息
                      </el-button>
                      <el-button :type="resultTab === 'explain' ? 'primary' : 'default'" @click="resultTab = 'explain'">
                        执行计划
                      </el-button>
                    </el-button-group>

                    <el-button v-if="executionResult && resultTab === 'data'" size="small" @click="exportResult">
                      <el-icon><Download /></el-icon>
                      导出
                    </el-button>
                  </div>
                </div>
              </template>

              <div class="laboratory__result-content">
                <!-- 数据结果 -->
                <div v-if="resultTab === 'data'" class="laboratory__result-data">
                  <div v-if="!executionResult" class="laboratory__result-placeholder">
                    <EmptyState
                      type="empty"
                      title="暂无执行结果"
                      description="点击执行按钮或按 Ctrl+Enter 执行SQL语句"
                    />
                  </div>

                  <SQLResultTable v-else :result="executionResult" :height="'400px'" />
                </div>

                <!-- 消息面板 -->
                <div v-else-if="resultTab === 'messages'" class="laboratory__result-messages">
                  <div class="laboratory__messages-list">
                    <div
                      v-for="(message, index) in executionMessages"
                      :key="index"
                      class="laboratory__message-item"
                      :class="`laboratory__message-item--${message.type}`"
                    >
                      <div class="laboratory__message-header">
                        <el-icon class="laboratory__message-icon">
                          <SuccessFilled v-if="message.type === 'success'" />
                          <WarningFilled v-else-if="message.type === 'warning'" />
                          <CircleCloseFilled v-else-if="message.type === 'error'" />
                          <InfoFilled v-else />
                        </el-icon>
                        <span class="laboratory__message-type">{{ getMessageTypeText(message.type) }}</span>
                        <span class="laboratory__message-time">{{ formatTime(message.timestamp) }}</span>
                      </div>
                      <div class="laboratory__message-content">{{ message.content }}</div>
                    </div>
                  </div>
                </div>

                <!-- 执行计划 -->
                <div v-else-if="resultTab === 'explain'" class="laboratory__result-explain">
                  <div v-if="!executionPlan" class="laboratory__explain-placeholder">
                    <EmptyState
                      type="empty"
                      title="暂无执行计划"
                      description="执行带有 EXPLAIN 的查询语句查看执行计划"
                    />
                  </div>

                  <div v-else class="laboratory__explain-content">
                    <pre class="laboratory__explain-text">{{ executionPlan }}</pre>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- SQL模板对话框 -->
    <el-dialog v-model="showTemplateDialog" title="SQL模板库" width="800px" :before-close="handleTemplateClose">
      <div class="laboratory__templates">
        <div class="laboratory__template-categories">
          <el-button-group>
            <el-button
              v-for="category in templateCategories"
              :key="category.id"
              :type="selectedTemplateCategory === category.id ? 'primary' : 'default'"
              @click="selectedTemplateCategory = category.id"
            >
              {{ category.name }}
            </el-button>
          </el-button-group>
        </div>

        <div class="laboratory__template-list">
          <div
            v-for="template in filteredTemplates"
            :key="template.id"
            class="laboratory__template-item"
            @click="selectTemplate(template)"
          >
            <div class="laboratory__template-header">
              <h4 class="laboratory__template-title">{{ template.title }}</h4>
              <el-tag size="small">{{ template.category }}</el-tag>
            </div>
            <p class="laboratory__template-desc">{{ template.description }}</p>
            <pre class="laboratory__template-code">{{ template.code }}</pre>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="showTemplateDialog = false">取消</el-button>
        <el-button type="primary" @click="useSelectedTemplate">使用模板</el-button>
      </template>
    </el-dialog>

    <!-- 分享对话框 -->
    <el-dialog v-model="showShareDialog" title="分享SQL" width="500px">
      <div class="laboratory__share-content">
        <el-form :model="shareForm" label-width="80px">
          <el-form-item label="标题">
            <el-input v-model="shareForm.title" placeholder="为你的SQL起个标题" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="shareForm.description" type="textarea" :rows="3" placeholder="描述一下这个SQL的用途" />
          </el-form-item>
          <el-form-item label="标签">
            <el-select
              v-model="shareForm.tags"
              multiple
              filterable
              allow-create
              placeholder="添加标签"
              style="width: 100%"
            >
              <el-option v-for="tag in commonTags" :key="tag" :label="tag" :value="tag" />
            </el-select>
          </el-form-item>
          <el-form-item label="公开性">
            <el-radio-group v-model="shareForm.visibility">
              <el-radio label="public">公开</el-radio>
              <el-radio label="private">私有</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="showShareDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmShare">分享</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  FolderOpened,
  Upload,
  Download,
  Share,
  Connection,
  DataBoard,
  Refresh,
  // ArrowDown,
  // ArrowRight,
  Grid,
  Key,
  Link,
  Document,
  Clock,
  Delete,
  Edit,
  MagicStick,
  Check,
  CaretRight,
  Position,
  Timer,
  DataAnalysis,
  SuccessFilled,
  WarningFilled,
  CircleCloseFilled,
  InfoFilled,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
// import { useAuthStore } from '@/stores/auth' // 暂时注释掉未使用的导入
import { useSqlStore } from '@/stores/sql'
// import { useProgressStore } from '@/stores/progress' // 暂时注释掉未使用的导入
import EmptyState from '../components/common/EmptyState.vue'
import SQLEditor from '../components/editor/SQLEditor.vue'
import SQLResultTable from '../components/editor/SQLResultTable.vue'
import type { SQLExecutionResult, DatabaseSchema, QueryHistory } from '../types'

/**
 * SQL实验室页面
 * 提供SQL编写、执行、调试等功能
 */

// 状态管理
const sqlStore = useSqlStore()

// 响应式数据
const sqlCode = ref('')
const selectedDatabase = ref('')
const executionResult = ref<SQLExecutionResult | null>(null)
const executionMessages = ref<
  Array<{
    type: 'success' | 'warning' | 'error' | 'info'
    content: string
    timestamp: number
  }>
>([])
const executionPlan = ref('')
const queryHistory = ref<QueryHistory[]>([])
const databaseSchema = ref<DatabaseSchema[]>([])
const expandedTables = ref<string[]>([])
const selectedTemplate = ref<any>(null)

// UI状态
const resultTab = ref<'data' | 'messages' | 'explain'>('data')
const editorHeight = ref('400px')
const executing = ref(false)
const showTemplateDialog = ref(false)
const showShareDialog = ref(false)
const selectedTemplateCategory = ref('basic')

// 编辑器状态
const cursorPosition = ref({ line: 1, column: 1 })
const selectedText = ref('')
const lastExecutionTime = ref<number | null>(null)

// 加载状态
const loading = ref({
  schema: false,
})

// 数据库列表
const databases = ref([
  {
    id: 'sample_db',
    name: '示例数据库',
    type: 'MySQL',
    version: '8.0',
    status: 'connected',
    tableCount: 8,
  },
  {
    id: 'test_db',
    name: '测试数据库',
    type: 'PostgreSQL',
    version: '13.0',
    status: 'disconnected',
    tableCount: 5,
  },
])

// 模板分类
const templateCategories = ref([
  { id: 'basic', name: '基础查询' },
  { id: 'join', name: '连接查询' },
  { id: 'aggregate', name: '聚合函数' },
  { id: 'window', name: '窗口函数' },
  { id: 'advanced', name: '高级查询' },
])

// SQL模板
const sqlTemplates = ref([
  {
    id: 1,
    title: '基础SELECT查询',
    category: 'basic',
    description: '最基本的SELECT查询语句',
    code: 'SELECT * FROM table_name WHERE condition;',
  },
  {
    id: 2,
    title: 'INNER JOIN查询',
    category: 'join',
    description: '内连接查询两个表的数据',
    code: 'SELECT a.*, b.*\nFROM table_a a\nINNER JOIN table_b b ON a.id = b.a_id;',
  },
  {
    id: 3,
    title: 'GROUP BY聚合',
    category: 'aggregate',
    description: '按字段分组并进行聚合计算',
    code: 'SELECT column1, COUNT(*), AVG(column2)\nFROM table_name\nGROUP BY column1\nHAVING COUNT(*) > 1;',
  },
])

// 分享表单
const shareForm = ref({
  title: '',
  description: '',
  tags: [] as string[],
  visibility: 'public',
})

// 常用标签
const commonTags = ref(['SELECT', 'JOIN', '聚合', '子查询', '窗口函数', '性能优化', '数据分析'])

// 计算属性
const currentDatabase = computed(() => {
  return databases.value.find(db => db.id === selectedDatabase.value)
})

const editorLines = computed(() => {
  return sqlCode.value.split('\n').length
})

const editorChars = computed(() => {
  return sqlCode.value.length
})

const filteredTemplates = computed(() => {
  return sqlTemplates.value.filter(template => template.category === selectedTemplateCategory.value)
})

/**
 * 处理数据库切换
 */
const handleDatabaseChange = async (dbId: string) => {
  if (dbId) {
    await loadDatabaseSchema()
    addMessage('info', `已切换到数据库: ${currentDatabase.value?.name}`)
  }
}

/**
 * 加载数据库结构
 */
const loadDatabaseSchema = async () => {
  loading.value.schema = true

  try {
    // 调用真实的API获取数据库结构
    // 简化版本暂时使用模拟数据
    const schema = {
      tables: [
        { name: 'users', columns: ['id', 'name', 'email'] },
        { name: 'orders', columns: ['id', 'user_id', 'amount'] }
      ]
    }
    databaseSchema.value = schema as any
    addMessage('success', '数据库结构加载完成')
  } catch (error) {
    console.error('加载数据库结构失败:', error)
    ElMessage.error('加载数据库结构失败')
    addMessage('error', '加载数据库结构失败')
  } finally {
    loading.value.schema = false
  }
}

/**
 * 刷新数据库结构
 */
const refreshSchema = () => {
  if (selectedDatabase.value) {
    loadDatabaseSchema()
  }
}

/**
 * 切换表展开状态
 */
const toggleTable = (tableName: string) => {
  const index = expandedTables.value.indexOf(tableName)
  if (index > -1) {
    expandedTables.value.splice(index, 1)
  } else {
    expandedTables.value.push(tableName)
  }
}

/**
 * 插入列名到编辑器
 */
const insertColumnName = (tableName: string, columnName: string) => {
  const insertText = `${tableName}.${columnName}`
  // 这里应该调用编辑器的API插入文本
  sqlCode.value += insertText
  ElMessage.success(`已插入: ${insertText}`)
}

/**
 * 处理编辑器内容变化
 */
const handleEditorChange = (value: string) => {
  sqlCode.value = value
}

/**
 * 格式化SQL
 */
const formatSQL = () => {
  if (sqlCode.value.trim()) {
    // 简单的SQL格式化
    const formatted = sqlCode.value
      .replace(/\s+/g, ' ')
      .replace(/,/g, ',\n  ')
      .replace(/SELECT/gi, 'SELECT')
      .replace(/FROM/gi, '\nFROM')
      .replace(/WHERE/gi, '\nWHERE')
      .replace(/GROUP BY/gi, '\nGROUP BY')
      .replace(/ORDER BY/gi, '\nORDER BY')
      .replace(/HAVING/gi, '\nHAVING')
      .replace(/JOIN/gi, '\nJOIN')
      .replace(/INNER JOIN/gi, '\nINNER JOIN')
      .replace(/LEFT JOIN/gi, '\nLEFT JOIN')
      .replace(/RIGHT JOIN/gi, '\nRIGHT JOIN')
      .trim()

    sqlCode.value = formatted
    addMessage('success', 'SQL已格式化')
  }
}

/**
 * 验证SQL语法
 */
const validateSQL = () => {
  if (!sqlCode.value.trim()) {
    addMessage('warning', '请输入SQL语句')
    return
  }

  // 简单的SQL语法验证
  const sql = sqlCode.value.trim().toUpperCase()
  const errors = []

  if (!sql.includes('SELECT') && !sql.includes('INSERT') && !sql.includes('UPDATE') && !sql.includes('DELETE')) {
    errors.push('未找到有效的SQL关键字')
  }

  if (sql.includes('SELECT') && !sql.includes('FROM')) {
    errors.push('SELECT语句缺少FROM子句')
  }

  if (errors.length > 0) {
    errors.forEach(error => addMessage('error', error))
  } else {
    addMessage('success', 'SQL语法验证通过')
  }
}

/**
 * 清空编辑器
 */
const clearEditor = async () => {
  try {
    await ElMessageBox.confirm('确定要清空编辑器内容吗？', '确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    sqlCode.value = ''
    executionResult.value = null
    addMessage('info', '编辑器已清空')
  } catch {
    // 用户取消
  }
}

/**
 * 执行SQL
 */
const executeSQL = async () => {
  if (!sqlCode.value.trim()) {
    addMessage('warning', '请输入SQL语句')
    return
  }

  if (!selectedDatabase.value) {
    addMessage('error', '请先选择数据库')
    return
  }

  executing.value = true
  const startTime = Date.now()

  try {
    // 调用真实的SQL执行API
    await sqlStore.executeSQL(sqlCode.value)

    const executionTime = Date.now() - startTime
    lastExecutionTime.value = executionTime

    if (sqlStore.executeResult) {
      executionResult.value = {
        success: true,
        data: sqlStore.executeResult.data?.data || [],
        columns: sqlStore.executeResult.data?.columns || [],
        rowCount: sqlStore.executeResult.data?.row_count || 0,
        executionTime: sqlStore.executeResult.data?.execution_time || executionTime / 1000,
      }

      addMessage('success', `查询执行成功，返回 ${executionResult.value?.rowCount || 0} 行数据，耗时 ${executionTime}ms`)

      // 添加到查询历史
      addToHistory(sqlCode.value, true, executionTime)

      // 保存查询到历史记录（简化版本暂时注释）
      // await sqlStore.saveQuery(sqlCode.value, `查询_${Date.now()}`, `执行于 ${new Date().toLocaleString()}`)
    } else if (sqlStore.executeError) {
      throw new Error(sqlStore.executeError)
    } else {
      throw new Error('查询执行失败')
    }
  } catch (error: any) {
    executionResult.value = {
      success: false,
      error: { code: 'EXECUTION_ERROR', message: error.message },
      data: [],
      columns: [],
      rowCount: 0,
      executionTime: (Date.now() - startTime) / 1000,
    }

    addMessage('error', `查询执行失败: ${error.message}`)
    addToHistory(sqlCode.value, false, Date.now() - startTime)
  } finally {
    executing.value = false
  }
}

/**
 * 添加消息
 */
const addMessage = (type: 'success' | 'warning' | 'error' | 'info', content: string) => {
  executionMessages.value.unshift({
    type,
    content,
    timestamp: Date.now(),
  })

  // 保持最多50条消息
  if (executionMessages.value.length > 50) {
    executionMessages.value = executionMessages.value.slice(0, 50)
  }
}

/**
 * 获取消息类型文本
 */
const getMessageTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    success: '成功',
    warning: '警告',
    error: '错误',
    info: '信息',
  }
  return typeMap[type] || '未知'
}

/**
 * 添加到查询历史
 */
const addToHistory = (sql: string, success: boolean, executionTime: number) => {
  queryHistory.value.unshift({
    sql,
    success,
    executionTime,
    timestamp: Date.now(),
  })

  // 保持最多100条历史记录
  if (queryHistory.value.length > 100) {
    queryHistory.value = queryHistory.value.slice(0, 100)
  }
}

/**
 * 加载历史查询
 */
const loadHistoryQuery = (query: QueryHistory) => {
  sqlCode.value = query.sql
  addMessage('info', '已加载历史查询')
}

/**
 * 截断SQL显示
 */
const truncateSQL = (sql: string): string => {
  return sql.length > 50 ? sql.substring(0, 50) + '...' : sql
}

/**
 * 清空查询历史
 */
const clearHistory = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有查询历史吗？', '确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    queryHistory.value = []
    addMessage('info', '查询历史已清空')
  } catch {
    // 用户取消
  }
}

/**
 * 格式化时间
 */
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString()
}

/**
 * 导入SQL
 */
const importSQL = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.sql,.txt'
  input.onchange = (e: any) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e: any) => {
        sqlCode.value = e.target.result
        addMessage('success', `已导入文件: ${file.name}`)
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

/**
 * 导出SQL
 */
const exportSQL = () => {
  if (!sqlCode.value.trim()) {
    ElMessage.warning('没有可导出的SQL内容')
    return
  }

  const blob = new Blob([sqlCode.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sql_export_${Date.now()}.sql`
  a.click()
  URL.revokeObjectURL(url)

  addMessage('success', 'SQL已导出')
}

/**
 * 导出结果
 */
const exportResult = () => {
  if (!executionResult.value?.data) {
    ElMessage.warning('没有可导出的结果数据')
    return
  }

  // 转换为CSV格式
  const headers = executionResult.value.columns?.join(',') || ''
  const rows = executionResult.value.data
    .map((row: any) => executionResult.value!.columns?.map((col: string) => row[col]).join(',') || '')
    .join('\n')

  const csv = headers + '\n' + rows
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `query_result_${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)

  addMessage('success', '查询结果已导出为CSV')
}

/**
 * 分享SQL
 */
const shareSQL = () => {
  if (!sqlCode.value.trim()) {
    ElMessage.warning('没有可分享的SQL内容')
    return
  }

  shareForm.value = {
    title: '',
    description: '',
    tags: [],
    visibility: 'public',
  }

  showShareDialog.value = true
}

/**
 * 确认分享
 */
const confirmShare = async () => {
  if (!shareForm.value.title.trim()) {
    ElMessage.warning('请输入标题')
    return
  }

  try {
    // 模拟分享API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    const shareUrl = `https://sqllab.example.com/share/${Date.now()}`

    // 复制分享链接到剪贴板
    await navigator.clipboard.writeText(shareUrl)

    ElMessage.success('分享成功！链接已复制到剪贴板')
    showShareDialog.value = false
    addMessage('success', `SQL已分享: ${shareUrl}`)
  } catch {
    ElMessage.error('分享失败，请重试')
  }
}

/**
 * 选择模板
 */
const selectTemplate = (template: any) => {
  selectedTemplate.value = template
}

/**
 * 使用选中的模板
 */
const useSelectedTemplate = () => {
  if (selectedTemplate.value) {
    sqlCode.value = selectedTemplate.value.code
    showTemplateDialog.value = false
    addMessage('success', `已加载模板: ${selectedTemplate.value.title}`)
  }
}

/**
 * 关闭模板对话框
 */
const handleTemplateClose = () => {
  selectedTemplate.value = null
}

// 初始化数据
const initData = async () => {
  try {
    // 获取查询历史 - 使用本地历史记录，不依赖API
    // 注意：fetchSavedQueries返回的是SavedQuery[]，与QueryHistory[]不兼容
    // 保持queryHistory为空数组，通过addToHistory添加本地历史

    // 如果有选中的数据库，加载其结构
    if (selectedDatabase.value) {
      await loadDatabaseSchema()
    }

    addMessage('success', '实验室初始化完成')
  } catch (error) {
    console.error('初始化失败:', error)
    addMessage('error', '实验室初始化失败')
  }
}

// 生命周期
onMounted(async () => {
  // 初始化数据
  await initData()

  // 默认选择第一个数据库
  if (databases.value.length > 0) {
    selectedDatabase.value = databases.value[0].id
    await handleDatabaseChange(selectedDatabase.value)
  }

  // 添加键盘快捷键
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault()
      executeSQL()
    }
  }

  document.addEventListener('keydown', handleKeydown)

  // 清理函数
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
})
</script>

<style scoped>
.laboratory {
  min-height: 100vh;
  background: var(--el-bg-color-page);
}

.laboratory__header {
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
  padding: 16px 24px;
}

.laboratory__header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.laboratory__breadcrumb {
  flex: 1;
}

.laboratory__header-actions {
  display: flex;
  gap: 12px;
}

.laboratory__content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.laboratory__sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.laboratory__tool-card {
  border-radius: 8px;
}

.laboratory__card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: var(--el-text-color-primary);
}

.laboratory__card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 数据库连接 */
.laboratory__connection {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.laboratory__db-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.laboratory__db-name {
  font-weight: 500;
}

.laboratory__db-info {
  padding: 12px;
  background: var(--el-bg-color-page);
  border-radius: 6px;
  border: 1px solid var(--el-border-color-lighter);
}

.laboratory__db-detail {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 13px;
}

.laboratory__db-detail:last-child {
  margin-bottom: 0;
}

.laboratory__db-label {
  color: var(--el-text-color-regular);
}

.laboratory__db-value {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

/* 数据库结构 */
.laboratory__schema {
  max-height: 400px;
  overflow-y: auto;
}

.laboratory__schema-loading {
  padding: 16px;
}

.laboratory__schema-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.laboratory__table-item {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  overflow: hidden;
}

.laboratory__table-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--el-bg-color-page);
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.laboratory__table-header:hover {
  background: var(--el-color-primary-light-9);
}

.laboratory__table-icon {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.laboratory__table-type-icon {
  font-size: 14px;
  color: var(--el-color-primary);
}

.laboratory__table-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
  flex: 1;
}

.laboratory__table-count {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.laboratory__table-columns {
  padding: 8px;
  background: var(--el-bg-color);
}

.laboratory__column-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.laboratory__column-item:hover {
  background: var(--el-color-primary-light-9);
}

.laboratory__column-icon {
  font-size: 12px;
}

.laboratory__column-icon .el-icon {
  color: var(--el-color-warning);
}

.laboratory__column-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
  min-width: 80px;
}

.laboratory__column-type {
  font-size: 12px;
  color: var(--el-text-color-regular);
  font-family: 'Consolas', 'Monaco', monospace;
}

/* 查询历史 */
.laboratory__history {
  max-height: 300px;
  overflow-y: auto;
}

.laboratory__history-empty {
  padding: 20px;
  text-align: center;
}

.laboratory__history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.laboratory__history-item {
  padding: 8px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.laboratory__history-item:hover {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.laboratory__history-sql {
  font-size: 12px;
  font-family: 'Consolas', 'Monaco', monospace;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
  line-height: 1.4;
}

.laboratory__history-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.laboratory__history-time {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

/* 工作区域 */
.laboratory__workspace {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.laboratory__editor-card {
  border-radius: 8px;
}

.laboratory__editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.laboratory__editor-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.laboratory__editor-info {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.laboratory__editor-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.laboratory__editor-container {
  position: relative;
}

.laboratory__editor-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--el-bg-color-page);
  border-top: 1px solid var(--el-border-color-lighter);
  font-size: 12px;
}

.laboratory__status-left,
.laboratory__status-right {
  display: flex;
  gap: 16px;
}

.laboratory__status-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--el-text-color-regular);
}

/* 结果面板 */
.laboratory__result-card {
  border-radius: 8px;
}

.laboratory__result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.laboratory__result-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.laboratory__result-content {
  min-height: 300px;
}

.laboratory__result-placeholder {
  padding: 60px;
  text-align: center;
}

.laboratory__result-data {
  min-height: 400px;
}

/* 消息面板 */
.laboratory__result-messages {
  max-height: 400px;
  overflow-y: auto;
}

.laboratory__messages-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.laboratory__message-item {
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid;
}

.laboratory__message-item--success {
  background: var(--el-color-success-light-9);
  border-left-color: var(--el-color-success);
}

.laboratory__message-item--warning {
  background: var(--el-color-warning-light-9);
  border-left-color: var(--el-color-warning);
}

.laboratory__message-item--error {
  background: var(--el-color-error-light-9);
  border-left-color: var(--el-color-error);
}

.laboratory__message-item--info {
  background: var(--el-color-info-light-9);
  border-left-color: var(--el-color-info);
}

.laboratory__message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.laboratory__message-icon {
  font-size: 16px;
}

.laboratory__message-type {
  font-weight: 600;
  font-size: 13px;
}

.laboratory__message-time {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  margin-left: auto;
}

.laboratory__message-content {
  font-size: 13px;
  line-height: 1.5;
  color: var(--el-text-color-primary);
}

/* 执行计划 */
.laboratory__result-explain {
  min-height: 400px;
}

.laboratory__explain-placeholder {
  padding: 60px;
  text-align: center;
}

.laboratory__explain-content {
  padding: 16px;
}

.laboratory__explain-text {
  background: var(--el-bg-color-page);
  padding: 16px;
  border-radius: 6px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.5;
  overflow-x: auto;
  margin: 0;
  white-space: pre-wrap;
}

/* 模板对话框 */
.laboratory__templates {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.laboratory__template-categories {
  display: flex;
  justify-content: center;
}

.laboratory__template-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.laboratory__template-item {
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.laboratory__template-item:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.laboratory__template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.laboratory__template-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--el-text-color-primary);
}

.laboratory__template-desc {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.laboratory__template-code {
  background: var(--el-bg-color-page);
  padding: 12px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.4;
  margin: 0;
  overflow-x: auto;
}

/* 分享对话框 */
.laboratory__share-content {
  padding: 16px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .laboratory__header-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .laboratory__content {
    padding: 16px;
  }

  .laboratory__editor-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .laboratory__editor-actions {
    justify-content: center;
  }

  .laboratory__result-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .laboratory__result-actions {
    justify-content: center;
  }

  .laboratory__editor-status {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }

  .laboratory__status-left,
  .laboratory__status-right {
    justify-content: center;
  }
}

/* 动画效果 */
.laboratory__table-columns {
  animation: laboratory-expand 0.3s ease-out;
}

@keyframes laboratory-expand {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 200px;
  }
}

.laboratory__message-item {
  animation: laboratory-message-fade-in 0.4s ease-out;
}

@keyframes laboratory-message-fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
