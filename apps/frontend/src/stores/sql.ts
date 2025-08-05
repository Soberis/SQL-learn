import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient } from '@/utils/apiClient'

/**
 * SQL Store - 简化版本
 * 只保留核心的SQL执行功能，移除所有复杂的抽象和未实现的功能
 */
export const useSqlStore = defineStore('sql', () => {
  // 核心状态
  const currentSQL = ref('')
  const executeResult = ref<any>(null)
  const isExecuting = ref(false)
  const executeError = ref('')

  /**
   * 执行SQL语句
   * @param sql - 要执行的SQL语句
   * @returns Promise<void>
   */
  const executeSQL = async (sql: string) => {
    if (!sql.trim()) return
    
    isExecuting.value = true
    executeError.value = ''
    
    try {
      const result = await apiClient.post('/sql/execute', { sql })
      executeResult.value = result.data
    } catch (error: any) {
      executeError.value = error.message || '执行失败'
      executeResult.value = null
    } finally {
      isExecuting.value = false
    }
  }

  /**
   * 设置当前SQL语句
   * @param sql - SQL语句
   */
  const setCurrentSQL = (sql: string) => {
    currentSQL.value = sql
  }

  /**
   * 重置所有状态
   */
  const reset = () => {
    currentSQL.value = ''
    executeResult.value = null
    executeError.value = ''
  }

  return {
    // 状态
    currentSQL,
    executeResult,
    isExecuting,
    executeError,
    
    // 方法
    executeSQL,
    setCurrentSQL,
    reset
  }
})