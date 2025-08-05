import { ElMessage } from 'element-plus'
import { ApiClientError } from './apiClient'

/**
 * 全局错误处理器
 * 用于处理未捕获的Promise拒绝和JavaScript错误
 */
export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler
  private errorQueue: Array<{ error: Error; timestamp: number }> = []
  private maxErrors = 10
  private errorThrottleTime = 5000 // 5秒内相同错误只显示一次

  private constructor() {
    this.setupGlobalHandlers()
  }

  static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler()
    }
    return GlobalErrorHandler.instance
  }

  private setupGlobalHandlers() {
    // 处理未捕获的Promise拒绝
    window.addEventListener('unhandledrejection', event => {
      console.error('未处理的Promise拒绝:', event.reason)

      if (event.reason instanceof ApiClientError) {
        this.handleApiError(event.reason)
      } else {
        this.handleGenericError(new Error(event.reason?.message || '未知的Promise错误'))
      }

      // 阻止默认的错误处理
      event.preventDefault()
    })

    // 处理未捕获的JavaScript错误
    window.addEventListener('error', event => {
      console.error('未捕获的JavaScript错误:', event.error)
      this.handleGenericError(event.error || new Error(event.message))
    })

    // 处理资源加载错误
    window.addEventListener(
      'error',
      event => {
        if (event.target !== window) {
          console.error('资源加载错误:', event.target)
          this.handleResourceError(event)
        }
      },
      true
    )
  }

  private handleApiError(error: ApiClientError) {
    if (this.shouldShowError(error)) {
      // 根据错误类型显示不同的提示
      switch (error.code) {
        case 'NETWORK_ERROR':
          ElMessage.error('网络连接失败，请检查网络设置')
          break
        case 'VALIDATION_ERROR':
          ElMessage.error('请求参数验证失败，请检查输入')
          break
        case 'BUSINESS_ERROR':
          ElMessage.error(error.message)
          break
        case 'HTTP_ERROR':
          if (error.statusCode === 401) {
            ElMessage.error('登录已过期，请重新登录')
          } else if (error.statusCode === 403) {
            ElMessage.error('没有权限访问该资源')
          } else if (error.statusCode && error.statusCode >= 500) {
            ElMessage.error('服务器内部错误，请稍后重试')
          } else {
            ElMessage.error(error.message)
          }
          break
        default:
          ElMessage.error(`请求失败: ${error.message}`)
      }
    }
  }

  private handleGenericError(error: Error) {
    if (this.shouldShowError(error)) {
      ElMessage.error('应用程序发生错误，请刷新页面重试')
    }
  }

  private handleResourceError(event: ErrorEvent) {
    const target = event.target as HTMLElement
    const tagName = target?.tagName?.toLowerCase()

    if (tagName === 'script') {
      ElMessage.error('脚本加载失败，请刷新页面重试')
    } else if (tagName === 'link') {
      ElMessage.error('样式文件加载失败，页面可能显示异常')
    } else if (tagName === 'img') {
      console.warn('图片加载失败:', (target as HTMLImageElement).src)
      // 图片加载失败通常不需要显示错误提示
    } else {
      ElMessage.error('资源加载失败，请刷新页面重试')
    }
  }

  private shouldShowError(error: Error): boolean {
    const now = Date.now()
    const errorMessage = error.message

    // 检查是否在节流时间内有相同的错误
    const recentSimilarError = this.errorQueue.find(
      item => item.error.message === errorMessage && now - item.timestamp < this.errorThrottleTime
    )

    if (recentSimilarError) {
      return false
    }

    // 添加到错误队列
    this.errorQueue.push({ error, timestamp: now })

    // 保持队列大小
    if (this.errorQueue.length > this.maxErrors) {
      this.errorQueue.shift()
    }

    // 清理过期的错误记录
    this.errorQueue = this.errorQueue.filter(item => now - item.timestamp < this.errorThrottleTime)

    return true
  }

  // 手动报告错误
  reportError(error: Error, context?: string) {
    console.error(`手动报告的错误${context ? ` (${context})` : ''}:`, error)

    if (error instanceof ApiClientError) {
      this.handleApiError(error)
    } else {
      this.handleGenericError(error)
    }
  }

  // 清空错误队列
  clearErrors() {
    this.errorQueue = []
  }

  // 获取错误统计信息
  getErrorStats() {
    const now = Date.now()
    const recentErrors = this.errorQueue.filter(item => now - item.timestamp < this.errorThrottleTime)

    return {
      totalErrors: this.errorQueue.length,
      recentErrors: recentErrors.length,
      errorTypes: this.getErrorTypes(recentErrors),
    }
  }

  // 处理Axios错误
  handleAxiosError(error: any) {
    if (error.response) {
      // 服务器响应错误
      const apiError = new ApiClientError(
        error.response.data?.message || '服务器错误',
        error.response.status,
        'HTTP_ERROR',
        error.response.data
      )
      this.handleApiError(apiError)
      return apiError
    } else if (error.request) {
      // 网络错误
      const networkError = new ApiClientError('网络连接失败', 0, 'NETWORK_ERROR')
      this.handleApiError(networkError)
      return networkError
    } else {
      // 其他错误
      const genericError = new ApiClientError(error.message || '未知错误', 0, 'UNKNOWN_ERROR')
      this.handleGenericError(genericError)
      return genericError
    }
  }

  private getErrorTypes(errors: Array<{ error: Error; timestamp: number }>) {
    const types: Record<string, number> = {}

    errors.forEach(({ error }) => {
      const type = error instanceof ApiClientError ? error.code : error.constructor.name
      if (type) {
        types[type] = (types[type] || 0) + 1
      }
    })

    return types
  }
}

// 初始化全局错误处理器
export const globalErrorHandler = GlobalErrorHandler.getInstance()

// 导出错误处理相关的工具函数
export const handleAsyncError = async <T>(asyncFn: () => Promise<T>, fallback?: T): Promise<T | undefined> => {
  try {
    return await asyncFn()
  } catch (error) {
    globalErrorHandler.reportError(error as Error, 'AsyncError')
    return fallback
  }
}

export const withErrorBoundary = <T extends (...args: any[]) => any>(fn: T, context?: string): T => {
  return ((...args: any[]) => {
    try {
      const result = fn(...args)

      // 如果返回Promise，处理异步错误
      if (result instanceof Promise) {
        return result.catch(error => {
          globalErrorHandler.reportError(error, context)
          throw error
        })
      }

      return result
    } catch (error) {
      globalErrorHandler.reportError(error as Error, context)
      throw error
    }
  }) as T
}
