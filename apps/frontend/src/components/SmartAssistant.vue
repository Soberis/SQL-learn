<template>
  <div class="smart-assistant">
    <!-- 助手头像和状态 -->
    <div class="assistant__header" @click="toggleAssistant">
      <div class="assistant__avatar" :class="{ 'assistant__avatar--active': isActive }">
        <div class="assistant__avatar-ring">
          <Bot :size="24" />
        </div>
        <div v-if="hasNewSuggestions" class="assistant__notification-dot"></div>
      </div>

      <div class="assistant__info">
        <h3 class="assistant__name">SQL智能助手</h3>
        <p class="assistant__status">{{ currentStatus }}</p>
      </div>

      <button class="assistant__toggle">
        <ChevronUp v-if="isExpanded" :size="20" />
        <ChevronDown v-else :size="20" />
      </button>
    </div>

    <!-- 助手内容面板 -->
    <Transition name="panel">
      <div v-if="isExpanded" class="assistant__panel">
        <!-- 快速操作 -->
        <div class="assistant__quick-actions">
          <button
            v-for="action in quickActions"
            :key="action.id"
            class="assistant__quick-action"
            :class="`assistant__quick-action--${action.type}`"
            @click="executeQuickAction(action)"
          >
            <component :is="action.icon" :size="16" />
            <span>{{ action.label }}</span>
          </button>
        </div>

        <!-- 个性化建议 -->
        <div v-if="personalizedSuggestions.length > 0" class="assistant__suggestions">
          <div class="assistant__section-header">
            <Lightbulb :size="16" />
            <h4>个性化建议</h4>
          </div>

          <div class="assistant__suggestions-list">
            <div
              v-for="suggestion in personalizedSuggestions"
              :key="suggestion.id"
              class="assistant__suggestion-item"
              :class="`assistant__suggestion-item--${suggestion.priority}`"
            >
              <div class="assistant__suggestion-icon">
                <component :is="getSuggestionIcon(suggestion.type)" :size="16" />
              </div>

              <div class="assistant__suggestion-content">
                <h5 class="assistant__suggestion-title">{{ suggestion.title }}</h5>
                <p class="assistant__suggestion-description">{{ suggestion.description }}</p>

                <div v-if="suggestion.reasons && suggestion.reasons.length > 0" class="assistant__suggestion-reasons">
                  <span class="assistant__reasons-label">原因:</span>
                  <ul class="assistant__reasons-list">
                    <li v-for="reason in suggestion.reasons" :key="reason">
                      {{ reason }}
                    </li>
                  </ul>
                </div>

                <div class="assistant__suggestion-actions">
                  <button
                    v-if="suggestion.primaryAction"
                    class="assistant__suggestion-btn assistant__suggestion-btn--primary"
                    @click="executeSuggestionAction(suggestion, suggestion.primaryAction)"
                  >
                    {{ suggestion.primaryAction.text }}
                  </button>

                  <button
                    v-if="suggestion.secondaryAction"
                    class="assistant__suggestion-btn assistant__suggestion-btn--secondary"
                    @click="executeSuggestionAction(suggestion, suggestion.secondaryAction)"
                  >
                    {{ suggestion.secondaryAction.text }}
                  </button>

                  <button
                    class="assistant__suggestion-btn assistant__suggestion-btn--dismiss"
                    @click="dismissSuggestion(suggestion.id)"
                  >
                    <X :size="14" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 学习路径推荐 -->
        <div v-if="learningPath.length > 0" class="assistant__learning-path">
          <div class="assistant__section-header">
            <Route :size="16" />
            <h4>推荐学习路径</h4>
          </div>

          <div class="assistant__path-steps">
            <div
              v-for="(step, index) in learningPath"
              :key="step.id"
              class="assistant__path-step"
              :class="{
                'assistant__path-step--completed': step.completed,
                'assistant__path-step--current': step.current,
                'assistant__path-step--locked': step.locked,
              }"
            >
              <div class="assistant__step-number">
                <CheckCircle v-if="step.completed" :size="16" />
                <Circle v-else-if="step.current" :size="16" />
                <Lock v-else-if="step.locked" :size="16" />
                <span v-else>{{ index + 1 }}</span>
              </div>

              <div class="assistant__step-content">
                <h5 class="assistant__step-title">{{ step.title }}</h5>
                <p class="assistant__step-description">{{ step.description }}</p>

                <div v-if="step.skills && step.skills.length > 0" class="assistant__step-skills">
                  <span v-for="skill in step.skills" :key="skill" class="assistant__skill-tag">
                    {{ skill }}
                  </span>
                </div>

                <div v-if="step.current && !step.completed" class="assistant__step-actions">
                  <button class="assistant__step-btn" @click="startLearningStep(step)">开始学习</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 智能问答 -->
        <div class="assistant__chat">
          <div class="assistant__section-header">
            <MessageCircle :size="16" />
            <h4>智能问答</h4>
          </div>

          <div ref="chatMessages" class="assistant__chat-messages">
            <div
              v-for="message in chatMessages"
              :key="message.id"
              class="assistant__chat-message"
              :class="`assistant__chat-message--${message.type}`"
            >
              <div v-if="message.type === 'assistant'" class="assistant__message-avatar">
                <Bot :size="16" />
              </div>

              <div class="assistant__message-content">
                <div class="assistant__message-text">{{ message.text }}</div>

                <div
                  v-if="message.suggestions && message.suggestions.length > 0"
                  class="assistant__message-suggestions"
                >
                  <button
                    v-for="suggestion in message.suggestions"
                    :key="suggestion"
                    class="assistant__message-suggestion"
                    @click="sendMessage(suggestion)"
                  >
                    {{ suggestion }}
                  </button>
                </div>

                <div v-if="message.code" class="assistant__message-code">
                  <pre><code>{{ message.code }}</code></pre>
                  <button class="assistant__code-copy" @click="copyCode(message.code)">
                    <Copy :size="14" />
                  </button>
                </div>
              </div>

              <div class="assistant__message-time">
                {{ formatTime(message.timestamp) }}
              </div>
            </div>
          </div>

          <div class="assistant__chat-input">
            <input
              v-model="chatInput"
              placeholder="有什么SQL问题可以问我..."
              class="assistant__input"
              @keypress.enter="sendMessage()"
            />
            <button :disabled="!chatInput.trim()" class="assistant__send-btn" @click="sendMessage()">
              <Send :size="16" />
            </button>
          </div>
        </div>

        <!-- 学习统计洞察 -->
        <div class="assistant__insights">
          <div class="assistant__section-header">
            <TrendingUp :size="16" />
            <h4>学习洞察</h4>
          </div>

          <div class="assistant__insights-grid">
            <div v-for="insight in learningInsights" :key="insight.id" class="assistant__insight-card">
              <div class="assistant__insight-icon">
                <component :is="insight.icon" :size="20" />
              </div>

              <div class="assistant__insight-content">
                <div class="assistant__insight-value">{{ insight.value }}</div>
                <div class="assistant__insight-label">{{ insight.label }}</div>
                <div class="assistant__insight-trend" :class="`assistant__insight-trend--${insight.trend}`">
                  <TrendingUp v-if="insight.trend === 'up'" :size="12" />
                  <TrendingDown v-else-if="insight.trend === 'down'" :size="12" />
                  <Minus v-else :size="12" />
                  <span>{{ insight.change }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import {
  Service as Bot,
  ArrowUp as ChevronUp,
  ArrowDown as ChevronDown,
  Opportunity as Lightbulb,
  Guide as Route,
  ChatDotRound as MessageCircle,
  TrendCharts as TrendingUp,
  TrendCharts as TrendingDown,
  Minus,
  SuccessFilled as CheckCircle,
  CirclePlus as Circle,
  Lock,
  Close as X,
  Promotion as Send,
  CopyDocument as Copy,
  Aim as Target,
  Reading as BookOpen,
  Lightning as Zap,
  Timer as Clock,
  Trophy as Award,
  DataAnalysis as BarChart3,
} from '@element-plus/icons-vue'

interface QuickAction {
  id: string
  label: string
  icon: any
  type: 'primary' | 'secondary' | 'success' | 'warning'
  action: () => void
}

interface Suggestion {
  id: string
  type: 'practice' | 'review' | 'project' | 'skill' | 'habit'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  reasons?: string[]
  primaryAction?: {
    text: string
    action: () => void
  }
  secondaryAction?: {
    text: string
    action: () => void
  }
}

interface LearningStep {
  id: string
  title: string
  description: string
  skills: string[]
  completed: boolean
  current: boolean
  locked: boolean
  estimatedTime: number
}

interface ChatMessage {
  id: number
  type: 'user' | 'assistant'
  text: string
  timestamp: Date
  suggestions?: string[]
  code?: string
}

interface LearningInsight {
  id: string
  label: string
  value: string
  icon: any
  trend: 'up' | 'down' | 'stable'
  change: string
}

// 响应式数据
const isExpanded = ref(false)
const isActive = ref(true)
const hasNewSuggestions = ref(true)
const chatInput = ref('')
const chatMessages = ref<ChatMessage[]>([])
const messageIdCounter = ref(2)

// 计算属性
const currentStatus = computed(() => {
  if (!isActive.value) return '离线'
  if (hasNewSuggestions.value) return '有新建议'
  return '在线助手'
})

// 快速操作
const quickActions = ref<QuickAction[]>([
  {
    id: 'daily-practice',
    label: '每日练习',
    icon: Target,
    type: 'primary',
    action: () => navigateToPage('/practice'),
  },
  {
    id: 'review-mistakes',
    label: '错题复习',
    icon: BookOpen,
    type: 'warning',
    action: () => reviewMistakes(),
  },
  {
    id: 'skill-assessment',
    label: '技能评估',
    icon: BarChart3,
    type: 'secondary',
    action: () => startSkillAssessment(),
  },
  {
    id: 'quick-reference',
    label: '语法速查',
    icon: Zap,
    type: 'success',
    action: () => navigateToPage('/handbook'),
  },
])

// 个性化建议
const personalizedSuggestions = ref<Suggestion[]>([
  {
    id: 'join-practice',
    type: 'practice',
    title: '加强JOIN查询练习',
    description: '你在JOIN查询方面的正确率较低，建议多做相关练习',
    priority: 'high',
    reasons: ['最近5次JOIN题目中有3次答错', '平均完成时间比其他用户慢30%', '复杂JOIN查询掌握不够熟练'],
    primaryAction: {
      text: '开始练习',
      action: () => startTargetedPractice('join'),
    },
    secondaryAction: {
      text: '查看教程',
      action: () => viewTutorial('join'),
    },
  },
  {
    id: 'study-streak',
    type: 'habit',
    title: '保持学习连续性',
    description: '你已经连续学习12天了，再坚持3天就能获得成就奖励',
    priority: 'medium',
    reasons: ['连续学习有助于知识巩固', '即将解锁"坚持学习者"成就', '学习效果在连续性中更佳'],
    primaryAction: {
      text: '今日练习',
      action: () => navigateToPage('/practice'),
    },
  },
  {
    id: 'project-recommendation',
    type: 'project',
    title: '尝试实战项目',
    description: '基于你当前的技能水平，推荐开始"电商数据分析"项目',
    priority: 'medium',
    reasons: ['你已掌握SELECT、WHERE、JOIN等基础技能', '实战项目能提升综合应用能力', '该项目难度适合你的当前水平'],
    primaryAction: {
      text: '开始项目',
      action: () => startProject('ecommerce-analysis'),
    },
    secondaryAction: {
      text: '查看详情',
      action: () => viewProjectDetails('ecommerce-analysis'),
    },
  },
])

// 学习路径
const learningPath = ref<LearningStep[]>([
  {
    id: 'basic-select',
    title: 'SELECT基础查询',
    description: '学习基本的数据查询语法',
    skills: ['SELECT', '字段选择', '基础语法'],
    completed: true,
    current: false,
    locked: false,
    estimatedTime: 30,
  },
  {
    id: 'where-filtering',
    title: 'WHERE条件筛选',
    description: '掌握数据筛选和条件判断',
    skills: ['WHERE', '条件运算符', '逻辑运算'],
    completed: true,
    current: false,
    locked: false,
    estimatedTime: 45,
  },
  {
    id: 'join-operations',
    title: 'JOIN表连接',
    description: '学习多表关联查询技巧',
    skills: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN'],
    completed: false,
    current: true,
    locked: false,
    estimatedTime: 60,
  },
  {
    id: 'advanced-queries',
    title: '高级查询技巧',
    description: '掌握子查询、窗口函数等高级特性',
    skills: ['子查询', '窗口函数', '聚合函数'],
    completed: false,
    current: false,
    locked: true,
    estimatedTime: 90,
  },
])

// 学习洞察
const learningInsights = ref<LearningInsight[]>([
  {
    id: 'weekly-progress',
    label: '本周完成题目',
    value: '23',
    icon: Target,
    trend: 'up',
    change: '+15%',
  },
  {
    id: 'accuracy-rate',
    label: '正确率',
    value: '85%',
    icon: Award,
    trend: 'up',
    change: '+5%',
  },
  {
    id: 'study-time',
    label: '学习时长',
    value: '4.2h',
    icon: Clock,
    trend: 'stable',
    change: '0%',
  },
  {
    id: 'skill-growth',
    label: '技能提升',
    value: '12%',
    icon: TrendingUp,
    trend: 'up',
    change: '+3%',
  },
])

const chatMessagesRef = ref<HTMLElement>()

// 方法
const toggleAssistant = () => {
  isExpanded.value = !isExpanded.value
  if (isExpanded.value) {
    hasNewSuggestions.value = false
  }
}

const executeQuickAction = (action: QuickAction) => {
  action.action()
}

const getSuggestionIcon = (type: string) => {
  switch (type) {
    case 'practice':
      return Target
    case 'review':
      return BookOpen
    case 'project':
      return Zap
    case 'skill':
      return TrendingUp
    case 'habit':
      return Clock
    default:
      return Lightbulb
  }
}

const executeSuggestionAction = (_suggestion: Suggestion, action: { action: () => void }) => {
  action.action()
}

const dismissSuggestion = (suggestionId: string) => {
  const index = personalizedSuggestions.value.findIndex(s => s.id === suggestionId)
  if (index > -1) {
    personalizedSuggestions.value.splice(index, 1)
  }
}

const startLearningStep = (step: LearningStep) => {
  // 开始学习步骤的逻辑
  console.log('开始学习:', step.title)
}

const sendMessage = (message?: string) => {
  const text = message || chatInput.value.trim()
  if (!text) return

  // 添加用户消息
  chatMessages.value.push({
    id: messageIdCounter.value++,
    type: 'user',
    text,
    timestamp: new Date(),
  })

  chatInput.value = ''

  // 模拟助手回复
  setTimeout(() => {
    const response = generateAssistantResponse(text)
    chatMessages.value.push({
      id: messageIdCounter.value++,
      type: 'assistant',
      text: response.text,
      timestamp: new Date(),
      suggestions: response.suggestions,
      code: response.code,
    })

    scrollToBottom()
  }, 1000)
}

const generateAssistantResponse = (userMessage: string) => {
  const message = userMessage.toLowerCase()

  if (message.includes('join')) {
    return {
      text: 'JOIN是SQL中用于连接多个表的重要操作。最常用的是INNER JOIN，它只返回两个表中都存在匹配记录的行。',
      suggestions: ['INNER JOIN示例', 'LEFT JOIN区别', 'JOIN性能优化'],
      code: 'SELECT u.name, o.order_date\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id;',
    }
  }

  if (message.includes('性能') || message.includes('优化')) {
    return {
      text: 'SQL性能优化的关键在于：1) 合理使用索引 2) 避免SELECT * 3) 优化WHERE条件 4) 合理使用JOIN。',
      suggestions: ['索引优化', '查询计划分析', '常见性能问题'],
      code: '-- 使用索引优化查询\nCREATE INDEX idx_user_email ON users(email);\nSELECT * FROM users WHERE email = "user@example.com";',
    }
  }

  if (message.includes('练习') || message.includes('题目')) {
    return {
      text: '根据你的学习进度，我推荐你先练习JOIN查询相关题目，这是你当前需要加强的技能点。',
      suggestions: ['开始JOIN练习', '查看错题集', '技能评估测试'],
    }
  }

  return {
    text: '我理解你的问题。你可以尝试在实战练习场中找到相关的练习题，或者查看速查手册获取语法帮助。',
    suggestions: ['实战练习', '语法速查', '学习路径'],
  }
}

const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
    // 可以添加复制成功的提示
  } catch (err) {
    console.error('复制失败:', err)
  }
}

const formatTime = (timestamp: Date) => {
  return timestamp.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  })
}

// 导航和操作方法
const navigateToPage = (path: string) => {
  // 路由导航逻辑
  console.log('导航到:', path)
}

const reviewMistakes = () => {
  console.log('开始错题复习')
}

const startSkillAssessment = () => {
  console.log('开始技能评估')
}

const startTargetedPractice = (skill: string) => {
  console.log('开始针对性练习:', skill)
}

const viewTutorial = (topic: string) => {
  console.log('查看教程:', topic)
}

const startProject = (projectId: string) => {
  console.log('开始项目:', projectId)
}

const viewProjectDetails = (projectId: string) => {
  console.log('查看项目详情:', projectId)
}

// 生命周期
onMounted(() => {
  // 初始化助手消息
  chatMessages.value = [
    {
      id: 1,
      type: 'assistant',
      text: '你好！我是你的SQL学习助手。我可以帮你制定学习计划、解答问题、提供练习建议。有什么可以帮助你的吗？',
      timestamp: new Date(),
      suggestions: ['我想学习JOIN查询', '如何提高SQL性能', '推荐一些练习题'],
    },
  ]
})
</script>

<style scoped>
.smart-assistant {
  @apply bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden;
}

/* 助手头部 */
.assistant__header {
  @apply flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors;
}

.assistant__avatar {
  @apply relative;
}

.assistant__avatar-ring {
  @apply w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white transition-all;
}

.assistant__avatar--active .assistant__avatar-ring {
  @apply animate-pulse;
}

.assistant__notification-dot {
  @apply absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white;
}

.assistant__info {
  @apply flex-1;
}

.assistant__name {
  @apply font-semibold text-gray-900;
}

.assistant__status {
  @apply text-sm text-gray-500;
}

.assistant__toggle {
  @apply p-2 rounded-lg hover:bg-gray-100 transition-colors;
}

/* 助手面板 */
.assistant__panel {
  @apply border-t border-gray-100 bg-gray-50;
}

.assistant__section-header {
  @apply flex items-center gap-2 mb-3;
}

.assistant__section-header h4 {
  @apply font-semibold text-gray-900;
}

/* 快速操作 */
.assistant__quick-actions {
  @apply p-4 grid grid-cols-2 gap-2;
}

.assistant__quick-action {
  @apply flex items-center gap-2 p-3 rounded-lg text-sm font-medium transition-colors;
}

.assistant__quick-action--primary {
  @apply bg-blue-100 text-blue-700 hover:bg-blue-200;
}

.assistant__quick-action--secondary {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200;
}

.assistant__quick-action--success {
  @apply bg-green-100 text-green-700 hover:bg-green-200;
}

.assistant__quick-action--warning {
  @apply bg-yellow-100 text-yellow-700 hover:bg-yellow-200;
}

/* 个性化建议 */
.assistant__suggestions {
  @apply p-4 border-t border-gray-200;
}

.assistant__suggestions-list {
  @apply space-y-3;
}

.assistant__suggestion-item {
  @apply flex gap-3 p-3 rounded-lg;
}

.assistant__suggestion-item--high {
  @apply bg-red-50 border border-red-200;
}

.assistant__suggestion-item--medium {
  @apply bg-yellow-50 border border-yellow-200;
}

.assistant__suggestion-item--low {
  @apply bg-blue-50 border border-blue-200;
}

.assistant__suggestion-icon {
  @apply flex-shrink-0 mt-1;
}

.assistant__suggestion-item--high .assistant__suggestion-icon {
  @apply text-red-600;
}

.assistant__suggestion-item--medium .assistant__suggestion-icon {
  @apply text-yellow-600;
}

.assistant__suggestion-item--low .assistant__suggestion-icon {
  @apply text-blue-600;
}

.assistant__suggestion-content {
  @apply flex-1;
}

.assistant__suggestion-title {
  @apply font-medium text-gray-900 mb-1;
}

.assistant__suggestion-description {
  @apply text-sm text-gray-600 mb-2;
}

.assistant__suggestion-reasons {
  @apply mb-3;
}

.assistant__reasons-label {
  @apply text-xs font-medium text-gray-500;
}

.assistant__reasons-list {
  @apply text-xs text-gray-600 mt-1 space-y-1;
}

.assistant__reasons-list li {
  @apply flex items-start gap-1;
}

.assistant__reasons-list li::before {
  content: '•';
  @apply text-gray-400;
}

.assistant__suggestion-actions {
  @apply flex items-center gap-2;
}

.assistant__suggestion-btn {
  @apply px-3 py-1 rounded text-sm font-medium transition-colors;
}

.assistant__suggestion-btn--primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.assistant__suggestion-btn--secondary {
  @apply bg-gray-200 text-gray-700 hover:bg-gray-300;
}

.assistant__suggestion-btn--dismiss {
  @apply p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded;
}

/* 学习路径 */
.assistant__learning-path {
  @apply p-4 border-t border-gray-200;
}

.assistant__path-steps {
  @apply space-y-3;
}

.assistant__path-step {
  @apply flex gap-3 p-3 rounded-lg transition-colors;
}

.assistant__path-step--completed {
  @apply bg-green-50 border border-green-200;
}

.assistant__path-step--current {
  @apply bg-blue-50 border border-blue-200;
}

.assistant__path-step--locked {
  @apply bg-gray-50 border border-gray-200 opacity-60;
}

.assistant__step-number {
  @apply w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium;
}

.assistant__path-step--completed .assistant__step-number {
  @apply bg-green-100 text-green-600;
}

.assistant__path-step--current .assistant__step-number {
  @apply bg-blue-100 text-blue-600;
}

.assistant__path-step--locked .assistant__step-number {
  @apply bg-gray-100 text-gray-400;
}

.assistant__step-content {
  @apply flex-1;
}

.assistant__step-title {
  @apply font-medium text-gray-900 mb-1;
}

.assistant__step-description {
  @apply text-sm text-gray-600 mb-2;
}

.assistant__step-skills {
  @apply flex flex-wrap gap-1 mb-2;
}

.assistant__skill-tag {
  @apply px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded;
}

.assistant__step-actions {
  @apply mt-2;
}

.assistant__step-btn {
  @apply px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors;
}

/* 智能问答 */
.assistant__chat {
  @apply p-4 border-t border-gray-200;
}

.assistant__chat-messages {
  @apply max-h-64 overflow-y-auto space-y-3 mb-4;
}

.assistant__chat-message {
  @apply flex gap-2;
}

.assistant__chat-message--user {
  @apply justify-end;
}

.assistant__message-avatar {
  @apply w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0;
}

.assistant__message-content {
  @apply max-w-xs;
}

.assistant__chat-message--user .assistant__message-content {
  @apply bg-blue-600 text-white rounded-lg p-3;
}

.assistant__chat-message--assistant .assistant__message-content {
  @apply bg-white border border-gray-200 rounded-lg p-3;
}

.assistant__message-text {
  @apply text-sm;
}

.assistant__message-suggestions {
  @apply flex flex-wrap gap-1 mt-2;
}

.assistant__message-suggestion {
  @apply px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200 transition-colors;
}

.assistant__message-code {
  @apply relative mt-2 bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono overflow-x-auto;
}

.assistant__code-copy {
  @apply absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-200 transition-colors;
}

.assistant__message-time {
  @apply text-xs text-gray-400 mt-1;
}

.assistant__chat-input {
  @apply flex gap-2;
}

.assistant__input {
  @apply flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.assistant__send-btn {
  @apply px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
}

/* 学习洞察 */
.assistant__insights {
  @apply p-4 border-t border-gray-200;
}

.assistant__insights-grid {
  @apply grid grid-cols-2 gap-3;
}

.assistant__insight-card {
  @apply bg-white p-3 rounded-lg border border-gray-200 flex items-center gap-3;
}

.assistant__insight-icon {
  @apply text-blue-600;
}

.assistant__insight-content {
  @apply flex-1;
}

.assistant__insight-value {
  @apply text-lg font-bold text-gray-900;
}

.assistant__insight-label {
  @apply text-xs text-gray-500;
}

.assistant__insight-trend {
  @apply flex items-center gap-1 text-xs;
}

.assistant__insight-trend--up {
  @apply text-green-600;
}

.assistant__insight-trend--down {
  @apply text-red-600;
}

.assistant__insight-trend--stable {
  @apply text-gray-600;
}

/* 过渡动画 */
.panel-enter-active,
.panel-leave-active {
  transition: all 0.3s ease;
}

.panel-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.panel-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .assistant__quick-actions {
    @apply grid-cols-1;
  }

  .assistant__insights-grid {
    @apply grid-cols-1;
  }

  .assistant__message-content {
    @apply max-w-none;
  }
}
</style>
