// API相关工具函数

import type { ApiResponse, ApiError } from '@sql-learn/shared-types';

/**
 * HTTP状态码常量
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
} as const;

/**
 * API错误类型
 */
export const API_ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  PARSE_ERROR: 'PARSE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

/**
 * 请求配置接口
 */
export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * 创建标准API响应
 */
export function createApiResponse<T>(
  success: boolean,
  data?: T,
  message?: string,
  error?: ApiError
): ApiResponse<T> {
  return {
    success,
    data,
    message,
    error,
    timestamp: new Date().toISOString()
  };
}

/**
 * 创建成功响应
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string
): ApiResponse<T> {
  return createApiResponse(true, data, message);
}

/**
 * 创建错误响应
 */
export function createErrorResponse(
  error: ApiError,
  message?: string
): ApiResponse<null> {
  return createApiResponse(false, null, message, error);
}

/**
 * 创建API错误对象
 */
export function createApiError(
  code: string,
  message: string,
  details?: Record<string, any>,
  field?: string
): ApiError {
  return {
    code,
    message,
    details,
    field
  };
}

/**
 * 处理HTTP错误状态码
 */
export function handleHttpError(status: number, statusText: string): ApiError {
  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:
      return createApiError(
        API_ERROR_CODES.VALIDATION_ERROR,
        '请求参数错误'
      );
    
    case HTTP_STATUS.UNAUTHORIZED:
      return createApiError(
        API_ERROR_CODES.AUTHENTICATION_ERROR,
        '身份验证失败，请重新登录'
      );
    
    case HTTP_STATUS.FORBIDDEN:
      return createApiError(
        API_ERROR_CODES.AUTHORIZATION_ERROR,
        '没有权限访问此资源'
      );
    
    case HTTP_STATUS.NOT_FOUND:
      return createApiError(
        API_ERROR_CODES.NOT_FOUND_ERROR,
        '请求的资源不存在'
      );
    
    case HTTP_STATUS.CONFLICT:
      return createApiError(
        API_ERROR_CODES.CONFLICT_ERROR,
        '资源冲突'
      );
    
    case HTTP_STATUS.UNPROCESSABLE_ENTITY:
      return createApiError(
        API_ERROR_CODES.VALIDATION_ERROR,
        '数据验证失败'
      );
    
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
    case HTTP_STATUS.BAD_GATEWAY:
    case HTTP_STATUS.SERVICE_UNAVAILABLE:
      return createApiError(
        API_ERROR_CODES.SERVER_ERROR,
        '服务器错误，请稍后重试'
      );
    
    default:
      return createApiError(
        API_ERROR_CODES.UNKNOWN_ERROR,
        `HTTP ${status}: ${statusText}`
      );
  }
}

/**
 * 构建查询字符串
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * 构建完整URL
 */
export function buildUrl(baseUrl: string, path: string, params?: Record<string, any>): string {
  const url = new URL(path, baseUrl);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => url.searchParams.append(key, String(item)));
        } else {
          url.searchParams.append(key, String(value));
        }
      }
    });
  }
  
  return url.toString();
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 重试函数
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i === maxRetries) {
        break;
      }
      
      await delay(retryDelay * Math.pow(2, i)); // 指数退避
    }
  }
  
  throw lastError!;
}

/**
 * 检查响应是否成功
 */
export function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true } {
  return response.success === true;
}

/**
 * 检查响应是否失败
 */
export function isErrorResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: false } {
  return response.success === false;
}

/**
 * 提取响应数据
 */
export function extractResponseData<T>(response: ApiResponse<T>): T | null {
  return isSuccessResponse(response) ? response.data || null : null;
}

/**
 * 提取响应错误
 */
export function extractResponseError<T>(response: ApiResponse<T>): ApiError | null {
  return isErrorResponse(response) ? response.error || null : null;
}

/**
 * 格式化API错误消息
 */
export function formatApiErrorMessage(error: ApiError): string