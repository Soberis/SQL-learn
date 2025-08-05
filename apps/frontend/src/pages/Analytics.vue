<template>
  <div class="analytics">
    <!-- 页面头部 -->
    <div class="analytics__header">
      <div class="analytics__header-content">
        <div class="analytics__breadcrumb">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>学习分析中心</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="analytics__header-actions">
          <el-button-group>
            <el-button :icon="Refresh" @click="refreshData">刷新数据</el-button>
            <el-button :icon="Download" @click="exportReport">导出报告</el-button>
            <el-button :icon="Share" @click="shareProgress">分享进度</el-button>
          </el-button-group>
        </div>
      </div>
    </div>

    <div class="analytics__content">
      <!-- 时间范围选择 -->
      <div class="analytics__time-filter">
        <el-card shadow="hover">
          <div class="analytics__filter-content">
            <div class="analytics__filter-label">
              <el-icon><Calendar /></el-icon>
              <span>时间范围</span>
            </div>

            <el-radio-group v-model="timeRange" @change="handleTimeRangeChange">
              <el-radio-button label="7d">最近7天</el-radio-button>
              <el-radio-button label="30d">最近30天</el-radio-button>
              <el-radio-button label="90d">最近3个月</el-radio-button>
              <el-radio-button label="1y">最近1年</el-radio-button>
              <el-radio-button label="all">全部</el-radio-button>
            </el-radio-group>

            <el-date-picker
              v-model="customDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleCustomDateChange"
            />
          </div>
        </el-card>
      </div>

      <!-- 核心指标卡片 -->
      <div class="analytics__metrics">
        <el-row :gutter="16">
          <el-col v-for="metric in coreMetrics" :key="metric.key" :xs="12" :sm="6">
            <el-card class="analytics__metric-card" shadow="hover">
              <div class="analytics__metric-content">
                <div class="analytics__metric-icon" :class="`analytics__metric-icon--${metric.type}`">
                  <el-icon><component :is="metric.icon" /></el-icon>
                </div>
                <div class="analytics__metric-info">
                  <div class="analytics__metric-value">{{ metric.value }}</div>
                  <div class="analytics__metric-label">{{ metric.label }}</div>
                  <div class="analytics__metric-change" :class="`analytics__metric-change--${metric.trend}`">
                    <el-icon>
                      <component
                        :is="metric.trend === 'up' ? 'TrendCharts' : metric.trend === 'down' ? 'Bottom' : 'Minus'"
                      />
                    </el-icon>
                    <span>{{ metric.change }}</span>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <el-row :gutter="16">
        <!-- 左侧图表区域 -->
        <el-col :xs="24" :lg="16">
          <div class="analytics__charts">
            <!-- 学习进度趋势 -->
            <el-card class="analytics__chart-card" shadow="hover">
              <template #header>
                <div class="analytics__chart-header">
                  <h3 class="analytics__chart-title">
                    <el-icon><TrendCharts /></el-icon>
                    学习进度趋势
                  </h3>
                  <el-button-group size="small">
                    <el-button
                      :type="progressChartType === 'line' ? 'primary' : 'default'"
                      @click="progressChartType = 'line'"
                    >
                      线图
                    </el-button>
                    <el-button
                      :type="progressChartType === 'bar' ? 'primary' : 'default'"
                      @click="progressChartType = 'bar'"
                    >
                      柱图
                    </el-button>
                  </el-button-group>
                </div>
              </template>

              <div class="analytics__chart-container">
                <div ref="progressChartRef" class="analytics__chart" style="height: 300px"></div>
              </div>
            </el-card>

            <!-- 技能掌握雷达图 -->
            <el-card class="analytics__chart-card" shadow="hover">
              <template #header>
                <h3 class="analytics__chart-title">
                  <el-icon><Radar /></el-icon>
                  技能掌握程度
                </h3>
              </template>

              <div class="analytics__chart-container">
                <div ref="skillRadarRef" class="analytics__chart" style="height: 350px"></div>
              </div>
            </el-card>

            <!-- 练习正确率分析 -->
            <el-card class="analytics__chart-card" shadow="hover">
              <template #header>
                <div class="analytics__chart-header">
                  <h3 class="analytics__chart-title">
                    <el-icon><PieChart /></el-icon>
                    练习正确率分析
                  </h3>
                  <el-select v-model="accuracyAnalysisType" size="small" style="width: 120px">
                    <el-option label="按难度" value="difficulty" />
                    <el-option label="按类型" value="type" />
                    <el-option label="按时间" value="time" />
                  </el-select>
                </div>
              </template>

              <div class="analytics__chart-container">
                <div ref="accuracyChartRef" class="analytics__chart" style="height: 300px"></div>
              </div>
            </el-card>

            <!-- 学习时间分布 -->
            <el-card class="analytics__chart-card" shadow="hover">
              <template #header>
                <h3 class="analytics__chart-title">
                  <el-icon><Clock /></el-icon>
                  学习时间分布
                </h3>
              </template>

              <div class="analytics__chart-container">
                <div ref="timeDistributionRef" class="analytics__chart" style="height: 300px"></div>
              </div>
            </el-card>
          </div>
        </el-col>

        <!-- 右侧信息面板 -->
        <el-col :xs="24" :lg="8">
          <div class="analytics__sidebar">
            <!-- 成就系统 -->
            <el-card class="analytics__achievement-card" shadow="hover">
              <template #header>
                <div class="analytics__card-header">
                  <h3 class="analytics__card-title">
                    <el-icon><Trophy /></el-icon>
                    成就系统
                  </h3>
                  <el-button size="small" text @click="viewAllAchievements">查看全部</el-button>
                </div>
              </template>

              <div class="analytics__achievements">
                <div class="analytics__achievement-progress">
                  <div class="analytics__achievement-stats">
                    <span class="analytics__achievement-count">{{ unlockedAchievements }}/{{ totalAchievements }}</span>
                    <span class="analytics__achievement-label">已解锁成就</span>
                  </div>
                  <el-progress :percentage="achievementProgress" :stroke-width="8" :show-text="false" />
                </div>

                <div class="analytics__achievement-list">
                  <div
                    v-for="achievement in recentAchievements"
                    :key="achievement.id"
                    class="analytics__achievement-item"
                    :class="{ 'analytics__achievement-item--unlocked': achievement.unlocked }"
                  >
                    <div class="analytics__achievement-icon">
                      <el-icon><component :is="achievement.icon" /></el-icon>
                    </div>
                    <div class="analytics__achievement-info">
                      <div class="analytics__achievement-name">{{ achievement.name }}</div>
                      <div class="analytics__achievement-desc">{{ achievement.description }}</div>
                      <div v-if="achievement.unlocked" class="analytics__achievement-date">
                        {{ achievement.unlockedAt ? formatTimestamp(achievement.unlockedAt, 'date') : '' }}
                      </div>
                      <div v-else class="analytics__achievement-progress-text">
                        {{ achievement.progress }}/{{ achievement.target }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>

            <!-- 学习排行榜 -->
            <el-card class="analytics__ranking-card" shadow="hover">
              <template #header>
                <div class="analytics__card-header">
                  <h3 class="analytics__card-title">
                    <el-icon><Ranking /></el-icon>
                    学习排行榜
                  </h3>
                  <el-select v-model="rankingType" size="small" style="width: 100px">
                    <el-option label="周榜" value="week" />
                    <el-option label="月榜" value="month" />
                    <el-option label="总榜" value="all" />
                  </el-select>
                </div>
              </template>

              <div class="analytics__ranking">
                <div class="analytics__my-ranking">
                  <div class="analytics__ranking-item analytics__ranking-item--me">
                    <div class="analytics__ranking-position">#{{ myRanking.position }}</div>
                    <div class="analytics__ranking-avatar">
                      <el-avatar :size="32" :src="myRanking.avatar" />
                    </div>
                    <div class="analytics__ranking-info">
                      <div class="analytics__ranking-name">{{ myRanking.name }} (我)</div>
                      <div class="analytics__ranking-score">{{ myRanking.score }}分</div>
                    </div>
                  </div>
                </div>

                <div class="analytics__ranking-list">
                  <div v-for="(user, index) in topRankings" :key="user.id" class="analytics__ranking-item">
                    <div class="analytics__ranking-position" :class="`analytics__ranking-position--${index + 1}`">
                      #{{ index + 1 }}
                    </div>
                    <div class="analytics__ranking-avatar">
                      <el-avatar :size="28" :src="user.avatar" />
                    </div>
                    <div class="analytics__ranking-info">
                      <div class="analytics__ranking-name">{{ user.name }}</div>
                      <div class="analytics__ranking-score">{{ user.score }}分</div>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>

            <!-- 学习建议 -->
            <el-card class="analytics__suggestion-card" shadow="hover">
              <template #header>
                <h3 class="analytics__card-title">
                  <el-icon><Lightbulb /></el-icon>
                  学习建议
                </h3>
              </template>

              <div class="analytics__suggestions">
                <div v-for="suggestion in learningSuggestions" :key="suggestion.id" class="analytics__suggestion-item">
                  <div class="analytics__suggestion-icon" :class="`analytics__suggestion-icon--${suggestion.type}`">
                    <el-icon><component :is="suggestion.icon" /></el-icon>
                  </div>
                  <div class="analytics__suggestion-content">
                    <div class="analytics__suggestion-title">{{ suggestion.title }}</div>
                    <div class="analytics__suggestion-desc">{{ suggestion.description }}</div>
                    <el-button
                      v-if="suggestion.action"
                      size="small"
                      type="primary"
                      text
                      @click="handleSuggestionAction(suggestion)"
                    >
                      {{ suggestion.actionText }}
                    </el-button>
                  </div>
                </div>
              </div>
            </el-card>

            <!-- 学习日历 -->
            <el-card class="analytics__calendar-card" shadow="hover">
              <template #header>
                <h3 class="analytics__card-title">
                  <el-icon><Calendar /></el-icon>
                  学习日历
                </h3>
              </template>

              <div class="analytics__calendar">
                <el-calendar v-model="calendarDate" :range="calendarRange">
                  <template #date-cell="{ data }">
                    <div class="analytics__calendar-cell">
                      <div class="analytics__calendar-day">
                        {{ data.day.split('-').slice(2).join('-') }}
                      </div>
                      <div
                        v-if="getStudyData(data.day)"
                        class="analytics__calendar-indicator"
                        :class="`analytics__calendar-indicator--${getStudyLevel(data.day)}`"
                      >
                        <span class="analytics__calendar-count">{{ getStudyData(data.day).count }}</span>
                      </div>
                    </div>
                  </template>
                </el-calendar>

                <div class="analytics__calendar-legend">
                  <span class="analytics__calendar-legend-label">学习强度：</span>
                  <div class="analytics__calendar-legend-items">
                    <div class="analytics__calendar-legend-item">
                      <div class="analytics__calendar-legend-color analytics__calendar-legend-color--none"></div>
                      <span>无</span>
                    </div>
                    <div class="analytics__calendar-legend-item">
                      <div class="analytics__calendar-legend-color analytics__calendar-legend-color--low"></div>
                      <span>低</span>
                    </div>
                    <div class="analytics__calendar-legend-item">
                      <div class="analytics__calendar-legend-color analytics__calendar-legend-color--medium"></div>
                      <span>中</span>
                    </div>
                    <div class="analytics__calendar-legend-item">
                      <div class="analytics__calendar-legend-color analytics__calendar-legend-color--high"></div>
                      <span>高</span>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 成就详情对话框 -->
    <el-dialog v-model="showAchievementDialog" title="成就详情" width="800px" :before-close="handleAchievementClose">
      <div class="analytics__achievement-dialog">
        <div class="analytics__achievement-categories">
          <el-button-group>
            <el-button
              v-for="category in achievementCategories"
              :key="category.id"
              :type="selectedAchievementCategory === category.id ? 'primary' : 'default'"
              @click="selectedAchievementCategory = category.id"
            >
              {{ category.name }}
            </el-button>
          </el-button-group>
        </div>

        <div class="analytics__achievement-grid">
          <div
            v-for="achievement in filteredAchievements"
            :key="achievement.id"
            class="analytics__achievement-card"
            :class="{ 'analytics__achievement-card--unlocked': achievement.unlocked }"
          >
            <div class="analytics__achievement-card-icon">
              <el-icon><component :is="achievement.icon" /></el-icon>
            </div>
            <div class="analytics__achievement-card-info">
              <h4 class="analytics__achievement-card-name">{{ achievement.name }}</h4>
              <p class="analytics__achievement-card-desc">{{ achievement.description }}</p>
              <div class="analytics__achievement-card-progress">
                <el-progress
                  :percentage="(achievement.progress / achievement.target) * 100"
                  :stroke-width="6"
                  :show-text="false"
                />
                <span class="analytics__achievement-card-progress-text">
                  {{ achievement.progress }}/{{ achievement.target }}
                </span>
              </div>
              <div v-if="achievement.unlocked" class="analytics__achievement-card-date">
                解锁时间：{{ achievement.unlockedAt ? formatTimestamp(achievement.unlockedAt, 'date') : '' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Refresh, Download, Share, Calendar, TrendCharts, PieChart, Clock, Trophy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { formatTimestamp } from '../utils'

/**
 * 学习分析中心页面
 * 展示用户学习数据分析、成就系统、排行榜等
 */

// 状态管理
// const learningStore = useLearningStore()

// 响应式数据
const timeRange = ref('30d')
const customDateRange = ref<[string, string] | null>(null)
const progressChartType = ref<'line' | 'bar'>('line')
const accuracyAnalysisType = ref('difficulty')
const rankingType = ref('week')
const calendarDate = ref(new Date())
const showAchievementDialog = ref(false)
const selectedAchievementCategory = ref('learning')

// 图表引用
const progressChartRef = ref<HTMLElement>()
const skillRadarRef = ref<HTMLElement>()
const accuracyChartRef = ref<HTMLElement>()
const timeDistributionRef = ref<HTMLElement>()

// 图表实例
let progressChart: echarts.ECharts | null = null
let skillRadarChart: echarts.ECharts | null = null
let accuracyChart: echarts.ECharts | null = null
let timeDistributionChart: echarts.ECharts | null = null

// 核心指标数据
const coreMetrics = ref([
  {
    key: 'totalStudyTime',
    label: '总学习时长',
    value: '156小时',
    change: '+12%',
    trend: 'up',
    type: 'primary',
    icon: 'Clock',
  },
  {
    key: 'completedCourses',
    label: '完成课程',
    value: '24',
    change: '+3',
    trend: 'up',
    type: 'success',
    icon: 'Medal',
  },
  {
    key: 'practiceAccuracy',
    label: '练习正确率',
    value: '87%',
    change: '+5%',
    trend: 'up',
    type: 'warning',
    icon: 'Target',
  },
  {
    key: 'currentStreak',
    label: '连续学习',
    value: '15天',
    change: '0',
    trend: 'stable',
    type: 'info',
    icon: 'Flag',
  },
])

// 成就数据
const unlockedAchievements = ref(18)
const totalAchievements = ref(45)
const achievementProgress = computed(() => Math.round((unlockedAchievements.value / totalAchievements.value) * 100))

// 最近成就
const recentAchievements = ref([
  {
    id: 1,
    name: 'SQL新手',
    description: '完成第一个SQL查询',
    icon: 'Star',
    unlocked: true,
    unlockedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    progress: 1,
    target: 1,
  },
  {
    id: 2,
    name: '连续学习者',
    description: '连续学习7天',
    icon: 'Flag',
    unlocked: true,
    unlockedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    progress: 7,
    target: 7,
  },
  {
    id: 3,
    name: '练习达人',
    description: '完成100道练习题',
    icon: 'Target',
    unlocked: false,
    progress: 67,
    target: 100,
  },
  {
    id: 4,
    name: '知识探索者',
    description: '阅读50篇知识库文章',
    icon: 'DataAnalysis',
    unlocked: false,
    progress: 23,
    target: 50,
  },
])

// 成就分类
const achievementCategories = ref([
  { id: 'learning', name: '学习成就' },
  { id: 'practice', name: '练习成就' },
  { id: 'social', name: '社交成就' },
  { id: 'special', name: '特殊成就' },
])

// 所有成就数据
const allAchievements = ref([
  // 学习成就
  {
    id: 1,
    category: 'learning',
    name: 'SQL新手',
    description: '完成第一个SQL查询',
    icon: 'Star',
    unlocked: true,
    unlockedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    progress: 1,
    target: 1,
  },
  {
    id: 2,
    category: 'learning',
    name: '基础掌握',
    description: '完成所有基础课程',
    icon: 'Medal',
    unlocked: true,
    unlockedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    progress: 8,
    target: 8,
  },
  {
    id: 3,
    category: 'learning',
    name: '进阶学者',
    description: '完成所有进阶课程',
    icon: 'Trophy',
    unlocked: false,
    progress: 5,
    target: 12,
  },
  // 练习成就
  {
    id: 4,
    category: 'practice',
    name: '练习新手',
    description: '完成10道练习题',
    icon: 'Target',
    unlocked: true,
    unlockedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    progress: 10,
    target: 10,
  },
  {
    id: 5,
    category: 'practice',
    name: '练习达人',
    description: '完成100道练习题',
    icon: 'Flag',
    unlocked: false,
    progress: 67,
    target: 100,
  },
  // 社交成就
  {
    id: 6,
    category: 'social',
    name: '分享者',
    description: '分享5个SQL代码片段',
    icon: 'Share',
    unlocked: false,
    progress: 2,
    target: 5,
  },
  // 特殊成就
  {
    id: 7,
    category: 'special',
    name: '连续学习者',
    description: '连续学习30天',
    icon: 'Calendar',
    unlocked: false,
    progress: 15,
    target: 30,
  },
])

// 排行榜数据
const myRanking = ref({
  position: 23,
  name: '我的用户名',
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
  score: 1250,
})

const topRankings = ref([
  {
    id: 1,
    name: 'SQL大师',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    score: 3580,
  },
  {
    id: 2,
    name: '数据分析师',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    score: 3420,
  },
  {
    id: 3,
    name: '查询专家',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    score: 3180,
  },
  {
    id: 4,
    name: 'SQL新星',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    score: 2950,
  },
  {
    id: 5,
    name: '代码忍者',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    score: 2780,
  },
])

// 学习建议
const learningSuggestions = ref([
  {
    id: 1,
    type: 'warning',
    icon: 'Warning',
    title: '练习不足',
    description: '本周练习时间较少，建议增加练习量',
    action: 'practice',
    actionText: '去练习',
  },
  {
    id: 2,
    type: 'info',
    icon: 'InfoFilled',
    title: '新课程推荐',
    description: '基于你的学习进度，推荐学习"高级JOIN操作"',
    action: 'course',
    actionText: '查看课程',
  },
  {
    id: 3,
    type: 'success',
    icon: 'Star',
    title: '学习状态良好',
    description: '保持当前的学习节奏，继续加油！',
    action: null,
    actionText: '',
  },
])

// 学习日历数据
const calendarRange = computed(() => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return [start, end]
})

// 模拟学习数据
const studyCalendarData = ref<Record<string, { count: number; duration: number }>>({
  '2024-01-15': { count: 3, duration: 120 },
  '2024-01-16': { count: 5, duration: 180 },
  '2024-01-17': { count: 2, duration: 90 },
  '2024-01-18': { count: 7, duration: 240 },
  '2024-01-19': { count: 4, duration: 150 },
  '2024-01-20': { count: 1, duration: 60 },
  '2024-01-21': { count: 6, duration: 200 },
})

// 计算属性
const filteredAchievements = computed(() => {
  return allAchievements.value.filter(achievement => achievement.category === selectedAchievementCategory.value)
})

/**
 * 获取学习数据
 */
const getStudyData = (date: string) => {
  return studyCalendarData.value[date]
}

/**
 * 获取学习强度等级
 */
const getStudyLevel = (date: string): string => {
  const data = getStudyData(date)
  if (!data) return 'none'

  if (data.count >= 6) return 'high'
  if (data.count >= 3) return 'medium'
  if (data.count >= 1) return 'low'
  return 'none'
}

/**
 * 处理时间范围变化
 */
const handleTimeRangeChange = (_value: string) => {
  customDateRange.value = null
  refreshCharts()
}

/**
 * 处理自定义日期范围变化
 */
const handleCustomDateChange = (value: [string, string] | null) => {
  if (value) {
    timeRange.value = 'custom'
    refreshCharts()
  }
}

/**
 * 刷新数据
 */
const refreshData = async () => {
  ElMessage.success('数据已刷新')
  // 这里可以调用API刷新数据
  refreshCharts()
}

/**
 * 导出报告
 */
const exportReport = () => {
  ElMessage.success('报告导出功能开发中')
}

/**
 * 分享进度
 */
const shareProgress = () => {
  ElMessage.success('进度分享功能开发中')
}

/**
 * 查看所有成就
 */
const viewAllAchievements = () => {
  showAchievementDialog.value = true
}

/**
 * 关闭成就对话框
 */
const handleAchievementClose = () => {
  selectedAchievementCategory.value = 'learning'
}

/**
 * 处理建议操作
 */
const handleSuggestionAction = (suggestion: any) => {
  if (suggestion.action === 'practice') {
    // 跳转到练习页面
    ElMessage.info('跳转到练习页面')
  } else if (suggestion.action === 'course') {
    // 跳转到课程页面
    ElMessage.info('跳转到课程页面')
  }
}

/**
 * 初始化学习进度趋势图
 */
const initProgressChart = () => {
  if (!progressChartRef.value) return

  progressChart = echarts.init(progressChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      data: ['学习时长', '完成题目', '课程进度'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['1月1日', '1月2日', '1月3日', '1月4日', '1月5日', '1月6日', '1月7日'],
    },
    yAxis: [
      {
        type: 'value',
        name: '时长(分钟)',
        position: 'left',
      },
      {
        type: 'value',
        name: '数量',
        position: 'right',
      },
    ],
    series: [
      {
        name: '学习时长',
        type: progressChartType.value,
        yAxisIndex: 0,
        data: [120, 150, 90, 180, 200, 160, 140],
        itemStyle: {
          color: '#409EFF',
        },
      },
      {
        name: '完成题目',
        type: progressChartType.value,
        yAxisIndex: 1,
        data: [5, 8, 3, 12, 15, 10, 7],
        itemStyle: {
          color: '#67C23A',
        },
      },
      {
        name: '课程进度',
        type: 'line',
        yAxisIndex: 1,
        data: [2, 3, 3, 4, 5, 6, 6],
        itemStyle: {
          color: '#E6A23C',
        },
      },
    ],
  }

  progressChart.setOption(option)
}

/**
 * 初始化技能雷达图
 */
const initSkillRadarChart = () => {
  if (!skillRadarRef.value) return

  skillRadarChart = echarts.init(skillRadarRef.value)

  const option = {
    tooltip: {},
    radar: {
      indicator: [
        { name: '基础查询', max: 100 },
        { name: '连接操作', max: 100 },
        { name: '聚合函数', max: 100 },
        { name: '子查询', max: 100 },
        { name: '窗口函数', max: 100 },
        { name: '性能优化', max: 100 },
      ],
      radius: 120,
    },
    series: [
      {
        name: '技能掌握度',
        type: 'radar',
        data: [
          {
            value: [90, 75, 85, 60, 45, 30],
            name: '当前水平',
            itemStyle: {
              color: '#409EFF',
            },
            areaStyle: {
              opacity: 0.3,
            },
          },
        ],
      },
    ],
  }

  skillRadarChart.setOption(option)
}

/**
 * 初始化正确率分析图
 */
const initAccuracyChart = () => {
  if (!accuracyChartRef.value) return

  accuracyChart = echarts.init(accuracyChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: '正确率分析',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: 87, name: '正确', itemStyle: { color: '#67C23A' } },
          { value: 13, name: '错误', itemStyle: { color: '#F56C6C' } },
        ],
      },
    ],
  }

  accuracyChart.setOption(option)
}

/**
 * 初始化时间分布图
 */
const initTimeDistributionChart = () => {
  if (!timeDistributionRef.value) return

  timeDistributionChart = echarts.init(timeDistributionRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: [
        '00:00',
        '02:00',
        '04:00',
        '06:00',
        '08:00',
        '10:00',
        '12:00',
        '14:00',
        '16:00',
        '18:00',
        '20:00',
        '22:00',
      ],
    },
    yAxis: {
      type: 'value',
      name: '学习时长(分钟)',
    },
    series: [
      {
        name: '学习时长',
        type: 'bar',
        data: [0, 0, 0, 0, 15, 30, 25, 45, 60, 80, 120, 90],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#409EFF' },
            { offset: 1, color: '#67C23A' },
          ]),
        },
      },
    ],
  }

  timeDistributionChart.setOption(option)
}

/**
 * 刷新所有图表
 */
const refreshCharts = () => {
  nextTick(() => {
    progressChart?.resize()
    skillRadarChart?.resize()
    accuracyChart?.resize()
    timeDistributionChart?.resize()
  })
}

/**
 * 监听图表类型变化
 */
watch(progressChartType, () => {
  initProgressChart()
})

watch(accuracyAnalysisType, () => {
  initAccuracyChart()
})

// 生命周期
onMounted(() => {
  nextTick(() => {
    initProgressChart()
    initSkillRadarChart()
    initAccuracyChart()
    initTimeDistributionChart()
  })

  // 监听窗口大小变化
  const handleResize = () => {
    refreshCharts()
  }

  window.addEventListener('resize', handleResize)

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)

    // 销毁图表实例
    progressChart?.dispose()
    skillRadarChart?.dispose()
    accuracyChart?.dispose()
    timeDistributionChart?.dispose()
  })
})
</script>

<style scoped>
.analytics {
  min-height: 100vh;
  background: var(--el-bg-color-page);
}

.analytics__header {
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
  padding: 16px 24px;
}

.analytics__header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.analytics__breadcrumb {
  flex: 1;
}

.analytics__header-actions {
  display: flex;
  gap: 12px;
}

.analytics__content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 时间筛选 */
.analytics__time-filter {
  border-radius: 8px;
}

.analytics__filter-content {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.analytics__filter-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}

/* 核心指标 */
.analytics__metrics {
  margin-bottom: 8px;
}

.analytics__metric-card {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.analytics__metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.analytics__metric-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.analytics__metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.analytics__metric-icon--primary {
  background: linear-gradient(135deg, #409eff, #66b1ff);
}

.analytics__metric-icon--success {
  background: linear-gradient(135deg, #67c23a, #85ce61);
}

.analytics__metric-icon--warning {
  background: linear-gradient(135deg, #e6a23c, #eebc5b);
}

.analytics__metric-icon--info {
  background: linear-gradient(135deg, #909399, #a6a9ad);
}

.analytics__metric-info {
  flex: 1;
}

.analytics__metric-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  line-height: 1.2;
}

.analytics__metric-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin: 4px 0;
}

.analytics__metric-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
}

.analytics__metric-change--up {
  color: var(--el-color-success);
}

.analytics__metric-change--down {
  color: var(--el-color-danger);
}

.analytics__metric-change--stable {
  color: var(--el-text-color-regular);
}

/* 图表区域 */
.analytics__charts {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.analytics__chart-card {
  border-radius: 8px;
}

.analytics__chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.analytics__chart-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--el-text-color-primary);
}

.analytics__chart-container {
  padding: 16px 0;
}

.analytics__chart {
  width: 100%;
}

/* 侧边栏 */
.analytics__sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.analytics__card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: var(--el-text-color-primary);
}

.analytics__card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 成就系统 */
.analytics__achievement-card {
  border-radius: 8px;
}

.analytics__achievements {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.analytics__achievement-progress {
  text-align: center;
}

.analytics__achievement-stats {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}

.analytics__achievement-count {
  font-size: 24px;
  font-weight: 700;
  color: var(--el-color-primary);
}

.analytics__achievement-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.analytics__achievement-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.analytics__achievement-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  transition: all 0.3s ease;
}

.analytics__achievement-item--unlocked {
  background: var(--el-color-success-light-9);
  border-color: var(--el-color-success-light-5);
}

.analytics__achievement-item:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.analytics__achievement-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: var(--el-color-primary-light-8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-color-primary);
  font-size: 16px;
}

.analytics__achievement-item--unlocked .analytics__achievement-icon {
  background: var(--el-color-success);
  color: white;
}

.analytics__achievement-info {
  flex: 1;
  min-width: 0;
}

.analytics__achievement-name {
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 2px;
}

.analytics__achievement-desc {
  font-size: 12px;
  color: var(--el-text-color-regular);
  line-height: 1.4;
  margin-bottom: 4px;
}

.analytics__achievement-date {
  font-size: 11px;
  color: var(--el-color-success);
}

.analytics__achievement-progress-text {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

/* 排行榜 */
.analytics__ranking-card {
  border-radius: 8px;
}

.analytics__ranking {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.analytics__my-ranking {
  padding: 12px;
  background: var(--el-color-primary-light-9);
  border-radius: 8px;
  border: 1px solid var(--el-color-primary-light-5);
}

.analytics__ranking-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.analytics__ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.analytics__ranking-item:hover {
  background: var(--el-bg-color-page);
}

.analytics__ranking-item--me {
  background: transparent;
}

.analytics__ranking-item--me:hover {
  background: transparent;
}

.analytics__ranking-position {
  width: 24px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
}

.analytics__ranking-position--1 {
  color: #ffd700;
}

.analytics__ranking-position--2 {
  color: #c0c0c0;
}

.analytics__ranking-position--3 {
  color: #cd7f32;
}

.analytics__ranking-avatar {
  flex-shrink: 0;
}

.analytics__ranking-info {
  flex: 1;
  min-width: 0;
}

.analytics__ranking-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
  font-size: 13px;
  margin-bottom: 2px;
}

.analytics__ranking-score {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

/* 学习建议 */
.analytics__suggestion-card {
  border-radius: 8px;
}

.analytics__suggestions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.analytics__suggestion-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

.analytics__suggestion-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.analytics__suggestion-icon--warning {
  background: var(--el-color-warning-light-8);
  color: var(--el-color-warning);
}

.analytics__suggestion-icon--info {
  background: var(--el-color-info-light-8);
  color: var(--el-color-info);
}

.analytics__suggestion-icon--success {
  background: var(--el-color-success-light-8);
  color: var(--el-color-success);
}

.analytics__suggestion-content {
  flex: 1;
  min-width: 0;
}

.analytics__suggestion-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
  font-size: 14px;
}

.analytics__suggestion-desc {
  font-size: 13px;
  color: var(--el-text-color-regular);
  line-height: 1.4;
  margin-bottom: 8px;
}

/* 学习日历 */
.analytics__calendar-card {
  border-radius: 8px;
}

.analytics__calendar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.analytics__calendar-cell {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.analytics__calendar-day {
  font-size: 12px;
  color: var(--el-text-color-primary);
}

.analytics__calendar-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  color: white;
}

.analytics__calendar-indicator--low {
  background: var(--el-color-success-light-3);
}

.analytics__calendar-indicator--medium {
  background: var(--el-color-warning);
}

.analytics__calendar-indicator--high {
  background: var(--el-color-danger);
}

.analytics__calendar-count {
  font-size: 9px;
}

.analytics__calendar-legend {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.analytics__calendar-legend-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.analytics__calendar-legend-items {
  display: flex;
  gap: 8px;
}

.analytics__calendar-legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--el-text-color-regular);
}

.analytics__calendar-legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.analytics__calendar-legend-color--none {
  background: var(--el-border-color-lighter);
}

.analytics__calendar-legend-color--low {
  background: var(--el-color-success-light-3);
}

.analytics__calendar-legend-color--medium {
  background: var(--el-color-warning);
}

.analytics__calendar-legend-color--high {
  background: var(--el-color-danger);
}

/* 成就对话框 */
.analytics__achievement-dialog {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.analytics__achievement-categories {
  display: flex;
  justify-content: center;
}

.analytics__achievement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.analytics__achievement-card {
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  display: flex;
  gap: 12px;
  transition: all 0.3s ease;
}

.analytics__achievement-card--unlocked {
  background: var(--el-color-success-light-9);
  border-color: var(--el-color-success-light-5);
}

.analytics__achievement-card:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.analytics__achievement-card-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: var(--el-color-primary-light-8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-color-primary);
  font-size: 24px;
  flex-shrink: 0;
}

.analytics__achievement-card--unlocked .analytics__achievement-card-icon {
  background: var(--el-color-success);
  color: white;
}

.analytics__achievement-card-info {
  flex: 1;
  min-width: 0;
}

.analytics__achievement-card-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}

.analytics__achievement-card-desc {
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
  margin: 0 0 12px 0;
}

.analytics__achievement-card-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.analytics__achievement-card-progress-text {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
}

.analytics__achievement-card-date {
  font-size: 12px;
  color: var(--el-color-success);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .analytics__content {
    padding: 16px;
  }

  .analytics__filter-content {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .analytics__chart-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
}

@media (max-width: 768px) {
  .analytics__header-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .analytics__metric-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .analytics__achievement-grid {
    grid-template-columns: 1fr;
  }

  .analytics__calendar-legend {
    flex-direction: column;
    gap: 8px;
  }

  .analytics__calendar-legend-items {
    justify-content: center;
  }
}

/* 动画效果 */
.analytics__metric-card {
  animation: analytics-fade-in-up 0.6s ease-out;
}

.analytics__metric-card:nth-child(1) {
  animation-delay: 0.1s;
}
.analytics__metric-card:nth-child(2) {
  animation-delay: 0.2s;
}
.analytics__metric-card:nth-child(3) {
  animation-delay: 0.3s;
}
.analytics__metric-card:nth-child(4) {
  animation-delay: 0.4s;
}

@keyframes analytics-fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.analytics__chart-card {
  animation: analytics-slide-in 0.8s ease-out;
}

@keyframes analytics-slide-in {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.analytics__achievement-item {
  animation: analytics-bounce-in 0.5s ease-out;
}

@keyframes analytics-bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.analytics__ranking-item {
  animation: analytics-fade-in 0.4s ease-out;
}

@keyframes analytics-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 加载状态 */
.analytics__loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--el-text-color-placeholder);
}

/* 空状态 */
.analytics__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--el-text-color-placeholder);
}

.analytics__empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.analytics__empty-text {
  font-size: 14px;
}
</style>
