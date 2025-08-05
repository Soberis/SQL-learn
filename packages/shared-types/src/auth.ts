// 认证相关类型定义

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  profile?: UserProfile;
}

export interface UserProfile {
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  level: number;
  total_points: number;
  completed_exercises: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface TokenPayload {
  sub: string;
  username: string;
  exp: number;
  iat: number;
}