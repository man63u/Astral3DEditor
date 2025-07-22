<!-- =============================================================
 README.md | 中文版说明文档
============================================================= -->

# Astral3DEditor + Rocksi 🚀（中文版）

> 本文档仅保留中文内容，涵盖快速入门、环境配置、Rocksi 集成及开发者手册。

---

## 📑 目录

1. [快速入门指南](#快速入门指南)
2. [开发者手册](#开发者手册)

   * [Rocksi 集成流程](#rocksi-集成流程)
   * [发布流程](#发布流程)
3. [常见问题](#常见问题)

---

## 快速入门指南

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

### 2 · 环境变量示例 `.env`

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

# 方式一：Bee 迁移（推荐，自动版本控制）
bee migrate -driver=mysql \
  -conn="$DB_USER:$DB_PASS@tcp($DB_HOST:$DB_PORT)/$DB_NAME?charset=utf8mb4"

# 方式二：直接导入预置 SQL（Astral3DEditorGoBack 已提供）
mysql -u $DB_USER -p$DB_PASS $DB_NAME < Astral3DEditorGoBack/database/schema.sql
```

> **说明**
>
> * `database/migrations/`：存放 Bee 自动生成的迁移文件，每次结构更新请执行 `bee generate migration add_xxx`
> * `database/schema.sql`：完整建表脚本，方便在无 Bee 环境下一次性导入。

### 3 · 启动命令

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

---

## 开发者手册

### 分支策略

| 分支             | 说明          |
| -------------- | ----------- |
| `main`         | 生产环境，随时可部署  |
| `dev`          | 日常开发 / 预发环境 |
| `feature/<功能>` | 新功能开发       |
| `bugfix/<问题>`  | 紧急修复        |

### 提交规范

遵循 **Conventional Commit**：

```
feat: 新增 Rocksi 转换功能
fix: 修复文件上传失败
chore: bump three.js 版本
```

### 目录结构概览

```
Astral3DEditor/            # 前端
  ├── src/components/
  ├── src/pages/
Astral3DEditorGoBack/      # 后端
  ├── controllers/
  ├── routers/
  ├── database/migrations/
```

### 新增 API 流程

1. 在 `controllers` 目录创建控制器文件。
2. 在 `routers/router.go` 注册路由。
3. `go test` 编写单元测试。
4. 更新 `docs/api/openapi.yaml`。

---

### Rocksi 集成流程

**目标：** 在编辑器内接入批量 3D 模型转换（Rocksi CLI）。

#### 1. 后端

```go
// controllers/rocksi.go
func (c *RocksiController) Post() {
    _, h, _ := c.GetFile("file")
    tmp := filepath.Join(os.TempDir(), h.Filename)
    c.SaveToFile("file", tmp)

    cmd := exec.Command(os.Getenv("ROCKSI_BIN"), "-i", tmp, "-o", tmp+".out", "--draco")
    if out, err := cmd.CombinedOutput(); err != nil {
        c.CustomAbort(500, string(out))
    }
    c.Data["json"] = map[string]string{"url": "/static/" + h.Filename + ".out"}
    c.ServeJSON()
}
```

路由注册：

```go
ns.Router("/rocksi/convert", &controllers.RocksiController{}, "post:Post")
```

（可选）解析 Rocksi 输出，通过 WebSocket 推送进度。

#### 2. 前端

```vue
<!-- Toolbar.vue -->
<button @click="uploadAndConvert" title="Rocksi 转换">
  <LucideMountain />
</button>
```

```ts
// utils/rocksi.ts
export async function convert(file: File) {
  const fd = new FormData(); fd.append('file', file);
  const { data } = await axios.post('/rocksi/convert', fd);
  return data.url;
}
```

进度条可用 NProgress 实现。

#### 3. 数据库（可选）

在 `files` 表插入转换结果元数据。

#### 4. 端到端测试

上传示例 `Salmon.gltf`，期望返回 `200` 与有效 URL。

#### 5. 文档

更新 OpenAPI `/rocksi/convert`，在 README 添加演示 GIF。

---

### 发布流程

PR 合并到 `dev` → 验证无误后 PR `dev → main` → GitHub Action 打包镜像推送。

---

## 常见问题

| 问题                    | 解决方案                                    |
| --------------------- | --------------------------------------- |
| `spawn rocksi ENOENT` | 检查 `ROCKSI_BIN` 路径或未安装 Rocksi CLI       |
| `端口被占用`               | `lsof -i:端口` 查找并终止冲突进程                  |
| MySQL 报编码错误           | 确认数据库与表均使用 `utf8mb4`                    |
| WebSocket 连接失败        | 代理(Nginx)需保留 `Upgrade` 与 `Connection` 头 |

---

*EOF*
