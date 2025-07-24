# Astral3D Editor with Rocksi

一个由 **Vue + Vite** 前端、**Go(Beego)** 后端、**MySQL** 数据库组成的 3D 场景编辑器，并在前端内嵌了 **Rocksi 卡片式编程** 页面用于机械臂/机器人仿真与逻辑编排。

> ✅ 本 README 适用于 **Windows / Linux / macOS**。  
> ✅ 下面所有命令默认你已经安装了对应平台常用包管理器（Windows 建议使用 PowerShell）。

---

## 目录

- [1. 技术栈与功能概览](#1-技术栈与功能概览)
- [2. 运行前准备（依赖环境）](#2-运行前准备依赖环境)
- [3. 5 分钟快速启动（TL;DR）](#3-5-分钟快速启动tldr)
- [4. 详细启动步骤](#4-详细启动步骤)
  - [4.1 克隆代码](#41-克隆代码)
  - [4.2 初始化数据库](#42-初始化数据库)
  - [4.3 配置后端](#43-配置后端)
  - [4.4 启动后端](#44-启动后端)
  - [4.5 配置前端环境变量](#45-配置前端环境变量)
  - [4.6 启动前端](#46-启动前端)
  - [4.7 集成 Rocksi（两种方式）](#47-集成-rocksi两种方式)
- [5. 项目结构说明](#5-项目结构说明)
- [6. 常见问题 / FAQ](#6-常见问题--faq)
- [7. 贡献指南](#7-贡献指南)
- [8. 许可证](#8-许可证)

---

## 1. 技术栈与功能概览

- **前端**：Vue 3 + Vite 5 + UnoCSS + Naive UI  
- **后端**：Go 1.20+，Beego 2.x  
- **数据库**：MySQL 8.x（utf8mb4）  
- **卡片式编程**：Rocksi（Parcel 打包的纯静态页面，通过 iframe 内嵌）  
- **WebSocket**：后端提供 `/api/sys/ws`（用于系统消息推送）

主要功能：

- 3D 场景管理（增删改查、截图、压缩包等元信息）
- Cesium/Three.js 类型工程配置存储
- Rocksi 卡片式编程界面嵌入，加载机器人模型进行仿真
- 简单资源中心 / 设置中心（示例级）

---

## 2. 运行前准备（依赖环境）

| 依赖 | 最低版本 | 说明 |
|------|----------|------|
| Go   | 1.20     | 建议 1.20+，已使用 Go modules |
| MySQL| 8.0      | 需启用 utf8mb4 |
| Node | 16/18    | Vite 5 推荐 Node ≥ 16.15 |
| npm / yarn | 任一 | npm 自带即可；遇到依赖冲突可用 `--legacy-peer-deps` |
| Bee 工具 | 2.3.0 | `go install github.com/beego/bee/v2@latest` |

---

## 3. 5 分钟快速启动（TL;DR）

> 假设你的 MySQL root 密码是 `rootpwd`，你想用的数据库名是 `astral3d`。

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

# 4. 配置后端 conf/app.conf 里 sql::conn
#    (astral:密码@tcp(地址:端口)/数据库?charset=utf8mb4&parseTime=true&loc=Local)
#    示例：
# sql::conn = astral:Astral@2025!@tcp(127.0.0.1:3306)/astral3d?charset=utf8mb4&parseTime=true&loc=Local

# 5. 启动后端
cd Astral3DEditorGoBack
bee run
# 看见 "http server Running on http://:8080" 即成功

# 6. 配置前端 .env.development
#    (文件在 Astral3DEditor 下，没有就新建)
cat > Astral3DEditor/.env.development <<'EOF'
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
# 浏览器访问 http://127.0.0.1:3000

# ✅ Rocksi 已随 iframe 加载（见左侧“卡片式编程”）
