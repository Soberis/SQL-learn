/**
 * 统一API服务导出
 * 简化版本，只使用services.ts中的统一API服务
 */

// 导出统一的API服务
export { api as default } from './services'
export * from './services'

// 重新导出apiClient以便其他模块使用
export { apiClient } from '@/utils/apiClient'
export type { ApiResponse } from '@/types/api'
