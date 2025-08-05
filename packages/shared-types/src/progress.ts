// 进度相关类型定义

export interface UserProgress {
  user_id: string;
  exercise_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score: number;
  best_score: number;
  attempts: number;
  time_spent: number; // 总花费时间（秒）
  first_attempt_at?: string;
  last_attempt_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ProgressStats {
  total_exercises: number;
  completed_exercises: number;
  in_progress_exercises: number;
  total_points: number;
  earned_points: number;
  completion_rate: number;
  average_score: number;
  total_time_spent: number;
  streak_days: number;
  last_activity_date?: string;
}

export interface DailyProgress {
  date: string;
  exercises_completed: number;
  points_earned: number;
  time_spent: number;
  new_exercises_started: number;
}

export interface WeeklyProgress {
  week_start: string;
  week_end: string;
  daily_progress: DailyProgress[];
  total_exercises_completed: number;
  total_points_earned: number;
  total_time_spent: number;
}

export interface MonthlyProgress {
  month: string;
  year: number;
  weekly_progress: WeeklyProgress[];
  total_exercises_completed: number;
  total_points_earned: number;
  total_time_spent: number;
  completion_rate: number;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_hours: number;
  exercise_ids: string[];
  prerequisites?: string[];
  created_at: string;
  updated_at: string;
}

export interface UserLearningPath {
  user_id: string;
  learning_path_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  current_exercise_index: number;
  started_at?: string;
  completed_at?: string;
  estimated_completion_date?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'completion' | 'streak' | 'score' | 'time' | 'special';
  criteria: AchievementCriteria;
  points_reward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AchievementCriteria {
  type: 'exercises_completed' | 'streak_days' | 'total_points' | 'perfect_scores' | 'time_limit';
  target_value: number;
  category?: string;
  difficulty?: string;
}

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  earned_at: string;
  progress: number;
  is_completed: boolean;
}