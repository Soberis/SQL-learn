# 合并 GitHub 仓库到本地项目

本指南将帮助你把 `https://github.com/Soberis/SQL-learn/tree/main` 的内容合并到当前项目中。

## 方案一：直接克隆覆盖（推荐）

### 步骤 1: 备份当前项目
```bash
# 创建备份目录
cd e:\Project\SQL
mkdir sql-learn-backup

# 备份当前项目
cp -r sql-learn sql-learn-backup/
```

### 步骤 2: 克隆GitHub仓库
```bash
# 进入项目目录的父目录
cd e:\Project\SQL

# 克隆GitHub仓库
git clone https://github.com/Soberis/SQL-learn.git sql-learn-github

# 切换到克隆的仓库目录
cd sql-learn-github

# 查看远程分支
git branch -r

# 切换到main分支
git checkout main
```

### 步骤 3: 替换本地项目
```bash
# 返回父目录
cd e:\Project\SQL

# 删除原项目目录（确保已备份）
rm -rf sql-learn

# 重命名克隆的目录
mv sql-learn-github sql-learn
```

## 方案二：保留本地修改的合并方式

### 步骤 1: 初始化本地Git仓库
```bash
cd e:\Project\SQL\sql-learn

# 初始化Git仓库
git init

# 添加所有文件
git add .

# 提交当前状态
git commit -m "保存当前项目状态"
```

### 步骤 2: 添加远程仓库并合并
```bash
# 添加远程仓库
git remote add origin https://github.com/Soberis/SQL-learn.git

# 获取远程分支
git fetch origin

# 创建并切换到main分支
git checkout -b main

# 合并远程分支
git merge origin/main --allow-unrelated-histories
```

### 步骤 3: 处理合并冲突
如果遇到冲突，Git会提示哪些文件有冲突。你需要手动解决：

1. 打开冲突的文件
2. 查找冲突标记（`<<<<<<<`, `=======`, `>>>>>>>`）
3. 保留需要的代码
4. 删除冲突标记
5. 添加解决后的文件

```bash
# 解决冲突后，添加文件
git add .

# 完成合并
git commit -m "合并GitHub仓库内容"
```

## 方案三：选择性合并（高级）

### 步骤 1: 创建临时分支
```bash
# 进入项目目录
cd e:\Project\SQL\sql-learn

# 初始化Git仓库
git init

# 添加并提交当前状态
git add .
git commit -m "当前项目状态"

# 添加远程仓库
git remote add upstream https://github.com/Soberis/SQL-learn.git

# 获取远程内容
git fetch upstream

# 创建新分支用于合并
git checkout -b merge-github
```

### 步骤 2: 选择性合并特定文件
```bash
# 检出GitHub仓库的特定文件或目录
# 例如，只合并src目录
git checkout upstream/main -- src/

# 或者合并特定文件
git checkout upstream/main -- package.json

# 检查状态
git status

# 提交合并结果
git commit -m "选择性合并GitHub仓库的特定文件"
```

## 验证合并结果

### 检查项目结构
```bash
# 查看项目结构
tree -L 3

# 检查关键文件是否存在
ls -la src/
ls -la apps/
cat package.json
```

### 测试项目运行
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建项目
npm run build
```

## 常见问题解决

### 1. 权限问题
如果遇到权限错误：
```bash
# Windows用户可能需要使用管理员权限运行PowerShell
# 或者以管理员身份运行命令提示符
```

### 2. 文件冲突
如果文件太多冲突：
```bash
# 使用策略性合并
git merge -X theirs origin/main  # 优先使用远程版本
git merge -X ours origin/main    # 优先使用本地版本
```

### 3. 大文件问题
如果仓库包含大文件：
```bash
# 使用浅克隆
git clone --depth=1 https://github.com/Soberis/SQL-learn.git
```

## 建议

1. **先备份**：无论采用哪种方案，都建议先备份当前项目
2. **分步验证**：每完成一步都验证项目是否能正常运行
3. **使用版本控制**：合并完成后，及时提交更改到Git
4. **测试功能**：确保所有功能在合并后仍能正常工作

## 一键执行脚本

创建 `merge-github.ps1` 文件：

```powershell
# merge-github.ps1
Write-Host "开始合并GitHub仓库..."

# 备份当前项目
$backupDir = "e:\Project\SQL\sql-learn-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item "e:\Project\SQL\sql-learn" $backupDir -Recurse
Write-Host "已创建备份: $backupDir"

# 克隆GitHub仓库
Set-Location "e:\Project\SQL"
git clone https://github.com/Soberis/SQL-learn.git sql-learn-temp

# 替换项目
Remove-Item "sql-learn" -Recurse -Force
Rename-Item "sql-learn-temp" "sql-learn"

Write-Host "合并完成！请检查项目并运行 npm install"
```

运行脚本：
```powershell
.\merge-github.ps1
```