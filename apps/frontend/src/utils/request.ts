import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { globalErrorHandler } from './errorHandler'

/**
 * 创建axios实例
 */
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * 检查后端服务是否可用
 */
let isBackendAvailable = true

/**
 * 检测后端服务状态
 */
const checkBackendStatus = async (): Promise<boolean> => {
  try {
    await axios.get(`${import.meta.env.VITE_API_BASE_URL}/health`, { timeout: 3000 })
    isBackendAvailable = true
    return true
  } catch {
    isBackendAvailable = false
    console.warn('后端服务不可用，将使用离线模式')
    return false
  }
}

// 初始化时检查后端状态
checkBackendStatus()

/**
 * 请求拦截器
 * 在请求发送前添加认证token
 */
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从localStorage获取token
    const token = localStorage.getItem(import.meta.env.VITE_TOKEN_STORAGE_KEY || 'access_token')

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 如果是开发环境，打印请求信息
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('🚀 API Request:', {
        url: config.url,
        method: config.method,
        data: config.data,
        params: config.params,
      })
    }

    return config
  },
  _error => {
    console.error('请求拦截器错误:', _error)
    return Promise.reject(_error)
  }
)

/**
 * 响应拦截器
 * 统一处理响应和错误
 */
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response

    // 如果是文件下载，直接返回
    if (response.config.responseType === 'blob') {
      return response
    }

    // 如果是开发环境，打印响应信息
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('📦 API Response:', {
        url: response.config.url,
        status: response.status,
        data: data,
      })
    }

    // 检查业务状态码
    if (data && data.error === true) {
      ElMessage.error(data.message || '请求失败')
      return Promise.reject(new Error(data.message || '请求失败'))
    }

    return data
  },
  error => {
    // 如果是网络错误且后端不可用，静默处理
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      if (!isBackendAvailable) {
        console.warn('后端服务不可用，请求被静默处理')
        return Promise.reject({
          type: 'NETWORK',
          message: '后端服务暂时不可用，部分功能可能受限',
          timestamp: Date.now(),
        })
      }
    }

    // 使用统一的错误处理器
    const errorInfo = globalErrorHandler.handleAxiosError(error)
    return Promise.reject(errorInfo)
  }
)

// TokenManager已移动到独立文件 @/utils/tokenManager

export { checkBackendStatus, isBackendAvailable }
export default service