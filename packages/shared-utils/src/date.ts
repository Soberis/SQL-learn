// 日期相关工具函数

/**
 * 格式化日期
 */
export function formatDate(date: string | Date, format: string = 'YYYY-MM-DD'): string {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 格式化日期时间
 */
export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'YYYY-MM-DD HH:mm:ss');
}

/**
 * 格式化时间
 */
export function formatTime(date: string | Date): string {
  return formatDate(date, 'HH:mm:ss');
}

/**
 * 获取相对时间描述
 */
export function getRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  
  if (isNaN(target.getTime())) {
    return 'Invalid Date';
  }
  
  const diffMs = now.getTime() - target.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  if (diffSeconds < 60) {
    return '刚刚';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks}周前`;
  } else if (diffMonths < 12) {
    return `${diffMonths}个月前`;
  } else {
    return `${diffYears}年前`;
  }
}

/**
 * 检查日期是否为今天
 */
export function isToday(date: string | Date): boolean {
  const today = new Date();
  const target = new Date(date);
  
  return (
    today.getFullYear() === target.getFullYear() &&
    today.getMonth() === target.getMonth() &&
    today.getDate() === target.getDate()
  );
}

/**
 * 检查日期是否为昨天
 */
export function isYesterday(date: string | Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const target = new Date(date);
  
  return (
    yesterday.getFullYear() === target.getFullYear() &&
    yesterday.getMonth() === target.getMonth() &&
    yesterday.getDate() === target.getDate()
  );
}

/**
 * 检查日期是否为本周
 */
export function isThisWeek(date: string | Date): boolean {
  const now = new Date();
  const target = new Date(date);
  
  // 获取本周的开始日期（周一）
  const startOfWeek = new Date(now);
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  
  // 获取本周的结束日期（周日）
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return target >= startOfWeek && target <= endOfWeek;
}

/**
 * 检查日期是否为本月
 */
export function isThisMonth(date: string | Date): boolean {
  const now = new Date();
  const target = new Date(date);
  
  return (
    now.getFullYear() === target.getFullYear() &&
    now.getMonth() === target.getMonth()
  );
}

/**
 * 获取日期范围内的所有日期
 */
export function getDateRange(startDate: string | Date, endDate: string | Date): Date[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dates: Date[] = [];
  
  const current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

/**
 * 获取本周的日期范围
 */
export function getThisWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  const day = now.getDay();
  
  // 获取本周的开始日期（周一）
  const start = new Date(now);
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  
  // 获取本周的结束日期（周日）
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

/**
 * 获取本月的日期范围
 */
export function getThisMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  
  return { start, end };
}

/**
 * 计算两个日期之间的天数差
 */
export function getDaysDifference(date1: string | Date, date2: string | Date): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 添加天数到日期
 */
export function addDays(date: string | Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * 添加小时到日期
 */
export function addHours(date: string | Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

/**
 * 获取日期的开始时间（00:00:00）
 */
export function getStartOfDay(date: string | Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * 获取日期的结束时间（23:59:59）
 */
export function getEndOfDay(date: string | Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * 检查日期是否有效
 */
export function isValidDate(date: any): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * 解析ISO日期字符串
 */
export function parseISODate(dateString: string): Date | null {
  try {
    const date = new Date(dateString);
    return isValidDate(date) ? date : null;
  } catch {
    return null;
  }
}

/**
 * 转换为ISO日期字符串
 */
export function toISODateString(date: Date): string {
  return date.toISOString();
}

/**
 * 获取友好的日期显示
 */
export function getFriendlyDate(date: string | Date): string {
  if (isToday(date)) {
    return '今天';
  }
  
  if (isYesterday(date)) {
    return '昨天';
  }
  
  if (isThisWeek(date)) {
    const target = new Date(date);
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[target.getDay()];
  }
  
  if (isThisMonth(date)) {
    return formatDate(date, 'MM-DD');
  }
  
  return formatDate(date, 'YYYY-MM-DD');
}

/**
 * 获取学习连续天数
 */
export function calculateStreakDays(dates: (string | Date)[]): number {
  if (dates.length === 0) {
    return 0;
  }
  
  // 转换为日期对象并排序
  const sortedDates = dates
    .map(d => getStartOfDay(d))
    .sort((a, b) => b.getTime() - a.getTime());
  
  // 去重
  const uniqueDates = sortedDates.filter((date, index) => 
    index === 0 || date.getTime() !== sortedDates[index - 1].getTime()
  );
  
  if (uniqueDates.length === 0) {
    return 0;
  }
  
  let streak = 1;
  const today = getStartOfDay(new Date());
  
  // 检查最新日期是否是今天或昨天
  const latestDate = uniqueDates[0];
  const daysDiff = getDaysDifference(latestDate, today);
  
  if (daysDiff > 1) {
    return 0; // 连续记录已中断
  }
  
  // 计算连续天数
  for (let i = 1; i < uniqueDates.length; i++) {
    const currentDate = uniqueDates[i];
    const previousDate = uniqueDates[i - 1];
    const diff = getDaysDifference(currentDate, previousDate);
    
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}