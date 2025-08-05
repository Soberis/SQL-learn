/**
 * SQL学习平台核心类型定义
 */

// 基础类型
export type ID = string
export type Timestamp = string

// 难度等级
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

// 技能类型
export type SkillType = 'SELECT查询' | 'JOIN操作' | '聚合函数' | '子查询' | '数据修改' | 'DDL操作' | '索引优化'

// 课程状态
export type LessonStatus = 'not_started' | 'in_progress' | 'completed' | 'locked'

// 练习题类型
export type QuestionType = 'single_choice' | 'multiple_choice' | 'sql_coding' | 'fill_blank'

/**
 * 课程接口
 */
export interface Course {
  id: ID
  title: string
  description: string
  category: string
  difficulty: DifficultyLevel
  skills: SkillType[]
  estimatedTime: number // 预计学习时间(分钟)
  duration: number // 课程时长(分钟)
  prerequisites: ID[] // 前置课程ID
  lessons: Lesson[]
  progress: number // 学习进度(0-100)
  isBookmarked: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * 课时接口
 */
export interface Lesson {
  id: ID
  title: string
  description: string
  content: string
  difficulty: DifficultyLevel
  skills: SkillType[]
  estimatedTime: number // 预计学习时间(分钟)
  duration: number // 课时时长(分钟)
  prerequisites: ID[] // 前置课程ID
  status: LessonStatus
  progress: number // 学习进度(0-100)
  exercise?: Question // 练习题
  codeExample?: string // 代码示例
  completed?: boolean // 是否完成
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * 练习题接口
 */
export interface Question {
  id: ID
  lessonId: ID
  title: string
  description: string
  question?: string // 题目内容
  type: QuestionType
  difficulty: DifficultyLevel
  skills: SkillType[]
  content: QuestionContent
  solution: QuestionSolution
  hints: string[]
  tags: string[]
  createdAt: Timestamp
}

/**
 * 题目内容接口
 */
export interface QuestionContent {
  question: string
  options?: string[] // 选择题选项
  sqlTemplate?: string // SQL模板
  expectedOutput?: unknown[] // 期望输出
  testCases?: TestCase[] // 测试用例
}

/**
 * 题目解答接口
 */
export interface QuestionSolution {
  answer: string | string[] // 答案
  explanation: string // 解释
  sqlCode?: string // SQL代码
  keyPoints: string[] // 关键点
}

/**
 * 测试用例接口
 */
export interface TestCase {
  id: ID
  input: unknown[]
  expectedOutput: unknown[]
  description: string
}

/**
 * 用户答题记录接口
 */
export interface UserAnswer {
  id: ID
  questionId: ID
  userId?: ID
  answer: string | string[]
  sqlCode?: string
  isCorrect: boolean
  score: number
  timeSpent: number // 用时(秒)
  attempts: number // 尝试次数
  hints_used: number // 使用提示次数
  submittedAt: Timestamp
}

/**
 * 学习统计接口
 */
export interface LearningStats {
  totalLessons: number
  completedLessons: number
  completedExercises: number // 完成的练习数
  totalQuestions: number
  correctAnswers: number
  correctRate: number // 正确率
  totalStudyTime: number // 总学习时间(分钟)
  currentStreak: number // 连续学习天数
  longestStreak: number // 最长连续学习天数
  skillLevels: Record<SkillType, number> // 技能掌握度(0-100)
  weeklyProgress: WeeklyProgress[]
}

/**
 * 周学习进度接口
 */
export interface WeeklyProgress {
  week: string // YYYY-WW格式
  date: string // 日期字符串
  lessonsCompleted: number
  questionsAnswered: number
  studyTime: number
  accuracy: number
  value: number // 进度值
}

/**
 * 成就接口
 */
export interface Achievement {
  id: ID
  title: string
  description: string
  icon: string
  category: 'learning' | 'practice' | 'social' | 'special'
  condition: AchievementCondition
  reward?: AchievementReward
  isUnlocked: boolean
  unlockedAt?: Timestamp
}

/**
 * 成就条件接口
 */
export interface AchievementCondition {
  type: 'lessons_completed' | 'questions_correct' | 'study_time' | 'streak_days' | 'skill_level'
  target: number
  skill?: SkillType
}

/**
 * 成就奖励接口
 */
export interface AchievementReward {
  type: 'badge' | 'title' | 'feature'
  value: string
}

/**
 * 知识库文章接口
 */
export interface KnowledgeArticle {
  id: ID
  title: string
  content: string
  summary: string
  category: string
  tags: string[]
  author: string
  difficulty?: DifficultyLevel
  skills?: SkillType[]
  examples?: CodeExample[]
  relatedArticles?: ID[]
  views: number
  likes: number
  favorited: boolean
  viewCount?: number
  isBookmarked?: boolean
  readAt?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * 代码示例接口
 */
export interface CodeExample {
  id: ID
  title: string
  description: string
  sqlCode: string
  expectedOutput?: unknown[]
  explanation: string
}

/**
 * SQL执行结果接口
 */
export interface SQLExecutionResult {
  success: boolean
  data?: unknown[]
  columns?: string[]
  rowCount?: number
  affectedRows?: number // 影响的行数
  executionTime?: number // 执行时间(毫秒)
  error?: SQLError
  errorDetails?: string // 详细错误信息
}

/**
 * SQL错误接口
 */
export interface SQLError {
  code: string
  message: string
  line?: number
  column?: number
  suggestion?: string
}

/**
 * 编辑器配置接口
 */
export interface EditorConfig {
  theme: 'vs' | 'vs-dark' | 'hc-black'
  fontSize: number
  tabSize: number
  wordWrap: boolean
  minimap: boolean
  lineNumbers: boolean
  autoComplete: boolean
  formatOnSave: boolean
}

/**
 * 用户偏好设置接口
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  notifications: NotificationSettings
  editor: EditorConfig
  learning: LearningPreferences
}

/**
 * 通知设置接口
 */
export interface NotificationSettings {
  enabled: boolean
  email: boolean
  push: boolean
  sound: boolean
  achievements: boolean
  reminders: boolean
}

/**
 * 学习偏好设置接口
 */
export interface LearningPreferences {
  autoSave: boolean
  showHints: boolean
  skipIntro: boolean
  difficultyPreference: DifficultyLevel
  dailyGoal: number // 每日学习目标(分钟)
  reminderTime?: string // 提醒时间 HH:mm格式
}

/**
 * API响应接口
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp: Timestamp
}

/**
 * 分页参数接口
 */
export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * 分页响应接口
 */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * 搜索参数接口
 */
export interface SearchParams {
  query: string
  category?: string
  difficulty?: DifficultyLevel
  skills?: SkillType[]
  tags?: string[]
}

/**
 * 图表数据接口
 */
export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

/**
 * 图表数据集接口
 */
export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
  borderWidth?: number
}

/**
 * 项目步骤接口
 */
export interface ProjectStep {
  title: string
  description: string
  difficulty: DifficultyLevel
  estimatedTime: number
  completed: boolean
  instruction: string
  hints: string[]
  expectedOutput: {
    columns: string[]
    data: unknown[]
  }
}

/**
 * 项目接口
 */
export interface Project {
  id: number
  title: string
  description: string
  industry: string
  difficulty: DifficultyLevel
  status: 'available' | 'in_progress' | 'completed' | 'locked'
  progress: number
  estimatedHours: number
  totalSteps: number
  points: number
  background: string
  objectives: string[]
  skills: string[]
  steps: ProjectStep[]
}

/**
 * 练习题接口（用于练习页面）
 */
export interface PracticeQuestion {
  id: ID
  title: string
  description: string
  content?: string
  difficulty: DifficultyLevel
  category: string
  tags: string[]
  isCompleted: boolean
  attempts: number
  maxAttempts?: number
  averageTime?: number
  points: number
  timeLimit: number
  hint?: string
  solution?: string
  explanation?: string
  sampleData?: string
  schema?: Array<{
    name: string
    columns: Array<{ name: string; type: string; primaryKey?: boolean }>
    data: unknown[]
  }>
  expectedAnswer?: string
  question?: string
  hints?: string[]
  tableSchema?: DatabaseSchema
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

/**
 * SQL执行结果接口（用于练习页面）
 */
export interface SQLResult {
  columns: Array<{ name: string; type: string }>
  rows: unknown[][]
  success: boolean
  error?: string
  errorDetails?: string // 详细错误信息
  executionTime?: number
  affectedRows?: number // 影响的行数
}

/**
 * 导航菜单项接口
 */
export interface MenuItem {
  path: string
  title: string
  icon: string
  children?: MenuItem[]
  meta?: {
    requiresAuth?: boolean
    roles?: string[]
    hidden?: boolean
  }
}

/**
 * 面包屑导航项接口
 */
export interface BreadcrumbItem {
  title: string
  path?: string
  icon?: string
}

/**
 * 表格列配置接口
 */
export interface TableColumn {
  key: string
  title: string
  label: string // 列标签
  width?: number
  minWidth?: number // 最小宽度
  sortable?: boolean
  filterable?: boolean
  render?: (_value: unknown, _record: unknown) => string
}

/**
 * 表单字段接口
 */
export interface FormField {
  name: string
  label: string
  type: 'input' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number'
  required?: boolean
  placeholder?: string
  options?: { label: string; value: unknown }[]
  validation?: FormValidationRule[]
}

/**
 * 表单验证规则接口
 */
export interface FormValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom'
  value?: unknown
  message: string
  validator?: (_value: unknown) => boolean
}

/**
 * 数据库模式接口
 */
export interface DatabaseSchema {
  name: string
  tables: Array<{
    name: string
    rowCount?: number
    columns: Array<{
      name: string
      type: string
      nullable: boolean
      primaryKey?: boolean
      foreignKey?: string
    }>
  }>
}

/**
 * 查询历史接口
 */
export interface QueryHistory {
  sql: string
  success: boolean
  executionTime: number
  timestamp: number
}
