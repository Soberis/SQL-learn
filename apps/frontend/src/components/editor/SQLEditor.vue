<template>
  <div class="sql-editor" :class="{ 'sql-editor--fullscreen': isFullscreen }">
    <div class="sql-editor__toolbar">
      <div class="sql-editor__toolbar-left">
        <el-button-group>
          <el-button
            size="small"
            :icon="VideoPlay"
            type="primary"
            :loading="isExecuting"
            :disabled="!modelValue.trim()"
            @click="handleExecute"
          >
            执行 (Ctrl+Enter)
          </el-button>
          <el-button size="small" :icon="DocumentChecked" :loading="isValidating" @click="handleValidate">
            验证语法
          </el-button>
          <el-button size="small" :icon="MagicStick" @click="handleFormat">格式化</el-button>
        </el-button-group>

        <el-divider direction="vertical" />

        <el-button-group>
          <el-button size="small" :icon="Download" @click="handleSave">保存</el-button>
          <el-button size="small" :icon="RefreshRight" @click="handleClear">清空</el-button>
        </el-button-group>
      </div>

      <div class="sql-editor__toolbar-right">
        <el-tooltip content="全屏模式">
          <el-button size="small" :icon="isFullscreen ? OfficeBuilding : FullScreen" @click="toggleFullscreen" />
        </el-tooltip>

        <el-dropdown @command="handleThemeChange">
          <el-button size="small" :icon="Brush">主题</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="vs">浅色主题</el-dropdown-item>
              <el-dropdown-item command="vs-dark">深色主题</el-dropdown-item>
              <el-dropdown-item command="hc-black">高对比度</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div class="sql-editor__content">
      <div ref="editorContainer" class="sql-editor__monaco" :style="{ height: editorHeight }" />

      <!-- 语法错误提示 -->
      <div v-if="validationErrors.length > 0" class="sql-editor__errors">
        <el-alert
          v-for="(error, index) in validationErrors"
          :key="index"
          :title="error"
          type="error"
          :closable="false"
          show-icon
        />
      </div>
    </div>

    <!-- 执行结果面板 -->
    <div v-if="showResults" class="sql-editor__results">
      <div class="sql-editor__results-header">
        <span class="sql-editor__results-title">执行结果</span>
        <div class="sql-editor__results-actions">
          <el-button size="small" :icon="Download" @click="handleExportResults">导出</el-button>
          <el-button size="small" :icon="Close" @click="showResults = false" />
        </div>
      </div>

      <div class="sql-editor__results-content">
        <SQLResultTable v-if="executionResult" :result="executionResult" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as monaco from 'monaco-editor'
import {
  VideoPlay,
  DocumentChecked,
  MagicStick,
  Download,
  RefreshRight,
  FullScreen,
  OfficeBuilding,
  Brush,
  Close,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import SQLResultTable from './SQLResultTable.vue'
import { validateSQL, formatSQL } from '../../utils'
import type { SQLExecutionResult } from '../../types'

/**
 * SQL编辑器组件
 * 基于Monaco Editor实现的SQL代码编辑器，支持语法高亮、自动补全、格式化等功能
 */

interface Props {
  /** 编辑器内容 */
  modelValue: string
  /** 编辑器高度 */
  height?: string
  /** 是否只读 */
  readonly?: boolean
  /** 编辑器主题 */
  theme?: 'vs' | 'vs-dark' | 'hc-black'
  /** 是否显示行号 */
  lineNumbers?: boolean
  /** 是否启用自动补全 */
  autoComplete?: boolean
}

interface Emits {
  /** 内容变化事件 */
  (_e: 'update:modelValue', _value: string): void
  /** 执行SQL事件 */
  (_e: 'execute', _sql: string): void
  /** 保存事件 */
  (_e: 'save', _sql: string): void
}

const props = withDefaults(defineProps<Props>(), {
  height: '300px',
  readonly: false,
  theme: 'vs',
  lineNumbers: true,
  autoComplete: true,
})

const emit = defineEmits<Emits>()

// 编辑器相关状态
const editorContainer = ref<HTMLElement>()
let editor: monaco.editor.IStandaloneCodeEditor | null = null
const isFullscreen = ref(false)
const editorHeight = ref<string>(props.height)

// 功能状态
const isExecuting = ref(false)
const isValidating = ref(false)
const validationErrors = ref<string[]>([])
const showResults = ref(false)
const executionResult = ref<SQLExecutionResult | null>(null)

/**
 * 初始化Monaco编辑器
 */
const initEditor = async () => {
  if (!editorContainer.value) return

  // 配置SQL语言支持
  monaco.languages.register({ id: 'sql' })

  // 设置SQL语法高亮
  monaco.languages.setMonarchTokensProvider('sql', {
    tokenizer: {
      root: [
        [
          /\b(SELECT|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|OUTER|ON|GROUP|BY|ORDER|HAVING|UNION|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|INDEX|VIEW|DATABASE)\b/i,
          'keyword',
        ],
        [/\b(INT|INTEGER|VARCHAR|CHAR|TEXT|DATE|DATETIME|TIMESTAMP|DECIMAL|FLOAT|DOUBLE|BOOLEAN|BOOL)\b/i, 'type'],
        [/\b(COUNT|SUM|AVG|MAX|MIN|DISTINCT|AS|AND|OR|NOT|NULL|IS|IN|LIKE|BETWEEN|EXISTS)\b/i, 'keyword'],
        [/'([^'\\]|\\.)*'/, 'string'],
        [/"([^"\\]|\\.)*"/, 'string'],
        [/\d+/, 'number'],
        [/--.*$/, 'comment'],
        [/\/\*[\s\S]*?\*\//, 'comment'],
      ],
    },
  })

  // 创建编辑器实例
  editor = monaco.editor.create(editorContainer.value, {
    value: props.modelValue,
    language: 'sql',
    theme: props.theme,
    readOnly: props.readonly,
    lineNumbers: props.lineNumbers ? 'on' : 'off',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    fontSize: 14,
    tabSize: 2,
    insertSpaces: true,
    wordWrap: 'on',
    contextmenu: true,
    selectOnLineNumbers: true,
    roundedSelection: false,
    cursorStyle: 'line',
    glyphMargin: false,
    folding: true,
    foldingHighlight: true,
    showFoldingControls: 'always',
  })

  // 监听内容变化
  editor.onDidChangeModelContent(() => {
    const value = editor?.getValue() || ''
    emit('update:modelValue', value)

    // 清除之前的验证错误
    if (validationErrors.value.length > 0) {
      validationErrors.value = []
    }
  })

  // 添加快捷键
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
    handleExecute()
  })

  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
    handleSave()
  })

  // 配置自动补全
  if (props.autoComplete) {
    monaco.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: (_model, position) => {
        const suggestions = [
          {
            label: 'SELECT',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'SELECT ',
            documentation: 'SELECT语句用于从数据库中选取数据',
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            },
          },
          {
            label: 'FROM',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'FROM ',
            documentation: 'FROM子句指定要查询的表',
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            },
          },
          {
            label: 'WHERE',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'WHERE ',
            documentation: 'WHERE子句用于过滤记录',
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            },
          },
          {
            label: 'JOIN',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'JOIN ',
            documentation: 'JOIN用于连接两个或多个表',
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            },
          },
        ]
        return { suggestions }
      },
    })
  }
}

/**
 * 执行SQL语句
 */
const handleExecute = async () => {
  const sql = editor?.getValue()?.trim()
  if (!sql) {
    ElMessage.warning('请输入SQL语句')
    return
  }

  isExecuting.value = true
  try {
    emit('execute', sql)
    // 这里应该接收执行结果并显示
    showResults.value = true
  } catch {
    ElMessage.error('SQL执行失败')
  } finally {
    isExecuting.value = false
  }
}

/**
 * 验证SQL语法
 */
const handleValidate = async () => {
  const sql = editor?.getValue()?.trim()
  if (!sql) {
    ElMessage.warning('请输入SQL语句')
    return
  }

  isValidating.value = true
  try {
    const result = validateSQL(sql)
    if (result.valid) {
      ElMessage.success('SQL语法正确')
      validationErrors.value = []
    } else {
      validationErrors.value = result.errors
      ElMessage.error('SQL语法有误，请检查')
    }
  } catch {
    ElMessage.error('语法验证失败')
  } finally {
    isValidating.value = false
  }
}

/**
 * 格式化SQL代码
 */
const handleFormat = () => {
  const sql = editor?.getValue()?.trim()
  if (!sql) {
    ElMessage.warning('请输入SQL语句')
    return
  }

  try {
    const formatted = formatSQL(sql)
    editor?.setValue(formatted)
    ElMessage.success('代码格式化完成')
  } catch {
    ElMessage.error('代码格式化失败')
  }
}

/**
 * 保存SQL代码
 */
const handleSave = () => {
  const sql = editor?.getValue() || ''
  emit('save', sql)
  ElMessage.success('保存成功')
}

/**
 * 清空编辑器内容
 */
const handleClear = async () => {
  try {
    await ElMessageBox.confirm('确定要清空编辑器内容吗？', '确认操作', {
      type: 'warning',
    })
    editor?.setValue('')
    validationErrors.value = []
    showResults.value = false
  } catch {
    // 用户取消操作
  }
}

/**
 * 切换全屏模式
 */
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  editorHeight.value = isFullscreen.value ? '100vh' : props.height

  nextTick(() => {
    editor?.layout()
  })
}

/**
 * 切换编辑器主题
 */
const handleThemeChange = (theme: string) => {
  monaco.editor.setTheme(theme)
}

/**
 * 导出执行结果
 */
const handleExportResults = () => {
  if (!executionResult.value) return

  // 实现结果导出逻辑
  ElMessage.success('导出功能开发中')
}

// 监听props变化
watch(
  () => props.modelValue,
  newValue => {
    if (editor && editor.getValue() !== newValue) {
      editor.setValue(newValue)
    }
  }
)

watch(
  () => props.theme,
  newTheme => {
    monaco.editor.setTheme(newTheme)
  }
)

// 生命周期
onMounted(() => {
  initEditor()
})

onUnmounted(() => {
  editor?.dispose()
})

// 暴露编辑器实例方法
defineExpose({
  getEditor: () => editor,
  getValue: () => editor?.getValue() || '',
  setValue: (value: string) => editor?.setValue(value),
  focus: () => editor?.focus(),
  format: handleFormat,
  validate: handleValidate,
})
</script>

<style scoped>
.sql-editor {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  overflow: hidden;
  background: var(--el-bg-color);
}

.sql-editor--fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  border-radius: 0;
}

.sql-editor__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--el-bg-color-page);
  border-bottom: 1px solid var(--el-border-color);
}

.sql-editor__toolbar-left,
.sql-editor__toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sql-editor__content {
  flex: 1;
  position: relative;
}

.sql-editor__monaco {
  width: 100%;
}

.sql-editor__errors {
  padding: 12px;
  background: var(--el-bg-color-page);
  border-top: 1px solid var(--el-border-color);
}

.sql-editor__errors .el-alert {
  margin-bottom: 8px;
}

.sql-editor__errors .el-alert:last-child {
  margin-bottom: 0;
}

.sql-editor__results {
  border-top: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
  max-height: 400px;
  display: flex;
  flex-direction: column;
}

.sql-editor__results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--el-bg-color-page);
  border-bottom: 1px solid var(--el-border-color);
}

.sql-editor__results-title {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.sql-editor__results-actions {
  display: flex;
  gap: 8px;
}

.sql-editor__results-content {
  flex: 1;
  overflow: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sql-editor__toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .sql-editor__toolbar-left,
  .sql-editor__toolbar-right {
    justify-content: center;
  }
}
</style>
