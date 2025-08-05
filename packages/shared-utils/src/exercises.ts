// 练习相关工具函数

import type { 
  Exercise, 
  ExerciseDetail, 
  DifficultyLevel, 
  ExerciseStatus,
  QueryResult,
  UserProgress
} from '@sql-learn/shared-types';

/**
 * 获取难度级别的显示文本
 */
export function getDifficultyLabel(difficulty: DifficultyLevel): string {
  const labels = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  };
  return labels[difficulty];
}

/**
 * 获取难度级别的颜色
 */
export function getDifficultyColor(difficulty: DifficultyLevel): string {
  const colors = {
    easy: '#52c41a',
    medium: '#faad14',
    hard: '#f5222d'
  };
  return colors[difficulty];
}

/**
 * 获取练习状态的显示文本
 */
export function getStatusLabel(status: ExerciseStatus): string {
  const labels = {
    not_started: '未开始',
    in_progress: '进行中',
    completed: '已完成',
    failed: '失败'
  };
  return labels[status];
}

/**
 * 获取练习状态的颜色
 */
export function getStatusColor(status: ExerciseStatus): string {
  const colors = {
    not_started: '#d9d9d9',
    in_progress: '#1890ff',
    completed: '#52c41a',
    failed: '#f5222d'
  };
  return colors[status];
}

/**
 * 计算练习完成度
 */
export function calculateCompletionRate(exercises: Exercise[], progresses: UserProgress[]): number {
  if (exercises.length === 0) {
    return 0;
  }
  
  const completedCount = progresses.filter(p => p.status === 'completed').length;
  return Math.round((completedCount / exercises.length) * 100);
}

/**
 * 根据分数计算星级评分
 */
export function calculateStarRating(score: number): number {
  if (score >= 95) return 5;
  if (score >= 85) return 4;
  if (score >= 70) return 3;
  if (score >= 50) return 2;
  if (score > 0) return 1;
  return 0;
}

/**
 * 格式化执行时间
 */
export function formatExecutionTime(timeMs: number): string {
  if (timeMs < 1000) {
    return `${timeMs}ms`;
  }
  
  const seconds = timeMs / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(2)}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
}

/**
 * 验证SQL查询结果是否匹配期望结果
 */
export function validateQueryResult(
  actual: QueryResult, 
  expected: QueryResult,
  options: {
    ignoreOrder?: boolean;
    ignoreCase?: boolean;
    tolerance?: number;
  } = {}
): {
  isMatch: boolean;
  differences: string[];
} {
  const differences: string[] = [];
  
  // 检查列数
  if (actual.columns.length !== expected.columns.length) {
    differences.push(`列数不匹配: 期望 ${expected.columns.length}, 实际 ${actual.columns.length}`);
    return { isMatch: false, differences };
  }
  
  // 检查列名
  for (let i = 0; i < expected.columns.length; i++) {
    const expectedCol = options.ignoreCase ? 
      expected.columns[i].toLowerCase() : expected.columns[i];
    const actualCol = options.ignoreCase ? 
      actual.columns[i].toLowerCase() : actual.columns[i];
    
    if (expectedCol !== actualCol) {
      differences.push(`列名不匹配: 期望 "${expected.columns[i]}", 实际 "${actual.columns[i]}"`);
    }
  }
  
  // 检查行数
  if (actual.row_count !== expected.row_count) {
    differences.push(`行数不匹配: 期望 ${expected.row_count}, 实际 ${actual.row_count}`);
  }
  
  // 检查数据内容
  const actualData = options.ignoreOrder ? 
    [...actual.data].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))) :
    actual.data;
  const expectedData = options.ignoreOrder ? 
    [...expected.data].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))) :
    expected.data;
  
  for (let i = 0; i < Math.min(actualData.length, expectedData.length); i++) {
    const actualRow = actualData[i];
    const expectedRow = expectedData[i];
    
    for (const column of expected.columns) {
      const actualValue = actualRow[column];
      const expectedValue = expectedRow[column];
      
      if (!compareValues(actualValue, expectedValue, options)) {
        differences.push(
          `第 ${i + 1} 行, 列 "${column}": 期望 "${expectedValue}", 实际 "${actualValue}"`
        );
      }
    }
  }
  
  return {
    isMatch: differences.length === 0,
    differences
  };
}

/**
 * 比较两个值是否相等
 */
function compareValues(
  actual: any, 
  expected: any, 
  options: { ignoreCase?: boolean; tolerance?: number }
): boolean {
  if (actual === expected) {
    return true;
  }
  
  // 处理null和undefined
  if (actual == null && expected == null) {
    return true;
  }
  
  if (actual == null || expected == null) {
    return false;
  }
  
  // 字符串比较
  if (typeof actual === 'string' && typeof expected === 'string') {
    if (options.ignoreCase) {
      return actual.toLowerCase() === expected.toLowerCase();
    }
    return actual === expected;
  }
  
  // 数字比较（支持容差）
  if (typeof actual === 'number' && typeof expected === 'number') {
    if (options.tolerance && options.tolerance > 0) {
      return Math.abs(actual - expected) <= options.tolerance;
    }
    return actual === expected;
  }
  
  // 其他类型转换为字符串比较
  return String(actual) === String(expected);
}

/**
 * 生成练习提示
 */
export function generateHint(exercise: ExerciseDetail, attemptCount: number): string | null {
  if (!exercise.hints || exercise.hints.length === 0) {
    return null;
  }
  
  // 根据尝试次数逐步提供提示
  const hintIndex = Math.min(attemptCount - 1, exercise.hints.length - 1);
  return exercise.hints[hintIndex];
}

/**
 * 计算练习推荐度
 */
export function calculateRecommendationScore(
  exercise: Exercise,
  userProgress: UserProgress[],
  userLevel: DifficultyLevel
): number {
  let score = 0;
  
  // 基于难度匹配
  const difficultyMatch = {
    easy: { easy: 1, medium: 0.7, hard: 0.3 },
    medium: { easy: 0.5, medium: 1, hard: 0.8 },
    hard: { easy: 0.2, medium: 0.6, hard: 1 }
  };
  
  score += difficultyMatch[userLevel][exercise.difficulty] * 40;
  
  // 基于完成状态
  const progress = userProgress.find(p => p.exercise_id === exercise.id);
  if (!progress || progress.status === 'not_started') {
    score += 30; // 优先推荐未开始的练习
  } else if (progress.status === 'in_progress') {
    score += 20; // 其次推荐进行中的练习
  } else if (progress.status === 'completed' && progress.score < 80) {
    score += 10; // 最后推荐需要改进的已完成练习
  }
  
  // 基于练习热度（点数）
  score += Math.min(exercise.points / 10, 20);
  
  // 基于发布时间（新练习加分）
  const daysSinceCreated = (Date.now() - new Date(exercise.created_at).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreated < 7) {
    score += 10;
  } else if (daysSinceCreated < 30) {
    score += 5;
  }
  
  return Math.min(100, Math.max(0, score));
}