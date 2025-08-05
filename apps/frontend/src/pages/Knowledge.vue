<template>
  <div class="knowledge">
    <!-- 页面头部 -->
    <div class="knowledge__header">
      <div class="knowledge__header-content">
        <div class="knowledge__breadcrumb">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>知识库</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="knowledge__header-actions">
          <el-button-group>
            <el-button :icon="Plus" @click="showContributeDialog = true">贡献内容</el-button>
            <el-button :icon="Star" @click="showFavorites = !showFavorites">我的收藏</el-button>
            <el-button :icon="Download" @click="exportKnowledge">导出文档</el-button>
          </el-button-group>
        </div>
      </div>
    </div>

    <div class="knowledge__content">
      <el-row :gutter="16">
        <!-- 左侧导航栏 -->
        <el-col :xs="24" :md="6" :lg="5">
          <div class="knowledge__sidebar">
            <!-- 搜索框 -->
            <el-card class="knowledge__search-card" shadow="hover">
              <div class="knowledge__search">
                <el-input
                  v-model="searchQuery"
                  placeholder="搜索知识库..."
                  :prefix-icon="Search"
                  clearable
                  @input="handleSearch"
                  @clear="handleSearchClear"
                >
                  <template #append>
                    <el-button :icon="Search" @click="performSearch" />
                  </template>
                </el-input>

                <!-- 搜索建议 -->
                <div v-if="searchSuggestions.length > 0" class="knowledge__search-suggestions">
                  <div
                    v-for="suggestion in searchSuggestions"
                    :key="suggestion.id"
                    class="knowledge__search-suggestion"
                    @click="selectSuggestion(suggestion)"
                  >
                    <el-icon><Document /></el-icon>
                    <span>{{ suggestion.title }}</span>
                  </div>
                </div>
              </div>
            </el-card>

            <!-- 分类导航 -->
            <el-card class="knowledge__category-card" shadow="hover">
              <template #header>
                <h3 class="knowledge__card-title">
                  <el-icon><Menu /></el-icon>
                  知识分类
                </h3>
              </template>

              <div class="knowledge__categories">
                <div
                  v-for="category in categories"
                  :key="category.id"
                  class="knowledge__category-item"
                  :class="{ 'knowledge__category-item--active': selectedCategory === category.id }"
                  @click="selectCategory(category.id)"
                >
                  <div class="knowledge__category-header">
                    <el-icon class="knowledge__category-icon">
                      <component :is="expandedCategories.includes(category.id) ? 'ArrowDown' : 'ArrowRight'" />
                    </el-icon>
                    <el-icon class="knowledge__category-type-icon">
                      <component :is="category.icon" />
                    </el-icon>
                    <span class="knowledge__category-name">{{ category.name }}</span>
                    <span class="knowledge__category-count">({{ category.count }})</span>
                  </div>

                  <div
                    v-if="expandedCategories.includes(category.id) && category.subcategories"
                    class="knowledge__subcategories"
                  >
                    <div
                      v-for="subcategory in category.subcategories"
                      :key="subcategory.id"
                      class="knowledge__subcategory-item"
                      :class="{
                        'knowledge__subcategory-item--active': selectedSubcategory === subcategory.id,
                      }"
                      @click.stop="selectSubcategory(subcategory.id)"
                    >
                      <span class="knowledge__subcategory-name">{{ subcategory.name }}</span>
                      <span class="knowledge__subcategory-count">({{ subcategory.count }})</span>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>

            <!-- 热门标签 -->
            <el-card class="knowledge__tags-card" shadow="hover">
              <template #header>
                <h3 class="knowledge__card-title">
                  <el-icon><PriceTag /></el-icon>
                  热门标签
                </h3>
              </template>

              <div class="knowledge__tags">
                <el-tag
                  v-for="tag in popularTags"
                  :key="tag.name"
                  class="knowledge__tag"
                  :type="selectedTags.includes(tag.name) ? 'primary' : 'info'"
                  :effect="selectedTags.includes(tag.name) ? 'dark' : 'plain'"
                  @click="toggleTag(tag.name)"
                >
                  {{ tag.name }} ({{ tag.count }})
                </el-tag>
              </div>
            </el-card>

            <!-- 最近阅读 -->
            <el-card class="knowledge__recent-card" shadow="hover">
              <template #header>
                <div class="knowledge__card-header">
                  <h3 class="knowledge__card-title">
                    <el-icon><Clock /></el-icon>
                    最近阅读
                  </h3>
                  <el-button size="small" text @click="clearRecentReading">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </template>

              <div class="knowledge__recent-list">
                <div v-if="recentReading.length === 0" class="knowledge__recent-empty">
                  <el-empty description="暂无阅读记录" :image-size="60" />
                </div>

                <div v-else class="knowledge__recent-items">
                  <div
                    v-for="item in recentReading.slice(0, 5)"
                    :key="item.id"
                    class="knowledge__recent-item"
                    @click="selectArticle(item)"
                  >
                    <div class="knowledge__recent-title">{{ item.title }}</div>
                    <div class="knowledge__recent-time">
                      {{ item.readAt ? formatTimestamp(item.readAt, 'relative') : '' }}
                    </div>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </el-col>

        <!-- 主要内容区域 -->
        <el-col :xs="24" :md="18" :lg="19">
          <div class="knowledge__main">
            <!-- 内容头部 -->
            <div class="knowledge__main-header">
              <div class="knowledge__view-controls">
                <el-button-group>
                  <el-button
                    :type="viewMode === 'list' ? 'primary' : 'default'"
                    :icon="List"
                    @click="viewMode = 'list'"
                  >
                    列表
                  </el-button>
                  <el-button
                    :type="viewMode === 'grid' ? 'primary' : 'default'"
                    :icon="Grid"
                    @click="viewMode = 'grid'"
                  >
                    网格
                  </el-button>
                </el-button-group>
              </div>

              <div class="knowledge__sort-controls">
                <el-select v-model="sortBy" placeholder="排序方式" size="small" style="width: 120px">
                  <el-option label="最新" value="latest" />
                  <el-option label="最热" value="popular" />
                  <el-option label="标题" value="title" />
                  <el-option label="阅读量" value="views" />
                </el-select>

                <el-button :icon="sortOrder === 'asc' ? 'Sort' : 'SortDown'" size="small" @click="toggleSortOrder">
                  {{ sortOrder === 'asc' ? '升序' : '降序' }}
                </el-button>
              </div>
            </div>

            <!-- 搜索结果提示 -->
            <div v-if="searchQuery" class="knowledge__search-result">
              <el-alert
                :title="`搜索 &quot;${searchQuery}&quot; 找到 ${filteredArticles.length} 个结果`"
                type="info"
                :closable="false"
                show-icon
              />
            </div>

            <!-- 文章列表 -->
            <div class="knowledge__articles">
              <div v-if="loading" class="knowledge__loading">
                <el-skeleton :rows="5" animated />
              </div>

              <div v-else-if="filteredArticles.length === 0" class="knowledge__empty">
                <EmptyState type="search" title="未找到相关内容" description="尝试调整搜索条件或浏览其他分类" />
              </div>

              <div v-else>
                <!-- 列表视图 -->
                <div v-if="viewMode === 'list'" class="knowledge__articles-list">
                  <div
                    v-for="article in paginatedArticles"
                    :key="article.id"
                    class="knowledge__article-item"
                    @click="selectArticle(article)"
                  >
                    <div class="knowledge__article-content">
                      <div class="knowledge__article-header">
                        <h3 class="knowledge__article-title">{{ article.title }}</h3>
                        <div class="knowledge__article-meta">
                          <el-tag size="small" :type="getCategoryType(article.category)">{{ article.category }}</el-tag>
                          <span class="knowledge__article-date">{{ formatTimestamp(article.updatedAt, 'date') }}</span>
                        </div>
                      </div>

                      <p class="knowledge__article-summary">{{ article.summary }}</p>

                      <div class="knowledge__article-footer">
                        <div class="knowledge__article-tags">
                          <el-tag v-for="tag in article.tags.slice(0, 3)" :key="tag" size="small" effect="plain">
                            {{ tag }}
                          </el-tag>
                        </div>

                        <div class="knowledge__article-stats">
                          <span class="knowledge__article-stat">
                            <el-icon><View /></el-icon>
                            {{ article.views }}
                          </span>
                          <span class="knowledge__article-stat">
                            <el-icon><Star /></el-icon>
                            {{ article.likes }}
                          </span>
                          <el-button
                            size="small"
                            text
                            :icon="article.favorited ? 'StarFilled' : 'Star'"
                            :type="article.favorited ? 'warning' : 'default'"
                            @click.stop="toggleFavorite(article)"
                          >
                            {{ article.favorited ? '已收藏' : '收藏' }}
                          </el-button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 网格视图 -->
                <div v-else class="knowledge__articles-grid">
                  <div
                    v-for="article in paginatedArticles"
                    :key="article.id"
                    class="knowledge__article-card"
                    @click="selectArticle(article)"
                  >
                    <el-card shadow="hover">
                      <div class="knowledge__card-header">
                        <h3 class="knowledge__card-title">{{ article.title }}</h3>
                        <el-button
                          size="small"
                          text
                          :icon="article.favorited ? 'StarFilled' : 'Star'"
                          :type="article.favorited ? 'warning' : 'default'"
                          @click.stop="toggleFavorite(article)"
                        />
                      </div>

                      <p class="knowledge__card-summary">{{ article.summary }}</p>

                      <div class="knowledge__card-footer">
                        <div class="knowledge__card-meta">
                          <el-tag size="small" :type="getCategoryType(article.category)">{{ article.category }}</el-tag>
                          <span class="knowledge__card-date">{{ formatTimestamp(article.updatedAt, 'date') }}</span>
                        </div>

                        <div class="knowledge__card-stats">
                          <span class="knowledge__card-stat">
                            <el-icon><View /></el-icon>
                            {{ article.views }}
                          </span>
                          <span class="knowledge__card-stat">
                            <el-icon><Star /></el-icon>
                            {{ article.likes }}
                          </span>
                        </div>
                      </div>
                    </el-card>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <div v-if="filteredArticles.length > 0" class="knowledge__pagination">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="filteredArticles.length"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 文章详情对话框 -->
    <el-dialog
      v-model="showArticleDialog"
      :title="selectedArticle?.title"
      width="80%"
      :before-close="handleArticleClose"
      class="knowledge__article-dialog"
    >
      <div v-if="selectedArticle" class="knowledge__article-detail">
        <div class="knowledge__article-detail-header">
          <div class="knowledge__article-detail-meta">
            <el-tag :type="getCategoryType(selectedArticle.category)">{{ selectedArticle.category }}</el-tag>
            <span class="knowledge__article-detail-date">
              更新时间：{{ formatTimestamp(selectedArticle.updatedAt, 'date') }}
            </span>
            <span class="knowledge__article-detail-author">作者：{{ selectedArticle.author }}</span>
          </div>

          <div class="knowledge__article-detail-actions">
            <el-button
              size="small"
              :icon="selectedArticle.favorited ? 'StarFilled' : 'Star'"
              :type="selectedArticle.favorited ? 'warning' : 'default'"
              @click="toggleFavorite(selectedArticle)"
            >
              {{ selectedArticle.favorited ? '已收藏' : '收藏' }}
            </el-button>
            <el-button size="small" :icon="Share" @click="shareArticle(selectedArticle)">分享</el-button>
            <el-button size="small" :icon="Download" @click="exportArticle(selectedArticle)">导出</el-button>
          </div>
        </div>

        <div class="knowledge__article-detail-content">
          <div class="knowledge__article-detail-summary">
            <h4>摘要</h4>
            <p>{{ selectedArticle.summary }}</p>
          </div>

          <div class="knowledge__article-detail-body">
            <div v-html="selectedArticle.content"></div>
          </div>

          <div class="knowledge__article-detail-tags">
            <h4>标签</h4>
            <div class="knowledge__article-detail-tag-list">
              <el-tag v-for="tag in selectedArticle.tags" :key="tag" @click="searchByTag(tag)">
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>

        <div class="knowledge__article-detail-footer">
          <div class="knowledge__article-detail-stats">
            <span class="knowledge__article-detail-stat">
              <el-icon><View /></el-icon>
              阅读量：{{ selectedArticle.views }}
            </span>
            <span class="knowledge__article-detail-stat">
              <el-icon><Star /></el-icon>
              点赞数：{{ selectedArticle.likes }}
            </span>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 贡献内容对话框 -->
    <el-dialog v-model="showContributeDialog" title="贡献知识内容" width="600px">
      <div class="knowledge__contribute-content">
        <el-form :model="contributeForm" label-width="80px">
          <el-form-item label="标题">
            <el-input v-model="contributeForm.title" placeholder="请输入文章标题" />
          </el-form-item>
          <el-form-item label="分类">
            <el-select v-model="contributeForm.category" placeholder="选择分类" style="width: 100%">
              <el-option
                v-for="category in categories"
                :key="category.id"
                :label="category.name"
                :value="category.name"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="摘要">
            <el-input v-model="contributeForm.summary" type="textarea" :rows="3" placeholder="请输入文章摘要" />
          </el-form-item>
          <el-form-item label="标签">
            <el-select
              v-model="contributeForm.tags"
              multiple
              filterable
              allow-create
              placeholder="添加标签"
              style="width: 100%"
            >
              <el-option v-for="tag in popularTags" :key="tag.name" :label="tag.name" :value="tag.name" />
            </el-select>
          </el-form-item>
          <el-form-item label="内容">
            <el-input
              v-model="contributeForm.content"
              type="textarea"
              :rows="8"
              placeholder="请输入文章内容（支持Markdown格式）"
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="showContributeDialog = false">取消</el-button>
        <el-button type="primary" @click="submitContribution">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  Plus,
  Star,
  Download,
  Search,
  Document,
  Menu,
  PriceTag,
  Clock,
  Delete,
  List,
  Grid,
  View,
  Share,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import EmptyState from '../components/common/EmptyState.vue'
import { formatTimestamp } from '../utils'
import type { KnowledgeArticle } from '../types'

/**
 * 知识库页面
 * 提供SQL知识文档的搜索、浏览和学习功能
 */

// 响应式数据
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedSubcategory = ref('')
const selectedTags = ref<string[]>([])
const expandedCategories = ref<string[]>(['basic', 'advanced'])
const viewMode = ref<'list' | 'grid'>('list')
const sortBy = ref('latest')
const sortOrder = ref<'asc' | 'desc'>('desc')
const currentPage = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const showFavorites = ref(false)
const showArticleDialog = ref(false)
const showContributeDialog = ref(false)
const selectedArticle = ref<KnowledgeArticle | null>(null)

// 搜索建议
const searchSuggestions = ref<Array<{ id: string; title: string }>>([])

// 分类数据
const categories = ref([
  {
    id: 'basic',
    name: '基础语法',
    icon: 'Document',
    count: 45,
    subcategories: [
      { id: 'select', name: 'SELECT查询', count: 12 },
      { id: 'insert', name: 'INSERT插入', count: 8 },
      { id: 'update', name: 'UPDATE更新', count: 6 },
      { id: 'delete', name: 'DELETE删除', count: 5 },
    ],
  },
  {
    id: 'advanced',
    name: '高级特性',
    icon: 'Star',
    count: 38,
    subcategories: [
      { id: 'join', name: '连接查询', count: 15 },
      { id: 'subquery', name: '子查询', count: 10 },
      { id: 'window', name: '窗口函数', count: 8 },
      { id: 'cte', name: 'CTE表达式', count: 5 },
    ],
  },
  {
    id: 'optimization',
    name: '性能优化',
    icon: 'TrendCharts',
    count: 25,
    subcategories: [
      { id: 'index', name: '索引优化', count: 12 },
      { id: 'query', name: '查询优化', count: 8 },
      { id: 'execution', name: '执行计划', count: 5 },
    ],
  },
  {
    id: 'database',
    name: '数据库管理',
    icon: 'Setting',
    count: 32,
    subcategories: [
      { id: 'design', name: '数据库设计', count: 15 },
      { id: 'backup', name: '备份恢复', count: 10 },
      { id: 'security', name: '安全管理', count: 7 },
    ],
  },
])

// 热门标签
const popularTags = ref([
  { name: 'SELECT', count: 156 },
  { name: 'JOIN', count: 89 },
  { name: '索引', count: 67 },
  { name: '性能', count: 54 },
  { name: '子查询', count: 43 },
  { name: '聚合函数', count: 38 },
  { name: '窗口函数', count: 29 },
  { name: '事务', count: 25 },
])

// 最近阅读
const recentReading = ref<KnowledgeArticle[]>([
  {
    id: '1',
    title: 'SQL JOIN详解',
    category: '高级特性',
    summary: '深入理解SQL中各种JOIN操作的原理和应用场景',
    content: '<h2>SQL JOIN详解</h2><p>JOIN是SQL中最重要的操作之一...</p>',
    tags: ['JOIN', '连接查询', '高级'],
    author: 'SQL专家',
    views: 1250,
    likes: 89,
    favorited: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    readAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
])

// 文章数据
const articles = ref<KnowledgeArticle[]>([
  {
    id: '1',
    title: 'SQL基础语法入门',
    category: '基础语法',
    summary: '从零开始学习SQL，掌握基本的查询语法和数据操作',
    content: '<h2>SQL基础语法入门</h2><p>SQL（Structured Query Language）是用于管理关系数据库的标准语言...</p>',
    tags: ['基础', 'SELECT', '入门'],
    author: 'SQL导师',
    views: 2340,
    likes: 156,
    favorited: false,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: '2',
    title: 'SQL JOIN详解',
    category: '高级特性',
    summary: '深入理解SQL中各种JOIN操作的原理和应用场景',
    content: '<h2>SQL JOIN详解</h2><p>JOIN是SQL中最重要的操作之一...</p>',
    tags: ['JOIN', '连接查询', '高级'],
    author: 'SQL专家',
    views: 1250,
    likes: 89,
    favorited: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: '3',
    title: '数据库索引优化策略',
    category: '性能优化',
    summary: '学习如何通过合理的索引设计来提升查询性能',
    content: '<h2>数据库索引优化策略</h2><p>索引是提升数据库查询性能的关键...</p>',
    tags: ['索引', '性能', '优化'],
    author: 'DBA专家',
    views: 980,
    likes: 67,
    favorited: false,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: '4',
    title: '窗口函数完全指南',
    category: '高级特性',
    summary: '掌握SQL窗口函数的使用方法和实际应用场景',
    content: '<h2>窗口函数完全指南</h2><p>窗口函数是SQL中的高级特性...</p>',
    tags: ['窗口函数', '分析函数', '高级'],
    author: '数据分析师',
    views: 756,
    likes: 45,
    favorited: true,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: '5',
    title: '数据库设计最佳实践',
    category: '数据库管理',
    summary: '学习如何设计高效、可维护的数据库结构',
    content: '<h2>数据库设计最佳实践</h2><p>良好的数据库设计是系统成功的基础...</p>',
    tags: ['数据库设计', '规范化', '最佳实践'],
    author: '架构师',
    views: 1456,
    likes: 98,
    favorited: false,
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
])

// 贡献表单
const contributeForm = ref({
  title: '',
  category: '',
  summary: '',
  tags: [] as string[],
  content: '',
})

// 计算属性
const filteredArticles = computed(() => {
  let result = articles.value

  // 收藏筛选
  if (showFavorites.value) {
    result = result.filter(article => article.favorited)
  }

  // 分类筛选
  if (selectedCategory.value) {
    const categoryName = categories.value.find(cat => cat.id === selectedCategory.value)?.name
    if (categoryName) {
      result = result.filter(article => article.category === categoryName)
    }
  }

  // 标签筛选
  if (selectedTags.value.length > 0) {
    result = result.filter(article => selectedTags.value.some(tag => article.tags.includes(tag)))
  }

  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      article =>
        article.title.toLowerCase().includes(query) ||
        article.summary.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // 排序
  result.sort((a, b) => {
    let comparison = 0

    switch (sortBy.value) {
      case 'latest':
        comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        break
      case 'popular':
        comparison = b.views - a.views
        break
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'views':
        comparison = b.views - a.views
        break
    }

    return sortOrder.value === 'asc' ? -comparison : comparison
  })

  return result
})

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredArticles.value.slice(start, end)
})

/**
 * 获取分类类型
 */
const getCategoryType = (category: string): string => {
  const typeMap: Record<string, string> = {
    基础语法: 'primary',
    高级特性: 'success',
    性能优化: 'warning',
    数据库管理: 'info',
  }
  return typeMap[category] || 'default'
}

/**
 * 处理搜索
 */
const handleSearch = (value: string) => {
  if (value.length > 0) {
    // 模拟搜索建议
    searchSuggestions.value = articles.value
      .filter(article => article.title.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 5)
      .map(article => ({ id: article.id, title: article.title }))
  } else {
    searchSuggestions.value = []
  }
}

/**
 * 执行搜索
 */
const performSearch = () => {
  searchSuggestions.value = []
  currentPage.value = 1
}

/**
 * 清空搜索
 */
const handleSearchClear = () => {
  searchSuggestions.value = []
  currentPage.value = 1
}

/**
 * 选择搜索建议
 */
const selectSuggestion = (suggestion: { id: string; title: string }) => {
  const article = articles.value.find(a => a.id === suggestion.id)
  if (article) {
    selectArticle(article)
  }
  searchSuggestions.value = []
}

/**
 * 选择分类
 */
const selectCategory = (categoryId: string) => {
  if (selectedCategory.value === categoryId) {
    selectedCategory.value = ''
    expandedCategories.value = expandedCategories.value.filter(id => id !== categoryId)
  } else {
    selectedCategory.value = categoryId
    if (!expandedCategories.value.includes(categoryId)) {
      expandedCategories.value.push(categoryId)
    }
  }
  selectedSubcategory.value = ''
  currentPage.value = 1
}

/**
 * 选择子分类
 */
const selectSubcategory = (subcategoryId: string) => {
  selectedSubcategory.value = subcategoryId
  currentPage.value = 1
}

/**
 * 切换标签
 */
const toggleTag = (tagName: string) => {
  const index = selectedTags.value.indexOf(tagName)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tagName)
  }
  currentPage.value = 1
}

/**
 * 切换排序顺序
 */
const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

/**
 * 选择文章
 */
const selectArticle = (article: KnowledgeArticle) => {
  selectedArticle.value = article
  showArticleDialog.value = true

  // 增加阅读量
  article.views++

  // 添加到最近阅读
  const existingIndex = recentReading.value.findIndex(item => item.id === article.id)
  if (existingIndex > -1) {
    recentReading.value.splice(existingIndex, 1)
  }

  recentReading.value.unshift({
    ...article,
    readAt: new Date().toISOString(),
  })

  // 保持最多10条记录
  if (recentReading.value.length > 10) {
    recentReading.value = recentReading.value.slice(0, 10)
  }
}

/**
 * 切换收藏
 */
const toggleFavorite = (article: KnowledgeArticle) => {
  article.favorited = !article.favorited
  ElMessage.success(article.favorited ? '已添加到收藏' : '已取消收藏')
}

/**
 * 按标签搜索
 */
const searchByTag = (tag: string) => {
  searchQuery.value = tag
  showArticleDialog.value = false
  performSearch()
}

/**
 * 分享文章
 */
const shareArticle = (article: KnowledgeArticle) => {
  const shareUrl = `${window.location.origin}/knowledge/${article.id}`
  navigator.clipboard.writeText(shareUrl).then(() => {
    ElMessage.success('分享链接已复制到剪贴板')
  })
}

/**
 * 导出文章
 */
const exportArticle = (article: KnowledgeArticle) => {
  const content = `# ${article.title}\n\n${article.summary}\n\n${article.content}`
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${article.title}.md`
  a.click()
  URL.revokeObjectURL(url)

  ElMessage.success('文章已导出')
}

/**
 * 导出知识库
 */
const exportKnowledge = () => {
  ElMessage.success('知识库导出功能开发中')
}

/**
 * 清空最近阅读
 */
const clearRecentReading = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有阅读记录吗？', '确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    recentReading.value = []
    ElMessage.success('阅读记录已清空')
  } catch {
    // 用户取消
  }
}

/**
 * 提交贡献
 */
const submitContribution = () => {
  if (!contributeForm.value.title.trim()) {
    ElMessage.warning('请输入标题')
    return
  }

  if (!contributeForm.value.category) {
    ElMessage.warning('请选择分类')
    return
  }

  if (!contributeForm.value.content.trim()) {
    ElMessage.warning('请输入内容')
    return
  }

  // 模拟提交
  ElMessage.success('内容已提交，感谢您的贡献！')
  showContributeDialog.value = false

  // 重置表单
  contributeForm.value = {
    title: '',
    category: '',
    summary: '',
    tags: [],
    content: '',
  }
}

/**
 * 关闭文章对话框
 */
const handleArticleClose = () => {
  selectedArticle.value = null
}

/**
 * 处理页面大小变化
 */
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

/**
 * 处理当前页变化
 */
const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

// 监听搜索查询变化
watch(searchQuery, () => {
  currentPage.value = 1
})

// 监听排序变化
watch([sortBy, sortOrder], () => {
  currentPage.value = 1
})

// 生命周期
onMounted(() => {
  // 初始化数据
  loading.value = false
})
</script>

<style scoped>
.knowledge {
  min-height: 100vh;
  background: var(--el-bg-color-page);
}

.knowledge__header {
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
  padding: 16px 24px;
}

.knowledge__header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.knowledge__breadcrumb {
  flex: 1;
}

.knowledge__header-actions {
  display: flex;
  gap: 12px;
}

.knowledge__content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

/* 侧边栏 */
.knowledge__sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.knowledge__search-card,
.knowledge__category-card,
.knowledge__tags-card,
.knowledge__recent-card {
  border-radius: 8px;
}

.knowledge__card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: var(--el-text-color-primary);
}

.knowledge__card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 搜索 */
.knowledge__search {
  position: relative;
}

.knowledge__search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-top: none;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}

.knowledge__search-suggestion {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.knowledge__search-suggestion:hover {
  background: var(--el-bg-color-page);
}

/* 分类导航 */
.knowledge__categories {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.knowledge__category-item {
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.knowledge__category-item:hover {
  background: var(--el-bg-color-page);
}

.knowledge__category-item--active {
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-5);
}

.knowledge__category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
}

.knowledge__category-icon {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.knowledge__category-type-icon {
  font-size: 14px;
  color: var(--el-color-primary);
}

.knowledge__category-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
  flex: 1;
}

.knowledge__category-count {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.knowledge__subcategories {
  padding: 4px 8px 8px 32px;
  background: var(--el-bg-color);
}

.knowledge__subcategory-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.knowledge__subcategory-item:hover {
  background: var(--el-color-primary-light-9);
}

.knowledge__subcategory-item--active {
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
}

.knowledge__subcategory-name {
  font-size: 13px;
  font-weight: 500;
}

.knowledge__subcategory-count {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

/* 标签 */
.knowledge__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.knowledge__tag {
  cursor: pointer;
  transition: all 0.3s ease;
}

.knowledge__tag:hover {
  transform: translateY(-1px);
}

/* 最近阅读 */
.knowledge__recent-list {
  max-height: 300px;
  overflow-y: auto;
}

.knowledge__recent-empty {
  padding: 20px;
  text-align: center;
}

.knowledge__recent-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.knowledge__recent-item {
  padding: 8px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.knowledge__recent-item:hover {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.knowledge__recent-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
  line-height: 1.4;
}

.knowledge__recent-time {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

/* 主要内容区域 */
.knowledge__main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.knowledge__main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

.knowledge__view-controls {
  display: flex;
  gap: 12px;
}

.knowledge__sort-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.knowledge__search-result {
  margin-bottom: 8px;
}

/* 文章列表 */
.knowledge__articles {
  min-height: 400px;
}

.knowledge__loading {
  padding: 24px;
}

.knowledge__empty {
  padding: 60px;
  text-align: center;
}

/* 列表视图 */
.knowledge__articles-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.knowledge__article-item {
  padding: 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.knowledge__article-item:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
  transform: translateY(-1px);
}

.knowledge__article-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.knowledge__article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.knowledge__article-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
  line-height: 1.4;
  flex: 1;
}

.knowledge__article-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.knowledge__article-date {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.knowledge__article-summary {
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
  margin: 0;
}

.knowledge__article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.knowledge__article-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.knowledge__article-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.knowledge__article-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

/* 网格视图 */
.knowledge__articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.knowledge__article-card {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.knowledge__article-card:hover {
  transform: translateY(-2px);
}

.knowledge__card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.knowledge__card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
  line-height: 1.4;
  flex: 1;
}

.knowledge__card-summary {
  font-size: 13px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.knowledge__card-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.knowledge__card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.knowledge__card-date {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

.knowledge__card-stats {
  display: flex;
  gap: 12px;
}

.knowledge__card-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

/* 分页 */
.knowledge__pagination {
  display: flex;
  justify-content: center;
  padding: 24px 0;
}

/* 文章详情对话框 */
.knowledge__article-dialog {
  border-radius: 8px;
}

.knowledge__article-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.knowledge__article-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.knowledge__article-detail-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.knowledge__article-detail-date,
.knowledge__article-detail-author {
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.knowledge__article-detail-actions {
  display: flex;
  gap: 8px;
}

.knowledge__article-detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.knowledge__article-detail-summary h4,
.knowledge__article-detail-tags h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}

.knowledge__article-detail-summary p {
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
  margin: 0;
}

.knowledge__article-detail-body {
  font-size: 14px;
  line-height: 1.8;
  color: var(--el-text-color-primary);
}

.knowledge__article-detail-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.knowledge__article-detail-tag-list .el-tag {
  cursor: pointer;
}

.knowledge__article-detail-footer {
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.knowledge__article-detail-stats {
  display: flex;
  gap: 24px;
}

.knowledge__article-detail-stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

/* 贡献对话框 */
.knowledge__contribute-content {
  padding: 16px 0;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .knowledge__content {
    padding: 16px;
  }

  .knowledge__main-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .knowledge__sort-controls {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .knowledge__header-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .knowledge__article-header {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .knowledge__article-footer {
    flex-direction: column;
    gap: 8px;
  }

  .knowledge__articles-grid {
    grid-template-columns: 1fr;
  }

  .knowledge__article-detail-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .knowledge__article-detail-actions {
    justify-content: center;
  }
}

/* 动画效果 */
.knowledge__article-item {
  animation: knowledge-fade-in-up 0.6s ease-out;
}

.knowledge__article-card {
  animation: knowledge-scale-in 0.5s ease-out;
}

@keyframes knowledge-fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes knowledge-scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.knowledge__category-item {
  animation: knowledge-slide-in 0.4s ease-out;
}

@keyframes knowledge-slide-in {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.knowledge__tag {
  animation: knowledge-bounce-in 0.3s ease-out;
}

@keyframes knowledge-bounce-in {
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

/* 加载状态 */
.knowledge__loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

/* 空状态 */
.knowledge__empty {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}
</style>
