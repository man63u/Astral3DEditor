<!-- =============================================================
 README_BILANGUAGE.md  |  双语说明文档 (English & 中文)
============================================================= -->

# Astral3DEditor + Rocksi 🚀

<div align="right">
  <b>Language:</b>
  <a href="#quick-start-guide-en">English</a> |
  <a href="#快速入门指南-zh">中文</a>
</div>

> **English first, 中文在后**。English readers can stop after the English sections; Chinese readers can scroll to the “📖 中文快速指南” 标题。

---

## 📑 Table of Contents

1. [Quick‑Start Guide (EN)](#quick-start-guide-en)
2. [Developer Guide (EN)](#developer-guide-en)
3. [📖 中文快速指南](#快速入门指南-zh)
4. [👩‍💻 中文开发者手册](#开发者手册-zh)

---

## Quick‑Start Guide (EN)

<details>
<summary>Click to expand</summary>

### 0 · Repository layout

| Path                    | Purpose                                        |
| ----------------------- | ---------------------------------------------- |
| `Astral3DEditor/`       | Vue 3 + Three.js front‑end (Vite)              |
| `Astral3DEditorGoBack/` | Go (Beego / Bee) JSON + WebSocket API back‑end |

### 1 · Prerequisites

| Stack      | Version | Notes                                       |
| ---------- | ------- | ------------------------------------------- |
| Node.js    | 18 LTS  | npm v10 bundled                             |
| Go         | 1.22.x  | Bee auto‑watch uses this                    |
| Bee CLI    | 2.3.0   | `go install github.com/beego/bee/v2@latest` |
| Rocksi CLI | ≥0.6.0  | 3‑D asset converter                         |
| **MySQL**  | 8.0.x   | Persistent store                            |
| Git        | any     | SSH clone recommended                       |

### 2 · Environment variables (.env)

```dotenv
# Front‑end
VITE_APP_API_BASE = http://localhost:8000
VITE_APP_WS_PORT  = 8001
# Back‑end
APP_PORT = 8000
WS_PORT  = 8001
# Database
DB_HOST = localhost
DB_PORT = 3306
DB_USER = astral
DB_PASS = astral_dev_pw
DB_NAME = astral_db   # avoid pure digits; if you insist use back‑ticks in SQL
# Misc
ROCKSI_BIN = /usr/local/bin/rocksi
BEE_APP_ENV = dev
```

### 2.5 · One‑time MySQL setup

```bash
mysql -u root -p <<SQL
CREATE DATABASE IF NOT EXISTS astral_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'astral'@'%' IDENTIFIED BY 'astral_dev_pw';
GRANT ALL PRIVILEGES ON astral_db.* TO 'astral'@'%';
FLUSH PRIVILEGES;
SQL
```

Run migrations:

```bash
bee migrate -driver=mysql -conn="$DB_USER:$DB_PASS@tcp($DB_HOST:$DB_PORT)/$DB_NAME?charset=utf8mb4"
```

### 3 · Dev scripts

Front‑end:

```bash
cd Astral3DEditor && npm i && npm run dev
```

Back‑end:

```bash
cd Astral3DEditorGoBack && bee run
```

### 4 · Docker

```bash
docker compose up --build
```

### 5 · Troubleshooting

| Symptom                                 | Fix                                    |
| --------------------------------------- | -------------------------------------- |
| `spawn rocksi ENOENT`                   | ROCKSI\_BIN wrong / not installed      |
| `refusing to merge unrelated histories` | `git pull --allow-unrelated-histories` |

</details>

---

## Developer Guide (EN)

<details>
<summary>Click to expand</summary>

### Branches

* `main` – production
* `dev` – staging
* `feature/*`, `bugfix/*`

### Commits

Conventional Commits (`feat:`, `fix:` …) – Release action auto‑tags.

### Folder overview

```
Astral3DEditor/
Astral3DEditorGoBack/
```

### Adding an API route

1. Controller file → register in router → write tests → document OpenAPI.

### Release flow

PR → dev → main → CI builds Docker & publishes.

</details>

---

## 📖 快速入门指南 (ZH)

<details>
<summary>点击展开中文版</summary>

### 0 · 目录结构

| 路径                      | 作用                                |
| ----------------------- | --------------------------------- |
| `Astral3DEditor/`       | Vue 3 + Three.js 前端（Vite）         |
| `Astral3DEditorGoBack/` | Go (Beego/Bee) 后端 API + WebSocket |

### 1 · 环境要求

| 栈          | 推荐版本   | 说明                                          |
| ---------- | ------ | ------------------------------------------- |
| Node.js    | 18 LTS | 自带 npm v10                                  |
| Go         | 1.22.x | Bee 热更新依赖                                   |
| Bee CLI    | 2.3.0  | `go install github.com/beego/bee/v2@latest` |
| Rocksi CLI | ≥0.6.0 | 3D 资源转换工具                                   |
| **MySQL**  | 8.0.x  | 持久化存储                                       |
| Git        | 任意     | 推荐 SSH 克隆                                   |

### 2 · 环境变量示例 (.env)

```dotenv
# 前端
VITE_APP_API_BASE = http://localhost:8000
VITE_APP_WS_PORT  = 8001
# 后端
APP_PORT = 8000
WS_PORT  = 8001
# 数据库
DB_HOST = localhost
DB_PORT = 3306
DB_USER = astral
DB_PASS = astral_dev_pw
DB_NAME = astral_db   # 建议字母开头；若用纯数字需在 SQL 中用反引号包围
# 其他
ROCKSI_BIN = /usr/local/bin/rocksi
BEE_APP_ENV = dev
```

### 2.5 · 初始化 MySQL

```bash
mysql -u root -p <<SQL
CREATE DATABASE IF NOT EXISTS astral_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'astral'@'%' IDENTIFIED BY 'astral_dev_pw';
GRANT ALL PRIVILEGES ON astral_db.* TO 'astral'@'%';
FLUSH PRIVILEGES;
SQL
```

执行迁移：

```bash
bee migrate -driver=mysql -conn="$DB_USER:$DB_PASS@tcp($DB_HOST:$DB_PORT)/$DB_NAME?charset=utf8mb4"
```

### 3 · 开发命令

```bash
# 前端
cd Astral3DEditor && npm i && npm run dev
# 后端
cd Astral3DEditorGoBack && bee run
```

### 4 · Docker 一键启动

```bash
docker compose up --build
```

### 5 · 常见问题

| 问题                    | 解决                          |
| --------------------- | --------------------------- |
| `spawn rocksi ENOENT` | ROCKSI\_BIN 配置错误或未安装 Rocksi |
| `端口被占用`               | 使用 `lsof -i:端口` 查进程并终止      |

</details>

---

## 👩‍💻 开发者手册 (ZH)

<details>
<summary>点击展开</summary>

### 分支策略

* `main`：生产环境
* `dev`：日常开发 / 预发
* `feature/<功能>`：新功能
* `bugfix/<问题>`：紧急修复

### 提交规范

遵循 Conventional Commit：`feat: xxx`、`fix: xxx`。

### 目录结构

```
Astral3DEditor/        # 前端
Astral3DEditorGoBack/  # 后端
```

### 新增 API 流程

1. 在 `controllers` 创建控制器
2. `routers/router.go` 注册路由
3. 写单元测试 `go test`
4. 更新 `docs/api/openapi.yaml`

### 发布流程

PR 合并到 `dev` → 验证无误后 PR `dev → main` → CI 打包镜像发布。

</details>

---

*EOF*
