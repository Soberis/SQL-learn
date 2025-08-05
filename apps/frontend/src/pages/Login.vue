<template>
  <div class="login">
    <div class="login__container">
      <div class="login__card">
        <!-- Logo和标题 -->
        <div class="login__header">
          <div class="login__logo">
            <el-icon size="48"><Lightning /></el-icon>
          </div>
          <h1 class="login__title">SQL实战学习平台</h1>
          <p class="login__subtitle">开启你的SQL学习之旅</p>
        </div>

        <!-- 登录表单 -->
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login__form"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="用户名或邮箱"
              size="large"
              :prefix-icon="User"
              clearable
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              clearable
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-form-item>
            <div class="login__options">
              <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
              <el-button type="primary" link @click="showForgotPassword">忘记密码？</el-button>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" size="large" class="login__submit" :loading="loading" @click="handleLogin">
              登录
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 注册链接 -->
        <div class="login__footer">
          <span class="login__footer-text">还没有账号？</span>
          <el-button type="primary" link @click="showRegister">立即注册</el-button>
        </div>
      </div>
    </div>

    <!-- 注册对话框 -->
    <el-dialog v-model="registerDialogVisible" title="用户注册" width="400px" :close-on-click-modal="false">
      <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="registerForm.email" placeholder="请输入邮箱地址" clearable />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" show-password clearable />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
            clearable
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="registerDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="registerLoading" @click="handleRegister">注册</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 忘记密码对话框 -->
    <el-dialog v-model="forgotPasswordDialogVisible" title="忘记密码" width="400px" :close-on-click-modal="false">
      <el-form ref="forgotPasswordFormRef" :model="forgotPasswordForm" :rules="forgotPasswordRules" label-width="80px">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="forgotPasswordForm.email" placeholder="请输入注册邮箱" clearable />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="forgotPasswordDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="forgotPasswordLoading" @click="handleForgotPassword">
            发送重置邮件
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lightning, User, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

// 表单引用
const loginFormRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()
const forgotPasswordFormRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)
const registerLoading = ref(false)
const forgotPasswordLoading = ref(false)

// 对话框显示状态
const registerDialogVisible = ref(false)
const forgotPasswordDialogVisible = ref(false)

// 登录表单
const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false,
})

// 注册表单
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

// 忘记密码表单
const forgotPasswordForm = reactive({
  email: '',
})

// 表单验证规则
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' },
    { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
  ],
}

const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
      message: '密码必须包含大小写字母和数字',
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

const forgotPasswordRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
}

/**
 * 处理登录
 */
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return

    loading.value = true

    const success = await authStore.login({
      username: loginForm.username,
      password: loginForm.password,
    })

    if (success) {
      ElMessage.success('登录成功')
      // 跳转到首页或之前访问的页面
      const redirect = router.currentRoute.value.query.redirect as string
      router.push(redirect || '/dashboard')
    }
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 处理注册
 */
const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    const valid = await registerFormRef.value.validate()
    if (!valid) return

    registerLoading.value = true

    const success = await authStore.register({
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password,
    })

    if (success) {
      ElMessage.success('注册成功，请登录')
      registerDialogVisible.value = false
      // 清空注册表单
      Object.assign(registerForm, {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
      })
    }
  } catch (error) {
    console.error('注册失败:', error)
  } finally {
    registerLoading.value = false
  }
}

/**
 * 处理忘记密码
 */
const handleForgotPassword = async () => {
  if (!forgotPasswordFormRef.value) return

  try {
    const valid = await forgotPasswordFormRef.value.validate()
    if (!valid) return

    forgotPasswordLoading.value = true

    // 这里应该调用忘记密码API
    // await authStore.forgotPassword(forgotPasswordForm.email)

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('重置密码邮件已发送，请查收邮箱')
    forgotPasswordDialogVisible.value = false
    forgotPasswordForm.email = ''
  } catch (error) {
    console.error('发送重置邮件失败:', error)
    ElMessage.error('发送重置邮件失败，请稍后重试')
  } finally {
    forgotPasswordLoading.value = false
  }
}

/**
 * 显示注册对话框
 */
const showRegister = () => {
  registerDialogVisible.value = true
}

/**
 * 显示忘记密码对话框
 */
const showForgotPassword = () => {
  forgotPasswordDialogVisible.value = true
}
</script>

<style scoped>
.login {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login__container {
  width: 100%;
  max-width: 400px;
}

.login__card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.login__header {
  text-align: center;
  margin-bottom: 32px;
}

.login__logo {
  color: var(--el-color-primary);
  margin-bottom: 16px;
}

.login__title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}

.login__subtitle {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin: 0;
}

.login__form {
  margin-bottom: 24px;
}

.login__options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.login__submit {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
}

.login__footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.login__footer-text {
  color: var(--el-text-color-regular);
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login__card {
    padding: 24px;
    margin: 0 16px;
  }

  .login__title {
    font-size: 20px;
  }
}

/* 深色主题适配 */
:global(.dark) .login__card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
}
</style>
