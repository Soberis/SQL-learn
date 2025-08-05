// 练习相关类型定义

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type ExerciseStatus = 'not_started' | 'in_progress' | 'completed' | 'failed';

export interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  points: number;
  category: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  is_published: boolean;
  order_index: number;
}

export interface ExerciseDetail extends Exercise {
  content: string;
  sample_data: SampleData;
  expected_result: QueryResult;
  hints: string[];
  solution?: string;
  test_cases: TestCase[];
}

export interface SampleData {
  tables: TableData[];
  description?: string;
}

export interface TableData {
  name: string;
  columns: ColumnInfo[];
  data: Record<string, any>[];
  description?: string;
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  description?: string;
}

export interface QueryResult {
  columns: string[];
  data: Record<string, any>[];
  row_count: number;
  execution_time?: number;
}

export interface TestCase {
  id: string;
  name: string;
  input_sql: string;
  expected_output: QueryResult;
  description?: string;
}

export interface ExerciseSubmission {
  id: string;
  exercise_id: string;
  user_id: string;
  sql_code: string;
  result: QueryResult | null;
  is_correct: boolean;
  score: number;
  feedback?: string;
  submitted_at: string;
  execution_time?: number;
  error_message?: string;
}

export interface ExerciseListParams {
  difficulty?: DifficultyLevel;
  category?: string;
  tags?: string[];
  status?: ExerciseStatus;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: 'created_at' | 'difficulty' | 'points' | 'title';
  sort_order?: 'asc' | 'desc';
}

export interface ExerciseListResponse {
  exercises: Exercise[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ExerciseCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  sort_order: number;
  exercise_count: number;
}