<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.x-42b883?style=for-the-badge&logo=vue.js" />
  <img src="https://img.shields.io/badge/Vite-5.x-646cff?style=for-the-badge&logo=vite" />
  <img src="https://img.shields.io/badge/Go-1.20+-00ADD8?style=for-the-badge&logo=go" />
  <img src="https://img.shields.io/badge/Beego-2.x-00B4AA?style=for-the-badge" />
  <img src="https://img.shields.io/badge/MySQL-8.x-4479A1?style=for-the-badge&logo=mysql" />
  <img src="https://img.shields.io/badge/Parcel-1.x-FB8C00?style=for-the-badge&logo=parcel" />
</p>

<h1 align="center">Astral3D Editor with Rocksi</h1>

<p align="center">
  一个由 <b>Vue + Vite</b> 前端、<b>Go(Beego)</b> 后端、<b>MySQL</b> 数据库构成的 3D 场景编辑平台，前端内嵌 <b>Rocksi 卡片式编程</b> 页面，实现机械臂/机器人仿真与逻辑编排。<br/>
  <sub>已在 Windows / Linux / macOS 下验证运行。</sub>
</p>

---

## 📖 目录

- [1. 技术栈 & 功能概览](#1-技术栈--功能概览)
- [2. 开源依赖一览](#2-开源依赖一览)
- [3. 运行前准备（依赖环境）](#3-运行前准备依赖环境)
- [4. 5 分钟快速启动（TL;DR）](#4-5-分钟快速启动tldr)
- [5. 详细启动步骤](#5-详细启动步骤)
  - [5.1 克隆代码](#51-克隆代码)
  - [5.2 初始化数据库](#52-初始化数据库)
  - [5.3 配置后端](#53-配置后端)
  - [5.4 启动后端](#54-启动后端)
  - [5.5 配置前端环境变量](#55-配置前端环境变量)
  - [5.6 启动前端](#56-启动前端)
  - [5.7 集成 Rocksi（两种方式）](#57-集成-rocksi两种方式)
- [6. 项目结构](#6-项目结构)
- [7. 常见问题 / FAQ](#7-常见问题--faq)
- [8. 开发规范 & 贡献指南](#8-开发规范--贡献指南)
- [9. 许可证](#9-许可证)
- [10. 致谢](#10-致谢)

---

## 1. 技术栈 & 功能概览

**前端**
- Vue 3 + Vite 5  
- UnoCSS / Naive UI（或其他 UI 组件库）  
- Axios / WebSocket（消息推送）  
- 通过 iframe 嵌入 Rocksi（Parcel 构建的静态文件）

**后端**
- Go 1.20+  
- Beego 2.x Web 框架  
- Beego ORM + MySQL  
- 可选：Revit/CAD 转换 WebSocket 服务（可关闭）

**数据库**
- MySQL 8.x（utf8mb4）

**核心功能**
- 3D 场景管理（CRUD、封面图、ZIP 等元信息）
- Cesium / Three.js 项目配置存储
- Rocksi 卡片式编程：加载机器人模型，进行可视化编程与仿真
- 简单资源中心 / 设置中心（示例级）

---

## 2. 开源依赖一览

| 模块 | 库/框架 | 主要用途 | License |
|-----|---------|----------|---------|
| 前端框架 | Vue 3 | UI 组件化开发 | MIT |
| 构建工具 | Vite 5 | 前端构建/开发服务器 | MIT |
| 样式原子化 | UnoCSS | 原子化 CSS 引擎 | MIT |
| UI 组件 | Naive UI（若使用） | Vue3 UI 组件库 | MIT |
| HTTP 客户端 | Axios | API 请求 | MIT |
| 3D 引擎 | three.js | WebGL 3D 渲染 | MIT |
| 物理引擎 | cannon-es | 物理模拟 | MIT |
| 机器人模型加载 | urdf-loader | 解析 URDF | MIT |
| 积木编程 | Blockly | 积木式编程 | Apache-2.0 |
| Rocksi | robotsim (Rocksi) | 卡片式/积木编程仿真 | ISC / MIT |
| 打包器 | Parcel 1.x | Rocksi 构建工具 | MIT |
| 后端框架 | Beego 2 | Go Web 框架 | Apache-2.0 |
| ORM | Beego ORM | 数据库 ORM | Apache-2.0 |
| 数据库 | MySQL | 数据存储 | GPLv2（Server Side） |

> 以上仅摘要，发布/商用前请务必阅读并遵守各依赖库的 LICENSE。

---

## 3. 运行前准备（依赖环境）

| 依赖 | 最低版本 | 说明 |
|------|----------|------|
| Go   | 1.20     | 使用 Go modules |
| MySQL| 8.0      | 字符集 utf8mb4 |
| Node | 16.x / 18.x | Vite 5 推荐 Node ≥ 16.15 |
| npm / yarn | 任一 | 遇到冲突可用 `--legacy-peer-deps` |
| Bee 工具 | 2.3.0 | `go install github.com/beego/bee/v2@latest` |

---

## 4. 5 分钟快速启动（TL;DR）

> 假设 MySQL root 密码是 `rootpwd`，数据库名为 `astral3d`。

```bash
# 1. 克隆
git clone https://github.com/<your-name>/astral3d-editor-with-rocksi.git
cd astral3d-editor-with-rocksi

# 2. 建库&建用户（按需修改密码）
mysql -uroot -prootpwd -e "CREATE DATABASE astral3d DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_general_ci;
CREATE USER 'astral'@'localhost' IDENTIFIED BY 'Astral@2025!';
GRANT ALL PRIVILEGES ON astral3d.* TO 'astral'@'localhost';
FLUSH PRIVILEGES;"

# 3. 导入表结构
mysql -uastral -pAstral@2025! astral3d < static/sql/astral-3d-editor.sql

# 4. 配置后端 conf/app.conf -> sql::conn
# sql::conn = astral:Astral@2025!@tcp(127.0.0.1:3306)/astral3d?charset=utf8mb4&parseTime=true&loc=Local

# 5. 启动后端
cd Astral3DEditorGoBack
bee run
# 日志提示： http server Running on http://:8080

# 6. 配置前端 .env.development（在 Astral3DEditor 下，没有就新建）
cat > ../Astral3DEditor/.env.development <<'EOF'
VITE_PORT=3000
VITE_PUBLIC_PATH=/
VITE_PROXY_URL=http://127.0.0.1:8080
VITE_API_PREFIX=/api
VITE_ROCKSI_URL=http://127.0.0.1:8080/rocksi/index.html
VITE_GLOB_SOCKET_URL=ws://127.0.0.1:8080/api/sys/ws
EOF

# 7. 启动前端
cd ../Astral3DEditor
npm install --legacy-peer-deps
npm run dev

# 浏览器访问：http://127.0.0.1:3000
# ✅ 左侧菜单进入“卡片式编程”即可看到 Rocksi（若卡 Loading Robot 请看 FAQ）
````

---

## 5. 详细启动步骤

### 5.1 克隆代码

```bash
git clone https://github.com/<your-name>/astral3d-editor-with-rocksi.git
cd astral3d-editor-with-rocksi
```

### 5.2 初始化数据库

登录 MySQL：

```bash
mysql -uroot -p
```

执行 SQL（可根据需要修改用户名/密码）：

```sql
CREATE DATABASE astral3d DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_general_ci;
CREATE USER 'astral'@'localhost' IDENTIFIED BY 'Astral@2025!';
GRANT ALL PRIVILEGES ON astral3d.* TO 'astral'@'localhost';
FLUSH PRIVILEGES;
```

导入表结构：

```bash
mysql -uastral -pAstral@2025! astral3d < static/sql/astral-3d-editor.sql
```

### 5.3 配置后端

编辑 `Astral3DEditorGoBack/conf/app.conf` 中的数据库连接：

```ini
[sql]
conn = astral:Astral@2025!@tcp(127.0.0.1:3306)/astral3d?charset=utf8mb4&parseTime=true&loc=Local
```

若后端需要托管 Rocksi 静态资源，请在 `main.go` 中添加静态目录映射（示例）：

```go
dist := "C:/path/to/Rocksi-master/dist/build"  // 请改成实际绝对路径
beego.BConfig.WebConfig.StaticDir["/rocksi"] = dist
beego.BConfig.WebConfig.StaticDir["/models"] = filepath.Join(dist, "models")
beego.BConfig.WebConfig.StaticDir["/i18n"]   = filepath.Join(dist, "i18n")
beego.BConfig.WebConfig.StaticDir["/images"] = filepath.Join(dist, "images")
```

### 5.4 启动后端

```bash
cd Astral3DEditorGoBack
bee run
```

成功标志：

```
http server Running on http://:8080
```

访问测试：

* `http://127.0.0.1:8080/api/editor3d/scenes/getAll` 应返回 JSON
* `http://127.0.0.1:8080/rocksi/index.html` 可直接打开 Rocksi

### 5.5 配置前端环境变量

在 `Astral3DEditor/.env.development` 写入：

```env
VITE_PORT=3000
VITE_PUBLIC_PATH=/

VITE_PROXY_URL=http://127.0.0.1:8080
VITE_API_PREFIX=/api

# 推荐用绝对地址（避免 /models 路径 404 或返回 HTML）
VITE_ROCKSI_URL=http://127.0.0.1:8080/rocksi/index.html

VITE_GLOB_SOCKET_URL=ws://127.0.0.1:8080/api/sys/ws
```

> 注意：dotenv 中 `=` 两边不要有空格。

### 5.6 启动前端

```bash
cd Astral3DEditor
npm install --legacy-peer-deps
npm run dev
```

成功标志：

```
VITE v5.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

### 5.7 集成 Rocksi（两种方式）

#### ✅ 方式 A（推荐）：iframe 直连后端静态目录

`.env.development` 中 `VITE_ROCKSI_URL` 用完整绝对 URL（带 8080）。

组件示例：

```vue
<iframe
  :src="import.meta.env.VITE_ROCKSI_URL"
  class="w-full h-full border-0"
/>
```

#### 方式 B：通过 Vite 代理将 `/rocksi`、`/models` 等转发到 8080

在 `vite.config.ts`：

```ts
proxy: {
  [env.VITE_API_PREFIX]: { target: env.VITE_PROXY_URL, changeOrigin: true, ws: true },
  '/rocksi': { target: env.VITE_PROXY_URL, changeOrigin: true },
  '/models': { target: env.VITE_PROXY_URL, changeOrigin: true },
  '/i18n':   { target: env.VITE_PROXY_URL, changeOrigin: true },
  '/images': { target: env.VITE_PROXY_URL, changeOrigin: true }
}
```

`.env.development` 中可写相对路径：

```env
VITE_ROCKSI_URL=/rocksi/index.html
```

---

## 6. 项目结构

```bash
astral3d-editor-with-rocksi/
├── Astral3DEditor/                # 前端（Vue + Vite）
│   ├── src/
│   ├── vite.config.ts
│   └── .env(.development / .production ...)
├── Astral3DEditorGoBack/          # 后端（Go + Beego）
│   ├── conf/app.conf
│   ├── main.go
│   ├── routers/
│   └── utils/
├── Rocksi-master/                 # Rocksi 源码 (Parcel 1.x)
│   ├── src/
│   └── dist/build/                # 打包产物（index.html / models / i18n / images ...）
├── static/sql/astral-3d-editor.sql# MySQL 建表脚本
├── README.md
└── ...
```

---

## 7. 常见问题 / FAQ

<details>
<summary><b>接口 500 / 404 / 跨域？</b></summary>

* 检查 `.env.development` 中的 `VITE_PROXY_URL`、`VITE_API_PREFIX` 是否与后端一致。
* 确保 `vite.config.ts` 的 `server.proxy` 正确配置。
* 直接访问后端接口：`http://127.0.0.1:8080/api/...` 看是否正常。
* 开发阶段用代理即可，不必后端开 CORS；生产可在 Beego 加 CORS 过滤器。

</details>

<details>
<summary><b>Rocksi 页面一直 “Loading Robot…”</b></summary>

* **Network 中 `/models/...urdf.xacro` 返回的是 HTML（text/html）**
  → iframe 页面走了 3000 端口而不是 8080。
  → 解决：使用绝对地址 `VITE_ROCKSI_URL=http://127.0.0.1:8080/rocksi/index.html`，或把 `/models` 代理到 8080。

* **XacroLoader 解析失败（拿到 xml 但还加载不动）**

  * 换成纯 `.urdf` 文件（如 `/models/niryo_robot_description/urdf/niryo_one.urdf`）。
  * 或用 `xacro` 工具把 `.urdf.xacro` 转成 `.urdf`：

    ```bash
    pip install xacro
    xacro panda_arm_hand.urdf.xacro -o panda_arm_hand.urdf
    ```

* **缓存问题**

  * DevTools → Application → Service Workers → Unregister
  * Clear storage → Clear site data
  * 隐身窗口重试

</details>

<details>
<summary><b>Parcel / npm 依赖冲突</b></summary>

* 使用 `npm install --legacy-peer-deps --no-audit` 安装。
* 如果只使用 `dist/build`，无需再安装 Parcel 相关依赖。

</details>

<details>
<summary><b>Git 报错 “refspec does not match any”</b></summary>

* 没有 commit / 分支不存在：

  ```bash
  git add -A
  git commit -m "feat: run ok"
  git push -u origin your-branch
  ```

</details>

<details>
<summary><b>CRLF 警告</b></summary>

* 可忽略；或使用：

  ```bash
  git config core.autocrlf false
  ```

</details>

---

## 8. 开发规范 & 贡献指南

* **分支命名**：`feat/xxx`、`fix/xxx`、`chore/xxx`…
* **Commit message**：建议遵循 [Conventional Commits](https://www.conventionalcommits.org/)。
* **PR 流程**：

  1. Fork & Clone
  2. 新建分支开发并本地测试通过（前后端均能跑）
  3. 提交 PR，描述改动内容和测试方式
* **代码风格**：

  * 前端：ESLint / Prettier（如已配置）
  * 后端：`gofmt` / `golangci-lint`（如需要）

---

## 9. 许可证

> 请根据项目实际情况填写。若继承了其他仓库，请遵守并保留原有 License。

**本项目：MIT License**

```
MIT © 2025 YourName
```

依赖库的 LICENSE 请查看各自官网或仓库。商用/二次分发前请确认许可证兼容性。

---

## 10. 致谢

* [Vue.js](https://vuejs.org/) / [Vite](https://vitejs.dev/)
* [Beego](https://beego.vip/) / [MySQL](https://www.mysql.com/)
* [three.js](https://threejs.org/) / [cannon-es](https://github.com/pmndrs/cannon-es)
* [Blockly](https://developers.google.com/blockly)
* [Parcel](https://parceljs.org/)
* Rocksi / robotsim 相关开源作者（Nikolas Dahn 等）
* 所有贡献代码、提交 Issue 的开发者们 🙌

---

> 如有问题或改进建议，请提 Issue 或 PR。祝玩得愉快！🎉

```
```
