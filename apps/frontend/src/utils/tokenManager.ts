/**
 * Token管理工具类
 * 统一管理访问令牌和刷新令牌的存储和获取
 */
export class TokenManager {
  private static readonly TOKEN_KEY = import.meta.env.VITE_TOKEN_STORAGE_KEY || 'access_token'
  private static readonly REFRESH_TOKEN_KEY = import.meta.env.VITE_REFRESH_TOKEN_KEY || 'refresh_token'

  /**
   * 保存访问令牌
   *
   * @param token 访问令牌
   */
  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token)
  }

  /**
   * 获取访问令牌
   *
   * @returns string | null 访问令牌
   */
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY)
  }

  /**
   * 保存刷新令牌
   *
   * @param refreshToken 刷新令牌
   */
  static setRefreshToken(refreshToken: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)
  }

  /**
   * 获取刷新令牌
   *
   * @returns string | null 刷新令牌
   */
  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  /**
   * 移除所有令牌
   */
  static removeTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
  }

  /**
   * 检查令牌是否存在
   *
   * @returns boolean 令牌是否存在
   */
  static hasToken(): boolean {
    return !!this.getToken()
  }

  /**
   * 检查令牌是否过期
   *
   * @param token JWT令牌
   * @returns boolean 是否过期
   */
  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp < currentTime
    } catch {
      return true
    }
  }
}
