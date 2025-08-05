// 存储相关工具函数

/**
 * 本地存储工具类
 */
export class LocalStorage {
  /**
   * 设置本地存储项
   */
  static setItem<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Failed to set localStorage item:', error);
    }
  }

  /**
   * 获取本地存储项
   */
  static getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue ?? null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Failed to get localStorage item:', error);
      return defaultValue ?? null;
    }
  }

  /**
   * 移除本地存储项
   */
  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove localStorage item:', error);
    }
  }

  /**
   * 清空本地存储
   */
  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  /**
   * 检查本地存储是否可用
   */
  static isAvailable(): boolean {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取存储大小（字节）
   */
  static getSize(): number {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  }

  /**
   * 获取所有键
   */
  static getAllKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        keys.push(key);
      }
    }
    return keys;
  }
}

/**
 * 会话存储工具类
 */
export class SessionStorage {
  /**
   * 设置会话存储项
   */
  static setItem<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Failed to set sessionStorage item:', error);
    }
  }

  /**
   * 获取会话存储项
   */
  static getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = sessionStorage.getItem(key);
      if (item === null) {
        return defaultValue ?? null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Failed to get sessionStorage item:', error);
      return defaultValue ?? null;
    }
  }

  /**
   * 移除会话存储项
   */
  static removeItem(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove sessionStorage item:', error);
    }
  }

  /**
   * 清空会话存储
   */
  static clear(): void {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Failed to clear sessionStorage:', error);
    }
  }

  /**
   * 检查会话存储是否可用
   */
  static isAvailable(): boolean {
    try {
      const testKey = '__sessionStorage_test__';
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Cookie工具类
 */
export class CookieStorage {
  /**
   * 设置Cookie
   */
  static setItem(
    key: string, 
    value: string, 
    options: {
      expires?: Date | number;
      path?: string;
      domain?: string;
      secure?: boolean;
      sameSite?: 'strict' | 'lax' | 'none';
    } = {}
  ): void {
    try {
      let cookieString = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      
      if (options.expires) {
        if (typeof options.expires === 'number') {
          const date = new Date();
          date.setTime(date.getTime() + options.expires * 24 * 60 * 60 * 1000);
          cookieString += `; expires=${date.toUTCString()}`;
        } else {
          cookieString += `; expires=${options.expires.toUTCString()}`;
        }
      }
      
      if (options.path) {
        cookieString += `; path=${options.path}`;
      }
      
      if (options.domain) {
        cookieString += `; domain=${options.domain}`;
      }
      
      if (options.secure) {
        cookieString += '; secure';
      }
      
      if (options.sameSite) {
        cookieString += `; samesite=${options.sameSite}`;
      }
      
      document.cookie = cookieString;
    } catch (error) {
      console.error('Failed to set cookie:', error);
    }
  }

  /**
   * 获取Cookie
   */
  static getItem(key: string): string | null {
    try {
      const encodedKey = encodeURIComponent(key);
      const cookies = document.cookie.split(';');
      
      for (const cookie of cookies) {
        const [cookieKey, cookieValue] = cookie.trim().split('=');
        if (cookieKey === encodedKey) {
          return decodeURIComponent(cookieValue);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get cookie:', error);
      return null;
    }
  }

  /**
   * 移除Cookie
   */
  static removeItem(key: string, path?: string, domain?: string): void {
    try {
      let cookieString = `${encodeURIComponent(key)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      
      if (path) {
        cookieString += `; path=${path}`;
      }
      
      if (domain) {
        cookieString += `; domain=${domain}`;
      }
      
      document.cookie = cookieString;
    } catch (error) {
      console.error('Failed to remove cookie:', error);
    }
  }

  /**
   * 获取所有Cookie键
   */
  static getAllKeys(): string[] {
    try {
      const cookies = document.cookie.split(';');
      const keys: string[] = [];
      
      for (const cookie of cookies) {
        const [key] = cookie.trim().split('=');
        if (key) {
          keys.push(decodeURIComponent(key));
        }
      }
      
      return keys;
    } catch (error) {
      console.error('Failed to get cookie keys:', error);
      return [];
    }
  }
}

/**
 * 存储管理器
 */
export class StorageManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'user_info';
  private static readonly SETTINGS_KEY = 'user_settings';
  private static readonly THEME_KEY = 'theme';
  private static readonly LANGUAGE_KEY = 'language';

  /**
   * 保存认证令牌
   */
  static saveToken(token: string): void {
    LocalStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * 获取认证令牌
   */
  static getToken(): string | null {
    return LocalStorage.getItem<string>(this.TOKEN_KEY);
  }

  /**
   * 移除认证令牌
   */
  static removeToken(): void {
    LocalStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * 保存用户信息
   */
  static saveUser(user: any): void {
    LocalStorage.setItem(this.USER_KEY, user);
  }

  /**
   * 获取用户信息
   */
  static getUser<T>(): T | null {
    return LocalStorage.getItem<T>(this.USER_KEY);
  }

  /**
   * 移除用户信息
   */
  static removeUser(): void {
    LocalStorage.removeItem(this.USER_KEY);
  }

  /**
   * 保存用户设置
   */
  static saveSettings(settings: any): void {
    LocalStorage.setItem(this.SETTINGS_KEY, settings);
  }

  /**
   * 获取用户设置
   */
  static getSettings<T>(): T | null {
    return LocalStorage.getItem<T>(this.SETTINGS_KEY);
  }

  /**
   * 保存主题设置
   */
  static saveTheme(theme: string): void {
    LocalStorage.setItem(this.THEME_KEY, theme);
  }

  /**
   * 获取主题设置
   */
  static getTheme(): string | null {
    return LocalStorage.getItem<string>(this.THEME_KEY);
  }

  /**
   * 保存语言设置
   */
  static saveLanguage(language: string): void {
    LocalStorage.setItem(this.LANGUAGE_KEY, language);
  }

  /**
   * 获取语言设置
   */
  static getLanguage(): string | null {
    return LocalStorage.getItem<string>(this.LANGUAGE_KEY);
  }

  /**
   * 清除所有用户数据
   */
  static clearUserData(): void {
    this.removeToken();
    this.removeUser();
    LocalStorage.removeItem(this.SETTINGS_KEY);
  }

  /**
   * 清除所有数据
   */
  static clearAll(): void {
    LocalStorage.clear();
    SessionStorage.clear();
  }
}

/**
 * 缓存管理器
 */
export class CacheManager {
  private static readonly CACHE_PREFIX = 'cache_';
  private static readonly CACHE_EXPIRY_SUFFIX = '_expiry';

  /**
   * 设置缓存项
   */
  static setItem<T>(
    key: string, 
    value: T, 
    expiryMinutes: number = 60
  ): void {
    const cacheKey = this.CACHE_PREFIX + key;
    const expiryKey = cacheKey + this.CACHE_EXPIRY_SUFFIX;
    const expiryTime = Date.now() + expiryMinutes * 60 * 1000;
    
    LocalStorage.setItem(cacheKey, value);
    LocalStorage.setItem(expiryKey, expiryTime);
  }

  /**
   * 获取缓存项
   */
  static getItem<T>(key: string): T | null {
    const cacheKey = this.CACHE_PREFIX + key;
    const expiryKey = cacheKey + this.CACHE_EXPIRY_SUFFIX;
    
    const expiryTime = LocalStorage.getItem<number>(expiryKey);
    
    if (!expiryTime || Date.now() > expiryTime) {
      // 缓存已过期，清除数据
      this.removeItem(key);
      return null;
    }
    
    return LocalStorage.getItem<T>(cacheKey);
  }

  /**
   * 移除缓存项
   */
  static removeItem(key: string): void {
    const cacheKey = this.CACHE_PREFIX + key;
    const expiryKey = cacheKey + this.CACHE_EXPIRY_SUFFIX;
    
    LocalStorage.removeItem(cacheKey);
    LocalStorage.removeItem(expiryKey);
  }

  /**
   * 清除所有过期缓存
   */
  static clearExpired(): void {
    const keys = LocalStorage.getAllKeys();
    const now = Date.now();
    
    for (const key of keys) {
      if (key.startsWith(this.CACHE_PREFIX) && key.endsWith(this.CACHE_EXPIRY_SUFFIX)) {
        const expiryTime = LocalStorage.getItem<number>(key);
        if (expiryTime && now > expiryTime) {
          const cacheKey = key.replace(this.CACHE_EXPIRY_SUFFIX, '');
          const originalKey = cacheKey.replace(this.CACHE_PREFIX, '');
          this.removeItem(originalKey);
        }
      }
    }
  }

  /**
   * 清除所有缓存
   */
  static clearAll(): void {
    const keys = LocalStorage.getAllKeys();
    
    for (const key of keys) {
      if (key.startsWith(this.CACHE_PREFIX)) {
        LocalStorage.removeItem(key);
      }
    }
  }
}