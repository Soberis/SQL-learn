import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '@/utils/apiClient'

/**
 * 用户信息接口
 */
interface User {
  id: string
  username: string
  email: string
  avatar_url?: string
}

/**
 * 登录请求接口
 */
interface LoginRequest {
  username: string
  password: string
}

/**
 * 注册请求接口
 */
interface RegisterRequest {
  username: string
  email: string
  password: string
}

/**
 * Auth Store - 简化版本
 * 只保留基本的登录/登出功能，移除复杂的权限管理和高级功能
 */
export const useAuthStore = defineStore('auth', () => {
  // 核心状态
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)

  // 计算属性
  const userName = computed(() => user.value?.username || '')
  const userEmail = computed(() => user.value?.email || '')

  /**
   * 初始化认证状态
   * 检查本地存储的token是否有效
   */
  const initAuth = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        isLoading.value = true
        const response = await apiClient.get('/auth/me')
        if (response.data) {
          user.value = response.data
          isAuthenticated.value = true
        }
      } catch (error) {
        // Token无效，清除本地存储
        localStorage.removeItem('token')
        isAuthenticated.value = false
      } finally {
        isLoading.value = false
      }
    }
  }

  /**
   * 用户登录
   * @param credentials - 登录凭据
   * @returns Promise<{success: boolean, message?: string}>
   */
  const login = async (credentials: LoginRequest) => {
    try {
      isLoading.value = true
      const response = await apiClient.post('/auth/login', credentials)
      
      if (response.data) {
        const { user: userData, token } = response.data
        
        // 保存用户信息和令牌
        user.value = userData
        isAuthenticated.value = true
        localStorage.setItem('token', token)
        
        return { success: true }
      } else {
        return { success: false, message: '登录失败' }
      }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || '登录过程中发生错误' }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 用户注册
   * @param userData - 注册数据
   * @returns Promise<{success: boolean, message?: string}>
   */
  const register = async (userData: RegisterRequest) => {
    try {
      isLoading.value = true
      const response = await apiClient.post('/auth/register', userData)
      
      if (response.data) {
        return { success: true, message: '注册成功，请登录' }
      } else {
        return { success: false, message: '注册失败' }
      }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || '注册过程中发生错误' }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 用户登出
   * 清除本地状态和存储
   */
  const logout = async () => {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      console.error('登出请求失败:', error)
    } finally {
      // 无论请求是否成功，都清除本地状态
      user.value = null
      isAuthenticated.value = false
      localStorage.removeItem('token')
    }
  }

  /**
   * 重置状态
   */
  const reset = () => {
    user.value = null
    isAuthenticated.value = false
    localStorage.removeItem('token')
  }

  return {
    // 状态
    user,
    isAuthenticated,
    isLoading,
    
    // 计算属性
    userName,
    userEmail,
    
    // 方法
    initAuth,
    login,
    register,
    logout,
    reset
  }
})
