import axios, { type AxiosInstance, type AxiosResponse, type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { globalErrorHandler } from './errorHandler'
import { TokenManager } from './tokenManager'
import type { ApiResponse, UploadProgressCallback } from '@/types/api'

// 重新导出统一的类型
export type { ApiResponse, UploadProgressCallback } from '@/types/api'
export { ApiClientError } from '@/types/api'

/**
 * HTTP客户端类
 */
class ApiClient {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  /**
   * 设置请求和响应拦截器
   */
  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // 添加请求时间戳
        ;(config as any).metadata = { startTime: Date.now() }

        // 添加认证token
        const token = TokenManager.getToken()
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }

        return config
      },
      (error: any) => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // 计算请求耗时
        const config = response.config as any
        if (config.metadata?.startTime) {
          const duration = Date.now() - config.metadata.startTime
          console.log(`API请求耗时: ${duration}ms - ${config.method?.toUpperCase()} ${config.url}`)
        }

        return response
      },
      (error: AxiosError) => {
        globalErrorHandler.handleAxiosError(error)
        return Promise.reject(error)
      }
    )
  }

  /**
   * GET请求
   *
   * @param url 请求URL
   * @param params 查询参数
   * @returns Promise<ApiResponse<T>> API响应
   */
  async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await this.instance.get(url, { params })
    return response.data
  }

  /**
   * POST请求
   *
   * @param url 请求URL
   * @param data 请求数据
   * @returns Promise<ApiResponse<T>> API响应
   */
  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.instance.post(url, data)
    return response.data
  }

  /**
   * PUT请求
   *
   * @param url 请求URL
   * @param data 请求数据
   * @returns Promise<ApiResponse<T>> API响应
   */
  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.instance.put(url, data)
    return response.data
  }

  /**
   * PATCH请求
   *
   * @param url 请求URL
   * @param data 请求数据
   * @returns Promise<ApiResponse<T>> API响应
   */
  async patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.instance.patch(url, data)
    return response.data
  }

  /**
   * DELETE请求
   *
   * @param url 请求URL
   * @returns Promise<ApiResponse<T>> API响应
   */
  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    const response = await this.instance.delete(url)
    return response.data
  }

  /**
   * 文件上传
   *
   * @param url 上传URL
   * @param file 要上传的文件
   * @param onProgress 上传进度回调函数
   * @returns Promise<ApiResponse<T>> API响应
   */
  async upload<T = any>(url: string, file: File, onProgress?: UploadProgressCallback): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await this.instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: any) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })

    return response.data
  }

  /**
   * 文件下载
   *
   * @param url 下载URL
   * @param filename 文件名（可选）
   * @returns Promise<void>
   */
  async download(url: string, filename?: string): Promise<void> {
    const response = await this.instance.get(url, {
      responseType: 'blob',
    })

    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }
}

// 创建并导出API客户端实例
export const apiClient = new ApiClient()

// 导出类型
export type { InternalAxiosRequestConfig as AxiosRequestConfig, AxiosResponse }