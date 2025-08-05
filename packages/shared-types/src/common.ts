// 通用类型定义

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface FilterParams {
  search?: string;
  filters?: Record<string, any>;
  date_from?: string;
  date_to?: string;
}

export interface SortOption {
  field: string;
  label: string;
  direction: 'asc' | 'desc';
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface FormState<T = Record<string, any>> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  lastUpdated?: string;
}

export interface NotificationMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  actions?: NotificationAction[];
  timestamp: string;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  type?: 'primary' | 'secondary';
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
  disabled?: boolean;
  badge?: string | number;
  permission?: string;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: string;
}

export interface TabItem {
  key: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  closable?: boolean;
}

export interface ModalProps {
  visible: boolean;
  title?: string;
  width?: string | number;
  closable?: boolean;
  maskClosable?: boolean;
  destroyOnClose?: boolean;
  centered?: boolean;
}

export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  fixed?: 'left' | 'right';
}

export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
  color?: string;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
  type?: 'line' | 'bar' | 'area' | 'pie';
}

export interface DateRange {
  start: string;
  end: string;
}

export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

export interface SystemInfo {
  version: string;
  build_date: string;
  environment: 'development' | 'staging' | 'production';
  features: string[];
  maintenance_mode: boolean;
}