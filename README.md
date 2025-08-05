# SQL学习平台

一个现代化的SQL学习平台，提供交互式SQL练习、学习进度跟踪和实时反馈功能。

## 🚀 项目简介

SQL学习平台是一个全栈Web应用，旨在帮助用户通过实践学习SQL语言。平台提供：
- 分级的SQL练习题库
- 实时的SQL执行和结果反馈
- 个人学习进度跟踪
- 用户认证和管理系统
- 响应式Web界面

## 🏗️ 技术架构

### 前端技术栈
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **状态管理**: Zustand
- **样式**: Tailwind CSS
- **UI组件**: Headless UI + Radix UI
- **路由**: React Router v6
- **HTTP客户端**: Axios

### 后端技术栈
- **框架**: FastAPI (Python)
- **数据库**: PostgreSQL (开发环境支持SQLite)
- **ORM**: SQLAlchemy 2.0
- **认证**: JWT Token
- **迁移工具**: Alembic
- **文档**: 自动生成OpenAPI文档

### 基础设施
- **容器化**: Docker + Docker Compose
- **部署**: Vercel (前端) + Render/ Railway (后端)
- **包管理**: pnpm (monorepo)
- **CI/CD**: GitHub Actions

## 📁 项目结构

```
sql-learn/
├── apps/
│   ├── frontend/          # React前端应用
│   └── backend/           # FastAPI后端服务
├── packages/              # 共享包
│   ├── shared-types/      # TypeScript类型定义
│   └── shared-utils/      # 共享工具函数
├── docs/                  # 项目文档
├── scripts/               # 开发脚本
├── docker/               # Docker配置
└── .github/              # GitHub工作流
```

## 🚦 快速开始

### 前置要求
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+ (可选，开发可用SQLite)
- pnpm (包管理器)

### 安装依赖

```bash
# 安装pnpm (如果未安装)
npm install -g pnpm

# 安装所有依赖
pnpm install

# 或者分别安装前后端依赖
cd apps/frontend && pnpm install
cd apps/backend && pip install -r requirements.txt
```

### 环境配置

1. **后端环境变量** (apps/backend/.env):
```env
# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/sqllearn_db

# 应用配置
SECRET_KEY=your-secret-key-here
DEBUG=true
ALLOWED_ORIGINS=http://localhost:5173
```

2. **前端环境变量** (apps/frontend/.env):
```env
VITE_API_URL=http://localhost:8000
```

### 启动开发服务器

```bash
# 使用Docker Compose (推荐)
docker-compose up -d

# 或者手动启动
# 后端
cd apps/backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 前端 (新终端)
cd apps/frontend
pnpm dev
```

访问地址：
- 前端: http://localhost:5173
- 后端API: http://localhost:8000
- API文档: http://localhost:8000/docs

## 🧪 测试

```bash
# 运行所有测试
pnpm test

# 仅运行后端测试
cd apps/backend && pytest

# 仅运行前端测试
cd apps/frontend && pnpm test
```

## 🚀 部署

### 前端部署 (Vercel)
```bash
cd apps/frontend
vercel --prod
```

### 后端部署
- **Render**: 自动部署GitHub仓库
- **Railway**: 一键部署
- **Docker**: 自建容器部署

详细部署指南请参考 [docs/deployment.md](docs/deployment.md)

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

- 项目维护者: [Your Name]
- 邮箱: [your.email@example.com]
- 项目链接: [https://github.com/yourusername/sql-learn](https://github.com/yourusername/sql-learn)

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户。

---

<div align="center">
  <p>⭐ 如果这个项目对你有帮助，请给个Star！</p>
</div>