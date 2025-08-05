<template>
  <div class="project">
    <!-- 页面头部 -->
    <div class="project__header">
      <div class="project__header-content">
        <div class="project__title-section">
          <h1 class="project__title">
            <el-icon class="project__title-icon"><Suitcase /></el-icon>
            项目实战室
          </h1>
          <p class="project__subtitle">通过完整的真实项目案例，掌握SQL在实际业务中的应用</p>
        </div>
        <div class="project__progress-overview">
          <div class="project__progress-item">
            <span class="project__progress-number">{{ projectStats.completed }}</span>
            <span class="project__progress-label">已完成项目</span>
          </div>
          <div class="project__progress-item">
            <span class="project__progress-number">{{ projectStats.inProgress }}</span>
            <span class="project__progress-label">进行中</span>
          </div>
          <div class="project__progress-item">
            <span class="project__progress-number">{{ projectStats.totalHours }}</span>
            <span class="project__progress-label">学习时长(h)</span>
          </div>
        </div>
      </div>
    </div>

    <div class="project__content">
      <el-row :gutter="24">
        <!-- 左侧：项目列表 -->
        <el-col :xs="24" :lg="8">
          <!-- 项目筛选 -->
          <el-card class="project__filter-card" shadow="hover">
            <template #header>
              <div class="project__card-header">
                <h3 class="project__card-title">
                  <el-icon><Filter /></el-icon>
                  项目筛选
                </h3>
                <el-button type="primary" size="small" @click="resetFilters">重置</el-button>
              </div>
            </template>

            <div class="project__filters">
              <div class="project__filter-group">
                <label class="project__filter-label">行业领域</label>
                <el-select v-model="filters.industry" placeholder="选择行业" clearable class="project__filter-select">
                  <el-option
                    v-for="industry in industryOptions"
                    :key="industry.value"
                    :label="industry.label"
                    :value="industry.value"
                  />
                </el-select>
              </div>

              <div class="project__filter-group">
                <label class="project__filter-label">项目难度</label>
                <el-select v-model="filters.difficulty" placeholder="选择难度" clearable class="project__filter-select">
                  <el-option
                    v-for="difficulty in difficultyOptions"
                    :key="difficulty.value"
                    :label="difficulty.label"
                    :value="difficulty.value"
                  />
                </el-select>
              </div>

              <div class="project__filter-group">
                <label class="project__filter-label">项目状态</label>
                <el-radio-group v-model="filters.status" class="project__filter-radio">
                  <el-radio label="all">全部</el-radio>
                  <el-radio label="available">可开始</el-radio>
                  <el-radio label="in_progress">进行中</el-radio>
                  <el-radio label="completed">已完成</el-radio>
                </el-radio-group>
              </div>
            </div>
          </el-card>

          <!-- 项目列表 -->
          <el-card class="project__list-card" shadow="hover">
            <template #header>
              <div class="project__card-header">
                <h3 class="project__card-title">
                  <el-icon><FolderOpened /></el-icon>
                  项目列表 ({{ filteredProjects.length }})
                </h3>
              </div>
            </template>

            <div class="project__list">
              <div
                v-for="project in filteredProjects"
                :key="project.id"
                class="project__item"
                :class="{
                  'project__item--active': currentProject?.id === project.id,
                  'project__item--completed': project.status === 'completed',
                  'project__item--locked': project.status === 'locked',
                }"
                @click="selectProject(project)"
              >
                <div class="project__item-header">
                  <div class="project__item-meta">
                    <el-tag :type="getIndustryType(project.industry)" size="small">
                      {{ getIndustryLabel(project.industry) }}
                    </el-tag>
                    <el-tag :type="getDifficultyType(project.difficulty)" size="small">
                      {{ getDifficultyLabel(project.difficulty) }}
                    </el-tag>
                  </div>
                  <div class="project__item-status">
                    <el-icon v-if="project.status === 'completed'" class="project__item-completed">
                      <SuccessFilled />
                    </el-icon>
                    <el-icon v-else-if="project.status === 'locked'" class="project__item-locked">
                      <Lock />
                    </el-icon>
                    <el-progress
                      v-else-if="project.status === 'in_progress'"
                      :percentage="project.progress"
                      :stroke-width="4"
                      :show-text="false"
                      class="project__item-progress"
                    />
                  </div>
                </div>

                <h4 class="project__item-title">{{ project.title }}</h4>
                <p class="project__item-desc">{{ project.description }}</p>

                <div class="project__item-footer">
                  <div class="project__item-info">
                    <span class="project__item-duration">
                      <el-icon><Timer /></el-icon>
                      {{ project.estimatedHours }}小时
                    </span>
                    <span class="project__item-steps">
                      <el-icon><List /></el-icon>
                      {{ project.totalSteps }}个步骤
                    </span>
                  </div>
                  <div class="project__item-reward">
                    <span class="project__item-points">
                      <el-icon><Star /></el-icon>
                      {{ project.points }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧：项目详情 -->
        <el-col :xs="24" :lg="16">
          <div v-if="currentProject" class="project__workspace">
            <!-- 项目概览 -->
            <el-card class="project__overview-card" shadow="hover">
              <template #header>
                <div class="project__card-header">
                  <div class="project__overview-info">
                    <h3 class="project__card-title">{{ currentProject.title }}</h3>
                    <div class="project__overview-badges">
                      <el-tag :type="getIndustryType(currentProject.industry)">
                        {{ getIndustryLabel(currentProject.industry) }}
                      </el-tag>
                      <el-tag :type="getDifficultyType(currentProject.difficulty)">
                        {{ getDifficultyLabel(currentProject.difficulty) }}
                      </el-tag>
                      <span class="project__overview-points">
                        <el-icon><Star /></el-icon>
                        {{ currentProject.points }} 积分
                      </span>
                    </div>
                  </div>
                  <div class="project__overview-actions">
                    <el-button v-if="currentProject.status === 'available'" type="primary" @click="startProject">
                      <el-icon><CaretRight /></el-icon>
                      开始项目
                    </el-button>
                    <el-button
                      v-else-if="currentProject.status === 'in_progress'"
                      type="success"
                      @click="continueProject"
                    >
                      <el-icon><CaretRight /></el-icon>
                      继续项目
                    </el-button>
                    <el-button v-else-if="currentProject.status === 'completed'" @click="reviewProject">
                      <el-icon><View /></el-icon>
                      回顾项目
                    </el-button>
                    <el-button v-else disabled>
                      <el-icon><Lock /></el-icon>
                      未解锁
                    </el-button>
                  </div>
                </div>
              </template>

              <div class="project__overview-content">
                <div class="project__description">
                  <h4 class="project__section-title">
                    <el-icon><Document /></el-icon>
                    项目背景
                  </h4>
                  <p class="project__section-content">{{ currentProject.background }}</p>
                </div>

                <div class="project__objectives">
                  <h4 class="project__section-title">
                    <el-icon><Flag /></el-icon>
                    学习目标
                  </h4>
                  <ul class="project__objectives-list">
                    <li v-for="objective in currentProject.objectives" :key="objective" class="project__objective-item">
                      <el-icon><Check /></el-icon>
                      <span>{{ objective }}</span>
                    </li>
                  </ul>
                </div>

                <div class="project__skills">
                  <h4 class="project__section-title">
                    <el-icon><Medal /></el-icon>
                    涉及技能
                  </h4>
                  <div class="project__skills-list">
                    <el-tag v-for="skill in currentProject.skills" :key="skill" type="info" class="project__skill-tag">
                      {{ skill }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </el-card>

            <!-- 项目步骤 -->
            <el-card class="project__steps-card" shadow="hover">
              <template #header>
                <div class="project__card-header">
                  <h3 class="project__card-title">
                    <el-icon><List /></el-icon>
                    项目步骤
                  </h3>
                  <div class="project__steps-progress">
                    <span class="project__steps-current">
                      {{ currentStep + 1 }} / {{ currentProject.steps.length }}
                    </span>
                    <el-progress
                      :percentage="Math.round(((currentStep + 1) / currentProject.steps.length) * 100)"
                      :stroke-width="6"
                      class="project__steps-bar"
                    />
                  </div>
                </div>
              </template>

              <div class="project__steps-content">
                <el-steps :active="currentStep" direction="vertical" class="project__steps">
                  <el-step
                    v-for="(step, index) in currentProject.steps"
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

                <!-- 当前步骤详情 -->
                <div v-if="currentStepData" class="project__current-step">
                  <div class="project__step-header">
                    <h4 class="project__step-title">{{ currentStepData.title }}</h4>
                    <div class="project__step-meta">
                      <span class="project__step-duration">
                        <el-icon><Timer /></el-icon>
                        预计 {{ currentStepData.estimatedTime }} 分钟
                      </span>
                      <el-tag :type="getDifficultyType(currentStepData.difficulty)" size="small">
                        {{ getDifficultyLabel(currentStepData.difficulty) }}
                      </el-tag>
                    </div>
                  </div>

                  <div class="project__step-content">
                    <div class="project__step-instruction">
                      <h5 class="project__step-section-title">
                        <el-icon><Guide /></el-icon>
                        步骤说明
                      </h5>
                      <p class="project__step-text">{{ currentStepData.instruction }}</p>
                    </div>

                    <div v-if="currentStepData.hints" class="project__step-hints">
                      <h5 class="project__step-section-title">
                        <el-icon><Lightbulb /></el-icon>
                        提示信息
                      </h5>
                      <ul class="project__hints-list">
                        <li v-for="hint in currentStepData.hints" :key="hint" class="project__hint-item">
                          {{ hint }}
                        </li>
                      </ul>
                    </div>

                    <div v-if="currentStepData.expectedOutput" class="project__step-expected">
                      <h5 class="project__step-section-title">
                        <el-icon><DataAnalysis /></el-icon>
                        预期结果
                      </h5>
                      <div class="project__expected-output">
                        <el-table
                          :data="currentStepData.expectedOutput.data"
                          size="small"
                          class="project__expected-table"
                        >
                          <el-table-column
                            v-for="column in currentStepData.expectedOutput.columns"
                            :key="column"
                            :prop="column"
                            :label="column"
                            min-width="80"
                          />
                        </el-table>
                      </div>
                    </div>
                  </div>

                  <div class="project__step-actions">
                    <el-button type="primary" @click="openSQLEditor">
                      <el-icon><Edit /></el-icon>
                      开始编写SQL
                    </el-button>
                    <el-button v-if="currentStep > 0" @click="prevStep">
                      <el-icon><ArrowLeft /></el-icon>
                      上一步
                    </el-button>
                    <el-button v-if="currentStepData.completed" type="success" @click="nextStep">
                      下一步
                      <el-icon><ArrowRight /></el-icon>
                    </el-button>
                  </div>
                </div>
              </div>
            </el-card>

            <!-- SQL编辑器（展开时显示） -->
            <el-card v-if="showEditor" class="project__editor-card" shadow="hover">
              <template #header>
                <div class="project__card-header">
                  <h3 class="project__card-title">
                    <el-icon><Edit /></el-icon>
                    SQL编辑器 - {{ currentStepData?.title }}
                  </h3>
                  <div class="project__editor-actions">
                    <el-button type="success" :loading="isRunning" @click="runStepQuery">
                      <el-icon><CaretRight /></el-icon>
                      运行查询
                    </el-button>
                    <el-button type="primary" :disabled="!stepResult" @click="submitStepAnswer">
                      <el-icon><Check /></el-icon>
                      提交步骤
                    </el-button>
                    <el-button @click="closeEditor">
                      <el-icon><Close /></el-icon>
                      关闭编辑器
                    </el-button>
                  </div>
                </div>
              </template>

              <div class="project__editor-container">
                <div ref="stepEditorRef" class="project__step-editor"></div>
              </div>
            </el-card>

            <!-- 步骤结果 -->
            <el-card v-if="stepResult" class="project__step-result-card" shadow="hover">
              <template #header>
                <div class="project__card-header">
                  <h3 class="project__card-title">
                    <el-icon><DataAnalysis /></el-icon>
                    执行结果
                  </h3>
                  <div class="project__result-meta">
                    <span class="project__result-count">{{ stepResult.rows.length }} 条记录</span>
                    <span class="project__result-time">{{ stepResult.executionTime }}ms</span>
                  </div>
                </div>
              </template>

              <div class="project__step-result-content">
                <el-table :data="stepResult.rows" class="project__step-result-table" max-height="300">
                  <el-table-column
                    v-for="column in stepResult.columns"
                    :key="column"
                    :prop="column"
                    :label="column"
                    min-width="100"
                  />
                </el-table>
              </div>
            </el-card>

            <!-- 项目完成 -->
            <el-card v-if="projectCompleted" class="project__completion-card" shadow="hover">
              <template #header>
                <div class="project__card-header">
                  <h3 class="project__card-title">
                    <el-icon><Trophy /></el-icon>
                    项目完成
                  </h3>
                </div>
              </template>

              <div class="project__completion-content">
                <div class="project__completion-celebration">
                  <el-icon class="project__completion-icon"><Trophy /></el-icon>
                  <h4 class="project__completion-title">恭喜完成项目！</h4>
                  <p class="project__completion-desc">
                    你已成功完成「{{ currentProject.title }}」项目，获得了宝贵的实战经验！
                  </p>
                </div>

                <div class="project__completion-rewards">
                  <h5 class="project__completion-section-title">获得奖励</h5>
                  <div class="project__rewards-list">
                    <div class="project__reward-item">
                      <el-icon><Star /></el-icon>
                      <span>{{ currentProject.points }} 积分</span>
                    </div>
                    <div class="project__reward-item">
                      <el-icon><Medal /></el-icon>
                      <span>{{ currentProject.title }} 项目徽章</span>
                    </div>
                    <div class="project__reward-item">
                      <el-icon><TrendCharts /></el-icon>
                      <span>技能经验值提升</span>
                    </div>
                  </div>
                </div>

                <div class="project__completion-actions">
                  <el-button type="primary" @click="viewCertificate">
                    <el-icon><Document /></el-icon>
                    查看项目证书
                  </el-button>
                  <el-button @click="shareAchievement">
                    <el-icon><Share /></el-icon>
                    分享成就
                  </el-button>
                  <el-button @click="selectNextProject">
                    <el-icon><ArrowRight /></el-icon>
                    下一个项目
                  </el-button>
                </div>
              </div>
            </el-card>
          </div>

          <!-- 空状态 -->
          <el-empty v-else description="请从左侧选择一个项目开始实战" class="project__empty">
            <el-button type="primary" @click="selectRecommendedProject">推荐项目</el-button>
          </el-empty>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import * as monaco from 'monaco-editor'
import { ElMessage } from 'element-plus'
import { usePreferencesStore } from '../stores/preferences'
import type { Project, SQLResult } from '../types'

/**
 * 项目实战室页面
 * 实现完整项目案例、分步指导、成果展示
 */
// const router = useRouter()
// const learningStore = useLearningStore()
const preferencesStore = usePreferencesStore()

// 编辑器相关
const stepEditorRef = ref<HTMLElement>()
let stepEditor: monaco.editor.IStandaloneCodeEditor | null = null

// 项目统计
const projectStats = ref({
  completed: 3,
  inProgress: 1,
  totalHours: 24,
})

// 筛选条件
const filters = ref({
  industry: '',
  difficulty: '',
  status: 'all',
})

// 当前项目和步骤
const currentProject = ref<Project | null>(null)
const currentStep = ref(0)
const showEditor = ref(false)
const stepResult = ref<SQLResult | null>(null)
const isRunning = ref(false)
const projectCompleted = ref(false)

// 选项数据
const industryOptions = ref([
  { label: '电商零售', value: 'ecommerce' },
  { label: '金融服务', value: 'finance' },
  { label: '教育培训', value: 'education' },
  { label: '医疗健康', value: 'healthcare' },
  { label: '游戏娱乐', value: 'gaming' },
])

const difficultyOptions = ref([
  { label: '初级', value: 'beginner' },
  { label: '中级', value: 'intermediate' },
  { label: '高级', value: 'advanced' },
])

// 项目数据
const projects = ref<Project[]>([
  {
    id: 1,
    title: '电商数据分析平台',
    description: '构建完整的电商数据分析系统，从用户行为到销售报表',
    industry: 'ecommerce',
    difficulty: 'intermediate',
    status: 'available',
    progress: 0,
    estimatedHours: 8,
    totalSteps: 6,
    points: 500,
    background:
      '某电商公司需要建立数据分析平台，帮助运营团队更好地理解用户行为、商品销售情况和市场趋势。你将作为数据分析师，使用SQL构建各种分析报表。',
    objectives: [
      '掌握电商业务数据模型设计',
      '学会复杂的多表关联查询',
      '熟练使用聚合函数进行数据统计',
      '理解用户行为分析方法',
      '掌握销售数据分析技巧',
    ],
    skills: ['JOIN查询', 'GROUP BY分组', '聚合函数', '子查询', '窗口函数'],
    steps: [
      {
        title: '用户注册趋势分析',
        description: '分析用户注册数据，了解平台增长趋势',
        difficulty: 'beginner',
        estimatedTime: 30,
        completed: false,
        instruction: '查询每月新用户注册数量，分析用户增长趋势。需要按月份分组统计注册用户数，并计算环比增长率。',
        hints: ['使用DATE_FORMAT函数按月份分组', '使用COUNT函数统计用户数量', '可以使用LAG窗口函数计算环比增长'],
        expectedOutput: {
          columns: ['month', 'new_users', 'growth_rate'],
          data: [
            { month: '2024-01', new_users: 1250, growth_rate: null },
            { month: '2024-02', new_users: 1380, growth_rate: '10.4%' },
            { month: '2024-03', new_users: 1520, growth_rate: '10.1%' },
          ],
        },
      },
      {
        title: '商品销售排行榜',
        description: '统计热销商品，为运营决策提供数据支持',
        difficulty: 'beginner',
        estimatedTime: 45,
        completed: false,
        instruction: '查询销售额前20的商品，包括商品名称、销售数量、销售额、平均单价等信息。',
        hints: ['需要关联商品表和订单表', '使用SUM函数计算销售额和数量', '使用ORDER BY和LIMIT获取前20名'],
        expectedOutput: {
          columns: ['product_name', 'sales_quantity', 'sales_amount', 'avg_price'],
          data: [
            {
              product_name: 'iPhone 15 Pro',
              sales_quantity: 856,
              sales_amount: 8559440,
              avg_price: 9999,
            },
            {
              product_name: 'MacBook Air M2',
              sales_quantity: 432,
              sales_amount: 4319680,
              avg_price: 9999,
            },
            {
              product_name: 'AirPods Pro 2',
              sales_quantity: 1205,
              sales_amount: 2409975,
              avg_price: 1999,
            },
          ],
        },
      },
      {
        title: '用户购买行为分析',
        description: '深入分析用户购买模式和偏好',
        difficulty: 'intermediate',
        estimatedTime: 60,
        completed: false,
        instruction: '分析用户购买行为，包括复购率、客单价分布、购买频次等关键指标。',
        hints: ['使用窗口函数分析用户购买次数', '计算用户的平均客单价', '分析用户购买时间间隔'],
        expectedOutput: {
          columns: ['user_segment', 'user_count', 'avg_order_value', 'avg_frequency'],
          data: [
            {
              user_segment: '高价值用户',
              user_count: 1250,
              avg_order_value: 2850,
              avg_frequency: 8.5,
            },
            {
              user_segment: '中等用户',
              user_count: 3420,
              avg_order_value: 1200,
              avg_frequency: 3.2,
            },
            { user_segment: '新用户', user_count: 5680, avg_order_value: 450, avg_frequency: 1.1 },
          ],
        },
      },
      {
        title: '销售漏斗分析',
        description: '分析用户从浏览到购买的转化过程',
        difficulty: 'intermediate',
        estimatedTime: 75,
        completed: false,
        instruction: '构建销售漏斗，分析用户在各个环节的转化率，找出优化机会。',
        hints: [
          '定义漏斗的各个阶段（浏览、加购物车、下单、支付）',
          '计算各阶段的用户数量和转化率',
          '使用CASE WHEN进行条件统计',
        ],
        expectedOutput: {
          columns: ['funnel_stage', 'user_count', 'conversion_rate'],
          data: [
            { funnel_stage: '商品浏览', user_count: 125000, conversion_rate: '100%' },
            { funnel_stage: '加入购物车', user_count: 25000, conversion_rate: '20%' },
            { funnel_stage: '提交订单', user_count: 8750, conversion_rate: '35%' },
            { funnel_stage: '完成支付', user_count: 7000, conversion_rate: '80%' },
          ],
        },
      },
      {
        title: '库存预警系统',
        description: '建立智能库存预警机制',
        difficulty: 'advanced',
        estimatedTime: 90,
        completed: false,
        instruction: '基于历史销售数据和当前库存，建立库存预警系统，预测哪些商品需要补货。',
        hints: ['计算商品的平均日销量', '根据当前库存和销售速度预测缺货时间', '设置不同的预警级别'],
        expectedOutput: {
          columns: ['product_name', 'current_stock', 'daily_sales', 'days_remaining', 'alert_level'],
          data: [
            {
              product_name: 'iPhone 15',
              current_stock: 45,
              daily_sales: 12,
              days_remaining: 4,
              alert_level: '紧急',
            },
            {
              product_name: 'MacBook Pro',
              current_stock: 28,
              daily_sales: 3,
              days_remaining: 9,
              alert_level: '警告',
            },
            {
              product_name: 'AirPods',
              current_stock: 156,
              daily_sales: 8,
              days_remaining: 20,
              alert_level: '正常',
            },
          ],
        },
      },
      {
        title: '综合运营报表',
        description: '生成完整的运营分析报表',
        difficulty: 'advanced',
        estimatedTime: 120,
        completed: false,
        instruction: '整合前面的分析结果，生成一份综合的运营报表，包括关键指标和趋势分析。',
        hints: ['使用WITH子句组织复杂查询', '结合多个分析维度', '计算同比和环比增长率'],
        expectedOutput: {
          columns: ['metric_name', 'current_value', 'previous_value', 'growth_rate', 'trend'],
          data: [
            {
              metric_name: '月活跃用户',
              current_value: 45680,
              previous_value: 42150,
              growth_rate: '8.4%',
              trend: '上升',
            },
            {
              metric_name: '月销售额',
              current_value: 2856000,
              previous_value: 2634000,
              growth_rate: '8.4%',
              trend: '上升',
            },
            {
              metric_name: '平均客单价',
              current_value: 1250,
              previous_value: 1180,
              growth_rate: '5.9%',
              trend: '上升',
            },
          ],
        },
      },
    ],
  },
  {
    id: 2,
    title: '金融风控数据分析',
    description: '构建金融风控模型，识别潜在风险用户和异常交易',
    industry: 'finance',
    difficulty: 'advanced',
    status: 'locked',
    progress: 0,
    estimatedHours: 12,
    totalSteps: 8,
    points: 800,
    background: '某金融科技公司需要建立完善的风控体系，通过数据分析识别高风险用户和异常交易行为，降低业务风险。',
    objectives: [
      '理解金融风控业务逻辑',
      '掌握异常检测SQL技巧',
      '学会风险评分模型构建',
      '熟练使用统计分析函数',
      '掌握时间序列分析方法',
    ],
    skills: ['统计函数', '时间序列', '异常检测', '风险建模', '复杂查询'],
    steps: [],
  },
  {
    id: 3,
    title: '在线教育学习分析',
    description: '分析学习者行为数据，优化课程设计和学习路径',
    industry: 'education',
    difficulty: 'beginner',
    status: 'completed',
    progress: 100,
    estimatedHours: 6,
    totalSteps: 5,
    points: 300,
    background: '在线教育平台希望通过数据分析了解学习者的学习行为和效果，优化课程内容和学习体验。',
    objectives: ['分析学习者行为模式', '评估课程完成率', '识别学习困难点', '优化学习路径设计', '提升学习效果'],
    skills: ['基础查询', '数据统计', '趋势分析', '用户分群'],
    steps: [],
  },
])

// 计算属性
const filteredProjects = computed(() => {
  return projects.value.filter(project => {
    if (filters.value.industry && project.industry !== filters.value.industry) {
      return false
    }
    if (filters.value.difficulty && project.difficulty !== filters.value.difficulty) {
      return false
    }
    if (filters.value.status !== 'all' && project.status !== filters.value.status) {
      return false
    }
    return true
  })
})

const currentStepData = computed(() => {
  if (!currentProject.value || !currentProject.value.steps) return null
  return currentProject.value.steps[currentStep.value] || null
})

// 方法
const getIndustryType = (industry: string) => {
  const types: Record<string, string> = {
    ecommerce: 'primary',
    finance: 'warning',
    education: 'success',
    healthcare: 'info',
    gaming: 'danger',
  }
  return types[industry] || 'info'
}

const getIndustryLabel = (industry: string) => {
  const option = industryOptions.value.find(opt => opt.value === industry)
  return option?.label || industry
}

const getDifficultyType = (difficulty: string) => {
  const types: Record<string, string> = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'danger',
  }
  return types[difficulty] || 'info'
}

const getDifficultyLabel = (difficulty: string) => {
  const option = difficultyOptions.value.find(opt => opt.value === difficulty)
  return option?.label || difficulty
}

const getStepStatus = (index: number) => {
  if (!currentProject.value?.steps) return 'wait'
  if (currentProject.value.steps[index]?.completed) return 'success'
  if (index === currentStep.value) return 'process'
  if (index < currentStep.value) return 'success'
  return 'wait'
}

const resetFilters = () => {
  filters.value = {
    industry: '',
    difficulty: '',
    status: 'all',
  }
}

const selectProject = (project: Project) => {
  if (project.status === 'locked') {
    ElMessage.warning('该项目尚未解锁，请先完成前置项目')
    return
  }

  currentProject.value = project
  currentStep.value = 0
  showEditor.value = false
  stepResult.value = null
  projectCompleted.value = project.status === 'completed'
}

const selectRecommendedProject = () => {
  const availableProjects = projects.value.filter(p => p.status === 'available')
  if (availableProjects.length > 0) {
    selectProject(availableProjects[0])
  }
}

const startProject = () => {
  if (currentProject.value) {
    currentProject.value.status = 'in_progress'
    ElMessage.success('项目已开始，祝你学习愉快！')
  }
}

const continueProject = () => {
  ElMessage.info('继续你的项目学习之旅')
}

const reviewProject = () => {
  ElMessage.info('回顾项目内容，巩固学习成果')
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
    showEditor.value = false
    stepResult.value = null
  }
}

const nextStep = () => {
  if (currentProject.value && currentStep.value < currentProject.value.steps.length - 1) {
    currentStep.value++
    showEditor.value = false
    stepResult.value = null
  } else {
    // 项目完成
    completeProject()
  }
}

const openSQLEditor = () => {
  showEditor.value = true
  nextTick(() => {
    initStepEditor()
  })
}

const closeEditor = () => {
  showEditor.value = false
  stepResult.value = null
}

const runStepQuery = async () => {
  if (!stepEditor || !currentStepData.value) return

  const sql = stepEditor.getValue().trim()
  if (!sql) {
    ElMessage.warning('请输入SQL查询语句')
    return
  }

  isRunning.value = true

  try {
    // 模拟查询执行
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 使用预期结果作为模拟数据
    stepResult.value = {
      columns: currentStepData.value.expectedOutput.columns.map(col => ({
        name: col,
        type: 'string',
      })),
      rows: currentStepData.value.expectedOutput.data.map((row: any) => Object.values(row)),
      success: true,
      executionTime: Math.floor(Math.random() * 200) + 50,
    }

    ElMessage.success('查询执行成功')
  } catch (error: any) {
    ElMessage.error('查询执行失败：' + (error.message || '未知错误'))
  } finally {
    isRunning.value = false
  }
}

const submitStepAnswer = () => {
  if (!currentStepData.value || !stepResult.value) return

  // 标记步骤完成
  currentStepData.value.completed = true

  // 更新项目进度
  if (currentProject.value) {
    const completedSteps = currentProject.value.steps.filter(step => step.completed).length
    if (currentProject.value) {
      currentProject.value.progress = Math.round((completedSteps / currentProject.value.steps.length) * 100)
    }
  }

  ElMessage.success('步骤完成！获得经验值 +50')

  // 自动进入下一步
  setTimeout(() => {
    nextStep()
  }, 1000)
}

const completeProject = () => {
  if (currentProject.value) {
    if (currentProject.value) {
      currentProject.value.status = 'completed'
      currentProject.value.progress = 100
    }
    projectCompleted.value = true

    // 更新统计数据
    projectStats.value.completed++
    projectStats.value.inProgress--

    ElMessage.success(`恭喜完成项目「${currentProject.value.title}」！获得 ${currentProject.value.points || 0} 积分`)
  }
}

const viewCertificate = () => {
  ElMessage.info('项目证书功能开发中...')
}

const shareAchievement = () => {
  ElMessage.info('分享功能开发中...')
}

const selectNextProject = () => {
  const nextProject = projects.value.find(p => p.status === 'available')
  if (nextProject) {
    selectProject(nextProject)
    projectCompleted.value = false
  } else {
    ElMessage.info('暂无更多可用项目')
  }
}

const initStepEditor = () => {
  if (!stepEditorRef.value) return

  stepEditor = monaco.editor.create(stepEditorRef.value, {
    value: '',
    language: 'sql',
    theme: preferencesStore.settings.theme === 'dark' ? 'vs-dark' : 'vs',
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    minimap: { enabled: false },
    wordWrap: 'on',
  })
}

onMounted(() => {
  // 初始化数据
  console.log('项目实战室已加载')
})
</script>

<style scoped>
.project {
  min-height: 100vh;
}

.project__header {
  background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-color-warning-light-9) 100%);
  padding: 40px 0;
  margin: -24px -24px 24px -24px;
}

.project__header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
}

.project__title {
  font-size: 36px;
  font-weight: 700;
  color: var(--el-color-primary);
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.project__title-icon {
  font-size: 40px;
}

.project__subtitle {
  font-size: 16px;
  color: var(--el-text-color-regular);
  margin: 0;
}

.project__progress-overview {
  display: flex;
  gap: 32px;
}

.project__progress-item {
  text-align: center;
}

.project__progress-number {
  display: block;
  font-size: 32px;
  font-weight: 700;
  color: var(--el-color-primary);
  line-height: 1;
}

.project__progress-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin-top: 4px;
}

.project__content {
  max-width: 1200px;
  margin: 0 auto;
}

.project__filter-card,
.project__list-card {
  margin-bottom: 24px;
}

.project__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.project__card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-primary);
}

.project__filters {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.project__filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project__filter-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.project__filter-select {
  width: 100%;
}

.project__filter-radio {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project__list {
  max-height: 600px;
  overflow-y: auto;
}

.project__item {
  padding: 20px;
  border: 2px solid var(--el-border-color-lighter);
  border-radius: 12px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.project__item:hover {
  border-color: var(--el-color-primary-light-7);
  background-color: var(--el-color-primary-light-9);
}

.project__item--active {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.project__item--completed {
  background-color: var(--el-color-success-light-9);
  border-color: var(--el-color-success-light-7);
}

.project__item--locked {
  opacity: 0.6;
  cursor: not-allowed;
}

.project__item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.project__item-meta {
  display: flex;
  gap: 8px;
}

.project__item-status {
  display: flex;
  align-items: center;
}

.project__item-completed {
  color: var(--el-color-success);
  font-size: 18px;
}

.project__item-locked {
  color: var(--el-text-color-placeholder);
  font-size: 18px;
}

.project__item-progress {
  width: 60px;
}

.project__item-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.project__item-desc {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

.project__item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.project__item-info {
  display: flex;
  gap: 16px;
}

.project__item-duration,
.project__item-steps {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.project__item-points {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--el-color-warning);
  font-size: 14px;
  font-weight: 600;
}

.project__workspace {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.project__overview-info {
  flex: 1;
}

.project__overview-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.project__overview-points {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--el-color-warning);
  font-weight: 600;
}

.project__overview-actions {
  display: flex;
  gap: 8px;
}

.project__overview-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.project__description,
.project__objectives,
.project__skills {
  padding: 16px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
}

.project__section-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.project__section-content {
  margin: 0;
  color: var(--el-text-color-regular);
  line-height: 1.6;
}

.project__objectives-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project__objective-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

.project__skills-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.project__skill-tag {
  font-size: 12px;
}

.project__steps-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.project__steps-current {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-color-primary);
  white-space: nowrap;
}

.project__steps-bar {
  flex: 1;
  max-width: 200px;
}

.project__steps-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.project__steps {
  margin-bottom: 0;
}

.project__current-step {
  padding: 20px;
  background: var(--el-bg-color-page);
  border-radius: 12px;
  border: 2px solid var(--el-color-primary-light-8);
}

.project__step-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.project__step-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.project__step-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.project__step-duration {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.project__step-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
}

.project__step-instruction,
.project__step-hints,
.project__step-expected {
  padding: 16px;
  background: var(--el-bg-color);
  border-radius: 8px;
}

.project__step-section-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.project__step-text {
  margin: 0;
  color: var(--el-text-color-regular);
  line-height: 1.6;
}

.project__hints-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project__hint-item {
  color: var(--el-text-color-regular);
  line-height: 1.5;
  position: relative;
  padding-left: 16px;
}

.project__hint-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--el-color-primary);
  font-weight: bold;
}

.project__expected-output {
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  overflow: hidden;
}

.project__expected-table {
  font-size: 12px;
}

.project__step-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.project__editor-container {
  height: 400px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  overflow: hidden;
}

.project__step-editor {
  height: 100%;
}

.project__editor-actions {
  display: flex;
  gap: 8px;
}

.project__result-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.project__result-count {
  font-weight: 600;
}

.project__result-time {
  color: var(--el-color-success);
}

.project__step-result-table {
  font-size: 12px;
}

.project__completion-content {
  text-align: center;
  padding: 20px;
}

.project__completion-celebration {
  margin-bottom: 32px;
}

.project__completion-icon {
  font-size: 64px;
  color: var(--el-color-warning);
  margin-bottom: 16px;
}

.project__completion-title {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.project__completion-desc {
  margin: 0 0 32px 0;
  font-size: 16px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
}

.project__completion-rewards {
  margin-bottom: 32px;
}

.project__completion-section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.project__rewards-list {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.project__reward-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--el-color-success-light-9);
  border-radius: 8px;
  color: var(--el-color-success);
  font-weight: 600;
}

.project__completion-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.project__empty {
  margin-top: 100px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .project__header-content {
    flex-direction: column;
    text-align: center;
    gap: 24px;
  }

  .project__title {
    font-size: 28px;
  }

  .project__progress-overview {
    gap: 24px;
  }

  .project__progress-number {
    font-size: 24px;
  }

  .project__step-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .project__step-meta {
    align-self: flex-end;
  }

  .project__completion-actions {
    flex-direction: column;
  }

  .project__rewards-list {
    flex-direction: column;
    align-items: center;
  }
}
</style>
