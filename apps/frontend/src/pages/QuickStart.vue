<template>
  <div class="quickstart">
    <!-- 游戏化元素 -->
    <!-- <GameElements ref="gameElementsRef" /> -->

    <!-- 智能助手 -->
    <!-- <div class="quickstart__assistant">
      <SmartAssistant />
    </div> -->

    <!-- 欢迎横幅 -->
    <div class="quickstart__hero">
      <div class="quickstart__hero-content">
        <div class="quickstart__welcome">
          <h1 class="quickstart__title">
            <el-icon class="quickstart__title-icon"><Lightning /></el-icon>
            欢迎来到SQL实战学习平台
          </h1>
          <p class="quickstart__subtitle">零基础用户30分钟内完成第一个真实项目查询，7天内具备基本的数据分析能力</p>
          <div class="quickstart__cta">
            <el-button type="primary" size="large" class="quickstart__start-btn" @click="startQuickTutorial">
              <el-icon><VideoPlay /></el-icon>
              立即开始练习
            </el-button>
            <el-button size="large" class="quickstart__demo-btn" @click="watchDemo">
              <el-icon><VideoPlay /></el-icon>
              观看30秒介绍
            </el-button>
          </div>
        </div>
        <div class="quickstart__hero-visual">
          <div class="quickstart__code-preview">
            <div class="quickstart__code-header">
              <span class="quickstart__code-title">你的第一个SQL查询</span>
            </div>
            <div class="quickstart__code-content">
              <pre><code>SELECT name, age, city
FROM users
WHERE age > 25
ORDER BY age DESC;</code></pre>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="quickstart__content">
      <el-row :gutter="24">
        <!-- 5分钟快速上手 -->
        <el-col :xs="24" :lg="16">
          <el-card class="quickstart__card quickstart__tutorial-card" shadow="hover">
            <template #header>
              <div class="quickstart__card-header">
                <h3 class="quickstart__card-title">
                  <el-icon><Timer /></el-icon>
                  5分钟快速上手
                </h3>
                <el-tag type="success" size="small">推荐新手</el-tag>
              </div>
            </template>

            <div class="quickstart__tutorial-steps">
              <el-steps :active="currentStep" direction="vertical" class="quickstart__steps">
                <el-step
                  v-for="(step, index) in tutorialSteps"
                  :key="index"
                  :title="step.title"
                  :description="step.description"
                  :status="getStepStatus(index)"
                >
                  <template #icon>
                    <el-icon v-if="step.completed"><SuccessFilled /></el-icon>
                    <el-icon v-else-if="index === currentStep"><Loading /></el-icon>
                    <span v-else>{{ index + 1 }}</span>
                  </template>
                </el-step>
              </el-steps>

              <div class="quickstart__step-actions">
                <el-button
                  v-if="currentStep < tutorialSteps.length - 1"
                  type="primary"
                  :disabled="!canProceed"
                  @click="nextStep"
                >
                  下一步
                </el-button>
                <el-button v-else type="success" @click="completeTutorial">完成入门</el-button>
                <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
              </div>
            </div>
          </el-card>

          <!-- 学习路径预览 -->
          <el-card class="quickstart__card" shadow="hover">
            <template #header>
              <div class="quickstart__card-header">
                <h3 class="quickstart__card-title">
                  <el-icon><Guide /></el-icon>
                  学习路径预览
                </h3>
                <el-button type="primary" size="small" @click="$router.push('/dashboard')">查看详细进度</el-button>
              </div>
            </template>

            <div class="quickstart__learning-path">
              <div
                v-for="(phase, index) in learningPath"
                :key="index"
                class="quickstart__path-item"
                :class="{ 'quickstart__path-item--active': phase.isActive }"
              >
                <div class="quickstart__path-icon">
                  <el-icon><component :is="phase.icon" /></el-icon>
                </div>
                <div class="quickstart__path-content">
                  <h4 class="quickstart__path-title">{{ phase.title }}</h4>
                  <p class="quickstart__path-desc">{{ phase.description }}</p>
                  <div class="quickstart__path-meta">
                    <el-progress :percentage="phase.progress" :stroke-width="6" :show-text="false" />
                    <span class="quickstart__path-progress">{{ phase.progress }}%</span>
                  </div>
                </div>
                <div class="quickstart__path-action">
                  <el-button v-if="phase.isActive" type="primary" size="small" @click="goToPhase">开始学习</el-button>
                  <el-tag v-else-if="phase.isCompleted" type="success" size="small">已完成</el-tag>
                  <el-tag v-else type="info" size="small">待解锁</el-tag>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧边栏 -->
        <el-col :xs="24" :lg="8">
          <!-- 今日挑战 -->
          <el-card class="quickstart__card quickstart__challenge-card" shadow="hover">
            <template #header>
              <div class="quickstart__card-header">
                <h3 class="quickstart__card-title">
                  <el-icon><Trophy /></el-icon>
                  今日挑战
                </h3>
                <el-tag :type="challengeStatus.type" size="small">
                  {{ challengeStatus.text }}
                </el-tag>
              </div>
            </template>

            <div class="quickstart__challenge">
              <div class="quickstart__challenge-info">
                <h4 class="quickstart__challenge-title">{{ todayChallenge.title }}</h4>
                <p class="quickstart__challenge-desc">{{ todayChallenge.description }}</p>
                <div class="quickstart__challenge-meta">
                  <el-tag :type="getDifficultyType(todayChallenge.difficulty)" size="small">
                    {{ getDifficultyText(todayChallenge.difficulty) }}
                  </el-tag>
                  <span class="quickstart__challenge-points">
                    <el-icon><Star /></el-icon>
                    {{ todayChallenge.points }} 积分
                  </span>
                </div>
              </div>

              <div class="quickstart__challenge-action">
                <el-button
                  v-if="!todayChallenge.isCompleted"
                  type="primary"
                  class="quickstart__challenge-btn"
                  @click="startChallenge"
                >
                  开始挑战
                </el-button>
                <div v-else class="quickstart__challenge-completed">
                  <el-icon class="quickstart__challenge-success"><SuccessFilled /></el-icon>
                  <span>今日挑战已完成！</span>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 连续打卡 -->
          <el-card class="quickstart__card" shadow="hover">
            <template #header>
              <div class="quickstart__card-header">
                <h3 class="quickstart__card-title">
                  <el-icon><Calendar /></el-icon>
                  连续打卡
                </h3>
              </div>
            </template>

            <div class="quickstart__streak">
              <div class="quickstart__streak-count">
                <span class="quickstart__streak-number">{{ streakData.current }}</span>
                <span class="quickstart__streak-label">天</span>
              </div>
              <p class="quickstart__streak-desc">
                连续学习 {{ streakData.current }} 天，再坚持
                {{ streakData.nextMilestone - streakData.current }} 天解锁新成就！
              </p>
              <div class="quickstart__streak-calendar">
                <div
                  v-for="day in streakData.recentDays"
                  :key="day.date"
                  class="quickstart__streak-day"
                  :class="{
                    'quickstart__streak-day--completed': day.completed,
                    'quickstart__streak-day--today': day.isToday,
                  }"
                >
                  <span class="quickstart__streak-day-number">{{ day.day }}</span>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 快速链接 -->
          <el-card class="quickstart__card" shadow="hover">
            <template #header>
              <div class="quickstart__card-header">
                <h3 class="quickstart__card-title">
                  <el-icon><Link /></el-icon>
                  快速链接
                </h3>
              </div>
            </template>

            <div class="quickstart__quick-links">
              <div
                v-for="link in quickLinks"
                :key="link.path"
                class="quickstart__quick-link"
                @click="$router.push(link.path)"
              >
                <div class="quickstart__quick-link-icon">
                  <el-icon><component :is="link.icon" /></el-icon>
                </div>
                <div class="quickstart__quick-link-content">
                  <h4 class="quickstart__quick-link-title">{{ link.title }}</h4>
                  <p class="quickstart__quick-link-desc">{{ link.description }}</p>
                </div>
                <el-icon class="quickstart__quick-link-arrow"><ArrowRight /></el-icon>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// import { useLearningStore } from '@/stores/learning'
// import { usePreferencesStore } from '../stores/preferences'
// import GameElements from '@/components/GameElements.vue'
// import SmartAssistant from '@/components/SmartAssistant.vue'
// import InstantFeedback from '@/components/InstantFeedback.vue'
import {
  Lightning,
  VideoPlay,
  Timer,
  SuccessFilled,
  Loading,
  Guide,
  Trophy,
  Star,
  Link,
  ArrowRight,
} from '@element-plus/icons-vue'

/**
 * 快速开始页面
 * 实现5分钟快速入门、今日挑战、学习路径预览
 */
const router = useRouter()
// const learningStore = useLearningStore()
// const preferencesStore = usePreferencesStore()
// const gameElementsRef = ref(null)

// 当前教程步骤
const currentStep = ref(0)
const canProceed = ref(true)

// 教程步骤
const tutorialSteps = ref([
  {
    title: '了解SQL基础',
    description: '学习什么是SQL，为什么要学习SQL',
    completed: false,
    duration: '1分钟',
  },
  {
    title: '第一个查询',
    description: '编写并执行你的第一个SELECT语句',
    completed: false,
    duration: '2分钟',
  },
  {
    title: '数据筛选',
    description: '使用WHERE子句筛选数据',
    completed: false,
    duration: '1分钟',
  },
  {
    title: '结果排序',
    description: '使用ORDER BY对结果进行排序',
    completed: false,
    duration: '1分钟',
  },
])

// 学习路径
const learningPath = ref([
  {
    title: '基础查询',
    description: '掌握SELECT、WHERE、ORDER BY等基础语法',
    icon: 'Reading',
    progress: 80,
    isActive: true,
    isCompleted: false,
  },
  {
    title: '数据连接',
    description: '学习JOIN操作，连接多个表的数据',
    icon: 'Connection',
    progress: 30,
    isActive: false,
    isCompleted: false,
  },
  {
    title: '聚合分析',
    description: '使用GROUP BY和聚合函数进行数据分析',
    icon: 'DataAnalysis',
    progress: 0,
    isActive: false,
    isCompleted: false,
  },
  {
    title: '高级查询',
    description: '子查询、窗口函数等高级SQL技巧',
    icon: 'Magic',
    progress: 0,
    isActive: false,
    isCompleted: false,
  },
])

// 今日挑战
const todayChallenge = ref({
  title: '查询年龄大于25岁的用户',
  description: '从用户表中查询所有年龄大于25岁的用户信息，并按年龄降序排列',
  difficulty: 'beginner',
  points: 50,
  isCompleted: false,
})

// 连续打卡数据
const streakData = ref({
  current: 3,
  nextMilestone: 7,
  recentDays: [
    { date: '2024-01-15', day: 15, completed: true, isToday: false },
    { date: '2024-01-16', day: 16, completed: true, isToday: false },
    { date: '2024-01-17', day: 17, completed: true, isToday: false },
    { date: '2024-01-18', day: 18, completed: false, isToday: true },
    { date: '2024-01-19', day: 19, completed: false, isToday: false },
    { date: '2024-01-20', day: 20, completed: false, isToday: false },
    { date: '2024-01-21', day: 21, completed: false, isToday: false },
  ],
})

// 快速链接
const quickLinks = ref([
  {
    title: '实战练习场',
    description: '真实业务场景练习',
    icon: 'EditPen',
    path: '/practice',
  },
  {
    title: '项目实战室',
    description: '完整项目案例实战',
    icon: 'Suitcase',
    path: '/project',
  },
  {
    title: '速查手册',
    description: 'SQL语法快速查询',
    icon: 'Collection',
    path: '/handbook',
  },
])

// 计算属性
const challengeStatus = computed(() => {
  if (todayChallenge.value.isCompleted) {
    return { type: 'success', text: '已完成' }
  }
  return { type: 'warning', text: '进行中' }
})

// 方法
const getStepStatus = (index: number) => {
  if (tutorialSteps.value[index].completed) return 'success'
  if (index === currentStep.value) return 'process'
  if (index < currentStep.value) return 'success'
  return 'wait'
}

const getDifficultyType = (difficulty: string) => {
  const types: Record<string, string> = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'danger',
  }
  return types[difficulty] || 'info'
}

const getDifficultyText = (difficulty: string) => {
  const texts: Record<string, string> = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级',
  }
  return texts[difficulty] || '未知'
}

const startQuickTutorial = () => {
  // 开始快速教程
  router.push('/practice?tutorial=quick')
}

const watchDemo = () => {
  // 播放演示视频
  console.log('播放演示视频')
}

const nextStep = () => {
  if (currentStep.value < tutorialSteps.value.length - 1) {
    tutorialSteps.value[currentStep.value].completed = true
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const completeTutorial = () => {
  tutorialSteps.value[currentStep.value].completed = true
  // 跳转到实战练习场
  router.push('/practice')
}

const goToPhase = () => {
  // 根据学习阶段跳转到对应页面
  router.push('/practice')
}

const startChallenge = () => {
  // 开始今日挑战
  // learningStore.startLearningSession()
  // if (gameElementsRef.value) {
  //   gameElementsRef.value?.addPoints?.(5)
  // }
  router.push('/practice?challenge=today')
}

onMounted(() => {
  // 初始化数据
  console.log('快速开始页面已加载')
})
</script>

<style scoped>
.quickstart {
  min-height: 100vh;
  position: relative;
}

.quickstart__assistant {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

.quickstart__hero {
  background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-color-primary-light-8) 100%);
  padding: 60px 0;
  margin: -24px -24px 24px -24px;
}

.quickstart__hero-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 60px;
}

.quickstart__welcome {
  flex: 1;
}

.quickstart__title {
  font-size: 48px;
  font-weight: 700;
  color: var(--el-color-primary);
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.quickstart__title-icon {
  font-size: 56px;
}

.quickstart__subtitle {
  font-size: 20px;
  color: var(--el-text-color-regular);
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.quickstart__cta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.quickstart__start-btn {
  height: 56px;
  padding: 0 32px;
  font-size: 18px;
  font-weight: 600;
}

.quickstart__demo-btn {
  height: 56px;
  padding: 0 32px;
  font-size: 18px;
}

.quickstart__hero-visual {
  flex: 1;
  display: flex;
  justify-content: center;
}

.quickstart__code-preview {
  background: var(--el-bg-color);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  max-width: 400px;
}

.quickstart__code-header {
  background: var(--el-color-primary);
  color: white;
  padding: 12px 20px;
  font-weight: 600;
}

.quickstart__code-content {
  padding: 20px;
}

.quickstart__code-content pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;
  line-height: 1.5;
  color: var(--el-text-color-primary);
}

.quickstart__content {
  max-width: 1200px;
  margin: 0 auto;
}

.quickstart__card {
  margin-bottom: 24px;
}

.quickstart__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.quickstart__card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-primary);
}

.quickstart__tutorial-steps {
  padding: 20px 0;
}

.quickstart__steps {
  margin-bottom: 32px;
}

.quickstart__step-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.quickstart__learning-path {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quickstart__path-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 2px solid var(--el-border-color-lighter);
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.quickstart__path-item:hover {
  border-color: var(--el-color-primary-light-7);
  background-color: var(--el-color-primary-light-9);
}

.quickstart__path-item--active {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.quickstart__path-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--el-color-primary-light-8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--el-color-primary);
}

.quickstart__path-content {
  flex: 1;
}

.quickstart__path-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.quickstart__path-desc {
  margin: 0 0 12px 0;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.quickstart__path-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quickstart__path-progress {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.quickstart__challenge {
  padding: 20px 0;
}

.quickstart__challenge-info {
  margin-bottom: 20px;
}

.quickstart__challenge-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.quickstart__challenge-desc {
  margin: 0 0 12px 0;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

.quickstart__challenge-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.quickstart__challenge-points {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--el-color-warning);
  font-weight: 600;
}

.quickstart__challenge-action {
  text-align: center;
}

.quickstart__challenge-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

.quickstart__challenge-completed {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--el-color-success);
  font-weight: 600;
}

.quickstart__challenge-success {
  font-size: 20px;
}

.quickstart__streak {
  text-align: center;
  padding: 20px 0;
}

.quickstart__streak-count {
  margin-bottom: 12px;
}

.quickstart__streak-number {
  font-size: 48px;
  font-weight: 700;
  color: var(--el-color-primary);
}

.quickstart__streak-label {
  font-size: 18px;
  color: var(--el-text-color-regular);
  margin-left: 8px;
}

.quickstart__streak-desc {
  margin: 0 0 20px 0;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

.quickstart__streak-calendar {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.quickstart__streak-day {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 2px solid var(--el-border-color-lighter);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-regular);
}

.quickstart__streak-day--completed {
  background: var(--el-color-success);
  border-color: var(--el-color-success);
  color: white;
}

.quickstart__streak-day--today {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

.quickstart__quick-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quickstart__quick-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
  transition: all 0.3s ease;
}

.quickstart__quick-link:hover {
  border-color: var(--el-color-primary-light-7);
  background-color: var(--el-color-primary-light-9);
}

.quickstart__quick-link-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--el-color-primary-light-8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--el-color-primary);
}

.quickstart__quick-link-content {
  flex: 1;
}

.quickstart__quick-link-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.quickstart__quick-link-desc {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.quickstart__quick-link-arrow {
  color: var(--el-text-color-placeholder);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .quickstart__hero {
    padding: 40px 0;
  }

  .quickstart__hero-content {
    flex-direction: column;
    gap: 40px;
    text-align: center;
  }

  .quickstart__title {
    font-size: 36px;
  }

  .quickstart__subtitle {
    font-size: 18px;
  }

  .quickstart__cta {
    justify-content: center;
  }

  .quickstart__start-btn,
  .quickstart__demo-btn {
    height: 48px;
    font-size: 16px;
  }
}
</style>
