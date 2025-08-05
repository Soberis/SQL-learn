<template>
  <div class="handbook">
    <!-- 页面头部 -->
    <div class="handbook__header">
      <div class="handbook__header-content">
        <div class="handbook__welcome">
          <h1 class="handbook__title">
            <el-icon class="handbook__title-icon"><Document /></el-icon>
            SQL速查手册
          </h1>
          <p class="handbook__subtitle">快速查找SQL语法、解决常见错误、获取实用代码示例</p>
        </div>
        <div class="handbook__search">
          <el-input
            v-model="searchQuery"
            placeholder="搜索语法、函数或错误信息..."
            size="large"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>
    </div>

    <div class="handbook__content">
      <el-row :gutter="24">
        <!-- 左侧：导航菜单 -->
        <el-col :xs="24" :lg="6">
          <el-card class="handbook__nav-card" shadow="hover">
            <template #header>
              <div class="handbook__nav-header">
                <h3 class="handbook__nav-title">
                  <el-icon><Menu /></el-icon>
                  快速导航
                </h3>
                <el-button type="primary" size="small" @click="toggleAllSections">
                  {{ allExpanded ? '收起全部' : '展开全部' }}
                </el-button>
              </div>
            </template>

            <div class="handbook__nav-menu">
              <div v-for="section in navigationSections" :key="section.id" class="handbook__nav-section">
                <div
                  class="handbook__nav-section-header"
                  :class="{ 'handbook__nav-section-header--active': activeSection === section.id }"
                  @click="toggleSection(section.id)"
                >
                  <div class="handbook__nav-section-title">
                    <el-icon><component :is="section.icon" /></el-icon>
                    <span>{{ section.title }}</span>
                  </div>
                  <el-icon
                    class="handbook__nav-section-arrow"
                    :class="{ 'handbook__nav-section-arrow--expanded': expandedSections.includes(section.id) }"
                  >
                    <ArrowRight />
                  </el-icon>
                </div>
                <div v-show="expandedSections.includes(section.id)" class="handbook__nav-section-content">
                  <div
                    v-for="item in section.items"
                    :key="item.id"
                    class="handbook__nav-item"
                    :class="{ 'handbook__nav-item--active': activeItem === item.id }"
                    @click="scrollToItem(item.id)"
                  >
                    <span class="handbook__nav-item-title">{{ item.title }}</span>
                    <el-tag v-if="item.isNew" type="danger" size="small">NEW</el-tag>
                  </div>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 快捷工具 -->
          <el-card class="handbook__tools-card" shadow="hover">
            <template #header>
              <h3 class="handbook__tools-title">
                <el-icon><Tools /></el-icon>
                快捷工具
              </h3>
            </template>

            <div class="handbook__tools">
              <el-button
                v-for="tool in quickTools"
                :key="tool.id"
                class="handbook__tool-button"
                :type="tool.type"
                size="small"
                @click="handleTool(tool)"
              >
                <el-icon><component :is="tool.icon" /></el-icon>
                {{ tool.title }}
              </el-button>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧：内容区域 -->
        <el-col :xs="24" :lg="18">
          <!-- 搜索结果 -->
          <div v-if="searchQuery && searchResults.length > 0" class="handbook__search-results">
            <el-card shadow="hover">
              <template #header>
                <h3 class="handbook__search-title">
                  <el-icon><Search /></el-icon>
                  搜索结果 ({{ searchResults.length }})
                </h3>
              </template>

              <div class="handbook__search-list">
                <div
                  v-for="result in searchResults"
                  :key="result.id"
                  class="handbook__search-item"
                  @click="scrollToItem(result.id)"
                >
                  <div class="handbook__search-item-header">
                    <h4 class="handbook__search-item-title">{{ result.title }}</h4>
                    <el-tag
                      :type="
                        result.category === 'syntax'
                          ? 'primary'
                          : result.category === 'function'
                            ? 'success'
                            : 'warning'
                      "
                      size="small"
                    >
                      {{ result.categoryName }}
                    </el-tag>
                  </div>
                  <p class="handbook__search-item-desc">{{ result.description }}</p>
                  <div v-if="result.example" class="handbook__search-item-code">
                    <code>{{ result.example }}</code>
                  </div>
                </div>
              </div>
            </el-card>
          </div>

          <!-- 无搜索结果 -->
          <div v-else-if="searchQuery && searchResults.length === 0" class="handbook__no-results">
            <el-empty description="未找到相关内容">
              <el-button type="primary" @click="clearSearch">清除搜索</el-button>
            </el-empty>
          </div>

          <!-- 主要内容 -->
          <div v-else class="handbook__main-content">
            <!-- SQL语法参考 -->
            <el-card id="syntax" class="handbook__content-card" shadow="hover">
              <template #header>
                <div class="handbook__content-header">
                  <h3 class="handbook__content-title">
                    <el-icon><Code /></el-icon>
                    SQL语法参考
                  </h3>
                  <el-button-group size="small">
                    <el-button :type="syntaxView === 'category' ? 'primary' : ''" @click="syntaxView = 'category'">
                      分类查看
                    </el-button>
                    <el-button
                      :type="syntaxView === 'alphabetical' ? 'primary' : ''"
                      @click="syntaxView = 'alphabetical'"
                    >
                      字母排序
                    </el-button>
                  </el-button-group>
                </div>
              </template>

              <div class="handbook__syntax-content">
                <!-- 分类视图 -->
                <div v-if="syntaxView === 'category'" class="handbook__syntax-categories">
                  <div v-for="category in syntaxCategories" :key="category.id" class="handbook__syntax-category">
                    <h4 class="handbook__syntax-category-title">
                      <el-icon><component :is="category.icon" /></el-icon>
                      {{ category.name }}
                    </h4>
                    <div class="handbook__syntax-items">
                      <div v-for="item in category.items" :key="item.id" class="handbook__syntax-item">
                        <div class="handbook__syntax-item-header">
                          <h5 class="handbook__syntax-item-title">{{ item.name }}</h5>
                          <div class="handbook__syntax-item-actions">
                            <el-button size="small" @click="copyCode(item.syntax)">
                              <el-icon><CopyDocument /></el-icon>
                              复制
                            </el-button>
                            <el-button size="small" @click="tryCode(item.syntax)">
                              <el-icon><CaretRight /></el-icon>
                              试试
                            </el-button>
                          </div>
                        </div>
                        <p class="handbook__syntax-item-desc">{{ item.description }}</p>
                        <div class="handbook__syntax-item-code">
                          <pre><code>{{ item.syntax }}</code></pre>
                        </div>
                        <div v-if="item.example" class="handbook__syntax-item-example">
                          <h6 class="handbook__syntax-item-example-title">示例：</h6>
                          <div class="handbook__syntax-item-example-code">
                            <pre><code>{{ item.example }}</code></pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 字母排序视图 -->
                <div v-else class="handbook__syntax-alphabetical">
                  <div class="handbook__syntax-alphabet">
                    <el-button
                      v-for="letter in alphabet"
                      :key="letter"
                      size="small"
                      :type="selectedLetter === letter ? 'primary' : ''"
                      @click="filterByLetter(letter)"
                    >
                      {{ letter }}
                    </el-button>
                  </div>
                  <div class="handbook__syntax-items">
                    <div v-for="item in filteredSyntaxItems" :key="item.id" class="handbook__syntax-item">
                      <div class="handbook__syntax-item-header">
                        <h5 class="handbook__syntax-item-title">{{ item.name }}</h5>
                        <div class="handbook__syntax-item-actions">
                          <el-button size="small" @click="copyCode(item.syntax)">
                            <el-icon><CopyDocument /></el-icon>
                            复制
                          </el-button>
                          <el-button size="small" @click="tryCode(item.syntax)">
                            <el-icon><CaretRight /></el-icon>
                            试试
                          </el-button>
                        </div>
                      </div>
                      <p class="handbook__syntax-item-desc">{{ item.description }}</p>
                      <div class="handbook__syntax-item-code">
                        <pre><code>{{ item.syntax }}</code></pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>

            <!-- 常用函数 -->
            <el-card id="functions" class="handbook__content-card" shadow="hover">
              <template #header>
                <div class="handbook__content-header">
                  <h3 class="handbook__content-title">
                    <el-icon><Operation /></el-icon>
                    常用函数
                  </h3>
                  <el-select
                    v-model="selectedFunctionCategory"
                    placeholder="选择函数分类"
                    size="small"
                    style="width: 150px"
                    @change="filterFunctions"
                  >
                    <el-option label="全部" value="all" />
                    <el-option
                      v-for="category in functionCategories"
                      :key="category.id"
                      :label="category.name"
                      :value="category.id"
                    />
                  </el-select>
                </div>
              </template>

              <div class="handbook__functions-content">
                <div class="handbook__functions-grid">
                  <div v-for="func in filteredFunctions" :key="func.id" class="handbook__function-item">
                    <div class="handbook__function-header">
                      <h5 class="handbook__function-title">{{ func.name }}</h5>
                      <el-tag
                        :type="
                          func.category === 'string'
                            ? 'primary'
                            : func.category === 'number'
                              ? 'success'
                              : func.category === 'date'
                                ? 'warning'
                                : 'info'
                        "
                        size="small"
                      >
                        {{ func.categoryName }}
                      </el-tag>
                    </div>
                    <p class="handbook__function-desc">{{ func.description }}</p>
                    <div class="handbook__function-syntax">
                      <strong>语法：</strong>
                      <code>{{ func.syntax }}</code>
                    </div>
                    <div v-if="func.example" class="handbook__function-example">
                      <strong>示例：</strong>
                      <div class="handbook__function-example-code">
                        <pre><code>{{ func.example }}</code></pre>
                      </div>
                    </div>
                    <div class="handbook__function-actions">
                      <el-button size="small" @click="copyCode(func.syntax)">
                        <el-icon><CopyDocument /></el-icon>
                        复制
                      </el-button>
                      <el-button size="small" @click="tryCode(func.example || func.syntax)">
                        <el-icon><CaretRight /></el-icon>
                        试试
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>

            <!-- 错误解决方案 -->
            <el-card id="errors" class="handbook__content-card" shadow="hover">
              <template #header>
                <div class="handbook__content-header">
                  <h3 class="handbook__content-title">
                    <el-icon><Warning /></el-icon>
                    常见错误解决
                  </h3>
                  <el-input
                    v-model="errorSearchQuery"
                    placeholder="搜索错误信息..."
                    size="small"
                    style="width: 200px"
                    clearable
                    @input="filterErrors"
                  >
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                </div>
              </template>

              <div class="handbook__errors-content">
                <div class="handbook__errors-list">
                  <div v-for="error in filteredErrors" :key="error.id" class="handbook__error-item">
                    <div class="handbook__error-header">
                      <h5 class="handbook__error-title">
                        <el-icon class="handbook__error-icon"><WarningFilled /></el-icon>
                        {{ error.title }}
                      </h5>
                      <el-tag
                        :type="error.severity === 'high' ? 'danger' : error.severity === 'medium' ? 'warning' : 'info'"
                        size="small"
                      >
                        {{ error.severityName }}
                      </el-tag>
                    </div>
                    <div class="handbook__error-message">
                      <strong>错误信息：</strong>
                      <code>{{ error.message }}</code>
                    </div>
                    <div class="handbook__error-cause">
                      <strong>可能原因：</strong>
                      <ul class="handbook__error-cause-list">
                        <li v-for="cause in error.causes" :key="cause">{{ cause }}</li>
                      </ul>
                    </div>
                    <div class="handbook__error-solution">
                      <strong>解决方案：</strong>
                      <div class="handbook__error-solution-steps">
                        <div
                          v-for="(step, index) in error.solutions"
                          :key="index"
                          class="handbook__error-solution-step"
                        >
                          <div class="handbook__error-solution-step-number">{{ index + 1 }}</div>
                          <div class="handbook__error-solution-step-content">
                            <p>{{ step.description }}</p>
                            <div v-if="step.code" class="handbook__error-solution-step-code">
                              <pre><code>{{ step.code }}</code></pre>
                              <el-button size="small" @click="copyCode(step.code)">
                                <el-icon><CopyDocument /></el-icon>
                                复制
                              </el-button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>

            <!-- 实例代码库 -->
            <el-card id="examples" class="handbook__content-card" shadow="hover">
              <template #header>
                <div class="handbook__content-header">
                  <h3 class="handbook__content-title">
                    <el-icon><Files /></el-icon>
                    实例代码库
                  </h3>
                  <div class="handbook__examples-filters">
                    <el-select
                      v-model="selectedExampleCategory"
                      placeholder="选择场景"
                      size="small"
                      style="width: 120px"
                      @change="filterExamples"
                    >
                      <el-option label="全部" value="all" />
                      <el-option
                        v-for="category in exampleCategories"
                        :key="category.id"
                        :label="category.name"
                        :value="category.id"
                      />
                    </el-select>
                    <el-select
                      v-model="selectedExampleDifficulty"
                      placeholder="选择难度"
                      size="small"
                      style="width: 100px"
                      @change="filterExamples"
                    >
                      <el-option label="全部" value="all" />
                      <el-option label="简单" value="easy" />
                      <el-option label="中等" value="medium" />
                      <el-option label="困难" value="hard" />
                    </el-select>
                  </div>
                </div>
              </template>

              <div class="handbook__examples-content">
                <div class="handbook__examples-grid">
                  <div v-for="example in filteredExamples" :key="example.id" class="handbook__example-item">
                    <div class="handbook__example-header">
                      <h5 class="handbook__example-title">{{ example.title }}</h5>
                      <div class="handbook__example-meta">
                        <el-tag
                          :type="
                            example.category === 'query'
                              ? 'primary'
                              : example.category === 'analysis'
                                ? 'success'
                                : 'warning'
                          "
                          size="small"
                        >
                          {{ example.categoryName }}
                        </el-tag>
                        <el-tag
                          :type="
                            example.difficulty === 'easy'
                              ? 'success'
                              : example.difficulty === 'medium'
                                ? 'warning'
                                : 'danger'
                          "
                          size="small"
                        >
                          {{ example.difficultyName }}
                        </el-tag>
                      </div>
                    </div>
                    <p class="handbook__example-desc">{{ example.description }}</p>
                    <div class="handbook__example-scenario">
                      <strong>应用场景：</strong>
                      <span>{{ example.scenario }}</span>
                    </div>
                    <div class="handbook__example-code">
                      <div class="handbook__example-code-header">
                        <strong>SQL代码：</strong>
                        <div class="handbook__example-code-actions">
                          <el-button size="small" @click="copyCode(example.code)">
                            <el-icon><CopyDocument /></el-icon>
                            复制
                          </el-button>
                          <el-button size="small" @click="tryCode(example.code)">
                            <el-icon><CaretRight /></el-icon>
                            运行
                          </el-button>
                          <el-button size="small" @click="explainCode(example)">
                            <el-icon><QuestionFilled /></el-icon>
                            解释
                          </el-button>
                        </div>
                      </div>
                      <div class="handbook__example-code-content">
                        <pre><code>{{ example.code }}</code></pre>
                      </div>
                    </div>
                    <div v-if="example.explanation" class="handbook__example-explanation">
                      <strong>代码解释：</strong>
                      <p>{{ example.explanation }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

/**
 * SQL速查手册页面
 * 实现SQL语法速查、错误解决方案、实例代码库
 */
const router = useRouter()

// 搜索相关
const searchQuery = ref('')
const errorSearchQuery = ref('')

// 导航相关
const activeSection = ref('syntax')
const activeItem = ref('')
const expandedSections = ref(['syntax', 'functions'])
const allExpanded = ref(false)

// 视图切换
const syntaxView = ref('category')
const selectedLetter = ref('A')
const selectedFunctionCategory = ref('all')
const selectedExampleCategory = ref('all')
const selectedExampleDifficulty = ref('all')

// 导航菜单
const navigationSections = ref([
  {
    id: 'syntax',
    title: 'SQL语法参考',
    icon: 'Code',
    items: [
      { id: 'select', title: 'SELECT查询', isNew: false },
      { id: 'insert', title: 'INSERT插入', isNew: false },
      { id: 'update', title: 'UPDATE更新', isNew: false },
      { id: 'delete', title: 'DELETE删除', isNew: false },
      { id: 'join', title: 'JOIN连接', isNew: false },
      { id: 'subquery', title: '子查询', isNew: true },
    ],
  },
  {
    id: 'functions',
    title: '常用函数',
    icon: 'Operation',
    items: [
      { id: 'string-functions', title: '字符串函数', isNew: false },
      { id: 'numeric-functions', title: '数值函数', isNew: false },
      { id: 'date-functions', title: '日期函数', isNew: false },
      { id: 'aggregate-functions', title: '聚合函数', isNew: false },
    ],
  },
  {
    id: 'errors',
    title: '错误解决',
    icon: 'Warning',
    items: [
      { id: 'syntax-errors', title: '语法错误', isNew: false },
      { id: 'runtime-errors', title: '运行时错误', isNew: false },
      { id: 'performance-issues', title: '性能问题', isNew: true },
    ],
  },
  {
    id: 'examples',
    title: '实例代码',
    icon: 'Files',
    items: [
      { id: 'basic-queries', title: '基础查询', isNew: false },
      { id: 'complex-queries', title: '复杂查询', isNew: false },
      { id: 'data-analysis', title: '数据分析', isNew: true },
    ],
  },
])

// 快捷工具
const quickTools = ref([
  { id: 'sql-formatter', title: 'SQL格式化', icon: 'EditPen', type: 'primary' },
  { id: 'query-builder', title: '查询构建器', icon: 'Tools', type: 'success' },
  { id: 'schema-viewer', title: '表结构查看', icon: 'View', type: 'info' },
  { id: 'performance-analyzer', title: '性能分析', icon: 'TrendCharts', type: 'warning' },
])

// 语法分类
const syntaxCategories = ref([
  {
    id: 'basic',
    name: '基础查询',
    icon: 'Search',
    items: [
      {
        id: 'select-basic',
        name: 'SELECT',
        description: '从表中选择数据',
        syntax: 'SELECT column1, column2 FROM table_name;',
        example: 'SELECT name, age FROM users;',
      },
      {
        id: 'where',
        name: 'WHERE',
        description: '添加查询条件',
        syntax: 'SELECT * FROM table_name WHERE condition;',
        example: 'SELECT * FROM users WHERE age > 18;',
      },
      {
        id: 'order-by',
        name: 'ORDER BY',
        description: '对结果进行排序',
        syntax: 'SELECT * FROM table_name ORDER BY column ASC|DESC;',
        example: 'SELECT * FROM users ORDER BY age DESC;',
      },
    ],
  },
  {
    id: 'joins',
    name: '表连接',
    icon: 'Connection',
    items: [
      {
        id: 'inner-join',
        name: 'INNER JOIN',
        description: '内连接，返回两表中匹配的记录',
        syntax: 'SELECT * FROM table1 INNER JOIN table2 ON table1.id = table2.id;',
        example: 'SELECT u.name, o.total FROM users u INNER JOIN orders o ON u.id = o.user_id;',
      },
      {
        id: 'left-join',
        name: 'LEFT JOIN',
        description: '左连接，返回左表所有记录',
        syntax: 'SELECT * FROM table1 LEFT JOIN table2 ON table1.id = table2.id;',
        example: 'SELECT u.name, o.total FROM users u LEFT JOIN orders o ON u.id = o.user_id;',
      },
    ],
  },
  {
    id: 'aggregation',
    name: '聚合查询',
    icon: 'DataAnalysis',
    items: [
      {
        id: 'group-by',
        name: 'GROUP BY',
        description: '按指定列分组',
        syntax: 'SELECT column, COUNT(*) FROM table_name GROUP BY column;',
        example: 'SELECT department, COUNT(*) FROM employees GROUP BY department;',
      },
      {
        id: 'having',
        name: 'HAVING',
        description: '对分组结果进行筛选',
        syntax: 'SELECT column, COUNT(*) FROM table_name GROUP BY column HAVING COUNT(*) > 1;',
        example: 'SELECT department, COUNT(*) FROM employees GROUP BY department HAVING COUNT(*) > 5;',
      },
    ],
  },
])

// 字母表
const alphabet = ref([
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
])

// 函数分类
const functionCategories = ref([
  { id: 'string', name: '字符串函数' },
  { id: 'number', name: '数值函数' },
  { id: 'date', name: '日期函数' },
  { id: 'aggregate', name: '聚合函数' },
])

// 函数列表
const functions = ref([
  {
    id: 'concat',
    name: 'CONCAT',
    category: 'string',
    categoryName: '字符串',
    description: '连接两个或多个字符串',
    syntax: 'CONCAT(string1, string2, ...)',
    example: 'SELECT CONCAT(first_name, " ", last_name) AS full_name FROM users;',
  },
  {
    id: 'upper',
    name: 'UPPER',
    category: 'string',
    categoryName: '字符串',
    description: '将字符串转换为大写',
    syntax: 'UPPER(string)',
    example: 'SELECT UPPER(name) FROM users;',
  },
  {
    id: 'count',
    name: 'COUNT',
    category: 'aggregate',
    categoryName: '聚合',
    description: '计算行数',
    syntax: 'COUNT(column)',
    example: 'SELECT COUNT(*) FROM users;',
  },
  {
    id: 'sum',
    name: 'SUM',
    category: 'aggregate',
    categoryName: '聚合',
    description: '计算数值列的总和',
    syntax: 'SUM(column)',
    example: 'SELECT SUM(salary) FROM employees;',
  },
  {
    id: 'avg',
    name: 'AVG',
    category: 'aggregate',
    categoryName: '聚合',
    description: '计算数值列的平均值',
    syntax: 'AVG(column)',
    example: 'SELECT AVG(age) FROM users;',
  },
  {
    id: 'round',
    name: 'ROUND',
    category: 'number',
    categoryName: '数值',
    description: '四舍五入到指定小数位',
    syntax: 'ROUND(number, decimals)',
    example: 'SELECT ROUND(price, 2) FROM products;',
  },
  {
    id: 'now',
    name: 'NOW',
    category: 'date',
    categoryName: '日期',
    description: '返回当前日期和时间',
    syntax: 'NOW()',
    example: 'SELECT NOW();',
  },
  {
    id: 'date-format',
    name: 'DATE_FORMAT',
    category: 'date',
    categoryName: '日期',
    description: '格式化日期',
    syntax: 'DATE_FORMAT(date, format)',
    example: 'SELECT DATE_FORMAT(created_at, "%Y-%m-%d") FROM orders;',
  },
])

// 错误列表
const errors = ref([
  {
    id: 'syntax-error-1',
    title: '语法错误：缺少分号',
    message: 'You have an error in your SQL syntax',
    severity: 'high',
    severityName: '严重',
    causes: ['SQL语句末尾缺少分号', '关键字拼写错误', '括号不匹配'],
    solutions: [
      {
        description: '检查SQL语句末尾是否有分号',
        code: 'SELECT * FROM users; -- 确保有分号结尾',
      },
      {
        description: '检查关键字拼写是否正确',
        code: 'SELECT * FROM users; -- 不是 SELCT',
      },
    ],
  },
  {
    id: 'column-not-found',
    title: '列不存在错误',
    message: 'Unknown column in field list',
    severity: 'medium',
    severityName: '中等',
    causes: ['列名拼写错误', '列不存在于指定表中', '表别名使用错误'],
    solutions: [
      {
        description: '检查列名是否正确',
        code: 'DESCRIBE table_name; -- 查看表结构',
      },
      {
        description: '使用正确的表别名',
        code: 'SELECT u.name FROM users u; -- 使用别名u',
      },
    ],
  },
  {
    id: 'table-not-found',
    title: '表不存在错误',
    message: "Table doesn't exist",
    severity: 'high',
    severityName: '严重',
    causes: ['表名拼写错误', '表不存在于当前数据库', '权限不足'],
    solutions: [
      {
        description: '检查表名是否正确',
        code: 'SHOW TABLES; -- 查看所有表',
      },
      {
        description: '确认当前数据库',
        code: 'SELECT DATABASE(); -- 查看当前数据库',
      },
    ],
  },
])

// 示例代码
const examples = ref([
  {
    id: 'basic-select',
    title: '基础数据查询',
    category: 'query',
    categoryName: '查询',
    difficulty: 'easy',
    difficultyName: '简单',
    description: '从用户表中查询所有用户的姓名和邮箱',
    scenario: '用户管理系统中查看用户列表',
    code: 'SELECT name, email FROM users WHERE status = "active" ORDER BY created_at DESC;',
    explanation: '查询活跃用户的姓名和邮箱，按创建时间倒序排列',
  },
  {
    id: 'join-query',
    title: '多表关联查询',
    category: 'query',
    categoryName: '查询',
    difficulty: 'medium',
    difficultyName: '中等',
    description: '查询用户及其订单信息',
    scenario: '电商系统中查看用户订单详情',
    code: 'SELECT u.name, u.email, o.order_number, o.total_amount\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id\nWHERE o.status = "completed"\nORDER BY o.created_at DESC;',
    explanation: '通过内连接查询已完成订单的用户信息和订单详情',
  },
  {
    id: 'sales-analysis',
    title: '销售数据分析',
    category: 'analysis',
    categoryName: '分析',
    difficulty: 'hard',
    difficultyName: '困难',
    description: '按月统计销售额和订单数量',
    scenario: '商业智能报表中的销售分析',
    code: 'SELECT \n  DATE_FORMAT(created_at, "%Y-%m") as month,\n  COUNT(*) as order_count,\n  SUM(total_amount) as total_sales,\n  AVG(total_amount) as avg_order_value\nFROM orders \nWHERE status = "completed" \n  AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)\nGROUP BY DATE_FORMAT(created_at, "%Y-%m")\nORDER BY month DESC;',
    explanation: '统计最近12个月每月的订单数量、总销售额和平均订单价值',
  },
  {
    id: 'user-activity',
    title: '用户活跃度分析',
    category: 'analysis',
    categoryName: '分析',
    difficulty: 'medium',
    difficultyName: '中等',
    description: '分析用户登录活跃度',
    scenario: '用户行为分析中的活跃度统计',
    code: 'SELECT \n  u.id,\n  u.name,\n  COUNT(l.id) as login_count,\n  MAX(l.login_time) as last_login,\n  DATEDIFF(NOW(), MAX(l.login_time)) as days_since_last_login\nFROM users u\nLEFT JOIN user_logins l ON u.id = l.user_id \n  AND l.login_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)\nGROUP BY u.id, u.name\nHAVING login_count > 0\nORDER BY login_count DESC;',
    explanation: '统计用户最近30天的登录次数和最后登录时间',
  },
])

// 示例分类
const exampleCategories = ref([
  { id: 'query', name: '查询' },
  { id: 'analysis', name: '分析' },
  { id: 'management', name: '管理' },
])

// 计算属性
const searchResults = computed(() => {
  if (!searchQuery.value) return []

  const query = searchQuery.value.toLowerCase()
  const results: any[] = []

  // 搜索语法
  syntaxCategories.value.forEach(category => {
    category.items.forEach(item => {
      if (
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.syntax.toLowerCase().includes(query)
      ) {
        results.push({
          id: item.id,
          title: item.name,
          description: item.description,
          example: item.syntax,
          category: 'syntax',
          categoryName: '语法',
        })
      }
    })
  })

  // 搜索函数
  functions.value.forEach(func => {
    if (func.name.toLowerCase().includes(query) || func.description.toLowerCase().includes(query)) {
      results.push({
        id: func.id,
        title: func.name,
        description: func.description,
        example: func.syntax,
        category: 'function',
        categoryName: '函数',
      })
    }
  })

  // 搜索错误
  errors.value.forEach(error => {
    if (error.title.toLowerCase().includes(query) || error.message.toLowerCase().includes(query)) {
      results.push({
        id: error.id,
        title: error.title,
        description: error.message,
        category: 'error',
        categoryName: '错误',
      })
    }
  })

  return results
})

const filteredSyntaxItems = computed(() => {
  if (selectedLetter.value === 'A') return []

  const allItems: any[] = []
  syntaxCategories.value.forEach(category => {
    allItems.push(...category.items)
  })

  return allItems.filter(item => item.name.charAt(0).toUpperCase() === selectedLetter.value)
})

const filteredFunctions = computed(() => {
  if (selectedFunctionCategory.value === 'all') {
    return functions.value
  }
  return functions.value.filter(func => func.category === selectedFunctionCategory.value)
})

const filteredErrors = computed(() => {
  if (!errorSearchQuery.value) return errors.value

  const query = errorSearchQuery.value.toLowerCase()
  return errors.value.filter(
    error => error.title.toLowerCase().includes(query) || error.message.toLowerCase().includes(query)
  )
})

const filteredExamples = computed(() => {
  let filtered = examples.value

  if (selectedExampleCategory.value !== 'all') {
    filtered = filtered.filter(example => example.category === selectedExampleCategory.value)
  }

  if (selectedExampleDifficulty.value !== 'all') {
    filtered = filtered.filter(example => example.difficulty === selectedExampleDifficulty.value)
  }

  return filtered
})

// 方法
const handleSearch = () => {
  // 搜索逻辑已在计算属性中实现
}

const clearSearch = () => {
  searchQuery.value = ''
}

const toggleAllSections = () => {
  if (allExpanded.value) {
    expandedSections.value = []
  } else {
    expandedSections.value = navigationSections.value.map(section => section.id)
  }
  allExpanded.value = !allExpanded.value
}

const toggleSection = (sectionId: string) => {
  const index = expandedSections.value.indexOf(sectionId)
  if (index > -1) {
    expandedSections.value.splice(index, 1)
  } else {
    expandedSections.value.push(sectionId)
  }
  activeSection.value = sectionId
}

const scrollToItem = (itemId: string) => {
  activeItem.value = itemId
  const element = document.getElementById(itemId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const handleTool = (tool: any) => {
  ElMessage.info(`${tool.title}功能开发中...`)
}

const filterByLetter = (letter: string) => {
  selectedLetter.value = letter
}

const filterFunctions = () => {
  // 过滤逻辑已在计算属性中实现
}

const filterErrors = () => {
  // 过滤逻辑已在计算属性中实现
}

const filterExamples = () => {
  // 过滤逻辑已在计算属性中实现
}

const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
    ElMessage.success('代码已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

const tryCode = (code: string) => {
  // 跳转到实战练习场并预填代码
  router.push({
    path: '/practice',
    query: { code: encodeURIComponent(code) },
  })
}

const explainCode = (example: any) => {
  ElMessage.info(`代码解释：${example.explanation || '暂无详细解释'}`)
}

onMounted(() => {
  console.log('SQL速查手册已加载')
})
</script>

<style scoped>
.handbook {
  min-height: 100vh;
}

.handbook__header {
  background: linear-gradient(135deg, var(--el-color-success-light-9) 0%, var(--el-color-info-light-9) 100%);
  padding: 40px 0;
  margin: -24px -24px 24px -24px;
}

.handbook__header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
}

.handbook__title {
  font-size: 36px;
  font-weight: 700;
  color: var(--el-color-success);
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.handbook__title-icon {
  font-size: 40px;
}

.handbook__subtitle {
  font-size: 16px;
  color: var(--el-text-color-regular);
  margin: 0;
}

.handbook__search {
  width: 400px;
}

.handbook__content {
  max-width: 1200px;
  margin: 0 auto;
}

.handbook__nav-card,
.handbook__tools-card,
.handbook__content-card {
  margin-bottom: 24px;
}

.handbook__nav-header,
.handbook__content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.handbook__nav-title,
.handbook__tools-title,
.handbook__content-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-primary);
}

.handbook__nav-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.handbook__nav-section {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  overflow: hidden;
}

.handbook__nav-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--el-bg-color-page);
}

.handbook__nav-section-header:hover {
  background: var(--el-color-primary-light-9);
}

.handbook__nav-section-header--active {
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
}

.handbook__nav-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.handbook__nav-section-arrow {
  transition: transform 0.3s ease;
}

.handbook__nav-section-arrow--expanded {
  transform: rotate(90deg);
}

.handbook__nav-section-content {
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-lighter);
}

.handbook__nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px 8px 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.handbook__nav-item:last-child {
  border-bottom: none;
}

.handbook__nav-item:hover {
  background: var(--el-color-primary-light-9);
}

.handbook__nav-item--active {
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
  font-weight: 600;
}

.handbook__nav-item-title {
  font-size: 14px;
}

.handbook__tools {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.handbook__tool-button {
  justify-content: flex-start;
  gap: 8px;
}

.handbook__search-results {
  margin-bottom: 24px;
}

.handbook__search-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-primary);
}

.handbook__search-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.handbook__search-item {
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.handbook__search-item:hover {
  border-color: var(--el-color-primary-light-7);
  background-color: var(--el-color-primary-light-9);
}

.handbook__search-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.handbook__search-item-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.handbook__search-item-desc {
  margin: 0 0 8px 0;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

.handbook__search-item-code {
  background: var(--el-bg-color-page);
  padding: 8px 12px;
  border-radius: 4px;
  border-left: 3px solid var(--el-color-primary);
}

.handbook__search-item-code code {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: var(--el-color-primary);
}

.handbook__no-results {
  text-align: center;
  padding: 60px 0;
}

.handbook__main-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.handbook__syntax-content,
.handbook__functions-content,
.handbook__errors-content,
.handbook__examples-content {
  padding: 20px 0;
}

.handbook__syntax-categories {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.handbook__syntax-category {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
}

.handbook__syntax-category-title {
  margin: 0;
  padding: 16px 20px;
  background: var(--el-bg-color-page);
  border-bottom: 1px solid var(--el-border-color-lighter);
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.handbook__syntax-items {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--el-border-color-lighter);
}

.handbook__syntax-item {
  padding: 20px;
  background: var(--el-bg-color);
}

.handbook__syntax-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.handbook__syntax-item-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.handbook__syntax-item-actions {
  display: flex;
  gap: 8px;
}

.handbook__syntax-item-desc {
  margin: 0 0 12px 0;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

.handbook__syntax-item-code,
.handbook__syntax-item-example-code,
.handbook__function-example-code,
.handbook__example-code-content {
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 16px;
  margin: 12px 0;
  overflow-x: auto;
}

.handbook__syntax-item-code pre,
.handbook__syntax-item-example-code pre,
.handbook__function-example-code pre,
.handbook__example-code-content pre {
  margin: 0;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: var(--el-text-color-primary);
}

.handbook__syntax-item-example {
  margin-top: 16px;
}

.handbook__syntax-item-example-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.handbook__syntax-alphabet {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
}

.handbook__functions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.handbook__function-item {
  padding: 20px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);
}

.handbook__function-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.handbook__function-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.handbook__function-desc {
  margin: 0 0 12px 0;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

.handbook__function-syntax {
  margin: 12px 0;
  padding: 8px 12px;
  background: var(--el-bg-color-page);
  border-radius: 4px;
  border-left: 3px solid var(--el-color-success);
}

.handbook__function-syntax code {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: var(--el-color-success);
}

.handbook__function-example {
  margin: 12px 0;
}

.handbook__function-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.handbook__errors-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.handbook__error-item {
  padding: 24px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);
}

.handbook__error-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.handbook__error-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-color-danger);
  display: flex;
  align-items: center;
  gap: 8px;
}

.handbook__error-icon {
  color: var(--el-color-danger);
}

.handbook__error-message,
.handbook__error-cause,
.handbook__error-solution {
  margin: 16px 0;
}

.handbook__error-message code {
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
}

.handbook__error-cause-list {
  margin: 8px 0 0 20px;
  padding: 0;
}

.handbook__error-cause-list li {
  margin: 4px 0;
  color: var(--el-text-color-regular);
}

.handbook__error-solution-step {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.handbook__error-solution-step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--el-color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.handbook__error-solution-step-content {
  flex: 1;
}

.handbook__error-solution-step-content p {
  margin: 0 0 8px 0;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

.handbook__error-solution-step-code {
  position: relative;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 12px;
  margin: 8px 0;
}

.handbook__error-solution-step-code pre {
  margin: 0;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: var(--el-text-color-primary);
}

.handbook__error-solution-step-code .el-button {
  position: absolute;
  top: 8px;
  right: 8px;
}

.handbook__examples-filters {
  display: flex;
  gap: 12px;
}

.handbook__examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 24px;
}

.handbook__example-item {
  padding: 24px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);
}

.handbook__example-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.handbook__example-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.handbook__example-meta {
  display: flex;
  gap: 8px;
}

.handbook__example-desc {
  margin: 0 0 12px 0;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

.handbook__example-scenario {
  margin: 12px 0;
  padding: 8px 12px;
  background: var(--el-color-info-light-9);
  border-radius: 4px;
  border-left: 3px solid var(--el-color-info);
}

.handbook__example-scenario strong {
  color: var(--el-color-info);
}

.handbook__example-code {
  margin: 16px 0;
}

.handbook__example-code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.handbook__example-code-actions {
  display: flex;
  gap: 8px;
}

.handbook__example-explanation {
  margin: 16px 0 0 0;
  padding: 12px;
  background: var(--el-color-success-light-9);
  border-radius: 4px;
  border-left: 3px solid var(--el-color-success);
}

.handbook__example-explanation strong {
  color: var(--el-color-success);
}

.handbook__example-explanation p {
  margin: 4px 0 0 0;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .handbook__header-content {
    flex-direction: column;
    gap: 24px;
  }

  .handbook__title {
    font-size: 28px;
    text-align: center;
  }

  .handbook__search {
    width: 100%;
  }

  .handbook__functions-grid {
    grid-template-columns: 1fr;
  }

  .handbook__examples-grid {
    grid-template-columns: 1fr;
  }

  .handbook__syntax-alphabet {
    justify-content: center;
  }

  .handbook__examples-filters {
    flex-direction: column;
    gap: 8px;
  }

  .handbook__examples-filters .el-select {
    width: 100% !important;
  }
}
</style>
s { display: flex; flex-direction: column; gap: 16px; margin-top: 12px; } .handbook__error-solution-step
