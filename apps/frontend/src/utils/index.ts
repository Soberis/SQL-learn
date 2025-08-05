/**
 * SQL学习平台工具函数库
 */

import type { DifficultyLevel, SkillType, Timestamp } from '../types'

/**
 * 格式化时间戳为可读格式
 * @param timestamp 时间戳
 * @param format 格式类型
 * @returns 格式化后的时间字符串
 */
export const formatTimestamp = (
  timestamp: Timestamp,
  format: 'date' | 'datetime' | 'time' | 'relative' = 'datetime'
): string => {
  const date = new Date(timestamp)

  switch (format) {
    case 'date':
      return date.toLocaleDateString('zh-CN')
    case 'time':
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    case 'datetime':
      return date.toLocaleString('zh-CN')
    case 'relative':
      return getRelativeTime(date)
    default:
      return date.toLocaleString('zh-CN')
  }
}

/**
 * 获取相对时间描述
 * @param date 日期对象
 * @returns 相对时间字符串
 */
export const getRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return '刚刚'
  if (diffMin < 60) return `${diffMin}分钟前`
  if (diffHour < 24) return `${diffHour}小时前`
  if (diffDay < 7) return `${diffDay}天前`
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}周前`
  if (diffDay < 365) return `${Math.floor(diffDay / 30)}个月前`
  return `${Math.floor(diffDay / 365)}年前`
}

/**
 * 格式化学习时长
 * @param minutes 分钟数
 * @returns 格式化后的时长字符串
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}分钟`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`
  }

  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24

  return remainingHours > 0 ? `${days}天${remainingHours}小时` : `${days}天`
}

/**
 * 计算学习进度百分比
 * @param completed 已完成数量
 * @param total 总数量
 * @returns 百分比(0-100)
 */
export const calculateProgress = (completed: number, total: number): number => {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

/**
 * 获取难度等级的显示文本
 * @param difficulty 难度等级
 * @returns 显示文本
 */
export const getDifficultyText = (difficulty: DifficultyLevel): string => {
  const difficultyMap = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级',
  }
  return difficultyMap[difficulty]
}

/**
 * 获取难度等级的颜色
 * @param difficulty 难度等级
 * @returns 颜色值
 */
export const getDifficultyColor = (difficulty: DifficultyLevel): string => {
  const colorMap = {
    beginner: '#67C23A',
    intermediate: '#E6A23C',
    advanced: '#F56C6C',
  }
  return colorMap[difficulty]
}

/**
 * 获取技能类型的图标
 * @param skill 技能类型
 * @returns 图标名称
 */
export const getSkillIcon = (skill: SkillType): string => {
  const iconMap = {
    SELECT查询: 'Search',
    JOIN操作: 'Connection',
    聚合函数: 'DataAnalysis',
    子查询: 'Folder',
    数据修改: 'Edit',
    DDL操作: 'Setting',
    索引优化: 'TrendCharts',
  }
  return iconMap[skill] || 'Document'
}

/**
 * 生成唯一ID
 * @returns 唯一ID字符串
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param delay 延迟时间(毫秒)
 * @returns 防抖后的函数
 */
export const debounce = <T extends (..._args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((..._args: Parameters<T>) => void) => {
  let timeoutId: number
  return (..._args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(..._args), delay)
  }
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param delay 延迟时间(毫秒)
 * @returns 节流后的函数
 */
export const throttle = <T extends (..._args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((..._args: Parameters<T>) => void) => {
  let timeoutId: number | undefined
  return (..._args: Parameters<T>) => {
    if (!timeoutId) {
      func(..._args)
      timeoutId = setTimeout(() => {
        timeoutId = undefined
      }, delay)
    }
  }
}

/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 * @returns 拷贝后的对象
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T
  }

  if (typeof obj === 'object') {
    const cloned = {} as T
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }

  return obj
}

/**
 * 验证SQL语法基础检查
 * @param sql SQL语句
 * @returns 验证结果
 */
export const validateSQL = (sql: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  const trimmedSQL = sql.trim()

  if (!trimmedSQL) {
    errors.push('SQL语句不能为空')
    return { valid: false, errors }
  }

  // 基础语法检查
  const keywords = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER']
  const hasKeyword = keywords.some(keyword => trimmedSQL.toUpperCase().includes(keyword))

  if (!hasKeyword) {
    errors.push('SQL语句必须包含有效的关键字')
  }

  // 括号匹配检查
  const openParens = (trimmedSQL.match(/\(/g) || []).length
  const closeParens = (trimmedSQL.match(/\)/g) || []).length

  if (openParens !== closeParens) {
    errors.push('括号不匹配')
  }

  // 引号匹配检查
  const singleQuotes = (trimmedSQL.match(/'/g) || []).length
  const doubleQuotes = (trimmedSQL.match(/"/g) || []).length

  if (singleQuotes % 2 !== 0) {
    errors.push('单引号不匹配')
  }

  if (doubleQuotes % 2 !== 0) {
    errors.push('双引号不匹配')
  }

  return { valid: errors.length === 0, errors }
}

/**
 * 格式化SQL代码
 * @param sql SQL语句
 * @returns 格式化后的SQL
 */
export const formatSQL = (sql: string): string => {
  if (!sql) return ''

  // 简单的SQL格式化
  return sql
    .replace(/\s+/g, ' ') // 合并多个空格
    .replace(/,/g, ',\n  ') // 逗号后换行
    .replace(/\bFROM\b/gi, '\nFROM')
    .replace(/\bWHERE\b/gi, '\nWHERE')
    .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
    .replace(/\bHAVING\b/gi, '\nHAVING')
    .replace(/\bORDER BY\b/gi, '\nORDER BY')
    .replace(/\bJOIN\b/gi, '\nJOIN')
    .replace(/\bLEFT JOIN\b/gi, '\nLEFT JOIN')
    .replace(/\bRIGHT JOIN\b/gi, '\nRIGHT JOIN')
    .replace(/\bINNER JOIN\b/gi, '\nINNER JOIN')
    .trim()
}

/**
 * 计算字符串相似度
 * @param str1 字符串1
 * @param str2 字符串2
 * @returns 相似度(0-1)
 */
export const calculateSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1

  if (longer.length === 0) return 1.0

  const editDistance = getEditDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

/**
 * 计算编辑距离
 * @param str1 字符串1
 * @param str2 字符串2
 * @returns 编辑距离
 */
const getEditDistance = (str1: string, str2: string): number => {
  const matrix = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
      }
    }
  }

  return matrix[str2.length][str1.length]
}

/**
 * 本地存储工具
 */
export const storage = {
  /**
   * 设置本地存储
   * @param key 键名
   * @param value 值
   */
  set(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Failed to set localStorage:', error)
    }
  },

  /**
   * 获取本地存储
   * @param key 键名
   * @param defaultValue 默认值
   * @returns 存储的值
   */
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch (error) {
      console.error('Failed to get localStorage:', error)
      return defaultValue || null
    }
  },

  /**
   * 删除本地存储
   * @param key 键名
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Failed to remove localStorage:', error)
    }
  },

  /**
   * 清空本地存储
   */
  clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
    }
  },
}

/**
 * 数组工具函数
 */
export const arrayUtils = {
  /**
   * 数组去重
   * @param array 原数组
   * @param key 去重依据的键名(对象数组)
   * @returns 去重后的数组
   */
  unique<T>(array: T[], key?: keyof T): T[] {
    if (!key) {
      return [...new Set(array)]
    }

    const seen = new Set()
    return array.filter(item => {
      const value = item[key]
      if (seen.has(value)) {
        return false
      }
      seen.add(value)
      return true
    })
  },

  /**
   * 数组分组
   * @param array 原数组
   * @param key 分组依据的键名
   * @returns 分组后的对象
   */
  groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce(
      (groups, item) => {
        const groupKey = String(item[key])
        if (!groups[groupKey]) {
          groups[groupKey] = []
        }
        groups[groupKey].push(item)
        return groups
      },
      {} as Record<string, T[]>
    )
  },

  /**
   * 数组排序
   * @param array 原数组
   * @param key 排序依据的键名
   * @param order 排序顺序
   * @returns 排序后的数组
   */
  sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    return [...array].sort((a, b) => {
      const aValue = a[key]
      const bValue = b[key]

      if (aValue < bValue) return order === 'asc' ? -1 : 1
      if (aValue > bValue) return order === 'asc' ? 1 : -1
      return 0
    })
  },
}
