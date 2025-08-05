<template>
  <div class="dashboard">
    <div class="dashboard__container">
      <!-- 页面头部 -->
      <div class="dashboard__header">
        <h1 class="dashboard__title">学习看板</h1>
        <div class="dashboard__user-info">
          <span>欢迎回来，{{ authStore.user?.username || '学习者' }}！</span>
        </div>
      </div>

      <!-- 学习统计 -->
      <div class="dashboard__stats">
        <div class="dashboard__stat-card">
          <div class="dashboard__stat-icon">
            <el-icon><Star /></el-icon>
          </div>
          <div class="dashboard__stat-content">
            <div class="dashboard__stat-value">{{ progressStore.progressStats.total_completed }}</div>
            <div class="dashboard__stat-label">完成题目</div>
          </div>
        </div>

        <div class="dashboard__stat-card">
          <div class="dashboard__stat-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="dashboard__stat-content">
            <div class="dashboard__stat-value">{{ progressStore.progressStats.average_score }}</div>
            <div class="dashboard__stat-label">平均分数</div>
          </div>
        </div>

        <div class="dashboard__stat-card">
          <div class="dashboard__stat-icon">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="dashboard__stat-content">
            <div class="dashboard__stat-value">{{ progressStore.progressStats.completion_rate }}%</div>
            <div class="dashboard__stat-label">完成率</div>
          </div>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="dashboard__actions">
        <el-card class="dashboard__action-card" shadow="hover" @click="goToPractice">
          <div class="dashboard__action-content">
            <el-icon class="dashboard__action-icon"><EditPen /></el-icon>
            <h3>开始练习</h3>
            <p>继续你的SQL学习之旅</p>
          </div>
        </el-card>

        <el-card class="dashboard__action-card" shadow="hover" @click="goToHandbook">
          <div class="dashboard__action-content">
            <el-icon class="dashboard__action-icon"><Reading /></el-icon>
            <h3>学习手册</h3>
            <p>查看SQL语法和示例</p>
          </div>
        </el-card>

        <el-card class="dashboard__action-card" shadow="hover" @click="goToProgress">
          <div class="dashboard__action-content">
            <el-icon class="dashboard__action-icon"><DataAnalysis /></el-icon>
            <h3>学习进度</h3>
            <p>查看详细的学习统计</p>
          </div>
        </el-card>
      </div>

      <!-- 最近练习 -->
      <el-card class="dashboard__recent-card" shadow="hover">
        <template #header>
          <div class="dashboard__card-header">
            <h3>最近练习</h3>
            <el-button type="primary" size="small" @click="goToPractice">
              查看全部
            </el-button>
          </div>
        </template>

        <div v-if="recentExercises.length === 0" class="dashboard__empty">
          <el-empty description="暂无练习记录">
            <el-button type="primary" @click="goToPractice">开始第一次练习</el-button>
          </el-empty>
        </div>

        <div v-else class="dashboard__recent-list">
          <div
            v-for="exercise in recentExercises"
            :key="exercise.id"
            class="dashboard__recent-item"
            @click="goToExercise(exercise.id)"
          >
            <div class="dashboard__recent-info">
              <h4>{{ exercise.title }}</h4>
              <p>{{ exercise.description }}</p>
            </div>
            <div class="dashboard__recent-meta">
              <span class="dashboard__recent-score" v-if="exercise.score !== null">
                得分: {{ exercise.score }}
              </span>
              <span class="dashboard__recent-status" :class="exercise.completed ? 'completed' : 'pending'">
                {{ exercise.completed ? '已完成' : '进行中' }}
              </span>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Star,
  TrendCharts,
  CircleCheck,
  EditPen,
  Reading,
  DataAnalysis
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useProgressStore } from '@/stores/progress'

/**
 * 学习看板页面 - 简化版本
 * 只保留核心的统计展示和快速导航功能
 */
const router = useRouter()
const authStore = useAuthStore()
const progressStore = useProgressStore()

// 模拟最近练习数据
const recentExercises = ref([
  {
    id: '1',
    title: 'SELECT 基础查询',
    description: '学习基本的数据查询语法',
    score: 85,
    completed: true
  },
  {
    id: '2',
    title: 'WHERE 条件筛选',
    description: '使用WHERE子句筛选数据',
    score: null,
    completed: false
  }
])

/**
 * 导航到练习页面
 */
const goToPractice = () => {
  router.push('/practice')
}

/**
 * 导航到学习手册页面
 */
const goToHandbook = () => {
  router.push('/handbook')
}

/**
 * 导航到进度页面
 */
const goToProgress = () => {
  ElMessage.info('详细进度页面开发中...')
}

/**
 * 导航到具体练习
 * @param exerciseId 练习ID
 */
const goToExercise = (exerciseId: string) => {
  router.push(`/practice/${exerciseId}`)
}

/**
 * 页面初始化
 */
onMounted(() => {
  // 初始化用户认证状态
  authStore.initAuth()
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.dashboard__container {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  color: white;
}

.dashboard__title {
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
}

.dashboard__user-info {
  font-size: 1.1rem;
  opacity: 0.9;
}

.dashboard__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.dashboard__stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.dashboard__stat-card:hover {
  transform: translateY(-2px);
}

.dashboard__stat-icon {
  font-size: 2rem;
  color: #409eff;
  margin-right: 16px;
}

.dashboard__stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.dashboard__stat-label {
  color: #909399;
  font-size: 0.9rem;
}

.dashboard__actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.dashboard__action-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.dashboard__action-card:hover {
  transform: translateY(-4px);
}

.dashboard__action-content {
  text-align: center;
  padding: 20px;
}

.dashboard__action-icon {
  font-size: 3rem;
  color: #409eff;
  margin-bottom: 16px;
}

.dashboard__action-content h3 {
  margin: 0 0 8px 0;
  color: #303133;
}

.dashboard__action-content p {
  margin: 0;
  color: #909399;
}

.dashboard__recent-card {
  background: white;
  border-radius: 12px;
}

.dashboard__card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard__card-header h3 {
  margin: 0;
  color: #303133;
}

.dashboard__empty {
  text-align: center;
  padding: 40px 20px;
}

.dashboard__recent-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dashboard__recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.dashboard__recent-item:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.dashboard__recent-info h4 {
  margin: 0 0 4px 0;
  color: #303133;
}

.dashboard__recent-info p {
  margin: 0;
  color: #909399;
  font-size: 0.9rem;
}

.dashboard__recent-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.dashboard__recent-score {
  font-size: 0.9rem;
  color: #67c23a;
  font-weight: bold;
}

.dashboard__recent-status {
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 12px;
}

.dashboard__recent-status.completed {
  background: #f0f9ff;
  color: #409eff;
}

.dashboard__recent-status.pending {
  background: #fdf6ec;
  color: #e6a23c;
}
</style>
