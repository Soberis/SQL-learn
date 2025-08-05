import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 用户偏好设置接口
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  fontSize: number
  autoSave: boolean
  notifications: boolean
  language: string
  editorTheme: 'vs' | 'vs-dark' | 'hc-black'
  soundEnabled: boolean
  animationsEnabled: boolean
}

/**
 * 用户偏好设置状态管理
 * 管理用户的个性化设置和偏好
 */
export const usePreferencesStore = defineStore('preferences', () => {
  // 用户偏好设置
  const settings = ref<UserPreferences>({
    theme: 'auto',
    fontSize: 14,
    autoSave: true,
    notifications: true,
    language: 'zh-CN',
    editorTheme: 'vs',
    soundEnabled: true,
    animationsEnabled: true,
  })

  /**
   * 更新主题设置
   * @param theme 主题类型
   */
  const updateTheme = (theme: 'light' | 'dark' | 'auto') => {
    settings.value.theme = theme
    applyTheme(theme)
    saveToLocalStorage()
  }

  /**
   * 更新字体大小
   * @param size 字体大小(12-24)
   */
  const updateFontSize = (size: number) => {
    settings.value.fontSize = Math.max(12, Math.min(24, size))
    saveToLocalStorage()
  }

  /**
   * 更新编辑器主题
   * @param theme 编辑器主题
   */
  const updateEditorTheme = (theme: 'vs' | 'vs-dark' | 'hc-black') => {
    settings.value.editorTheme = theme
    saveToLocalStorage()
  }

  /**
   * 切换自动保存
   */
  const toggleAutoSave = () => {
    settings.value.autoSave = !settings.value.autoSave
    saveToLocalStorage()
  }

  /**
   * 切换通知
   */
  const toggleNotifications = () => {
    settings.value.notifications = !settings.value.notifications
    saveToLocalStorage()
  }

  /**
   * 切换声音
   */
  const toggleSound = () => {
    settings.value.soundEnabled = !settings.value.soundEnabled
    saveToLocalStorage()
  }

  /**
   * 切换动画
   */
  const toggleAnimations = () => {
    settings.value.animationsEnabled = !settings.value.animationsEnabled
    saveToLocalStorage()
  }

  /**
   * 应用主题到DOM
   * @param theme 主题类型
   */
  const applyTheme = (theme: 'light' | 'dark' | 'auto') => {
    const html = document.documentElement

    if (theme === 'auto') {
      // 根据系统偏好自动切换
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      html.className = prefersDark ? 'dark' : ''
    } else {
      html.className = theme === 'dark' ? 'dark' : ''
    }
  }

  /**
   * 保存设置到本地存储
   */
  const saveToLocalStorage = () => {
    localStorage.setItem('sql-learning-preferences', JSON.stringify(settings.value))
  }

  /**
   * 从本地存储加载设置
   */
  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem('sql-learning-preferences')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        settings.value = { ...settings.value, ...parsed }
        applyTheme(settings.value.theme)
      } catch (error) {
        console.error('Failed to load preferences:', error)
      }
    } else {
      // 首次访问，应用默认主题
      applyTheme(settings.value.theme)
    }
  }

  /**
   * 重置所有设置
   */
  const resetSettings = () => {
    settings.value = {
      theme: 'auto',
      fontSize: 14,
      autoSave: true,
      notifications: true,
      language: 'zh-CN',
      editorTheme: 'vs',
      soundEnabled: true,
      animationsEnabled: true,
    }
    applyTheme('auto')
    localStorage.removeItem('sql-learning-preferences')
  }

  // 监听系统主题变化
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', () => {
      if (settings.value.theme === 'auto') {
        applyTheme('auto')
      }
    })
  }

  // 初始化时加载设置
  loadFromLocalStorage()

  return {
    settings,
    updateTheme,
    updateFontSize,
    updateEditorTheme,
    toggleAutoSave,
    toggleNotifications,
    toggleSound,
    toggleAnimations,
    saveToLocalStorage,
    loadFromLocalStorage,
    resetSettings,
  }
})
