# 开发指南与最佳实践

## 1. 开发环境设置

### 1.1 系统要求

- **Node.js**: >= 18.0.0
- **Python**: >= 3.11
- **PostgreSQL**: >= 14.0
- **PNPM**: >= 8.0.0
- **Git**: >= 2.30.0

### 1.2 开发工具推荐

- **IDE**: VS Code + 推荐插件
- **数据库工具**: DBeaver 或 pgAdmin
- **API测试**: Postman 或 Insomnia
- **版本控制**: Git + GitHub Desktop

### 1.3 VS Code 推荐插件

```json
{
  "recommendations": [
    "vue.volar",
    "ms-python.python",
    "ms-python.black-formatter",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode-remote.remote-containers",
    "github.copilot"
  ]
}
```

## 2. 开发工作流程

### 2.1 分支管理策略

```
main                    # 生产分支
├── develop            # 开发分支
│   ├── feature/xxx    # 功能分支
│   ├── bugfix/xxx     # 修复分支
│   └── hotfix/xxx     # 热修复分支
└── release/x.x.x      # 发布分支
```

### 2.2 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
# 格式
<type>[optional scope]: <description>

# 示例
feat(auth): add user login functionality
fix(api): resolve exercise submission bug
docs(readme): update installation guide
style(frontend): format code with prettier
refactor(backend): optimize database queries
test(e2e): add user registration tests
chore(deps): update dependencies
```

### 2.3 代码审查流程

1. **创建Pull Request**
   - 填写详细的PR描述
   - 关联相关Issue
   - 添加适当的标签

2. **自检清单**
   - [ ] 代码符合编码规范
   - [ ] 所有测试通过
   - [ ] 文档已更新
   - [ ] 无安全漏洞

3. **审查要点**
   - 代码逻辑正确性
   - 性能影响评估
   - 安全性检查
   - 可维护性评估

## 3. 编码规范

### 3.1 TypeScript/JavaScript 规范

```typescript
// ✅ 好的实践
interface UserProfile {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

const getUserProfile = async (userId: string): Promise<UserProfile> => {
  try {
    const response = await userApi.getProfile(userId);
    return response.data;
  } catch (error) {
    logger.error('Failed to fetch user profile', { userId, error });
    throw new Error('Unable to fetch user profile');
  }
};

// ❌ 避免的实践
const getUser = async (id) => {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
};
```

### 3.2 Vue 组件规范

```vue
<!-- ✅ 好的实践 -->
<template>
  <div class="exercise-card">
    <h3 class="exercise-card__title">{{ exercise.title }}</h3>
    <p class="exercise-card__description">{{ exercise.description }}</p>
    <div class="exercise-card__actions">
      <BaseButton 
        variant="primary" 
        @click="startExercise"
      >
        开始练习
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Exercise } from '@sql-learn/shared-types';
import { BaseButton } from '@sql-learn/ui-components';

interface Props {
  exercise: Exercise;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  start: [exerciseId: string];
}>();

const startExercise = () => {
  emit('start', props.exercise.id);
};
</script>

<style scoped>
.exercise-card {
  @apply p-6 bg-white rounded-lg shadow-md;
}

.exercise-card__title {
  @apply text-xl font-semibold mb-2;
}

.exercise-card__description {
  @apply text-gray-600 mb-4;
}

.exercise-card__actions {
  @apply flex justify-end;
}
</style>
```

### 3.3 Python 编码规范

```python
# ✅ 好的实践
from typing import List, Optional
from sqlalchemy.orm import Session
from ..models.exercise import Exercise
from ..schemas.exercise import ExerciseCreate, ExerciseResponse

class ExerciseService:
    """练习服务类，处理练习相关的业务逻辑"""
    
    def __init__(self, db: Session) -> None:
        self.db = db
    
    def get_exercises(
        self, 
        skip: int = 0, 
        limit: int = 100,
        category_id: Optional[str] = None
    ) -> List[ExerciseResponse]:
        """获取练习列表
        
        Args:
            skip: 跳过的记录数
            limit: 限制返回的记录数
            category_id: 可选的分类ID过滤
            
        Returns:
            练习列表
        """
        query = self.db.query(Exercise)
        
        if category_id:
            query = query.filter(Exercise.category_id == category_id)
            
        exercises = query.offset(skip).limit(limit).all()
        return [ExerciseResponse.from_orm(exercise) for exercise in exercises]
    
    def create_exercise(self, exercise_data: ExerciseCreate) -> ExerciseResponse:
        """创建新练习"""
        exercise = Exercise(**exercise_data.dict())
        self.db.add(exercise)
        self.db.commit()
        self.db.refresh(exercise)
        return ExerciseResponse.from_orm(exercise)
```

## 4. 测试策略

### 4.1 测试金字塔

```
    /\     E2E Tests (10%)
   /  \    
  /____\   Integration Tests (20%)
 /______\  
/________\ Unit Tests (70%)
```

### 4.2 前端测试

```typescript
// 单元测试示例
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ExerciseCard from '../ExerciseCard.vue';

describe('ExerciseCard', () => {
  const mockExercise = {
    id: '1',
    title: 'SQL基础查询',
    description: '学习SELECT语句的基本用法',
    difficulty: 'beginner'
  };

  it('should render exercise information correctly', () => {
    const wrapper = mount(ExerciseCard, {
      props: { exercise: mockExercise }
    });

    expect(wrapper.find('.exercise-card__title').text()).toBe(mockExercise.title);
    expect(wrapper.find('.exercise-card__description').text()).toBe(mockExercise.description);
  });

  it('should emit start event when button clicked', async () => {
    const wrapper = mount(ExerciseCard, {
      props: { exercise: mockExercise }
    });

    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('start')).toBeTruthy();
    expect(wrapper.emitted('start')[0]).toEqual([mockExercise.id]);
  });
});
```

### 4.3 后端测试

```python
# 单元测试示例
import pytest
from sqlalchemy.orm import Session
from app.services.exercise_service import ExerciseService
from app.schemas.exercise import ExerciseCreate

class TestExerciseService:
    """练习服务测试类"""
    
    def test_create_exercise(self, db: Session):
        """测试创建练习"""
        service = ExerciseService(db)
        exercise_data = ExerciseCreate(
            title="测试练习",
            description="这是一个测试练习",
            sql_template="SELECT * FROM users;",
            expected_result="user_list",
            difficulty="beginner"
        )
        
        result = service.create_exercise(exercise_data)
        
        assert result.title == exercise_data.title
        assert result.description == exercise_data.description
        assert result.id is not None
    
    def test_get_exercises_with_filter(self, db: Session):
        """测试带过滤条件的练习查询"""
        service = ExerciseService(db)
        
        # 创建测试数据
        category_id = "test-category"
        exercise_data = ExerciseCreate(
            title="分类练习",
            description="测试分类过滤",
            category_id=category_id,
            sql_template="SELECT 1;",
            expected_result="1",
            difficulty="beginner"
        )
        service.create_exercise(exercise_data)
        
        # 测试过滤
        results = service.get_exercises(category_id=category_id)
        assert len(results) > 0
        assert all(ex.category_id == category_id for ex in results)
```

### 4.4 E2E测试

```typescript
// Playwright E2E测试示例
import { test, expect } from '@playwright/test';

test.describe('用户认证流程', () => {
  test('用户可以成功注册和登录', async ({ page }) => {
    // 访问注册页面
    await page.goto('/register');
    
    // 填写注册表单
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    
    // 提交注册
    await page.click('[data-testid="register-button"]');
    
    // 验证跳转到登录页面
    await expect(page).toHaveURL('/login');
    
    // 使用注册的账号登录
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // 验证登录成功
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });
});
```

## 5. 📊 性能监控指南

### 5.1 构建性能监控

#### 监控工具配置

```json
// package.json - 添加性能监控脚本
{
  "scripts": {
    "build:analyze": "pnpm --filter @sql-learn/frontend build --analyze",
    "build:report": "pnpm --filter @sql-learn/frontend build --reporter=append-only",
    "perf:bundle": "bundlesize",
    "perf:lighthouse": "lighthouse http://localhost:3000 --output=html --output-path=./reports/lighthouse.html"
  },
  "bundlesize": [
    {
      "path": "./apps/frontend/dist/assets/*.js",
      "maxSize": "250 kB",
      "compression": "gzip"
    },
    {
      "path": "./apps/frontend/dist/assets/*.css",
      "maxSize": "50 kB",
      "compression": "gzip"
    }
  ]
}
```

#### 构建性能监控脚本

```bash
#!/bin/bash
# scripts/performance/build-monitor.sh

echo "🚀 开始构建性能监控..."

# 记录开始时间
START_TIME=$(date +%s)

# 清理之前的构建
echo "🧹 清理构建缓存..."
pnpm clean

# 构建共享包
echo "📦 构建共享包..."
SHARED_START=$(date +%s)
pnpm --filter @sql-learn/shared-types build
pnpm --filter @sql-learn/shared-utils build
pnpm --filter @sql-learn/ui-components build
SHARED_END=$(date +%s)
SHARED_TIME=$((SHARED_END - SHARED_START))

# 构建前端
echo "🎨 构建前端应用..."
FRONTEND_START=$(date +%s)
pnpm --filter @sql-learn/frontend build
FRONTEND_END=$(date +%s)
FRONTEND_TIME=$((FRONTEND_END - FRONTEND_START))

# 总构建时间
END_TIME=$(date +%s)
TOTAL_TIME=$((END_TIME - START_TIME))

# 生成性能报告
echo "📊 生成性能报告..."
cat > reports/build-performance.md << EOF
# 构建性能报告

生成时间: $(date)

## 构建时间统计

- 共享包构建时间: ${SHARED_TIME}秒
- 前端应用构建时间: ${FRONTEND_TIME}秒
- 总构建时间: ${TOTAL_TIME}秒

## 性能目标

- ✅ 共享包构建 < 30秒: $([ $SHARED_TIME -lt 30 ] && echo "通过" || echo "未通过")
- ✅ 前端构建 < 60秒: $([ $FRONTEND_TIME -lt 60 ] && echo "通过" || echo "未通过")
- ✅ 总构建时间 < 120秒: $([ $TOTAL_TIME -lt 120 ] && echo "通过" || echo "未通过")

EOF

echo "✅ 构建性能监控完成！报告已保存到 reports/build-performance.md"
```

### 5.2 运行时性能监控

#### 前端性能监控

```typescript
// apps/frontend/src/utils/performance.ts
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // 监控页面加载时间
  measurePageLoad(pageName: string): void {
    const loadTime = performance.now();
    this.metrics.set(`page_load_${pageName}`, loadTime);
    
    // 如果加载时间超过2秒，记录警告
    if (loadTime > 2000) {
      console.warn(`⚠️ 页面 ${pageName} 加载时间过长: ${loadTime.toFixed(2)}ms`);
    }
  }

  // 监控API请求时间
  async measureApiCall<T>(
    apiName: string, 
    apiCall: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.metrics.set(`api_${apiName}`, duration);
      
      // 如果API调用超过1秒，记录警告
      if (duration > 1000) {
        console.warn(`⚠️ API ${apiName} 响应时间过长: ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.error(`❌ API ${apiName} 调用失败，耗时: ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  }

  // 获取性能报告
  getPerformanceReport(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  // 监控内存使用
  monitorMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.log('📊 内存使用情况:', {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
      });
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
```

#### 后端性能监控

```python
# apps/backend/app/utils/performance.py
import time
import psutil
import logging
from functools import wraps
from typing import Callable, Any

logger = logging.getLogger(__name__)

def monitor_performance(func_name: str = None):
    """性能监控装饰器"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def async_wrapper(*args, **kwargs) -> Any:
            name = func_name or f"{func.__module__}.{func.__name__}"
            start_time = time.time()
            start_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
            
            try:
                result = await func(*args, **kwargs)
                end_time = time.time()
                end_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
                
                duration = (end_time - start_time) * 1000  # ms
                memory_diff = end_memory - start_memory
                
                # 记录性能指标
                logger.info(
                    f"⚡ {name} - 执行时间: {duration:.2f}ms, "
                    f"内存变化: {memory_diff:+.2f}MB"
                )
                
                # 性能警告
                if duration > 1000:  # 超过1秒
                    logger.warning(f"⚠️ {name} 执行时间过长: {duration:.2f}ms")
                
                if memory_diff > 10:  # 内存增长超过10MB
                    logger.warning(f"⚠️ {name} 内存使用增长: {memory_diff:.2f}MB")
                
                return result
                
            except Exception as e:
                end_time = time.time()
                duration = (end_time - start_time) * 1000
                logger.error(f"❌ {name} 执行失败，耗时: {duration:.2f}ms", exc_info=True)
                raise
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs) -> Any:
            name = func_name or f"{func.__module__}.{func.__name__}"
            start_time = time.time()
            
            try:
                result = func(*args, **kwargs)
                end_time = time.time()
                duration = (end_time - start_time) * 1000
                
                logger.info(f"⚡ {name} - 执行时间: {duration:.2f}ms")
                
                if duration > 500:  # 超过500ms
                    logger.warning(f"⚠️ {name} 执行时间过长: {duration:.2f}ms")
                
                return result
                
            except Exception as e:
                end_time = time.time()
                duration = (end_time - start_time) * 1000
                logger.error(f"❌ {name} 执行失败，耗时: {duration:.2f}ms", exc_info=True)
                raise
        
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    return decorator

# 使用示例
@monitor_performance("获取练习列表")
async def get_exercises(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Exercise).offset(skip).limit(limit).all()
```

### 5.3 性能指标和目标

#### 前端性能目标

| 指标 | 目标值 | 监控方法 |
|------|--------|----------|
| 首屏加载时间 | < 2秒 | Lighthouse, Web Vitals |
| 热重载时间 | < 2秒 | Vite HMR监控 |
| 类型检查时间 | < 30秒 | TypeScript编译时间 |
| 包大小 | < 250KB (gzipped) | bundlesize工具 |
| 内存使用 | < 100MB | Performance API |

#### 后端性能目标

| 指标 | 目标值 | 监控方法 |
|------|--------|----------|
| API响应时间 | < 200ms | 性能装饰器 |
| 数据库查询时间 | < 100ms | SQLAlchemy日志 |
| 内存使用 | < 512MB | psutil监控 |
| CPU使用率 | < 70% | 系统监控 |
| 并发处理能力 | 1000+ 用户 | 压力测试 |

#### 构建性能目标

| 阶段 | 目标时间 | 优化策略 |
|------|----------|----------|
| 共享包构建 | < 30秒 | 增量构建、缓存 |
| 前端构建 | < 60秒 | 代码分割、Tree Shaking |
| 总构建时间 | < 120秒 | 并行构建、优化依赖 |
| 测试执行 | < 5分钟 | 并行测试、智能重试 |

### 5.4 性能监控工具推荐

#### 开发环境工具

```bash
# 安装性能监控工具
pnpm add -D bundlesize size-limit lighthouse webpack-bundle-analyzer

# 包大小分析
pnpm build:analyze

# Lighthouse性能测试
lighthouse http://localhost:3000 --output=html

# 包大小限制检查
pnpm perf:bundle
```

#### 生产环境监控

- **前端**: Sentry、Google Analytics、Web Vitals
- **后端**: Prometheus + Grafana、ELK Stack
- **数据库**: pg_stat_statements、pgAdmin
- **服务器**: htop、iotop、netstat

## 6. 调试技巧

### 6.1 前端调试

```typescript
// 开发环境调试工具
if (import.meta.env.DEV) {
  // Vue Devtools
  window.__VUE_DEVTOOLS_GLOBAL_HOOK__ = true;
  
  // 性能监控
  window.performanceMonitor = performanceMonitor;
  
  // 全局错误处理
  window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise拒绝:', event.reason);
  });
}
```

### 6.2 后端调试

```python
# 开发环境调试配置
if settings.DEBUG:
    import logging
    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # SQL查询日志
    logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
```

## 7. 部署最佳实践

### 7.1 环境配置

```bash
# 生产环境变量
NODE_ENV=production
VITE_API_BASE_URL=https://api.yourdomain.com
DATABASE_URL=postgresql://user:pass@prod-db:5432/sql_learning
REDIS_URL=redis://prod-redis:6379/0
SECRET_KEY=your-super-secret-production-key
```

### 7.2 Docker优化

```dockerfile
# 多阶段构建优化
FROM node:18-alpine AS builder
WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/frontend/ ./apps/frontend/

# 安装依赖并构建
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
RUN pnpm build

# 生产镜像
FROM nginx:alpine
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

这个开发指南为团队提供了完整的开发规范、性能监控策略和最佳实践，确保项目的高质量交付和长期维护。