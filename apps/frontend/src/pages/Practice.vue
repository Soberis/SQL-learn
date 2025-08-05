<template>
  <div class="practice">
    <div class="practice__container">
      <!-- 页面头部 -->
      <div class="practice__header">
        <h1 class="practice__title">SQL练习</h1>
        <div class="practice__stats">
          <div class="practice__stat-item">
            <span class="practice__stat-number">{{ progressStore.totalCompleted }}</span>
            <span class="practice__stat-label">已完成</span>
          </div>
          <div class="practice__stat-item">
            <span class="practice__stat-number">{{ progressStore.averageScore }}</span>
            <span class="practice__stat-label">平均分</span>
          </div>
        </div>
      </div>

      <el-row :gutter="24">
        <!-- 左侧：题目列表 -->
        <el-col :xs="24" :lg="8">
          <el-card class="practice__questions-card" shadow="hover">
            <template #header>
              <div class="practice__card-header">
                <h3>练习题目</h3>
                <el-button type="primary" size="small" @click="selectRandomQuestion">
                  随机选择
                </el-button>
              </div>
            </template>

            <div class="practice__questions-list">
              <div
                v-for="question in questions"
                :key="question.id"
                class="practice__question-item"
                :class="{
                  'practice__question-item--active': currentQuestion?.id === question.id,
                  'practice__question-item--completed': isQuestionCompleted(question.id)
                }"
                @click="selectQuestion(question)"
              >
                <div class="practice__question-header">
                  <el-tag :type="getDifficultyType(question.difficulty)" size="small">
                    {{ question.difficulty }}
                  </el-tag>
                  <div class="practice__question-status">
                    <el-icon v-if="isQuestionCompleted(question.id)" class="practice__question-completed">
                      <SuccessFilled />
                    </el-icon>
                    <span class="practice__question-points">
                      <el-icon><Star /></el-icon>
                      {{ question.points }}
                    </span>
                  </div>
                </div>
                <h4 class="practice__question-title">{{ question.title }}</h4>
                <p class="practice__question-desc">{{ question.description }}</p>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧：答题区域 -->
        <el-col :xs="24" :lg="16">
          <div v-if="currentQuestion" class="practice__workspace">
            <!-- 题目详情 -->
            <el-card class="practice__question-detail" shadow="hover">
              <template #header>
                <div class="practice__card-header">
                  <h3>{{ currentQuestion.title }}</h3>
                  <el-tag :type="getDifficultyType(currentQuestion.difficulty)">
                    {{ currentQuestion.difficulty }}
                  </el-tag>
                </div>
              </template>

              <div class="practice__question-content">
                <div class="practice__requirement">
                  <h4>题目要求</h4>
                  <p>{{ currentQuestion.requirement }}</p>
                </div>

                <div v-if="currentQuestion.sampleData" class="practice__sample-data">
                  <h4>示例数据</h4>
                  <div class="practice__tables">
                    <div v-for="table in currentQuestion.sampleData" :key="table.name" class="practice__table">
                      <h5>{{ table.name }}</h5>
                      <el-table :data="table.data" size="small" class="practice__sample-table">
                        <el-table-column
                          v-for="column in table.columns"
                          :key="column"
                          :prop="column"
                          :label="column"
                          min-width="80"
                        />
                      </el-table>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>

            <!-- SQL编辑器 -->
            <el-card class="practice__editor-card" shadow="hover">
              <template #header>
                <div class="practice__card-header">
                  <h3>SQL编辑器</h3>
                  <div class="practice__editor-actions">
                    <el-button type="success" :loading="sqlStore.isExecuting" @click="runQuery">
                      <el-icon><CaretRight /></el-icon>
                      运行
                    </el-button>
                    <el-button type="primary" :disabled="!sqlStore.executeResult" @click="submitAnswer">
                      <el-icon><Check /></el-icon>
                      提交
                    </el-button>
                  </div>
                </div>
              </template>

              <div class="practice__editor-container">
                <el-input
                  v-model="sqlStore.currentSQL"
                  type="textarea"
                  :rows="8"
                  placeholder="请输入SQL查询语句..."
                  class="practice__sql-input"
                />
              </div>
            </el-card>

            <!-- 查询结果 -->
            <el-card v-if="sqlStore.executeResult" class="practice__result-card" shadow="hover">
              <template #header>
                <div class="practice__card-header">
                  <h3>查询结果</h3>
                  <span class="practice__result-count">
                    共 {{ sqlStore.executeResult.rows?.length || 0 }} 条记录
                  </span>
                </div>
              </template>

              <div class="practice__result-content">
                <el-table :data="sqlStore.executeResult?.rows || []" class="practice__result-table" max-height="300">
                <el-table-column
                  v-for="column in sqlStore.executeResult?.columns || []"
                  :key="column"
                  :prop="column"
                  :label="column"
                  min-width="100"
                />
                </el-table>
              </div>
            </el-card>

            <!-- 错误信息 -->
            <el-alert
              v-if="sqlStore.executeError"
              :title="sqlStore.executeError"
              type="error"
              class="practice__error-alert"
              show-icon
            />
          </div>

          <!-- 空状态 -->
          <el-empty v-else description="请从左侧选择一道题目开始练习" class="practice__empty">
            <el-button type="primary" @click="selectRandomQuestion">随机选择题目</el-button>
          </el-empty>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  SuccessFilled,
  Star,
  CaretRight,
  Check
} from '@element-plus/icons-vue'
import { useSqlStore } from '@/stores/sql'
import { useProgressStore } from '@/stores/progress'

/**
 * SQL练习页面 - 简化版本
 * 只保留核心的练习功能：题目选择、SQL编辑、查询执行和结果展示
 */
const sqlStore = useSqlStore()
const progressStore = useProgressStore()

// 当前选中的题目
const currentQuestion = ref<any>(null)

// 题目数据
const questions = ref([
  {
    id: 1,
    title: 'SELECT 基础查询',
    description: '学习基本的数据查询语法',
    difficulty: '初级',
    points: 10,
    requirement: '查询所有用户的姓名和邮箱',
    sampleData: [
      {
        name: 'users',
        columns: ['id', 'name', 'email'],
        data: [
          { id: 1, name: '张三', email: 'zhangsan@example.com' },
          { id: 2, name: '李四', email: 'lisi@example.com' }
        ]
      }
    ]
  },
  {
    id: 2,
    title: 'WHERE 条件筛选',
    description: '使用WHERE子句筛选数据',
    difficulty: '初级',
    points: 15,
    requirement: '查询年龄大于25岁的用户信息',
    sampleData: [
      {
        name: 'users',
        columns: ['id', 'name', 'age'],
        data: [
          { id: 1, name: '张三', age: 28 },
          { id: 2, name: '李四', age: 22 },
          { id: 3, name: '王五', age: 30 }
        ]
      }
    ]
  },
  {
    id: 3,
    title: 'ORDER BY 排序',
    description: '学习数据排序',
    difficulty: '初级',
    points: 15,
    requirement: '按照工资从高到低排序显示员工信息',
    sampleData: [
      {
        name: 'employees',
        columns: ['id', 'name', 'salary'],
        data: [
          { id: 1, name: '张三', salary: 8000 },
          { id: 2, name: '李四', salary: 12000 },
          { id: 3, name: '王五', salary: 6000 }
        ]
      }
    ]
  },
  {
    id: 4,
    title: 'JOIN 表连接',
    description: '学习多表关联查询',
    difficulty: '中级',
    points: 25,
    requirement: '查询用户及其订单信息',
    sampleData: [
      {
        name: 'users',
        columns: ['id', 'name'],
        data: [
          { id: 1, name: '张三' },
          { id: 2, name: '李四' }
        ]
      },
      {
        name: 'orders',
        columns: ['id', 'user_id', 'amount'],
        data: [
          { id: 101, user_id: 1, amount: 299.99 },
          { id: 102, user_id: 2, amount: 199.99 }
        ]
      }
    ]
  },
  {
    id: 5,
    title: 'GROUP BY 分组统计',
    description: '学习数据分组和聚合函数',
    difficulty: '中级',
    points: 30,
    requirement: '统计每个部门的员工数量和平均工资',
    sampleData: [
      {
        name: 'employees',
        columns: ['id', 'name', 'department', 'salary'],
        data: [
          { id: 1, name: '张三', department: '技术部', salary: 8000 },
          { id: 2, name: '李四', department: '销售部', salary: 6000 },
          { id: 3, name: '王五', department: '技术部', salary: 9000 }
        ]
      }
    ]
  }
])

/**
 * 获取难度类型样式
 * @param difficulty 难度等级
 */
const getDifficultyType = (difficulty: string) => {
  const types: Record<string, string> = {
    '初级': 'success',
    '中级': 'warning',
    '高级': 'danger'
  }
  return types[difficulty] || 'info'
}

/**
 * 检查题目是否已完成
 * @param questionId 题目ID
 */
const isQuestionCompleted = (questionId: number) => {
  return progressStore.isExerciseCompleted(questionId.toString())
}

/**
 * 选择题目
 * @param question 题目对象
 */
const selectQuestion = (question: any) => {
  currentQuestion.value = question
  sqlStore.reset()
}

/**
 * 随机选择题目
 */
const selectRandomQuestion = () => {
  const randomIndex = Math.floor(Math.random() * questions.value.length)
  selectQuestion(questions.value[randomIndex])
}

/**
 * 运行SQL查询
 */
const runQuery = async () => {
  if (!sqlStore.currentSQL.trim()) {
    ElMessage.warning('请输入SQL语句')
    return
  }

  try {
    await sqlStore.executeSQL(sqlStore.currentSQL)
    if (sqlStore.executeResult) {
      ElMessage.success('查询执行成功')
    }
  } catch (error) {
    console.error('查询执行失败:', error)
  }
}

/**
 * 提交答案
 */
const submitAnswer = () => {
  if (!currentQuestion.value) {
    ElMessage.warning('请先选择题目')
    return
  }

  if (!sqlStore.executeResult) {
    ElMessage.warning('请先运行SQL查询')
    return
  }

  // 简单的答案验证逻辑
  const score = Math.floor(Math.random() * 40) + 60 // 模拟60-100分
  
  // 记录进度
  progressStore.recordProgress(currentQuestion.value.id.toString(), score)

  ElMessage.success(`答案提交成功！得分：${score}分`)
}

/**
 * 页面初始化
 */
onMounted(() => {
  // 默认选择第一题
  if (questions.value.length > 0) {
    selectQuestion(questions.value[0])
  }
})
</script>

<style scoped>
.practice {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.practice__container {
  max-width: 1400px;
  margin: 0 auto;
}

.practice__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  color: white;
}

.practice__title {
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
}

.practice__stats {
  display: flex;
  gap: 30px;
}

.practice__stat-item {
  text-align: center;
}

.practice__stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 4px;
}

.practice__stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.practice__questions-card,
.practice__question-detail,
.practice__editor-card,
.practice__result-card {
  margin-bottom: 20px;
  background: white;
  border-radius: 12px;
}

.practice__card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.practice__card-header h3 {
  margin: 0;
  color: #303133;
}

.practice__questions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 600px;
  overflow-y: auto;
}

.practice__question-item {
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.practice__question-item:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.practice__question-item--active {
  border-color: #409eff;
  background: #f0f9ff;
}

.practice__question-item--completed {
  border-color: #67c23a;
  background: #f0f9ff;
}

.practice__question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.practice__question-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.practice__question-completed {
  color: #67c23a;
}

.practice__question-points {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
  color: #e6a23c;
}

.practice__question-title {
  margin: 0 0 8px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #303133;
}

.practice__question-desc {
  margin: 0;
  font-size: 0.9rem;
  color: #909399;
}

.practice__question-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.practice__requirement h4,
.practice__sample-data h4 {
  margin: 0 0 8px 0;
  color: #303133;
}

.practice__requirement p {
  margin: 0;
  color: #606266;
  line-height: 1.6;
}

.practice__tables {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.practice__table h5 {
  margin: 0 0 8px 0;
  color: #409eff;
  font-weight: 600;
}

.practice__sample-table {
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.practice__editor-actions {
  display: flex;
  gap: 8px;
}

.practice__editor-container {
  padding: 16px 0;
}

.practice__sql-input {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.practice__result-count {
  font-size: 0.9rem;
  color: #909399;
}

.practice__result-table {
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.practice__error-alert {
  margin-top: 16px;
}

.practice__empty {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .practice__header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .practice__stats {
    gap: 20px;
  }

  .practice__questions-list {
    max-height: 400px;
  }
}
</style>
