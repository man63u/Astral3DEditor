<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.x-42b883?style=for-the-badge&logo=vue.js" />
  <img src="https://img.shields.io/badge/Vite-5.x-646cff?style=for-the-badge&logo=vite" />
  <img src="https://img.shields.io/badge/Go-1.20+-00ADD8?style=for-the-badge&logo=go" />
  <img src="https://img.shields.io/badge/Beego-2.x-00B4AA?style=for-the-badge" />
  <img src="https://img.shields.io/badge/MySQL-8.x-4479A1?style=for-the-badge&logo=mysql" />
</p>

<h1 align="center">Astral3D Editor with Rocksi</h1>

<p align="center">
  一个由 <b>Vue + Vite</b> 前端、<b>Go(Beego)</b> 后端、<b>MySQL</b> 数据库构成的 3D 场景编辑平台，集成了 <b>Rocksi</b> 卡片式编程机器人仿真。<br/>
  <sub>已在 Windows / Linux / macOS 下验证运行。</sub>
</p>

---

## 🚀 快速启动（TL;DR）

> **前提：** 已安装 [Go 1.20+](https://go.dev/)、[Node 16+/18+](https://nodejs.org/)、[MySQL 8.x](https://www.mysql.com/) 和 [Bee](https://beego.vip/docs/install/bee.md)。

```bash
# 1. 克隆仓库
git clone https://github.com/<your-name>/astral3d-editor-with-rocksi.git
cd astral3d-editor-with-rocksi

# 2. 初始化数据库
mysql -uroot -p -e "CREATE DATABASE astral3d DEFAULT CHARSET utf8mb4;"
mysql -uroot -p astral3d < static/sql/astral-3d-editor.sql

# 3. 配置后端 (Astral3DEditorGoBack/conf/app.conf)
sql::conn = root:123456@tcp(127.0.0.1:3306)/astral3d?charset=utf8mb4&parseTime=true&loc=Local

# 4. 安装依赖
cd Astral3DEditor && npm install
cd ../Rocksi-master && npm install && npm run build
cp -r dist/build/* ../Astral3DEditorGoBack/static/rocksi/

# 5. 启动后端
cd ../Astral3DEditorGoBack
bee run   # http://127.0.0.1:8080

# 6. 启动前端
cd ../Astral3DEditor
npm run dev   # http://127.0.0.1:3000
````

> ✅ 访问 `http://localhost:3000`，在侧边栏进入 Rocksi 页面即可使用机器人仿真。

---

## 🛠️ 技术栈

**前端：**

* Vue 3 + Vite 5
* Axios + WebSocket
* Three.js (3D 引擎) + Cannon-es (物理仿真)
* Rocksi 积木编程（基于 Blockly + URDF 机器人加载）

**后端：**

* Go 1.20+ + Beego 2.x
* MySQL 8.x（utf8mb4）
* Bee 开发工具热重载

---

## 📂 目录结构

```
astral3d-editor-with-rocksi/
├── Astral3DEditor/          # 前端 (Vue + Vite)
│   ├── src/                 # 前端源码
│   └── .env.development     # 开发环境配置
├── Astral3DEditorGoBack/    # 后端 (Go + Beego)
│   ├── conf/app.conf        # 后端配置文件
│   └── static/rocksi/       # Rocksi 构建结果
├── Rocksi-master/           # Rocksi 积木仿真项目 (Vite 构建)
│   ├── src/                 # Rocksi 源码
│   └── dist/build/          # 构建产物
└── static/sql/              # MySQL 初始化脚本
```

---

## ⚙️ 关键配置

### 前端 `.env.development`

```env
VITE_PORT=3000
VITE_PUBLIC_PATH=/
VITE_PROXY_URL=http://127.0.0.1:8080
VITE_API_PREFIX=/api
VITE_ROCKSI_URL=http://127.0.0.1:8080/rocksi/index.html
VITE_GLOB_SOCKET_URL=ws://127.0.0.1:8080/api/sys/ws
```

### 后端 `app.conf`

```ini
[appname]
appname = Astral3DEditorGoBack
httpport = 8080
runmode = dev

[sql]
conn = root:123456@tcp(127.0.0.1:3306)/astral3d?charset=utf8mb4&parseTime=true&loc=Local
```

---

## ❓ 常见问题 (FAQ)

<details>
<summary><b>Q1: Rocksi 机器人模型无法加载？</b></summary>

* 检查 `/models/` 路径是否 404：后端需挂载 `beego.BConfig.WebConfig.StaticDir["/models"]`
* 清除缓存（DevTools → Application → Clear Storage）
* 确保 `.env` 中的 `VITE_ROCKSI_URL` 指向后端 `http://127.0.0.1:8080/rocksi/index.html`

</details>

<details>
<summary><b>Q2: npm 安装依赖报错？</b></summary>

* 使用 `npm install --legacy-peer-deps`
* 或改用 `pnpm`：`pnpm install`

</details>

<details>
<summary><b>Q3: MySQL 连接失败？</b></summary>

* 确认 `app.conf` 中数据库用户名、密码与本地一致
* 确认数据库端口 (默认 3306)
* 检查 `utf8mb4` 编码设置是否正确

</details>

---

## 📦 部署 (生产)

1. 后端：`bee run` 或使用 Docker 容器运行 Beego。
2. 前端：`npm run build`，将 `dist/` 静态文件部署到 Nginx。
3. Rocksi：每次 `npm run build` 后，将 `dist/build` 复制至后端 `static/rocksi/`。

---

## 📝 许可证

MIT © 2025 YourName
依赖库遵循各自的开源协议（MIT/Apache/GPL 等），商用请确认许可证兼容。

---

## 🙌 致谢

* [Vue.js](https://vuejs.org/) & [Vite](https://vitejs.dev/)
* [Beego](https://beego.vip/) & [MySQL](https://www.mysql.com/)
* [Rocksi](https://github.com/ndahn/Rocksi) 积木仿真项目
* 所有贡献者 ❤️

```

