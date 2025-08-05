# Monorepo迁移指南

## 1. 迁移概述

### 1.1 迁移目标

将现有的分离式前后端项目迁移到统一的Monorepo架构，实现：
- 🏗️ **统一代码管理**：前后端代码在同一仓库中管理
- 📦 **共享包复用**：类型定义、工具函数、UI组件跨应用共享
- 🔄 **简化开发流程**：统一的构建、测试、部署流程
- ⚡ **提升开发效率**：减少重复代码，提高协作效率

### 1.2 迁移收益预期

| 指标 | 迁移前 | 迁移后 | 改善幅度 |
|------|--------|--------|----------|
| 构建时间 | 8-10分钟 | 4-6分钟 | 40-50% |
| 部署时间 | 15-20分钟 | 8-12分钟 | 40-50% |
| 代码复用率 | 20% | 60% | 200% |
| 类型安全性 | 部分覆盖 | 全覆盖 | 100% |
| 开发环境启动 | 3-5分钟 | 1-2分钟 | 60-70% |

## 2. 📋 迁移检查清单

### 2.1 迁移前准备检查

#### 环境准备
- [ ] **Node.js版本确认**：确保 >= 18.0.0
- [ ] **Python版本确认**：确保 >= 3.11
- [ ] **PNPM安装**：`npm install -g pnpm@latest`
- [ ] **PostgreSQL准备**：确保 >= 14.0 版本可用
- [ ] **Git版本确认**：确保 >= 2.30.0

#### 项目备份
- [ ] **代码备份**：创建完整的项目备份
  ```bash
  # 备份现有项目
  cp -r /path/to/frontend /backup/frontend-$(date +%Y%m%d)
  cp -r /path/to/backend /backup/backend-$(date +%Y%m%d)
  ```
- [ ] **数据库备份**：导出现有数据库
  ```bash
  pg_dump sql_learning > backup/database-$(date +%Y%m%d).sql
  ```
- [ ] **配置文件备份**：保存所有环境配置文件
- [ ] **依赖清单记录**：记录当前所有依赖版本

#### 团队准备
- [ ] **团队培训完成**：所有开发人员完成Monorepo概念培训
- [ ] **工具链熟悉**：团队熟悉PNPM工作空间使用
- [ ] **迁移计划确认**：团队确认迁移时间表和分工
- [ ] **回滚方案准备**：制定详细的回滚计划

#### 依赖兼容性检查
- [ ] **前端依赖分析**：检查Vue、TypeScript等核心依赖兼容性
- [ ] **后端依赖分析**：检查FastAPI、SQLAlchemy等依赖兼容性
- [ ] **共享依赖识别**：识别可以共享的依赖包
- [ ] **版本冲突解决**：解决潜在的依赖版本冲突

### 2.2 迁移过程检查

#### 第一阶段：项目结构创建
- [ ] **根目录创建**：创建新的Monorepo根目录
  ```bash
  mkdir sql-learn-monorepo
  cd sql-learn-monorepo
  ```
- [ ] **目录结构创建**：按照架构文档创建完整目录结构
  ```bash
  mkdir -p apps/{frontend,backend}
  mkdir -p packages/{shared-types,shared-utils,ui-components}
  mkdir -p {scripts,docs,tests,docker,logs}
  ```
- [ ] **工作空间配置**：创建pnpm-workspace.yaml
- [ ] **根package.json配置**：设置根目录依赖管理
- [ ] **TypeScript配置**：设置项目引用和路径映射

#### 第二阶段：共享包迁移
- [ ] **shared-types包创建**：
  - [ ] 提取前后端共同的类型定义
  - [ ] 创建API接口类型
  - [ ] 设置类型导出结构
  - [ ] 配置TypeScript编译
- [ ] **shared-utils包创建**：
  - [ ] 提取通用工具函数
  - [ ] 创建常量定义
  - [ ] 设置验证工具
  - [ ] 配置单元测试
- [ ] **ui-components包创建**：
  - [ ] 提取可复用UI组件
  - [ ] 设置组件样式系统
  - [ ] 创建组件文档
  - [ ] 配置Storybook（可选）

#### 第三阶段：应用迁移
- [ ] **前端应用迁移**：
  - [ ] 代码文件迁移到apps/frontend
  - [ ] 更新导入路径使用共享包
  - [ ] 配置Vite构建
  - [ ] 更新环境变量配置
  - [ ] 迁移测试文件
- [ ] **后端应用迁移**：
  - [ ] 代码文件迁移到apps/backend
  - [ ] 更新Python路径配置
  - [ ] 迁移数据库迁移文件
  - [ ] 更新依赖配置
  - [ ] 迁移测试文件

#### 第四阶段：配置和脚本
- [ ] **环境配置统一**：
  - [ ] 创建.env.example模板
  - [ ] 配置开发/生产环境变量
  - [ ] 设置数据库连接配置
- [ ] **构建脚本配置**：
  - [ ] 设置并行构建脚本
  - [ ] 配置开发服务器启动
  - [ ] 设置测试运行脚本
- [ ] **Docker配置迁移**：
  - [ ] 更新Dockerfile适配Monorepo
  - [ ] 配置docker-compose.yml
  - [ ] 设置多阶段构建优化

### 2.3 迁移后验证检查

#### 功能验证
- [ ] **前端功能测试**：
  - [ ] 页面正常加载和渲染
  - [ ] 用户认证流程正常
  - [ ] API调用正常工作
  - [ ] 路由导航正常
  - [ ] 状态管理正常
- [ ] **后端功能测试**：
  - [ ] API端点正常响应
  - [ ] 数据库连接正常
  - [ ] 认证授权正常
  - [ ] 数据CRUD操作正常
  - [ ] 错误处理正常
- [ ] **集成测试**：
  - [ ] 前后端数据交互正常
  - [ ] 文件上传下载正常
  - [ ] 实时功能正常（如有）

#### 性能验证
- [ ] **构建性能检查**：
  - [ ] 共享包构建时间 < 30秒
  - [ ] 前端构建时间 < 60秒
  - [ ] 总构建时间 < 120秒
- [ ] **运行时性能检查**：
  - [ ] 前端首屏加载 < 2秒
  - [ ] API响应时间 < 200ms
  - [ ] 热重载时间 < 2秒
- [ ] **资源使用检查**：
  - [ ] 内存使用在合理范围
  - [ ] CPU使用率正常
  - [ ] 网络请求优化

#### 开发体验验证
- [ ] **开发环境启动**：
  - [ ] `pnpm install` 正常执行
  - [ ] `pnpm dev` 正常启动前后端
  - [ ] 热重载功能正常
  - [ ] 类型检查正常
- [ ] **代码质量检查**：
  - [ ] ESLint检查通过
  - [ ] Prettier格式化正常
  - [ ] TypeScript编译无错误
  - [ ] 所有测试通过

#### 部署验证
- [ ] **Docker构建测试**：
  - [ ] 前端Docker镜像构建成功
  - [ ] 后端Docker镜像构建成功
  - [ ] Docker Compose启动正常
- [ ] **生产环境模拟**：
  - [ ] 生产构建成功
  - [ ] 环境变量配置正确
  - [ ] 数据库迁移正常
  - [ ] 服务健康检查通过

## 3. 详细迁移步骤

### 3.1 第一阶段：环境准备（预计1-2小时）

#### 步骤1：创建新的Monorepo结构

```bash
# 1. 创建新的项目目录
mkdir sql-learn-monorepo
cd sql-learn-monorepo

# 2. 初始化Git仓库
git init
git branch -M main

# 3. 创建目录结构
mkdir -p apps/{frontend,backend}
mkdir -p packages/{shared-types,shared-utils,ui-components}
mkdir -p scripts/{database,deployment,development,build}
mkdir -p docs/{api,development,deployment,architecture}
mkdir -p tests/{e2e,integration,fixtures}
mkdir -p docker
mkdir -p .github/workflows
mkdir logs

# 4. 创建工作空间配置
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
EOF
```

#### 步骤2：配置根目录package.json

```bash
cat > package.json << 'EOF'
{
  "name": "sql-learn-monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "concurrently \"pnpm --filter @sql-learn/frontend dev\" \"pnpm --filter @sql-learn/backend dev\"",
    "build": "pnpm --filter @sql-learn/shared-types build && pnpm --filter @sql-learn/shared-utils build && pnpm --filter @sql-learn/ui-components build && pnpm --filter @sql-learn/frontend build",
    "test": "pnpm --recursive test",
    "lint": "pnpm --recursive lint",
    "type-check": "pnpm --recursive type-check",
    "clean": "pnpm --recursive clean"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "concurrently": "^8.2.0",
    "eslint": "^8.45.0",
    "prettier": "^3.0.0",
    "typescript": "^5.1.0"
  }
}
EOF
```

#### 步骤3：配置TypeScript项目引用

```bash
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@sql-learn/shared-types": ["./packages/shared-types/src"],
      "@sql-learn/shared-utils": ["./packages/shared-utils/src"],
      "@sql-learn/ui-components": ["./packages/ui-components/src"]
    }
  },
  "references": [
    { "path": "./packages/shared-types" },
    { "path": "./packages/shared-utils" },
    { "path": "./packages/ui-components" },
    { "path": "./apps/frontend" }
  ]
}
EOF
```

### 3.2 第二阶段：共享包创建（预计2-3小时）

#### 步骤1：创建shared-types包

```bash
# 1. 创建shared-types目录结构
mkdir -p packages/shared-types/src/{api,models,common}

# 2. 创建package.json
cat > packages/shared-types/package.json << 'EOF'
{
  "name": "@sql-learn/shared-types",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "typescript": "^5.1.0"
  }
}
EOF

# 3. 创建TypeScript配置
cat > packages/shared-types/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules"]
}
EOF

# 4. 创建基础类型定义
cat > packages/shared-types/src/index.ts << 'EOF'
export * from './api';
export * from './models';
export * from './common';
EOF
```

#### 步骤2：迁移类型定义

```typescript
// packages/shared-types/src/api/auth.ts
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}
```

### 3.3 第三阶段：应用迁移（预计3-4小时）

#### 步骤1：前端应用迁移

```bash
# 1. 复制前端代码到新位置
cp -r /path/to/old-frontend/* apps/frontend/

# 2. 更新package.json添加共享包依赖
cat > apps/frontend/package.json << 'EOF'
{
  "name": "@sql-learn/frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix",
    "type-check": "vue-tsc --noEmit"
  },
  "dependencies": {
    "vue": "^3.3.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "axios": "^1.4.0",
    "@sql-learn/shared-types": "workspace:*",
    "@sql-learn/shared-utils": "workspace:*",
    "@sql-learn/ui-components": "workspace:*"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.2.0",
    "typescript": "^5.1.0",
    "vite": "^4.4.0",
    "vue-tsc": "^1.8.0"
  }
}
EOF

# 3. 更新Vite配置支持路径映射
cat > apps/frontend/vite.config.ts << 'EOF'
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@sql-learn/shared-types': resolve(__dirname, '../../packages/shared-types/src'),
      '@sql-learn/shared-utils': resolve(__dirname, '../../packages/shared-utils/src'),
      '@sql-learn/ui-components': resolve(__dirname, '../../packages/ui-components/src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
});
EOF
```

#### 步骤2：后端应用迁移

```bash
# 1. 复制后端代码到新位置
cp -r /path/to/old-backend/* apps/backend/

# 2. 更新Python路径配置
cat > apps/backend/main.py << 'EOF'
import sys
from pathlib import Path

# 添加应用根目录到Python路径
app_root = Path(__file__).parent
sys.path.insert(0, str(app_root))

from app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
EOF
```

### 3.4 第四阶段：测试和验证（预计1-2小时）

#### 步骤1：安装依赖和构建

```bash
# 1. 安装所有依赖
pnpm install

# 2. 构建共享包
pnpm --filter @sql-learn/shared-types build
pnpm --filter @sql-learn/shared-utils build
pnpm --filter @sql-learn/ui-components build

# 3. 类型检查
pnpm type-check

# 4. 代码检查
pnpm lint
```

#### 步骤2：启动开发环境

```bash
# 1. 启动开发服务器
pnpm dev

# 2. 验证前端访问
curl http://localhost:3000

# 3. 验证后端API
curl http://localhost:8000/docs
```

## 4. 回滚方案

### 4.1 快速回滚步骤

如果迁移过程中遇到无法解决的问题，可以按以下步骤快速回滚：

```bash
# 1. 停止新环境服务
pkill -f "pnpm dev"

# 2. 恢复原有项目
cp -r /backup/frontend-$(date +%Y%m%d) /path/to/frontend
cp -r /backup/backend-$(date +%Y%m%d) /path/to/backend

# 3. 恢复数据库（如有必要）
psql sql_learning < backup/database-$(date +%Y%m%d).sql

# 4. 重启原有服务
cd /path/to/frontend && npm start &
cd /path/to/backend && python main.py &
```

### 4.2 回滚决策标准

在以下情况下建议执行回滚：
- 迁移过程超过预期时间50%以上
- 核心功能无法正常工作且短时间内无法修复
- 性能下降超过20%且无法优化
- 团队成员无法适应新的开发流程

### 4.3 部分回滚策略

如果只有部分功能有问题，可以考虑部分回滚：
- 保留已成功迁移的共享包
- 回滚有问题的应用到原有结构
- 逐步修复问题后再次迁移

## 5. 迁移后优化建议

### 5.1 性能优化

```bash
# 1. 启用构建缓存
echo 'store-dir=~/.pnpm-store' >> .npmrc
echo 'cache-dir=~/.pnpm-cache' >> .npmrc

# 2. 配置并行构建
echo 'PNPM_PARALLEL=4' >> .env

# 3. 启用增量构建
echo '"build": "tsc --build"' # 在各包的package.json中
```

### 5.2 开发体验优化

```bash
# 1. 配置开发工具
cat > .vscode/settings.json << 'EOF'
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "eslint.workingDirectories": ["apps/frontend", "packages/*"]
}
EOF

# 2. 设置Git hooks
npx husky install
npx husky add .husky/pre-commit "pnpm lint-staged"
```

### 5.3 监控和维护

- 设置构建时间监控
- 配置依赖更新自动化
- 建立代码质量指标跟踪
- 定期进行性能评估

## 6. 常见问题和解决方案

### 6.1 依赖问题

**问题**：依赖版本冲突
```bash
# 解决方案：使用pnpm的覆盖功能
echo '{
  "pnpm": {
    "overrides": {
      "package-name": "^1.0.0"
    }
  }
}' >> package.json
```

**问题**：共享包导入失败
```bash
# 解决方案：检查路径映射配置
pnpm --filter @sql-learn/shared-types build
# 确保tsconfig.json中的paths配置正确
```

### 6.2 构建问题

**问题**：构建时间过长
```bash
# 解决方案：启用并行构建和缓存
pnpm config set store-dir ~/.pnpm-store
pnpm config set cache-dir ~/.pnpm-cache
```

**问题**：类型检查失败
```bash
# 解决方案：检查项目引用配置
tsc --build --dry --verbose
```

### 6.3 运行时问题

**问题**：热重载不工作
```bash
# 解决方案：检查Vite配置
# 确保vite.config.ts中的alias配置正确
```

**问题**：API调用失败
```bash
# 解决方案：检查代理配置
# 确保vite.config.ts中的proxy配置正确
```

## 7. 迁移成功标准

### 7.1 技术指标

- ✅ 所有功能正常工作
- ✅ 构建时间减少40%以上
- ✅ 开发环境启动时间减少60%以上
- ✅ 代码复用率提升到60%以上
- ✅ 类型安全覆盖率达到100%

### 7.2 团队指标

- ✅ 团队成员能够熟练使用新的开发流程
- ✅ 代码审查效率提升30%以上
- ✅ 新功能开发速度提升20%以上
- ✅ Bug修复时间减少30%以上

### 7.3 维护指标

- ✅ 依赖管理复杂度降低
- ✅ 部署流程简化
- ✅ 文档维护工作量减少
- ✅ 新人上手时间缩短50%以上

通过遵循这个详细的迁移指南和检查清单，可以确保SQL学习平台项目成功迁移到Monorepo架构，并获得预期的收益。