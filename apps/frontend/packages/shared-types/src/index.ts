// API相关类型
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// 练习相关类型
export interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  category?: string;
  tags?: string[];
  sample_data?: any;
  hints?: string[];
  expected_result?: any[];
  is_completed?: boolean;
}

export interface ExerciseSubmission {
  exercise_id: string;
  sql: string;
  result: any;
  is_correct?: boolean;
  feedback?: string;
}

// 通用响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 分页类型
export interface PaginationParams {
  page?: number;
  limit?: number;
  skip?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev