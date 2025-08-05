/**
 * 统一API服务模块 - 简化版本
 * 只保留核心功能，使用统一的ApiClient
 */

import { apiClient } from '@/utils/apiClient'
import type { ApiResponse } from '@/types/api'

/**
 * 认证相关API服务
 */
export const authService = {
  /**
   * 用户登录
   */
  async login(credentials: { username: string; password: string }): Promise<ApiResponse<any>> {
    return apiClient.post('/api/v1/auth/login', credentials)
  },

  /**
   * 用户注册
   */
  async register(userData: {
    username: string
    email: string
    password: string
    full_name?: string
  }): Promise<ApiResponse<any>> {
    return apiClient.post('/api/v1/auth/register', userData)
  },

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/v1/auth/me')
  },

  /**
   * 用户登出
   */
  async logout(): Promise<ApiResponse<any>> {
    return apiClient.post('/api/v1/auth/logout')
  },

  /**
   * 修改密码
   */
  async changePassword(data: {
    current_password: string
    new_password: string
  }): Promise<ApiResponse<any>> {
    return apiClient.put('/api/v1/auth/change-password', data)
  },
}

/**
 * 学习进度相关API服务
 */
export const progressService = {
  /**
   * 获取用户学习进度列表
   */
  async getProgressList(params: { page?: number; limit?: number } = {}): Promise<ApiResponse<any[]>> {
    return apiClient.get('/api/v1/progress', params)
  },

  /**
   * 获取学习进度统计
   */
  async getProgressStats(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/v1/progress/stats')
  },

  /**
   * 获取特定练习的进度
   */
  async getExerciseProgress(exerciseId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/v1/progress/${exerciseId}`)
  },

  /**
   * 创建学习进度记录
   */
  async createProgress(data: { exercise_id: string; status?: string; score?: number }): Promise<ApiResponse<any>> {
    return apiClient.post('/api/v1/progress', data)
  },

  /**
   * 更新学习进度
   */
  async updateProgress(
    exerciseId: string,
    data: {
      status?: string
      score?: number
      is_completed?: boolean
      time_spent?: number
    }
  ): Promise<ApiResponse<any>> {
    return apiClient.put(`/api/v1/progress/${exerciseId}`, data)
  },

  /**
   * 提交练习答案
   */
  async submitExercise(data: {
    exercise_id: string
    user_sql: string
    time_spent?: number
  }): Promise<ApiResponse<any>> {
    return apiClient.post('/api/v1/progress/submit', data)
  },
}

/**
 * 练习题相关API服务
 */
export const exerciseService = {
  /**
   * 获取练习题列表
   */
  async getExercises(params?: {
    course_id?: string
    difficulty?: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<any[]>> {
    return apiClient.get('/api/v1/exercises', params)
  },

  /**
   * 获取练习题详情
   */
  async getExercise(exerciseId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/v1/exercises/${exerciseId}`)
  },

  /**
   * 提交练习答案
   */
  async submitAnswer(exerciseId: string, answer: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/api/v1/exercises/${exerciseId}/submit`, { answer })
  },
}

/**
 * SQL执行相关API服务
 */
export const sqlService = {
  /**
   * 执行SQL语句
   */
  async executeSQL(sql: string, database?: string): Promise<ApiResponse<any>> {
    return apiClient.post('/api/v1/sql/execute', { sql, database })
  },

  /**
   * 验证SQL语法
   */
  async validateSQL(sql: string): Promise<ApiResponse<any>> {
    return apiClient.post('/api/v1/sql/validate', { sql })
  },

  /**
   * 获取数据库表结构
   */
  async getDatabaseSchema(database: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/v1/sql/schema/${database}`)
  },

  /**
   * 获取表示例数据
   */
  async getTableSampleData(database: string, table: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/api/v1/sql/sample/${database}/${table}`)
  },
}

/**
 * 学习统计相关API服务
 */
export const statsService = {
  /**
   * 获取学习统计数据
   */
  async getLearningStats(timeRange?: string): Promise<ApiResponse<any>> {
    return apiClient.get('/api/v1/stats/learning', { time_range: timeRange })
  },

  /**
   * 获取学习进度数据
   */
  async getProgressData(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/v1/stats/progress')
  },
}

/**
 * 用户相关API服务
 */
export const userService = {
  /**
   * 获取用户信息
   */
  async getUserInfo(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/v1/user/profile')
  },

  /**
   * 更新用户信息
   */
  async updateUserInfo(data: any): Promise<ApiResponse<any>> {
    return apiClient.put('/api/v1/user/profile', data)
  },

  /**
   * 获取用户统计信息
   */
  async getUserStats(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/v1/user/stats')
  },

  /**
   * 上传用户头像
   */
  async uploadAvatar(file: File): Promise<ApiResponse<any>> {
    return apiClient.upload('/api/v1/user/avatar', file)
  },
}

// 导出所有服务
export const api = {
  auth: authService,
  progress: progressService,
  exercise: exerciseService,
  sql: sqlService,
  stats: statsService,
  user: userService,
}

// 默认导出
export default api
