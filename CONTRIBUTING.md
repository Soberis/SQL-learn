# 贡献指南

感谢您有兴趣为SQL学习平台做出贡献！本指南将帮助您了解如何参与项目开发。

## 🚀 开始之前

### 开发环境要求
- **Node.js**: 18.0.0 或更高版本
- **Python**: 3.11 或更高版本
- **PostgreSQL**: 15.0 或更高版本（开发环境可用SQLite）
- **pnpm**: 8.0 或更高版本
- **Git**: 最新版本

### 快速设置
```bash
# 1. Fork项目到您的GitHub账户
# 2. 克隆项目
git clone https://github.com/yourusername/sql-learn.git
cd sql-learn

# 3. 安装依赖
make install

# 4. 设置开发环境
make setup-dev

# 5. 启动开发服务器
make dev
```

## 🏗️ 开发流程

### 1. 创建Issue
在开始工作之前，请先：
- 检查现有Issue，避免重复工作
- 创建新的Issue描述您要解决的问题
- 等待维护者确认和分配

### 2. 创建功能分支
```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/issue-description
```

### 3. 开发规范

#### 分支命名规范
- `feature/功能描述` - 新功能开发
- `fix/问题描述` - 问题修复
- `docs/文档描述` - 文档更新
- `refactor/重构描述` - 代码重构
- `test/测试描述` - 测试相关

#### 提交信息规范
使用[Conventional Commits](https://www.conventionalcommits.org/zh-hans/v1.0.0/):
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

类型说明：
- `feat`: 新功能
- `fix`: 问题修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

示例：
```
feat(auth): 添加用户注册功能

- 实现用户注册API端点
- 添加输入验证
- 添加单元测试

Closes #123
```

### 4. 代码规范

#### 前端规范 (TypeScript/React)
- 使用TypeScript严格模式
- 遵循ESLint配置
- 使用函数组件和Hooks
- 组件命名使用PascalCase
- 文件命名使用camelCase
- 使用Tailwind CSS进行样式设计

#### 后端规范 (Python)
- 遵循PEP 8规范
- 使用类型注解
- 函数和变量命名使用snake_case
- 类名使用PascalCase
- 添加docstring文档

#### 数据库规范
- 使用Alembic进行迁移
- 表名使用snake_case
- 添加适当的索引
- 使用外键约束

### 5. 测试要求

#### 前端测试
```bash
# 运行测试
cd apps/frontend && pnpm test

# 运行测试并查看覆盖率
cd apps/frontend && pnpm test --coverage

# 运行特定测试
cd apps/frontend && pnpm test --testNamePattern="Auth"
```

#### 后端测试
```bash
# 运行测试
cd apps/backend && pytest

# 运行测试并查看覆盖率
cd apps/backend && pytest --cov=app --cov-report=html

# 运行特定测试
cd apps/backend && pytest tests/test_auth.py -v
```

### 6. 代码审查

#### 提交Pull Request前检查清单
- [ ] 代码通过所有测试
- [ ] 代码符合项目规范
- [ ] 添加了适当的测试
- [ ] 更新了相关文档
- [ ] 解决了所有冲突
- [ ] 添加了CHANGELOG条目

#### PR模板
```markdown
## 描述
简要描述这个PR的变更内容

## 类型
- [ ] Bug修复
- [ ] 新功能
- [ ] 文档更新
- [ ] 代码重构
- [ ] 性能优化

## 测试
- [ ] 添加了单元测试
- [ ] 添加了集成测试
- [ ] 手动测试通过

## 截图（如适用）
添加相关截图或GIF

## 相关问题
Fixes #(issue编号)
```

## 🧪 开发工具

### 常用命令
```bash
# 安装依赖
make install

# 启动开发环境
make dev

# 运行测试
make test

# 代码格式化
make format

# 代码检查
make lint

# 数据库重置
make db-reset

# 清理缓存
make clean
```

### 调试技巧
- 使用VS Code调试配置
- 查看Docker日志: `make docker-logs`
- 检查服务健康状态: `make check-health`

## 📚 文档贡献

### 文档类型
- API文档（自动生成）
- 用户指南
- 开发者文档
- 部署指南
- 故障排除

### 文档规范
- 使用Markdown格式
- 添加适当的代码示例
- 保持语言简洁明了
- 定期更新过时的文档

## 🐛 报告问题

### 问题报告模板
使用GitHub Issue模板，包含：
- 问题描述
- 复现步骤
- 期望行为
- 实际行为
- 环境信息
- 截图/日志

## 🎯 路线图

查看 [ROADMAP.md](ROADMAP.md) 了解项目发展方向和优先级。

## 💬 沟通

### 讨论渠道
- GitHub Issues: 功能请求和问题报告
- GitHub Discussions: 一般讨论和问答
- Pull Request评论: 代码审查

### 行为准则
- 保持友善和尊重
- 建设性的反馈
- 帮助新手开发者
- 遵守开源社区规范

## 📄 许可证

通过贡献代码，您同意您的贡献将在MIT许可证下发布。

---

## 🙏 致谢

感谢所有为SQL学习平台做出贡献的开发者！您的贡献让这个项目变得更好。

<div align="center">
  <p>⭐ 如果这个项目对您有帮助，请给个Star！</p>
</div>