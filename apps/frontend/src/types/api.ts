/**
 * API相关类型定义
 * 统一的API响应格式，与后端保持一致
 */

/**
 * API错误信息接口
 */
export interface ApiError {
  code: string
  message: string
  details?: any
}

/**
 * 分页信息接口
 */
export interface PaginationInfo {
  page: number
  limit: number
  total: number
  has_next: boolean
  has_prev: boolean
}

/**
 * 统一API响应格式
 * 与后端ApiResponse保持一致
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: ApiError
  pagination?: PaginationInfo
}

/**
 * API请求配置接口
 */
export interface ApiRequestConfig {
  timeout?: number
  headers?: Record<string, string>
  params?: Record<string, any>
}

/**
 * 文件上传进度回调函数类型
 */
export type UploadProgressCallback = (progress: number) => void

/**
 * HTTP方法类型
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * API客户端错误类
 */
export class ApiClientError extends Error {
  public statusCode?: number
  public code?: string
  public response?: any

  constructor(message: string, statusCode?: number, code?: string, response?: any) {
    super(message)
    this.name = 'ApiClientError'
    this.statusCode = statusCode
    this.code = code
    this.response = response
  }
}
