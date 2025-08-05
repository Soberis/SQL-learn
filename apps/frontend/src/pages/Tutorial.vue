<template>
  <div class="tutorial">
    <!-- 页面头部 -->
    <div class="tutorial__header">
      <div class="tutorial__header-content">
        <div class="tutorial__breadcrumb">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>交互式教程</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentCourse">{{ currentCourse.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="tutorial__header-actions">
          <el-button-group>
            <el-button :icon="Search" @click="showSearchDialog = true">搜索课程</el-button>
            <el-button :icon="Filter" @click="showFilterDrawer = true">筛选</el-button>
            <el-button :icon="Sort" @click="handleSortChange">排序</el-button>
          </el-button-group>
        </div>
      </div>
    </div>

    <div class="tutorial__content">
      <el-row :gutter="24">
        <!-- 左侧课程导航 -->
        <el-col :xs="24" :md="8" :lg="6">
          <div class="tutorial__sidebar">
            <!-- 课程分类 -->
            <el-card class="tutorial__nav-card" shadow="hover">
              <template #header>
                <h3 class="tutorial__nav-title">
                  <el-icon><FolderOpened /></el-icon>
                  课程分类
                </h3>
              </template>

              <div class="tutorial__categories">
                <div
                  v-for="category in categories"
                  :key="category.id"
                  class="tutorial__category-item"
                  :class="{ 'tutorial__category-item--active': selectedCategory === category.id }"
                  @click="handleCategorySelect(category.id)"
                >
                  <div class="tutorial__category-info">
                    <span class="tutorial__category-name">{{ category.name }}</span>
                    <span class="tutorial__category-count">{{ category.courseCount }}</span>
                  </div>
                  <div class="tutorial__category-progress">
                    <el-progress
                      :percentage="category.progress"
                      :stroke-width="4"
                      :show-text="false"
                      :color="category.progress === 100 ? '#67C23A' : '#409EFF'"
                    />
                  </div>
                </div>
              </div>
            </el-card>

            <!-- 学习路径 -->
            <el-card class="tutorial__nav-card" shadow="hover">
              <template #header>
                <h3 class="tutorial__nav-title">
                  <el-icon><Guide /></el-icon>
                  学习路径
                </h3>
              </template>

              <div class="tutorial__learning-paths">
                <div v-for="path in learningPaths" :key="path.id" class="tutorial__path-item" @click="handlePathSelect">
                  <div class="tutorial__path-icon">
                    <el-icon><component :is="path.icon" /></el-icon>
                  </div>
                  <div class="tutorial__path-info">
                    <h4 class="tutorial__path-title">{{ path.title }}</h4>
                    <p class="tutorial__path-desc">{{ path.description }}</p>
                    <div class="tutorial__path-meta">
                      <span class="tutorial__path-courses">{{ path.courseCount }} 课程</span>
                      <span class="tutorial__path-duration">{{ formatDuration(path.duration) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </el-col>

        <!-- 右侧主要内容 -->
        <el-col :xs="24" :md="16" :lg="18">
          <div class="tutorial__main">
            <!-- 课程列表视图 -->
            <div v-if="!currentCourse" class="tutorial__course-list">
              <!-- 筛选标签 -->
              <div v-if="activeFilters.length > 0" class="tutorial__filters">
                <span class="tutorial__filters-label">当前筛选：</span>
                <el-tag v-for="filter in activeFilters" :key="filter.key" closable @close="removeFilter(filter.key)">
                  {{ filter.label }}
                </el-tag>
                <el-button type="text" size="small" @click="clearAllFilters">清除全部</el-button>
              </div>

              <!-- 课程网格 -->
              <div v-if="loading.courses" class="tutorial__loading">
                <LoadingSpinner text="加载课程中..." />
              </div>

              <div v-else-if="filteredCourses.length > 0" class="tutorial__courses-grid">
                <div
                  v-for="course in paginatedCourses"
                  :key="course.id"
                  class="tutorial__course-card"
                  @click="handleCourseSelect(course)"
                >
                  <div class="tutorial__course-header">
                    <div class="tutorial__course-difficulty">
                      <el-tag :type="getDifficultyType(course.difficulty)" size="small">
                        {{ getDifficultyText(course.difficulty) }}
                      </el-tag>
                    </div>
                    <div class="tutorial__course-progress">
                      <el-progress type="circle" :percentage="course.progress" :width="50" :stroke-width="4" />
                    </div>
                  </div>

                  <div class="tutorial__course-content">
                    <h3 class="tutorial__course-title">{{ course.title }}</h3>
                    <p class="tutorial__course-desc">{{ course.description }}</p>

                    <div class="tutorial__course-meta">
                      <div class="tutorial__course-stats">
                        <span class="tutorial__course-stat">
                          <el-icon><Clock /></el-icon>
                          {{ formatDuration(course.duration) }}
                        </span>
                        <span class="tutorial__course-stat">
                          <el-icon><Document /></el-icon>
                          {{ course.lessons.length }} 课时
                        </span>
                      </div>

                      <div class="tutorial__course-skills">
                        <el-tag v-for="skill in course.skills.slice(0, 2)" :key="skill" size="small" effect="plain">
                          {{ skill }}
                        </el-tag>
                        <span v-if="course.skills.length > 2" class="tutorial__course-more-skills">
                          +{{ course.skills.length - 2 }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="tutorial__course-footer">
                    <el-button type="primary" size="small" :disabled="course.progress === 100">
                      {{ course.progress === 0 ? '开始学习' : course.progress === 100 ? '已完成' : '继续学习' }}
                    </el-button>
                  </div>
                </div>
              </div>

              <EmptyState v-else type="search" title="没有找到匹配的课程" description="尝试调整筛选条件或搜索关键词">
                <template #action>
                  <el-button type="primary" @click="clearAllFilters">清除筛选条件</el-button>
                </template>
              </EmptyState>

              <!-- 分页器 -->
              <div v-if="totalCourses > pageSize" class="tutorial__pagination">
                <el-pagination
                  v-model:current-page="currentPage"
                  v-model:page-size="pageSize"
                  :page-sizes="[12, 24, 48]"
                  :total="totalCourses"
                  layout="total, sizes, prev, pager, next, jumper"
                  background
                />
              </div>
            </div>

            <!-- 课程详情视图 -->
            <div v-else class="tutorial__course-detail">
              <div class="tutorial__course-detail-header">
                <el-button :icon="ArrowLeft" @click="backToCourseList">返回课程列表</el-button>

                <div class="tutorial__course-detail-info">
                  <h1 class="tutorial__course-detail-title">{{ currentCourse.title }}</h1>
                  <p class="tutorial__course-detail-desc">{{ currentCourse.description }}</p>

                  <div class="tutorial__course-detail-meta">
                    <el-tag :type="getDifficultyType(currentCourse.difficulty)">
                      {{ getDifficultyText(currentCourse.difficulty) }}
                    </el-tag>
                    <span class="tutorial__course-detail-duration">
                      <el-icon><Clock /></el-icon>
                      {{ formatDuration(currentCourse.duration) }}
                    </span>
                    <span class="tutorial__course-detail-lessons">
                      <el-icon><Document /></el-icon>
                      {{ currentCourse.lessons.length }} 课时
                    </span>
                  </div>
                </div>

                <div class="tutorial__course-detail-progress">
                  <el-progress type="circle" :percentage="currentCourse.progress" :width="80" :stroke-width="6">
                    <template #default="{ percentage }">
                      <span class="tutorial__progress-text">{{ percentage }}%</span>
                    </template>
                  </el-progress>
                </div>
              </div>

              <!-- 课程内容 -->
              <el-row :gutter="24">
                <el-col :xs="24" :lg="8">
                  <!-- 课时列表 -->
                  <el-card class="tutorial__lessons-card" shadow="hover">
                    <template #header>
                      <h3 class="tutorial__lessons-title">
                        <el-icon><List /></el-icon>
                        课程目录
                      </h3>
                    </template>

                    <div class="tutorial__lessons">
                      <div
                        v-for="(lesson, index) in currentCourse.lessons"
                        :key="lesson.id"
                        class="tutorial__lesson-item"
                        :class="{
                          'tutorial__lesson-item--active': currentLesson?.id === lesson.id,
                          'tutorial__lesson-item--completed': lesson.completed,
                        }"
                        @click="handleLessonSelect(lesson)"
                      >
                        <div class="tutorial__lesson-index">{{ index + 1 }}</div>
                        <div class="tutorial__lesson-info">
                          <h4 class="tutorial__lesson-title">{{ lesson.title }}</h4>
                          <div class="tutorial__lesson-meta">
                            <span class="tutorial__lesson-duration">
                              <el-icon><Clock /></el-icon>
                              {{ lesson.duration }}分钟
                            </span>
                            <el-icon v-if="lesson.completed" class="tutorial__lesson-completed">
                              <SuccessFilled />
                            </el-icon>
                          </div>
                        </div>
                      </div>
                    </div>
                  </el-card>
                </el-col>

                <el-col :xs="24" :lg="16">
                  <!-- 课时内容 -->
                  <el-card v-if="currentLesson" class="tutorial__lesson-content-card" shadow="hover">
                    <template #header>
                      <div class="tutorial__lesson-header">
                        <h3 class="tutorial__lesson-content-title">{{ currentLesson.title }}</h3>
                        <div class="tutorial__lesson-actions">
                          <el-button :disabled="!canGoPrevious" @click="goToPreviousLesson">上一课</el-button>
                          <el-button type="primary" :disabled="!canGoNext" @click="goToNextLesson">下一课</el-button>
                        </div>
                      </div>
                    </template>

                    <div class="tutorial__lesson-content">
                      <div class="tutorial__lesson-text" v-html="currentLesson.content" />

                      <!-- 交互式代码示例 -->
                      <div v-if="currentLesson.codeExample" class="tutorial__code-example">
                        <h4 class="tutorial__code-title">代码示例</h4>
                        <SQLEditor
                          v-model="exampleCode"
                          :height="'200px'"
                          :readonly="true"
                          @execute="handleCodeExecute"
                        />
                      </div>

                      <!-- 练习题 -->
                      <div v-if="currentLesson.exercise" class="tutorial__lesson-exercise">
                        <h4 class="tutorial__exercise-title">课堂练习</h4>
                        <p class="tutorial__exercise-question">
                          {{ currentLesson.exercise.question }}
                        </p>
                        <SQLEditor v-model="exerciseAnswer" :height="'150px'" @execute="handleExerciseSubmit" />
                        <div class="tutorial__exercise-actions">
                          <el-button type="primary" @click="handleExerciseSubmit">提交答案</el-button>
                          <el-button @click="showExerciseHint">查看提示</el-button>
                        </div>
                      </div>
                    </div>
                  </el-card>

                  <!-- 选择课时提示 -->
                  <el-card v-else class="tutorial__lesson-placeholder" shadow="hover">
                    <EmptyState type="empty" title="请选择课时" description="从左侧课程目录中选择要学习的课时" />
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索对话框 -->
    <el-dialog v-model="showSearchDialog" title="搜索课程" width="600px" :before-close="handleSearchClose">
      <el-input
        v-model="searchKeyword"
        placeholder="输入课程名称或关键词"
        size="large"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <div v-if="searchResults.length > 0" class="tutorial__search-results">
        <div
          v-for="course in searchResults"
          :key="course.id"
          class="tutorial__search-result-item"
          @click="handleSearchResultClick(course)"
        >
          <h4 class="tutorial__search-result-title">{{ course.title }}</h4>
          <p class="tutorial__search-result-desc">{{ course.description }}</p>
        </div>
      </div>

      <template #footer>
        <el-button @click="showSearchDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </template>
    </el-dialog>

    <!-- 筛选抽屉 -->
    <el-drawer v-model="showFilterDrawer" title="筛选课程" size="400px">
      <div class="tutorial__filter-content">
        <!-- 难度筛选 -->
        <div class="tutorial__filter-group">
          <h4 class="tutorial__filter-title">难度等级</h4>
          <el-checkbox-group v-model="filters.difficulty">
            <el-checkbox label="beginner">初级</el-checkbox>
            <el-checkbox label="intermediate">中级</el-checkbox>
            <el-checkbox label="advanced">高级</el-checkbox>
          </el-checkbox-group>
        </div>

        <!-- 技能筛选 -->
        <div class="tutorial__filter-group">
          <h4 class="tutorial__filter-title">技能类型</h4>
          <el-checkbox-group v-model="filters.skills">
            <el-checkbox label="SELECT查询">SELECT查询</el-checkbox>
            <el-checkbox label="JOIN连接">JOIN连接</el-checkbox>
            <el-checkbox label="聚合函数">聚合函数</el-checkbox>
            <el-checkbox label="子查询">子查询</el-checkbox>
            <el-checkbox label="数据修改">数据修改</el-checkbox>
            <el-checkbox label="DDL操作">DDL操作</el-checkbox>
          </el-checkbox-group>
        </div>

        <!-- 进度筛选 -->
        <div class="tutorial__filter-group">
          <h4 class="tutorial__filter-title">学习进度</h4>
          <el-radio-group v-model="filters.progress">
            <el-radio label="all">全部</el-radio>
            <el-radio label="not-started">未开始</el-radio>
            <el-radio label="in-progress">进行中</el-radio>
            <el-radio label="completed">已完成</el-radio>
          </el-radio-group>
        </div>
      </div>

      <template #footer>
        <div class="tutorial__filter-footer">
          <el-button @click="resetFilters">重置</el-button>
          <el-button type="primary" @click="applyFilters">应用筛选</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Search,
  Filter,
  Sort,
  FolderOpened,
  Guide,
  Clock,
  Document,
  ArrowLeft,
  List,
  SuccessFilled,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import EmptyState from '../components/common/EmptyState.vue'
import SQLEditor from '../components/editor/SQLEditor.vue'
// import api from '../api' // 暂时注释掉未使用的导入
import { formatDuration, getDifficultyText } from '../utils'
import type { Course, Lesson, SkillType } from '../types'

/**
 * 交互式教程页面
 * 提供课程浏览、学习、练习等功能
 */

const router = useRouter()
const route = useRoute()

// 响应式数据
const courses = ref<Course[]>([])
const currentCourse = ref<Course | null>(null)
const currentLesson = ref<Lesson | null>(null)
const selectedCategory = ref('all')
const searchKeyword = ref('')
const searchResults = ref<Course[]>([])
const exampleCode = ref('')
const exerciseAnswer = ref('')

// UI状态
const showSearchDialog = ref(false)
const showFilterDrawer = ref(false)
const currentPage = ref(1)
const pageSize = ref(12)

// 加载状态
const loading = ref({
  courses: false,
  search: false,
})

// 筛选条件
const filters = ref({
  difficulty: [] as string[],
  skills: [] as string[],
  progress: 'all',
})

// 课程分类
const categories = ref([
  { id: 'all', name: '全部课程', courseCount: 0, progress: 0 },
  { id: 'basic', name: 'SQL基础', courseCount: 5, progress: 80 },
  { id: 'advanced', name: '高级查询', courseCount: 3, progress: 45 },
  { id: 'optimization', name: '性能优化', courseCount: 2, progress: 0 },
])

// 学习路径
const learningPaths = ref([
  {
    id: 'beginner',
    title: '初学者路径',
    description: '从零开始学习SQL',
    icon: 'Guide',
    courseCount: 6,
    duration: 480,
  },
  {
    id: 'developer',
    title: '开发者路径',
    description: '面向开发人员的SQL技能',
    icon: 'Monitor',
    courseCount: 8,
    duration: 720,
  },
  {
    id: 'analyst',
    title: '分析师路径',
    description: '数据分析必备SQL技能',
    icon: 'DataAnalysis',
    courseCount: 5,
    duration: 600,
  },
])

// 计算属性
const filteredCourses = computed(() => {
  let result = courses.value

  // 分类筛选
  if (selectedCategory.value !== 'all') {
    result = result.filter((course: Course) => course.category === selectedCategory.value)
  }

  // 难度筛选
  if (filters.value.difficulty.length > 0) {
    result = result.filter((course: Course) => filters.value.difficulty.includes(course.difficulty))
  }

  // 技能筛选
  if (filters.value.skills.length > 0) {
    result = result.filter((course: Course) =>
      course.skills.some((skill: SkillType) => filters.value.skills.includes(skill))
    )
  }

  // 进度筛选
  if (filters.value.progress !== 'all') {
    switch (filters.value.progress) {
      case 'not-started':
        result = result.filter((course: Course) => course.progress === 0)
        break
      case 'in-progress':
        result = result.filter((course: Course) => course.progress > 0 && course.progress < 100)
        break
      case 'completed':
        result = result.filter((course: Course) => course.progress === 100)
        break
    }
  }

  return result
})

const paginatedCourses = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredCourses.value.slice(start, end)
})

const totalCourses = computed(() => filteredCourses.value.length)

const activeFilters = computed(() => {
  const filters: Array<{ key: string; label: string }> = []

  if (selectedCategory.value !== 'all') {
    const category = categories.value.find(c => c.id === selectedCategory.value)
    if (category) {
      filters.push({ key: 'category', label: category.name })
    }
  }

  return filters
})

const canGoPrevious = computed(() => {
  if (!currentCourse.value || !currentLesson.value) return false
  const currentIndex = currentCourse.value.lessons.findIndex((l: Lesson) => l.id === currentLesson.value?.id)
  return currentIndex > 0
})

const canGoNext = computed(() => {
  if (!currentCourse.value || !currentLesson.value) return false
  const currentIndex = currentCourse.value.lessons.findIndex((l: Lesson) => l.id === currentLesson.value?.id)
  return currentIndex < currentCourse.value.lessons.length - 1
})

/**
 * 获取难度等级对应的标签类型
 */
const getDifficultyType = (difficulty: string): string => {
  const typeMap: Record<string, string> = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'danger',
  }
  return typeMap[difficulty] || 'info'
}

/**
 * 处理分类选择
 */
const handleCategorySelect = (categoryId: string) => {
  selectedCategory.value = categoryId
  currentPage.value = 1
}

/**
 * 处理学习路径选择
 */
const handlePathSelect = () => {
  // 根据学习路径筛选课程
  ElMessage.info('学习路径功能开发中')
}

/**
 * 处理课程选择
 */
const handleCourseSelect = (course: Course) => {
  currentCourse.value = course
  // 默认选择第一个课时
  if (course.lessons.length > 0) {
    currentLesson.value = course.lessons[0]
    exampleCode.value = currentLesson.value?.codeExample || ''
  }

  // 更新URL
  router.push(`/tutorial/${course.id}`)
}

/**
 * 返回课程列表
 */
const backToCourseList = () => {
  currentCourse.value = null
  currentLesson.value = null
  router.push('/tutorial')
}

/**
 * 处理课时选择
 */
const handleLessonSelect = (lesson: Lesson) => {
  currentLesson.value = lesson
  exampleCode.value = lesson.codeExample || ''
  exerciseAnswer.value = ''
}

/**
 * 上一课
 */
const goToPreviousLesson = () => {
  if (!currentCourse.value || !currentLesson.value) return

  const currentIndex = currentCourse.value.lessons.findIndex((l: Lesson) => l.id === currentLesson.value?.id)
  if (currentIndex > 0) {
    handleLessonSelect(currentCourse.value.lessons[currentIndex - 1])
  }
}

/**
 * 下一课
 */
const goToNextLesson = () => {
  if (!currentCourse.value || !currentLesson.value) return

  const currentIndex = currentCourse.value.lessons.findIndex((l: Lesson) => l.id === currentLesson.value?.id)
  if (currentIndex < currentCourse.value.lessons.length - 1) {
    // 标记当前课时为已完成
    currentLesson.value.completed = true
    handleLessonSelect(currentCourse.value.lessons[currentIndex + 1])
  }
}

/**
 * 处理代码执行
 */
const handleCodeExecute = () => {
  ElMessage.success('代码执行功能开发中')
}

/**
 * 处理练习提交
 */
const handleExerciseSubmit = () => {
  if (!exerciseAnswer.value.trim()) {
    ElMessage.warning('请输入答案')
    return
  }

  ElMessage.success('答案提交成功')
}

/**
 * 显示练习提示
 */
const showExerciseHint = () => {
  if (currentLesson.value?.exercise?.hints && currentLesson.value.exercise.hints.length > 0) {
    ElMessage.info(currentLesson.value.exercise.hints[0])
  }
}

/**
 * 处理搜索
 */
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  loading.value.search = true
  try {
    // 模拟搜索
    await new Promise(resolve => setTimeout(resolve, 500))
    searchResults.value = courses.value.filter(
      (course: Course) => course.title.includes(searchKeyword.value) || course.description.includes(searchKeyword.value)
    )
  } catch {
    ElMessage.error('搜索失败')
  } finally {
    loading.value.search = false
  }
}

/**
 * 处理搜索结果点击
 */
const handleSearchResultClick = (course: Course) => {
  showSearchDialog.value = false
  handleCourseSelect(course)
}

/**
 * 关闭搜索对话框
 */
const handleSearchClose = () => {
  searchKeyword.value = ''
  searchResults.value = []
}

/**
 * 处理排序变化
 */
const handleSortChange = () => {
  ElMessage.info('排序功能开发中')
}

/**
 * 移除筛选条件
 */
const removeFilter = (key: string) => {
  if (key === 'category') {
    selectedCategory.value = 'all'
  }
}

/**
 * 清除所有筛选条件
 */
const clearAllFilters = () => {
  selectedCategory.value = 'all'
  filters.value = {
    difficulty: [],
    skills: [],
    progress: 'all',
  }
  currentPage.value = 1
}

/**
 * 重置筛选条件
 */
const resetFilters = () => {
  filters.value = {
    difficulty: [],
    skills: [],
    progress: 'all',
  }
}

/**
 * 应用筛选条件
 */
const applyFilters = () => {
  showFilterDrawer.value = false
  currentPage.value = 1
}

/**
 * 加载课程数据
 */
const loadCourses = async () => {
  loading.value.courses = true
  try {
    // 使用模拟数据
    const courseData: any[] = [
      {
        id: '1',
        title: 'SQL基础入门',
        description: '从零开始学习SQL基础语法',
        difficulty: 'beginner',
        lessons: []
      },
      {
        id: '2', 
        title: 'SQL进阶查询',
        description: '掌握复杂查询和数据分析',
        difficulty: 'intermediate',
        lessons: []
      }
    ]
    courses.value = courseData

    // 更新分类统计
    categories.value[0].courseCount = courseData.length
  } catch (error) {
    console.error('加载课程失败:', error)
    ElMessage.error('加载课程失败')
  } finally {
    loading.value.courses = false
  }
}

/**
 * 初始化页面
 */
const initTutorial = async () => {
  await loadCourses()

  // 如果URL中有课程ID，直接跳转到课程详情
  const courseId = route.params.courseId as string
  if (courseId) {
    const course = courses.value.find((c: Course) => c.id === courseId)
    if (course) {
      handleCourseSelect(course)
    }
  }
}

// 生命周期
onMounted(() => {
  initTutorial()
})

// 监听路由变化
watch(
  () => route.params.courseId,
  courseId => {
    if (!courseId) {
      backToCourseList()
    }
  }
)
</script>

<style scoped>
.tutorial {
  min-height: 100vh;
  background: var(--el-bg-color-page);
}

.tutorial__header {
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
  padding: 16px 24px;
}

.tutorial__header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tutorial__breadcrumb {
  flex: 1;
}

.tutorial__header-actions {
  display: flex;
  gap: 12px;
}

.tutorial__content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.tutorial__sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.tutorial__nav-card {
  border-radius: 8px;
}

.tutorial__nav-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--el-text-color-primary);
}

/* 课程分类 */
.tutorial__categories {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tutorial__category-item {
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tutorial__category-item:hover {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.tutorial__category-item--active {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.tutorial__category-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.tutorial__category-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.tutorial__category-count {
  font-size: 12px;
  color: var(--el-text-color-regular);
  background: var(--el-bg-color-page);
  padding: 2px 6px;
  border-radius: 10px;
}

.tutorial__category-progress {
  margin-top: 8px;
}

/* 学习路径 */
.tutorial__learning-paths {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tutorial__path-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tutorial__path-item:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
  transform: translateY(-2px);
}

.tutorial__path-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-radius: 8px;
  font-size: 20px;
}

.tutorial__path-info {
  flex: 1;
}

.tutorial__path-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: var(--el-text-color-primary);
}

.tutorial__path-desc {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.tutorial__path-meta {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

/* 主要内容区域 */
.tutorial__main {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 24px;
}

.tutorial__loading {
  padding: 60px;
  text-align: center;
}

/* 筛选标签 */
.tutorial__filters {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--el-bg-color-page);
  border-radius: 6px;
}

.tutorial__filters-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin-right: 8px;
}

/* 课程网格 */
.tutorial__courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.tutorial__course-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--el-bg-color);
}

.tutorial__course-card:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.15);
  transform: translateY(-4px);
}

.tutorial__course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 0;
}

.tutorial__course-content {
  padding: 16px;
}

.tutorial__course-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
  line-height: 1.4;
}

.tutorial__course-desc {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin: 0 0 16px 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tutorial__course-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tutorial__course-stats {
  display: flex;
  gap: 16px;
}

.tutorial__course-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.tutorial__course-skills {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.tutorial__course-more-skills {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.tutorial__course-footer {
  padding: 0 16px 16px;
}

/* 分页器 */
.tutorial__pagination {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

/* 课程详情 */
.tutorial__course-detail-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-color-success-light-9) 100%);
  border-radius: 12px;
}

.tutorial__course-detail-info {
  flex: 1;
}

.tutorial__course-detail-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.tutorial__course-detail-desc {
  font-size: 16px;
  color: var(--el-text-color-regular);
  margin: 0 0 16px 0;
  line-height: 1.6;
}

.tutorial__course-detail-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.tutorial__course-detail-duration,
.tutorial__course-detail-lessons {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.tutorial__progress-text {
  font-size: 14px;
  font-weight: 600;
}

/* 课时列表 */
.tutorial__lessons-card {
  height: fit-content;
  border-radius: 8px;
}

.tutorial__lessons-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--el-text-color-primary);
}

.tutorial__lessons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tutorial__lesson-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tutorial__lesson-item:hover {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.tutorial__lesson-item--active {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.tutorial__lesson-item--completed {
  background: var(--el-color-success-light-9);
  border-color: var(--el-color-success-light-3);
}

.tutorial__lesson-index {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-bg-color-page);
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-regular);
}

.tutorial__lesson-item--active .tutorial__lesson-index {
  background: var(--el-color-primary);
  color: white;
}

.tutorial__lesson-info {
  flex: 1;
}

.tutorial__lesson-title {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 4px 0;
  color: var(--el-text-color-primary);
}

.tutorial__lesson-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tutorial__lesson-duration {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.tutorial__lesson-completed {
  color: var(--el-color-success);
  font-size: 16px;
}

/* 课时内容 */
.tutorial__lesson-content-card {
  border-radius: 8px;
}

.tutorial__lesson-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tutorial__lesson-content-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--el-text-color-primary);
}

.tutorial__lesson-actions {
  display: flex;
  gap: 8px;
}

.tutorial__lesson-content {
  line-height: 1.8;
}

.tutorial__lesson-text {
  font-size: 15px;
  color: var(--el-text-color-primary);
  margin-bottom: 24px;
}

.tutorial__lesson-text :deep(h1),
.tutorial__lesson-text :deep(h2),
.tutorial__lesson-text :deep(h3),
.tutorial__lesson-text :deep(h4) {
  color: var(--el-text-color-primary);
  margin: 24px 0 16px 0;
}

.tutorial__lesson-text :deep(p) {
  margin: 16px 0;
}

.tutorial__lesson-text :deep(code) {
  background: var(--el-bg-color-page);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
}

.tutorial__code-example,
.tutorial__lesson-exercise {
  margin-top: 32px;
  padding: 20px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

.tutorial__code-title,
.tutorial__exercise-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: var(--el-text-color-primary);
}

.tutorial__exercise-question {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin: 0 0 16px 0;
  line-height: 1.6;
}

.tutorial__exercise-actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}

.tutorial__lesson-placeholder {
  border-radius: 8px;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 搜索结果 */
.tutorial__search-results {
  margin-top: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.tutorial__search-result-item {
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tutorial__search-result-item:hover {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.tutorial__search-result-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: var(--el-text-color-primary);
}

.tutorial__search-result-desc {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin: 0;
  line-height: 1.4;
}

/* 筛选内容 */
.tutorial__filter-content {
  padding: 16px 0;
}

.tutorial__filter-group {
  margin-bottom: 24px;
}

.tutorial__filter-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--el-text-color-primary);
}

.tutorial__filter-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 0 0;
  border-top: 1px solid var(--el-border-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tutorial__header-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .tutorial__content {
    padding: 16px;
  }

  .tutorial__courses-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .tutorial__course-detail-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .tutorial__lesson-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .tutorial__lesson-actions {
    justify-content: center;
  }
}

/* 动画效果 */
.tutorial__course-card {
  animation: tutorial-card-fade-in 0.6s ease-out;
}

@keyframes tutorial-card-fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
