// 验证相关工具函数

import type { ValidationError } from '@sql-learn/shared-types';

/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): ValidationError | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return {
      field: 'email',
      message: '邮箱地址不能为空',
      code: 'REQUIRED'
    };
  }
  
  if (!emailRegex.test(email)) {
    return {
      field: 'email',
      message: '请输入有效的邮箱地址',
      code: 'INVALID_FORMAT'
    };
  }
  
  return null;
}

/**
 * 验证用户名格式
 */
export function validateUsername(username: string): ValidationError | null {
  if (!username) {
    return {
      field: 'username',
      message: '用户名不能为空',
      code: 'REQUIRED'
    };
  }
  
  if (username.length < 3) {
    return {
      field: 'username',
      message: '用户名长度至少需要3个字符',
      code: 'TOO_SHORT'
    };
  }
  
  if (username.length > 20) {
    return {
      field: 'username',
      message: '用户名长度不能超过20个字符',
      code: 'TOO_LONG'
    };
  }
  
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    return {
      field: 'username',
      message: '用户名只能包含字母、数字、下划线和连字符',
      code: 'INVALID_FORMAT'
    };
  }
  
  return null;
}

/**
 * 验证密码格式
 */
export function validatePassword(password: string): ValidationError | null {
  if (!password) {
    return {
      field: 'password',
      message: '密码不能为空',
      code: 'REQUIRED'
    };
  }
  
  if (password.length < 8) {
    return {
      field: 'password',
      message: '密码长度至少需要8个字符',
      code: 'TOO_SHORT'
    };
  }
  
  if (password.length > 128) {
    return {
      field: 'password',
      message: '密码长度不能超过128个字符',
      code: 'TOO_LONG'
    };
  }
  
  // 检查密码复杂度
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const complexityCount = [hasLowerCase, hasUpperCase, hasNumbers, hasSpecialChar]
    .filter(Boolean).length;
  
  if (complexityCount < 3) {
    return {
      field: 'password',
      message: '密码需要包含至少3种类型的字符（大写字母、小写字母、数字、特殊字符）',
      code: 'INSUFFICIENT_COMPLEXITY'
    };
  }
  
  return null;
}

/**
 * 验证确认密码
 */
export function validateConfirmPassword(
  password: string, 
  confirmPassword: string
): ValidationError | null {
  if (!confirmPassword) {
    return {
      field: 'confirmPassword',
      message: '请确认密码',
      code: 'REQUIRED'
    };
  }
  
  if (password !== confirmPassword) {
    return {
      field: 'confirmPassword',
      message: '两次输入的密码不一致',
      code: 'PASSWORD_MISMATCH'
    };
  }
  
  return null;
}

/**
 * 验证SQL代码
 */
export function validateSQLCode(sql: string): ValidationError | null {
  if (!sql || !sql.trim()) {
    return {
      field: 'sql',
      message: 'SQL代码不能为空',
      code: 'REQUIRED'
    };
  }
  
  const trimmedSql = sql.trim();
  
  // 检查SQL长度
  if (trimmedSql.length > 10000) {
    return {
      field: 'sql',
      message: 'SQL代码长度不能超过10000个字符',
      code: 'TOO_LONG'
    };
  }
  
  // 检查危险的SQL操作
  const dangerousPatterns = [
    /\bDROP\s+TABLE\b/i,
    /\bDROP\s+DATABASE\b/i,
    /\bTRUNCATE\b/i,
    /\bDELETE\s+FROM\s+\w+\s*;?\s*$/i, // DELETE without WHERE
    /\bUPDATE\s+\w+\s+SET\s+.*\s*;?\s*$/i, // UPDATE without WHERE
    /\bALTER\s+TABLE\b/i,
    /\bCREATE\s+TABLE\b/i,
    /\bINSERT\s+INTO\b/i
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmedSql)) {
      return {
        field: 'sql',
        message: '不允许执行可能危险的SQL操作',
        code: 'DANGEROUS_OPERATION'
      };
    }
  }
  
  return null;
}

/**
 * 验证练习标题
 */
export function validateExerciseTitle(title: string): ValidationError | null {
  if (!title || !title.trim()) {
    return {
      field: 'title',
      message: '练习标题不能为空',
      code: 'REQUIRED'
    };
  }
  
  if (title.trim().length < 5) {
    return {
      field: 'title',
      message: '练习标题长度至少需要5个字符',
      code: 'TOO_SHORT'
    };
  }
  
  if (title.trim().length > 100) {
    return {
      field: 'title',
      message: '练习标题长度不能超过100个字符',
      code: 'TOO_LONG'
    };
  }
  
  return null;
}

/**
 * 验证练习描述
 */
export function validateExerciseDescription(description: string): ValidationError | null {
  if (!description || !description.trim()) {
    return {
      field: 'description',
      message: '练习描述不能为空',
      code: 'REQUIRED'
    };
  }
  
  if (description.trim().length < 10) {
    return {
      field: 'description',
      message: '练习描述长度至少需要10个字符',
      code: 'TOO_SHORT'
    };
  }
  
  if (description.trim().length > 1000) {
    return {
      field: 'description',
      message: '练习描述长度不能超过1000个字符',
      code: 'TOO_LONG'
    };
  }
  
  return null;
}

/**
 * 验证分数值
 */
export function validateScore(score: number): ValidationError | null {
  if (typeof score !== 'number' || isNaN(score)) {
    return {
      field: 'score',
      message: '分数必须是有效的数字',
      code: 'INVALID_TYPE'
    };
  }
  
  if (score < 0) {
    return {
      field: 'score',
      message: '分数不能为负数',
      code: 'INVALID_RANGE'
    };
  }
  
  if (score > 100) {
    return {
      field: 'score',
      message: '分数不能超过100',
      code: 'INVALID_RANGE'
    };
  }
  
  return null;
}

/**
 * 批量验证表单数据
 */
export function validateForm<T extends Record<string, any>>(
  data: T,
  validators: Record<keyof T, (value: any) => ValidationError | null>
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  for (const [field, validator] of Object.entries(validators)) {
    const value = data[field as keyof T];
    const error = validator(value);
    if (error) {
      errors.push(error);
    }
  }
  
  return errors;
}

/**
 * 检查是否有验证错误
 */
export function hasValidationErrors(errors: ValidationError[]): boolean {
  return errors.length > 0;
}

/**
 * 获取字段的第一个错误信息
 */
export function getFieldError(errors: ValidationError[], field: string): string | null {
  const error = errors.find(e => e.field === field);
  return error ? error.message : null;
}

/**
 * 清理验证错误（移除指定字段的错误）
 */
export function clearFieldErrors(errors: ValidationError[], field: string): ValidationError[] {
  return errors.filter(e => e.field !== field);
}