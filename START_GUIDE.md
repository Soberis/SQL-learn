# SQL学习平台 - 启动指南

## 项目概述

SQL学习平台是一个基于Vue 3 + FastAPI的全栈Web应用，提供交互式SQL学习体验。项目采用Monorepo架构，统一管理前端和后端代码。

## 环境要求

### 必需软件
- **Node.js**: v20.16.0 或更高版本
- **pnpm**: v10.13.1 或更高版本
- **Python**: v3.12.4 或更高版本
- **PostgreSQL**: v17.5 或更高版本

### 推荐开发工具
- **IDE**: VS Code 或 WebStorm
- **数据库管理**: pgAdmin 或 DBeaver
- **API测试**: Postman 或 Insomnia

## 快速启动

### 1. 克隆项目
```bash
git clone <repository-url>
cd sql-learn
```

### 2. 一键安装依赖
```bash
pnpm run setup
```

### 3. 配置数据库

#### 创建PostgreSQL数据库
```sql
CREATE DATABASE sqllearn_db;
CREATE USER postgres WITH PASSWORD 'root';
GRANT ALL PRIVILEGES ON DATABASE sqllearn_db TO postgres;
```

#### 环境变量配置（可选）
创建 `apps/backend/.env` 文件：
```env
DATABASE_URL=postgresql://postgres:root@localhost:5432/sqllearn_db
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 4. 启动开发服务
```bash
pnpm run dev
```

启动成功后：
- 前端服务：http://localhost:3000
- 后端API：http://localhost:8000
- API文档：http://localhost:8000/docs

## 详细配置说明

### 前端配置

**技术栈**：
- Vue 3 + TypeScript
- Vite 构建工具
- Pinia 状态管理
- Vue Router 路由
- Element Plus UI组件
- ECharts 图表库
- Monaco Editor 代码编辑器

**端口配置**：
- 开发服务器：3000
- 热重载：自动启用
- 代理配置：自动转发API请求到后端

### 后端配置

**技术栈**：
- FastAPI + Python
- SQLAlchemy ORM
- PostgreSQL 数据库
- JWT 认证
- Uvicorn ASGI服务器

**端口配置**：
- API服务器：8000
- 自动重载：开发模式启用
- CORS：已配置前端域名

### 数据库初始化

**自动初始化**：
应用启动时会自动创建所需的数据表：
- users（用户表）
- exercises（练习题表）
- progress（用户进度表）
- user_exercise_records（答题记录表）
- sql_executions（SQL执行记录表）

**创建测试用户**：
```bash
cd apps/backend
python create_test_user.py
```

默认测试账号：
- 用户名：testuser
- 密码：testpass123
- 邮箱：test@example.com

## 可用脚本命令

### 根目录命令
```bash
# 一键启动前后端服务
pnpm run dev

# 单独启动前端
pnpm run dev:frontend

# 单独启动后端
pnpm run dev:backend

# 安装所有依赖
pnpm run setup

# 环境检查
pnpm run check:env

# 构建项目
pnpm run build

# 运行测试
pnpm run test
```

### 前端专用命令
```bash
cd apps/frontend

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview

# 代码检查
pnpm lint

# 代码格式化
pnpm format
```

### 后端专用命令
```bash
cd apps/backend

# 启动开发服务器
pnpm dev
# 或者
python -m uvicorn app.main:app --reload

# 安装Python依赖
pip install -r requirements.txt

# 数据库测试
python test_db_connection.py

# 创建测试用户
python create_test_user.py

# 检查数据
python check_data.py
```

## 开发工作流

### 1. 日常开发
1. 启动开发环境：`pnpm run dev`
2. 前端开发：修改 `apps/frontend/src/` 下的文件
3. 后端开发：修改 `apps/backend/app/` 下的文件
4. 实时预览：浏览器自动刷新，API自动重载

### 2. 数据库操作
1. 模型修改：编辑 `apps/backend/app/models.py`
2. 生成迁移：使用Alembic（如需要）
3. 应用迁移：重启服务自动创建表

### 3. API开发
1. 路由定义：`apps/backend/app/api/v1/`
2. 数据模型：`apps/backend/app/models.py`
3. 数据库操作：`apps/backend/app/database.py`
4. API文档：http://localhost:8000/docs

## 常见问题解决

### 1. 端口占用问题
```bash
# 查看端口占用
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# 终止进程
taskkill /PID <进程ID> /F
```

### 2. 数据库连接失败
- 检查PostgreSQL服务是否启动
- 确认数据库名称、用户名、密码正确
- 检查防火墙设置
- 验证DATABASE_URL环境变量

### 3. 依赖安装失败
```bash
# 清理缓存
pnpm store prune
npm cache clean --force

# 重新安装
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### 4. Python虚拟环境问题
```bash
# 创建虚拟环境
cd apps/backend
python -m venv venv

# 激活虚拟环境
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

### 5. 登录问题
- 确认测试用户已创建
- 检查网络请求是否正常
- 查看浏览器控制台错误信息
- 验证JWT token是否正确生成

### 6. 热重载不工作
- 重启开发服务器
- 检查文件监听权限
- 确认文件路径正确

## 项目结构

```
sql-learn/
├── apps/
│   ├── frontend/          # Vue 3前端应用
│   │   ├── src/
│   │   │   ├── components/    # 可复用组件
│   │   │   ├── pages/         # 页面组件
│   │   │   ├── stores/        # Pinia状态管理
│   │   │   ├── utils/         # 工具函数
│   │   │   └── api/           # API接口
│   │   └── package.json
│   └── backend/           # FastAPI后端应用
│       ├── app/
│       │   ├── api/v1/        # API路由
│       │   ├── core/          # 核心配置
│       │   ├── models.py      # 数据模型
│       │   ├── database.py    # 数据库配置
│       │   └── main.py        # 应用入口
│       ├── requirements.txt
│       └── package.json
├── package.json           # 根目录配置
├── pnpm-workspace.yaml   # pnpm工作区配置
└── START_GUIDE.md         # 本文档
```

## 技术支持

如遇到问题，请按以下步骤排查：

1. **检查环境**：`pnpm run check:env`
2. **查看日志**：开发服务器控制台输出
3. **测试连接**：`python apps/backend/test_db_connection.py`
4. **重启服务**：停止并重新运行 `pnpm run dev`

---

**祝您开发愉快！** 🚀