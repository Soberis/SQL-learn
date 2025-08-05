// SQL相关类型定义

export interface SQLExecutionRequest {
  sql: string;
  exercise_id?: string;
  timeout?: number;
  limit?: number;
}

export interface SQLExecutionResponse {
  success: boolean;
  result?: QueryResult;
  error?: SQLError;
  execution_time: number;
  rows_affected?: number;
}

export interface QueryResult {
  columns: ColumnMetadata[];
  data: Record<string, any>[];
  row_count: number;
  has_more?: boolean;
}

export interface ColumnMetadata {
  name: string;
  type: string;
  nullable: boolean;
  max_length?: number;
  precision?: number;
  scale?: number;
}

export interface SQLError {
  code: string;
  message: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning' | 'info';
  hint?: string;
}

export interface SQLValidationResult {
  is_valid: boolean;
  errors: SQLError[];
  warnings: SQLError[];
  suggestions?: string[];
}

export interface QueryPlan {
  node_type: string;
  operation: string;
  cost: number;
  rows: number;
  width: number;
  children?: QueryPlan[];
  details?: Record<string, any>;
}

export interface SQLAnalysis {
  query_type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'CREATE' | 'DROP' | 'ALTER';
  tables_used: string[];
  columns_used: string[];
  functions_used: string[];
  complexity_score: number;
  estimated_execution_time?: number;
  optimization_suggestions?: string[];
}

export interface DatabaseSchema {
  tables: TableSchema[];
  views: ViewSchema[];
  functions: FunctionSchema[];
  indexes: IndexSchema[];
}

export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
  primary_key: string[];
  foreign_keys: ForeignKeySchema[];
  indexes: string[];
  row_count?: number;
  description?: string;
}

export interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  default_value?: any;
  max_length?: number;
  precision?: number;
  scale?: number;
  is_primary_key: boolean;
  is_foreign_key: boolean;
  description?: string;
}

export interface ForeignKeySchema {
  column: string;
  referenced_table: string;
  referenced_column: string;
  on_delete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  on_update?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
}

export interface ViewSchema {
  name: string;
  definition: string;
  columns: ColumnSchema[];
  description?: string;
}

export interface FunctionSchema {
  name: string;
  parameters: ParameterSchema[];
  return_type: string;
  language: string;
  description?: string;
}

export interface ParameterSchema {
  name: string;
  type: string;
  default_value?: any;
  is_required: boolean;
}

export interface IndexSchema {
  name: string;
  table: string;
  columns: string[];
  is_unique: boolean;
  type: 'btree' | 'hash' | 'gin' | 'gist';
  description?: string;
}