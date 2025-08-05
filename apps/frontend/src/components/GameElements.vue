<template>
  <div class="game-elements">
    <!-- 用户等级和经验 -->
    <div class="game-elements__level-card">
      <div class="level-card__avatar">
        <div class="level-card__avatar-ring" :style="{ '--progress': levelProgress + '%' }">
          <img :src="userInfo.avatar || '/default-avatar.png'" :alt="userInfo.name" class="level-card__avatar-image" />
          <div class="level-card__level-badge">
            {{ userInfo.level }}
          </div>
        </div>
      </div>

      <div class="level-card__info">
        <h3 class="level-card__name">{{ userInfo.name }}</h3>
        <div class="level-card__title">{{ getUserTitle() }}</div>

        <div class="level-card__progress">
          <div class="level-card__progress-bar">
            <div class="level-card__progress-fill" :style="{ width: levelProgress + '%' }"></div>
          </div>
          <div class="level-card__progress-text">{{ userInfo.exp }} / {{ userInfo.nextLevelExp }} EXP</div>
        </div>
      </div>

      <div class="level-card__stats">
        <div class="level-card__stat">
          <Trophy :size="16" />
          <span>{{ userInfo.totalPoints }}</span>
        </div>
        <div class="level-card__stat">
          <Flame :size="16" />
          <span>{{ learningStats.streakDays }}天</span>
        </div>
      </div>
    </div>

    <!-- 今日挑战 -->
    <div class="game-elements__daily-challenge">
      <div class="daily-challenge__header">
        <div class="daily-challenge__icon">
          <Target :size="20" />
        </div>
        <div>
          <h4>今日挑战</h4>
          <p class="daily-challenge__subtitle">完成挑战获得额外奖励</p>
        </div>
        <div class="daily-challenge__reward">
          <Coins :size="16" />
          <span>+{{ dailyChallenge.reward }}</span>
        </div>
      </div>

      <div class="daily-challenge__progress">
        <div class="daily-challenge__progress-bar">
          <div
            class="daily-challenge__progress-fill"
            :style="{ width: (dailyChallenge.current / dailyChallenge.target) * 100 + '%' }"
          ></div>
        </div>
        <div class="daily-challenge__progress-text">
          {{ dailyChallenge.current }} / {{ dailyChallenge.target }} {{ dailyChallenge.unit }}
        </div>
      </div>

      <div class="daily-challenge__description">
        {{ dailyChallenge.description }}
      </div>

      <button
        v-if="dailyChallenge.current >= dailyChallenge.target && !dailyChallenge.claimed"
        class="daily-challenge__claim-btn"
        @click="claimDailyReward"
      >
        <Gift :size="16" />
        领取奖励
      </button>
    </div>

    <!-- 连击计数器 -->
    <div v-if="comboCount > 0" class="game-elements__combo">
      <div class="combo__animation" :class="{ 'combo__animation--active': showComboAnimation }">
        <Zap :size="24" />
        <span class="combo__count">{{ comboCount }}</span>
        <span class="combo__text">连击!</span>
      </div>

      <div class="combo__multiplier">经验加成: {{ comboMultiplier }}x</div>
    </div>

    <!-- 成就通知 -->
    <Transition name="achievement" appear>
      <div v-if="showAchievementNotification && currentAchievement" class="game-elements__achievement-notification">
        <div class="achievement-notification__content">
          <div class="achievement-notification__icon">
            <component :is="currentAchievement.icon" :size="32" />
          </div>
          <div class="achievement-notification__info">
            <div class="achievement-notification__title">🎉 成就解锁!</div>
            <div class="achievement-notification__name">
              {{ currentAchievement.title }}
            </div>
            <div class="achievement-notification__description">
              {{ currentAchievement.description }}
            </div>
            <div class="achievement-notification__reward">+{{ currentAchievement.points }} 积分</div>
          </div>
          <button class="achievement-notification__close" @click="dismissAchievement">
            <X :size="16" />
          </button>
        </div>
      </div>
    </Transition>

    <!-- 积分飞行动画 -->
    <div class="game-elements__floating-points">
      <Transition v-for="point in floatingPoints" :key="point.id" name="points">
        <div v-if="point" class="floating-points__item" :style="point.style">+{{ point.value }}</div>
      </Transition>
    </div>

    <!-- 技能升级通知 -->
    <Transition name="skill-up">
      <div v-if="showSkillUpNotification && currentSkillUp" class="game-elements__skill-up">
        <div class="skill-up__content">
          <div class="skill-up__icon">
            <TrendingUp :size="24" />
          </div>
          <div class="skill-up__info">
            <div class="skill-up__title">技能提升!</div>
            <div class="skill-up__skill">{{ currentSkillUp.name }}</div>
            <div class="skill-up__progress">{{ currentSkillUp.oldProgress }}% → {{ currentSkillUp.newProgress }}%</div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 等级提升特效 -->
    <Transition name="level-up">
      <div v-if="showLevelUpEffect" class="game-elements__level-up-effect">
        <div class="level-up-effect__content">
          <div class="level-up-effect__icon">
            <Crown :size="48" />
          </div>
          <div class="level-up-effect__text">
            <div class="level-up-effect__title">等级提升!</div>
            <div class="level-up-effect__level">Lv.{{ userInfo.level }}</div>
            <div class="level-up-effect__subtitle">{{ getUserTitle() }}</div>
          </div>
          <div class="level-up-effect__particles">
            <div v-for="i in 12" :key="i" class="level-up-effect__particle"></div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 学习统计小部件 -->
    <div class="game-elements__stats-widget">
      <div class="stats-widget__item">
        <div class="stats-widget__icon">
          <BookOpen :size="16" />
        </div>
        <div class="stats-widget__info">
          <div class="stats-widget__value">{{ learningStats.completedQuestions }}</div>
          <div class="stats-widget__label">题目完成</div>
        </div>
      </div>

      <div class="stats-widget__item">
        <div class="stats-widget__icon">
          <Clock :size="16" />
        </div>
        <div class="stats-widget__info">
          <div class="stats-widget__value">{{ Math.round(learningStats.studyHours) }}h</div>
          <div class="stats-widget__label">学习时长</div>
        </div>
      </div>

      <div class="stats-widget__item">
        <div class="stats-widget__icon">
          <Target :size="16" />
        </div>
        <div class="stats-widget__info">
          <div class="stats-widget__value">{{ learningStats.correctRate }}%</div>
          <div class="stats-widget__label">正确率</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  Trophy,
  Promotion as Flame,
  Aim as Target,
  Coin as Coins,
  Present as Gift,
  Lightning as Zap,
  Close as X,
  TrendCharts as TrendingUp,
  Medal as Crown,
  Reading as BookOpen,
  Timer as Clock,
} from '@element-plus/icons-vue'
import { useLearningStore } from '../stores/learning'

interface FloatingPoint {
  id: number
  value: number
  style: {
    left: string
    top: string
  }
}

interface SkillUpNotification {
  name: string
  oldProgress: number
  newProgress: number
}

const learningStore = useLearningStore()
const { userInfo, learningStats, achievements } = learningStore

// 响应式数据
const comboCount = ref(0)
const comboMultiplier = ref(1)
const showComboAnimation = ref(false)
const showAchievementNotification = ref(false)
const currentAchievement = ref<any>(null)
const showSkillUpNotification = ref(false)
const currentSkillUp = ref<SkillUpNotification | null>(null)
const showLevelUpEffect = ref(false)
const floatingPoints = ref<FloatingPoint[]>([])
const pointIdCounter = ref(0)

// 今日挑战数据
const dailyChallenge = ref({
  id: 'daily-practice',
  title: '每日练习',
  description: '完成5道SQL练习题',
  target: 5,
  current: 2,
  unit: '题',
  reward: 100,
  claimed: false,
})

// 计算属性
const levelProgress = computed(() => {
  return Math.round((userInfo.exp / userInfo.nextLevelExp) * 100)
})

// 方法
const getUserTitle = () => {
  const level = userInfo.level
  if (level >= 50) return 'SQL大师'
  if (level >= 30) return 'SQL专家'
  if (level >= 20) return 'SQL高手'
  if (level >= 10) return 'SQL进阶者'
  if (level >= 5) return 'SQL学习者'
  return 'SQL新手'
}

const addPoints = (points: number, x = 50, y = 50) => {
  // 添加积分到用户总分
  learningStore.addExperience(points)

  // 创建飞行积分动画
  const floatingPoint: FloatingPoint = {
    id: pointIdCounter.value++,
    value: points,
    style: {
      left: (x || Math.random() * 100) + '%',
      top: (y || Math.random() * 100) + '%',
    },
  }

  floatingPoints.value.push(floatingPoint)

  // 3秒后移除
  setTimeout(() => {
    const index = floatingPoints.value.findIndex(p => p.id === floatingPoint.id)
    if (index > -1) {
      floatingPoints.value.splice(index, 1)
    }
  }, 3000)

  // 更新连击
  updateCombo()
}

const updateCombo = () => {
  comboCount.value++
  comboMultiplier.value = Math.min(3, 1 + Math.floor(comboCount.value / 5) * 0.5)

  showComboAnimation.value = true
  setTimeout(() => {
    showComboAnimation.value = false
  }, 1000)

  // 连击超时重置
  clearTimeout(comboTimeout.value || undefined)
  comboTimeout.value = setTimeout(() => {
    comboCount.value = 0
    comboMultiplier.value = 1
  }, 10000)
}

const comboTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

const showAchievement = (achievement: { icon: string; title: string; description: string; points: number }) => {
  currentAchievement.value = achievement as any
  showAchievementNotification.value = true

  // 5秒后自动消失
  setTimeout(() => {
    if (showAchievementNotification.value) {
      dismissAchievement()
    }
  }, 5000)
}

const dismissAchievement = () => {
  showAchievementNotification.value = false
  setTimeout(() => {
    currentAchievement.value = null
  }, 300)
}

const showSkillUp = (skillName: string, oldProgress: number, newProgress: number) => {
  currentSkillUp.value = {
    name: skillName,
    oldProgress,
    newProgress,
  }
  showSkillUpNotification.value = true

  setTimeout(() => {
    showSkillUpNotification.value = false
    setTimeout(() => {
      currentSkillUp.value = null
    }, 300)
  }, 3000)
}

const triggerLevelUpEffect = () => {
  showLevelUpEffect.value = true

  setTimeout(() => {
    showLevelUpEffect.value = false
  }, 4000)
}

const claimDailyReward = () => {
  if (dailyChallenge.value.current >= dailyChallenge.value.target && !dailyChallenge.value.claimed) {
    dailyChallenge.value.claimed = true
    addPoints(dailyChallenge.value.reward)

    // 显示奖励获得提示
    showAchievement({
      icon: 'Gift',
      title: '每日挑战完成',
      description: `获得 ${dailyChallenge.value.reward} 积分奖励`,
      points: dailyChallenge.value.reward,
    })
  }
}

// 暴露方法给父组件
defineExpose({
  addPoints,
  showAchievement,
  showSkillUp,
  triggerLevelUpEffect,
  updateCombo,
})

// 生命周期
onMounted(() => {
  // 监听成就解锁
  const unlockedAchievements = achievements.filter((a: any) => a.isNew)
  unlockedAchievements.forEach((achievement: any) => {
    setTimeout(() => {
      showAchievement(achievement)
      learningStore.markAchievementAsRead(achievement.id)
    }, 1000)
  })
})

onUnmounted(() => {
  if (comboTimeout.value) {
    clearTimeout(comboTimeout.value)
  }
})
</script>

<style scoped>
.game-elements {
  @apply space-y-4;
}

/* 等级卡片 */
.game-elements__level-card {
  @apply bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl flex items-center gap-4;
}

.level-card__avatar {
  @apply relative;
}

.level-card__avatar-ring {
  @apply relative w-16 h-16 rounded-full p-1;
  background: conic-gradient(from 0deg, #10b981 0%, #10b981 var(--progress), #ffffff20 var(--progress), #ffffff20 100%);
}

.level-card__avatar-image {
  @apply w-full h-full rounded-full object-cover bg-white;
}

.level-card__level-badge {
  @apply absolute -bottom-1 -right-1 bg-yellow-400 text-yellow-900 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center;
}

.level-card__info {
  @apply flex-1;
}

.level-card__name {
  @apply text-lg font-bold;
}

.level-card__title {
  @apply text-sm opacity-90;
}

.level-card__progress {
  @apply mt-2;
}

.level-card__progress-bar {
  @apply w-full h-2 bg-white/20 rounded-full overflow-hidden;
}

.level-card__progress-fill {
  @apply h-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-500;
}

.level-card__progress-text {
  @apply text-xs mt-1 opacity-90;
}

.level-card__stats {
  @apply flex flex-col gap-2;
}

.level-card__stat {
  @apply flex items-center gap-2 text-sm;
}

/* 今日挑战 */
.game-elements__daily-challenge {
  @apply bg-white border border-gray-200 rounded-lg p-4;
}

.daily-challenge__header {
  @apply flex items-center gap-3 mb-3;
}

.daily-challenge__icon {
  @apply w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center;
}

.daily-challenge__header h4 {
  @apply font-semibold text-gray-900 flex-1;
}

.daily-challenge__subtitle {
  @apply text-sm text-gray-500;
}

.daily-challenge__reward {
  @apply flex items-center gap-1 text-sm font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded;
}

.daily-challenge__progress {
  @apply mb-3;
}

.daily-challenge__progress-bar {
  @apply w-full h-2 bg-gray-200 rounded-full overflow-hidden;
}

.daily-challenge__progress-fill {
  @apply h-full bg-gradient-to-r from-orange-400 to-red-400 transition-all duration-500;
}

.daily-challenge__progress-text {
  @apply text-sm text-gray-600 mt-1;
}

.daily-challenge__description {
  @apply text-sm text-gray-700 mb-3;
}

.daily-challenge__claim-btn {
  @apply w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:from-green-600 hover:to-emerald-600 transition-all;
}

/* 连击计数器 */
.game-elements__combo {
  @apply fixed top-20 right-4 z-50;
}

.combo__animation {
  @apply bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full flex items-center gap-2 font-bold shadow-lg;
  transform: scale(1);
  transition: transform 0.3s ease;
}

.combo__animation--active {
  transform: scale(1.2);
  animation: pulse 0.5s ease-in-out;
}

.combo__count {
  @apply text-xl;
}

.combo__text {
  @apply text-sm;
}

.combo__multiplier {
  @apply text-xs text-center mt-1 text-orange-600 font-medium;
}

/* 成就通知 */
.game-elements__achievement-notification {
  @apply fixed top-4 right-4 z-50 max-w-sm;
}

.achievement-notification__content {
  @apply bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg shadow-xl flex items-start gap-3;
}

.achievement-notification__icon {
  @apply text-yellow-300;
}

.achievement-notification__info {
  @apply flex-1;
}

.achievement-notification__title {
  @apply font-bold text-lg;
}

.achievement-notification__name {
  @apply font-semibold;
}

.achievement-notification__description {
  @apply text-sm opacity-90 mt-1;
}

.achievement-notification__reward {
  @apply text-sm font-medium text-yellow-300 mt-1;
}

.achievement-notification__close {
  @apply text-white/70 hover:text-white transition-colors;
}

/* 飞行积分 */
.game-elements__floating-points {
  @apply fixed inset-0 pointer-events-none z-40;
}

.floating-points__item {
  @apply absolute text-green-500 font-bold text-lg;
  animation: float-up 3s ease-out forwards;
}

/* 技能升级通知 */
.game-elements__skill-up {
  @apply fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50;
}

.skill-up__content {
  @apply bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-xl shadow-xl flex items-center gap-4;
}

.skill-up__icon {
  @apply text-yellow-300;
}

.skill-up__title {
  @apply font-bold text-xl;
}

.skill-up__skill {
  @apply font-semibold text-lg;
}

.skill-up__progress {
  @apply text-sm opacity-90;
}

/* 等级提升特效 */
.game-elements__level-up-effect {
  @apply fixed inset-0 bg-black/50 flex items-center justify-center z-50;
}

.level-up-effect__content {
  @apply relative bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white p-8 rounded-2xl text-center;
}

.level-up-effect__icon {
  @apply text-yellow-200 mb-4;
}

.level-up-effect__title {
  @apply text-3xl font-bold mb-2;
}

.level-up-effect__level {
  @apply text-5xl font-black mb-2;
}

.level-up-effect__subtitle {
  @apply text-xl opacity-90;
}

.level-up-effect__particles {
  @apply absolute inset-0;
}

.level-up-effect__particle {
  @apply absolute w-2 h-2 bg-yellow-300 rounded-full;
  animation: particle 2s ease-out infinite;
}

.level-up-effect__particle:nth-child(1) {
  animation-delay: 0s;
  top: 20%;
  left: 20%;
}
.level-up-effect__particle:nth-child(2) {
  animation-delay: 0.2s;
  top: 30%;
  left: 80%;
}
.level-up-effect__particle:nth-child(3) {
  animation-delay: 0.4s;
  top: 70%;
  left: 10%;
}
.level-up-effect__particle:nth-child(4) {
  animation-delay: 0.6s;
  top: 80%;
  left: 90%;
}
.level-up-effect__particle:nth-child(5) {
  animation-delay: 0.8s;
  top: 10%;
  left: 50%;
}
.level-up-effect__particle:nth-child(6) {
  animation-delay: 1s;
  top: 90%;
  left: 50%;
}
.level-up-effect__particle:nth-child(7) {
  animation-delay: 1.2s;
  top: 50%;
  left: 10%;
}
.level-up-effect__particle:nth-child(8) {
  animation-delay: 1.4s;
  top: 50%;
  left: 90%;
}
.level-up-effect__particle:nth-child(9) {
  animation-delay: 1.6s;
  top: 40%;
  left: 30%;
}
.level-up-effect__particle:nth-child(10) {
  animation-delay: 1.8s;
  top: 60%;
  left: 70%;
}
.level-up-effect__particle:nth-child(11) {
  animation-delay: 2s;
  top: 25%;
  left: 60%;
}
.level-up-effect__particle:nth-child(12) {
  animation-delay: 2.2s;
  top: 75%;
  left: 40%;
}

/* 统计小部件 */
.game-elements__stats-widget {
  @apply bg-white border border-gray-200 rounded-lg p-4 grid grid-cols-3 gap-4;
}

.stats-widget__item {
  @apply text-center;
}

.stats-widget__icon {
  @apply w-8 h-8 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center mx-auto mb-2;
}

.stats-widget__value {
  @apply text-lg font-bold text-gray-900;
}

.stats-widget__label {
  @apply text-xs text-gray-500;
}

/* 动画 */
@keyframes pulse {
  0%,
  100% {
    transform: scale(1.2);
  }
  50% {
    transform: scale(1.4);
  }
}

@keyframes float-up {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-100px);
  }
}

@keyframes particle {
  0% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: scale(0) rotate(360deg);
  }
}

/* 过渡动画 */
.achievement-enter-active,
.achievement-leave-active {
  transition: all 0.3s ease;
}

.achievement-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.achievement-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.points-enter-active {
  transition: all 3s ease-out;
}

.points-enter-from {
  opacity: 0;
  transform: translateY(0);
}

.skill-up-enter-active,
.skill-up-leave-active {
  transition: all 0.3s ease;
}

.skill-up-enter-from,
.skill-up-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}

.level-up-enter-active {
  transition: all 0.5s ease;
}

.level-up-leave-active {
  transition: all 0.3s ease;
}

.level-up-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.level-up-leave-to {
  opacity: 0;
  transform: scale(1.2);
}

@media (max-width: 768px) {
  .game-elements__level-card {
    @apply flex-col text-center;
  }

  .level-card__stats {
    @apply flex-row justify-center;
  }

  .game-elements__combo {
    @apply top-16 right-2;
  }

  .game-elements__achievement-notification {
    @apply right-2 left-2 max-w-none;
  }

  .game-elements__stats-widget {
    @apply grid-cols-1 gap-2;
  }
}
</style>
