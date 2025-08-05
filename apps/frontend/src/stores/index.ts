export { useSqlStore } from './sql'
export { useProgressStore } from './progress'
export { usePreferencesStore } from './preferences'
export { useAuthStore } from './auth'

// 为了向后兼容，保留旧的导入方式
import { useSqlStore } from './sql'
import { useProgressStore } from './progress'
import { usePreferencesStore } from './preferences'
import { useAuthStore } from './auth'

export {
  useSqlStore as sqlStore,
  useProgressStore as progressStore,
  usePreferencesStore as preferencesStore,
  useAuthStore as authStore,
}
