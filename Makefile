.PHONY: help install dev build test clean docker-up docker-down lint format

# 默认目标
help: ## 显示可用的make命令
	@echo "SQL学习平台 - 可用的make命令:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# 安装依赖
install: ## 安装所有依赖
	@echo "安装前端依赖..."
	@cd apps/frontend && pnpm install
	@echo "安装后端依赖..."
	@cd apps/backend && pip install -r requirements.txt
	@echo "安装共享包依赖..."
	@cd packages/shared-types && pnpm install
	@cd packages/shared-utils && pnpm install

# 开发环境
dev: ## 启动开发环境
	@echo "启动开发环境..."
	@docker-compose up -d postgres redis
	@echo "等待数据库启动..."
	@sleep 5
	@echo "启动后端..."
	@cd apps/backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
	@echo "启动前端..."
	@cd apps/frontend && pnpm dev

# Docker相关
docker-up: ## 使用Docker Compose启动所有服务
	@docker-compose up -d

docker-down: ## 停止所有Docker服务
	@docker-compose down

docker-logs: ## 查看Docker日志
	@docker-compose logs -f

docker-build: ## 构建Docker镜像
	@docker-compose build

# 数据库相关
db-init: ## 初始化数据库
	@cd apps/backend && python create_database.py

db-migrate: ## 运行数据库迁移
	@cd apps/backend && alembic upgrade head

db-reset: ## 重置数据库
	@cd apps/backend && python create_database.py --reset

db-seed: ## 插入示例数据
	@cd apps/backend && python insert_sample_data.py

# 测试
test: ## 运行所有测试
	@echo "运行后端测试..."
	@cd apps/backend && pytest -v
	@echo "运行前端测试..."
	@cd apps/frontend && pnpm test

test-backend: ## 仅运行后端测试
	@cd apps/backend && pytest -v

test-frontend: ## 仅运行前端测试
	@cd apps/frontend && pnpm test

# 代码质量
lint: ## 运行代码检查
	@echo "检查前端代码..."
	@cd apps/frontend && pnpm lint
	@echo "检查后端代码..."
	@cd apps/backend && flake8 .

format: ## 格式化代码
	@echo "格式化前端代码..."
	@cd apps/frontend && pnpm format
	@echo "格式化后端代码..."
	@cd apps/backend && black .

# 构建
build: ## 构建生产版本
	@echo "构建前端..."
	@cd apps/frontend && pnpm build
	@echo "构建后端..."
	@cd apps/backend && echo "后端无需构建"

# 清理
clean: ## 清理构建产物和缓存
	@echo "清理前端..."
	@cd apps/frontend && rm -rf dist node_modules/.cache
	@echo "清理后端..."
	@cd apps/backend && find . -type d -name "__pycache__" -exec rm -rf {} +
	@echo "清理Docker..."
	@docker system prune -f

# 部署
deploy-frontend: ## 部署前端到Vercel
	@cd apps/frontend && vercel --prod

deploy-backend: ## 部署后端到Render
	@echo "请使用Render.com的GitHub集成进行部署"

# 开发工具
check-health: ## 检查服务健康状态
	@echo "检查后端健康状态..."
	@curl -f http://localhost:8000/health || echo "后端服务未启动"
	@echo "检查数据库连接..."
	@cd apps/backend && python test_db_connection.py

setup-dev: ## 设置开发环境
	@echo "设置开发环境..."
	@cp .env.example .env
	@$(MAKE) install
	@$(MAKE) db-init
	@$(MAKE) db-seed
	@echo "开发环境设置完成！"

# 快捷命令
start: dev ## 启动开发环境（别名）

stop: docker-down ## 停止所有服务（别名）