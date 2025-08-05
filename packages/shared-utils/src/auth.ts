// 认证相关工具函数

import type { User, TokenPayload } from '@sql-learn/shared-types';

/**
 * 解析JWT令牌载荷
 */
export function parseJwtPayload(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as TokenPayload;
  } catch (error) {
    console.error('Failed to parse JWT payload:', error);
    return null;
  }
}

/**
 * 检查令牌是否过期
 */
export function isTokenExpired(token: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload || !payload.exp) {
    return true;
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

/**
 * 获取令牌剩余有效时间（秒）
 */
export function getTokenRemainingTime(token: string): number {
  const payload = parseJwtPayload(token);
  if (!payload || !payload.exp) {
    return 0;
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  return Math.max(0, payload.exp - currentTime);
}

/**
 * 验证密码强度
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;
  
  // 长度检查
  if (password.length < 8) {
    feedback.push('密码长度至少需要8个字符');
  } else if (password.length >= 12) {
    score += 2;
  } else {
    score += 1;
  }
  
  // 包含小写字母
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('密码需要包含小写字母');
  }
  
  // 包含大写字母
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('密码需要包含大写字母');
  }
  
  // 包含数字
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('密码需要包含数字');
  }
  
  // 包含特殊字符
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('密码需要包含特殊字符');
  }
  
  // 避免常见模式
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /(.)\1{2,}/ // 重复字符
  ];
  
  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      score -= 1;
      feedback.push('避免使用常见的密码模式');
      break;
    }
  }
  
  return {
    isValid: score >= 4 && feedback.length === 0,
    score: Math.max(0, Math.min(5, score)),
    feedback
  };
}

/**
 * 生成用户显示名称
 */
export function generateDisplayName(user: User): string {
  if (user.full_name) {
    return user.full_name;
  }
  
  if (user.username) {
    return user.username;
  }
  
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return 'Unknown User';
}

/**
 * 获取用户头像URL
 */
export function getUserAvatarUrl(user: User, size: number = 40): string {
  if (user.avatar_url) {
    return user.avatar_url;
  }
  
  // 使用Gravatar作为默认头像
  const email = user.email || '';
  const hash = btoa(email.toLowerCase().trim());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}

/**
 * 检查用户权限
 */
export function hasPermission(user: User, permission: string): boolean {
  if (!user.permissions) {
    return false;
  }
  
  return user.permissions.includes(permission) || user.permissions.includes('*');
}

/**
 * 检查用户角色
 */
export function hasRole(user: User, role: string): boolean {
  return user.role === role || user.role === 'admin';
}