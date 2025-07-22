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
# Rocksi × Astral3DEditor  整合教程

> **目标**：在 *astral3d-editor-with-rocksi* 代码库里，新增「机器人编程」模块（基于 Rocksi），并保持原 Astral3DEditor 功能全 OK。
>
> 完成后：侧边栏出现 **机器人编程** 按钮 → 点击进入 Blockly × 三维机械臂页面。

---

## 环境要求

| 软件           | 版本       | 检查命令            |
| ------------ | -------- | --------------- |
| **Node.js**  | ≥ 18 LTS | `node -v`       |
| **pnpm**（推荐） | ≥ 8      | `pnpm -v`       |
| **Git**      | ≥ 2.30   | `git --version` |
| **IDE**      | VS Code  | —               |

---

## 1 克隆并跑通原仓库

```bash
# 1‑1 克隆项目
$ git clone https://github.com/catcatcat23/astral3d-editor-with-rocksi.git
$ cd astral3d-editor-with-rocksi

# 1‑2 安装依赖（前后端各有 package.json）
$ pnpm install

# 1‑3 运行前端
$ cd Astral3DEditor
$ pnpm dev
# 打开 http://localhost:5173  验证侧栏正常渲染
```

> *若需后端：*
>
> ```bash
> $ cd ../Astral3DEditorGoBack && bee run
> ```

---

## 2 创建整合分支

```bash
$ cd Astral3DEditor        # 确保位于前端目录
$ git checkout -b feat/rocksi-integration
```

---

## 3 拉取 Rocksi 资源

```bash
# 3‑1 临时克隆 Rocksi
$ cd ../..
$ git clone https://github.com/ndahn/Rocksi.git rocksi-temp

# 3‑2 复制静态资源
$ mkdir -p Astral3DEditor/public/rocksi
$ cp -r rocksi-temp/models rocksi-temp/assets \
      Astral3DEditor/public/rocksi/

# 3‑3 复制源码
$ mkdir -p Astral3DEditor/src/rocksi
$ cp rocksi-temp/js/*.js Astral3DEditor/src/rocksi/
```

---

## 4 统一 three.js 版本

```bash
# 4‑1 删除 Rocksi 自带 CDN 脚本（如存在）
$ rm Astral3DEditor/src/rocksi/three.min.js 2>/dev/null || true

# 4‑2 锁版本（示例用 r153，若 Astral 已固定其他版本请替换）
$ cd Astral3DEditor
$ pnpm add three@0.153.0
```

在 **所有拷入的 Rocksi JS** 顶部统一：

```js
import * as THREE from 'three';
```

---

## 5 模块化 Rocksi

> 将原本的全局 JS 改为可导入模块，并导出初始化函数。

### 5‑1 创建入口 `src/rocksi/init.ts`

```ts
import { createScene } from './core/scene';

export default function initRocksi(el: HTMLElement) {
  createScene(el);   // 其余逻辑可继续拆分
}
```

### 5‑2 示范改造 `main.js` → `core/scene.ts`

```ts
import * as THREE from 'three';
export function createScene(container: HTMLElement) {
  const scene = new THREE.Scene();
  // ... 复制原 main.js 内容，将 document.body → container
  return { scene };
}
```

> 其他文件（`robot_loader.js`, `physics.js`, `runtime.js`, `blockly/*`）按相同思路搬迁。

---

## 6 新增 Vue 页面 & 路由

### 6‑1 `src/views/RobotSim.vue`

```vue
<template><div ref="root" class="h-full w-full"/></template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import initRocksi from '@/rocksi/init';
const root = ref<HTMLDivElement>();
onMounted(() => initRocksi(root.value!));
</script>
```

### 6‑2 `src/router/index.ts`

```ts
import RobotSim from '@/views/RobotSim.vue';
routes.push({
  path: '/robot',
  name: 'RobotSim',
  component: RobotSim,
  meta: { title: '机器人编程' },
});
```

### 6‑3 侧边栏菜单（若通过数组生成）

```ts
menu.push({ icon: 'MdiRobot', name: '机器人编程', path: '/robot' });
```

---

## 7 启动验证（最小可运行）

```bash
$ pnpm dev
```

1. 浏览器侧栏出现 **机器人编程** 入口。
2. 点击后看到 Blockly + 机械臂渲染。
3. 控制台无 `THREE duplicate` / 404。

---

## 8 接入 Astral 上传接口（URDF）

1. **后端**：在 `LbSysUploadController` 把允许后缀加入 `.urdf`, `.stl`。
2. **前端**：

```ts
import { upload } from '@/api/sys';
const fd = new FormData();
fd.append('file', urdfFile);
fd.append('biz', 'robot');
const { url } = await upload(fd);
loader.load(url, ...);
```

---

## 9 （可选）保存 Blockly 程序到数据库

1. 数据库 `lb_3d_editor_scenes` 增列 `programXml TEXT`。
2. 保存时：

```ts
import Blockly from 'blockly';
const xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));
await updateScene({ id: sceneId, programXml: xml });
```

3. 打开场景时 `Blockly.Xml.textToDom` 还原。

---

## 10 常见问题排查

| 症状                                        | 解决                                                   |
| ----------------------------------------- | ---------------------------------------------------- |
| `ERR_CONNECTION_REFUSED` on `/api/sys/ws` | WebSocket 地址写死 127.0.0.1；改用 `${location.host}` 或真实域名 |
| `multiple versions of three.js`           | 仍有 CDN `<script>`；或子依赖引用旧版。用 `npm ls three` 查看并统一    |
| URDF 模型 404                               | 上传接口没返回 URL / 放错路径；检查 Network 请求                     |

---

完成以上步骤，你就把 **Rocksi** 机器人编程模块无缝并入了 **Astral3DEditor**，并保留未来扩展实时协同、进度推送的空间。祝你集成顺利！
