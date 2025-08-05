// 格式化相关工具函数

/**
 * 格式化数字
 */
export function formatNumber(num: number, options: {
  decimals?: number;
  separator?: string;
  prefix?: string;
  suffix?: string;
} = {}): string {
  const {
    decimals = 0,
    separator = ',',
    prefix = '',
    suffix = ''
  } = options;
  
  const formatted = num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return `${prefix}${formatted}${suffix}`;
}

/**
 * 格式化百分比
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 格式化持续时间
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}秒`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    if (remainingSeconds === 0) {
      return `${minutes}分钟`;
    }
    return `${minutes}分${Math.round(remainingSeconds)}秒`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours < 24) {
    if (remainingMinutes === 0) {
      return `${hours}小时`;
    }
    return `${hours}小时${remainingMinutes}分钟`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  if (remainingHours === 0) {
    return `${days}天`;
  }
  return `${days}天${remainingHours}小时`;
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) {
    return '刚刚';
  }
  
  if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  }
  
  if (diffHours < 24) {
    return `${diffHours}小时前`;
  }
  
  if (diffDays < 7) {
    return `${diffDays}天前`;
  }
  
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}周前`;
  }
  
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months}个月前`;
  }
  
  const years = Math.floor(diffDays / 365);
  return `${years}年前`;
}

/**
 * 格式化SQL代码
 */
export function formatSQL(sql: string): string {
  // 简单的SQL格式化
  return sql
    .replace(/\s+/g, ' ') // 合并多个空格
    .replace(/;\s*/g, ';\n') // 分号后换行
    .replace(/\b(SELECT|FROM|WHERE|JOIN|INNER JOIN|LEFT JOIN|RIGHT JOIN|GROUP BY|ORDER BY|HAVING)\b/gi, '\n$1') // 关键字前换行
    .replace(/\b(AND|OR)\b/gi, '\n  $1') // 逻辑操作符缩进
    .replace(/,/g, ',\n  ') // 逗号后换行并缩进
    .trim()
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
}

/**
 * 截断文本
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * 格式化用户名显示
 */
export function formatDisplayName(name: string, maxLength: number = 20): string {
  if (!name) return 'Unknown';
  
  return truncateText(name, maxLength);
}

/**
 * 格式化标签列表
 */
export function formatTags(tags: string[], maxTags: number = 3): string {
  if (tags.length === 0) {
    return '';
  }
  
  if (tags.length <= maxTags) {
    return tags.join(', ');
  }
  
  const visibleTags = tags.slice(0, maxTags);
  const remainingCount = tags.length - maxTags;
  
  return `${visibleTags.join(', ')} +${remainingCount}`;
}

/**
 * 格式化分数显示
 */
export function formatScore(score: number): string {
  return `${Math.round(score)}分`;
}

/**
 * 格式化难度显示
 */
export function formatDifficulty(difficulty: string): string {
  const difficultyMap: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  };
  
  return difficultyMap[difficulty] || difficulty;
}

/**
 * 格式化练习状态
 */
export function formatExerciseStatus(status: string): string {
  const statusMap: Record<string, string> = {
    not_started: '未开始',
    in_progress: '进行中',
    completed: '已完成',
    failed: '失败'
  };
  
  return statusMap[status] || status;
}

/**
 * 格式化查询结果为表格
 */
export function formatQueryResultAsTable(result: {
  columns: string[];
  data: Record<string, any>[];
}): string {
  if (!result.data || result.data.length === 0) {
    return '无数据';
  }
  
  const { columns, data } = result;
  
  // 计算每列的最大宽度
  const columnWidths = columns.map(col => {
    const headerWidth = col.length;
    const dataWidth = Math.max(
      ...data.map(row => String(row[col] || '').length)
    );
    return Math.max(headerWidth, dataWidth, 3); // 最小宽度为3
  });
  
  // 创建分隔线
  const separator = '+' + columnWidths.map(width => '-'.repeat(width + 2)).join('+') + '+';
  
  // 创建表头
  const header = '|' + columns.map((col, i) => 
    ` ${col.padEnd(columnWidths[i])} `
  ).join('|') + '|';
  
  // 创建数据行
  const rows = data.map(row => 
    '|' + columns.map((col, i) => 
      ` ${String(row[col] || '').padEnd(columnWidths[i])} `
    ).join('|') + '|'
  );
  
  return [separator, header, separator, ...rows, separator].join('\n');
}

/**
 * 高亮SQL关键字
 */
export function highlightSQLKeywords(sql: string): string {
  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER',
    'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET',
    'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER',
    'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE',
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'DISTINCT'
  ];
  
  let highlighted = sql;
  
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    highlighted = highlighted.replace(regex, `<strong>${keyword.toUpperCase()}</strong>`);
  });
  
  return highlighted;
}