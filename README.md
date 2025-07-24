# Astral3d-editor-with-rocksi 项目使用教程

---

## 目录

* [项目介绍与架构](#项目介绍与架构)
* [环境依赖安装](#环境依赖安装)
* [代码获取与目录结构说明](#代码获取与目录结构说明)
* [数据库配置与建表](#数据库配置与建表)
* [关键配置文件说明](#关键配置文件说明)
* [启动步骤](#启动步骤)
* [运行成功表现](#运行成功表现)
* [常见问题与解决方案](#常见问题与解决方案)
* [版本兼容性与注意事项](#版本兼容性与注意事项)
* [你遇到的主要问题总结及解决](#你遇到的主要问题总结及解决)

---

## 项目介绍与架构

**Astral3d-editor-with-rocksi** 是一个集成了前端3D编辑器（基于Rocksi卡片式编程）和后端Go服务的Web应用。

* **前端**：Vue + Vite + Unocss，提供3D编辑界面。
* **后端**：Go (Beego框架)，负责业务逻辑和数据库操作。
* **数据库**：MySQL，存储场景数据等。

架构图示：

```text
用户浏览器 <---> 前端 (Vue + Vite) <---> 后端 (Go Beego) <---> MySQL数据库
```

---

## 环境依赖安装

### 1. 操作系统

推荐 Ubuntu 22.04 或等效 Linux。

---

### 2. 安装 MySQL

```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

---

### 3. 配置 MySQL root 用户（解决auth\_socket权限问题）

```bash
sudo mysql

-- 查看 root 账户认证插件
SELECT user, host, plugin FROM mysql.user WHERE user = 'root';

-- 修改 root 用户认证为密码模式
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '你的密码';
FLUSH PRIVILEGES;
EXIT;
```

---

### 4. 创建项目数据库和用户

```bash
mysql -u root -p --socket=/var/run/mysqld/mysqld.sock

CREATE DATABASE astral2d CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
CREATE USER 'astral'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON astral2d.* TO 'astral'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

### 5. 安装 Go（推荐1.20及以上）

```bash
wget https://go.dev/dl/go1.20.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.20.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin
go version
```

---

### 6. 安装 Node.js（推荐16.x或18.x）

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
npm -v
```

---

### 7. 安装前端依赖

```bash
cd Astral3d-editor-with-rocksi/Astral3DEditor
npm install
```

---

## 代码获取与目录结构说明

```bash
git clone https://github.com/kunkunking66/Astral3d-editor-with-rocksi.git
cd Astral3d-editor-with-rocksi
```

### 目录结构

```text
Astral3d-editor-with-rocksi/
├── Astral3DEditor/            # 前端代码（Vue + Vite）
├── Astral3DEditorGoBack/      # 后端代码（Go + Beego）
└── Rocksi-master              # 暂未修改 (html)
└── README.md
```

---

## 数据库配置与建表

### 1. 修改后端数据库配置

在 `Astral3DEditorGoBack/conf/app.conf` 中配置数据库连接：

```ini
db_driver=mysql
db_user=astral
db_password=your_password
db_name=astral2d
db_host=127.0.0.1
db_port=3306
```

---

### 2. 建表 SQL

登录 MySQL 后执行：

```sql
CREATE TABLE lb_3d_editor_scenes (
  id VARCHAR(255) NOT NULL PRIMARY KEY COMMENT '主键ID,UUID',
  sceneType VARCHAR(24) DEFAULT NULL COMMENT '场景类型',
  hasDrawing INT NOT NULL COMMENT '场景是否包含图纸 0:false 1:true',
  sceneIntroduction VARCHAR(255) DEFAULT NULL COMMENT '场景描述',
  sceneName VARCHAR(255) DEFAULT NULL COMMENT '场景名称',
  sceneVersion INT NOT NULL COMMENT '场景版本',
  zip VARCHAR(128) NOT NULL COMMENT '场景zip包',
  zipSize VARCHAR(32) NOT NULL COMMENT '场景zip包大小',
  coverPicture TEXT NOT NULL COMMENT '保存场景时自动生成的封面图url',
  exampleSceneId VARCHAR(255) DEFAULT NULL COMMENT '示例模板项目ID，null代表空项目创建',
  projectType INT NOT NULL COMMENT '项目类型。0：Web3D-THREE 1：WebGIS-Cesium',
  cesiumConfig VARCHAR(1000) DEFAULT NULL COMMENT 'WebGIS-Cesium 类型项目的基础Cesium配置',
  updateTime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  createTime DATETIME DEFAULT NULL COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='3D编辑场景表';
```

---

## 关键配置文件说明

### 1. 前端环境变量 `.env`

放在 `Astral3DEditor/.env` 目录(Ctrl+H)，示例：

```env
VITE_PORT=3000
VITE_GLOB_APP_TITLE='Astral 3D Editor'
VITE_GLOB_AUTHOR='ErSan'
VITE_GLOB_VERSION='1.0.0'
VITE_GLOB_BEIAN='XICP备XXXXXXXXXX号'
# 代理后端地址
VITE_PROXY_URL=http://127.0.0.1:8080
```

---
### 1. 前端环境变量 `.env.development`

放在 `Astral3DEditor/.env.development` 目录(Ctrl+H)，示例：

```env
# dev server 端口
VITE_PORT=3000  

# 静态资源前缀
VITE_PUBLIC_PATH = /

# REST / 文件代理到后端
VITE_PROXY_URL = http://127.0.0.1:8080

# WebSocket 地址（前端自己用）
VITE_GLOB_SOCKET_URL = ws://127.0.0.1:8080/api/sys/ws
```

### 3. 后端配置文件 `conf/app.conf`

```ini
# 替换为自己的用户名和密码
[sql]
conn = "astral:123456@tcp(127.0.0.1:3306)/astral2d?charset=utf8mb4&parseTime=true&loc=Local"
```

---

## 启动步骤

### 1. 启动 MySQL 服务

```bash
sudo systemctl start mysql
sudo systemctl status mysql
```

---

### 2. 启动后端服务

进入后端目录：

```bash
cd Astral3DEditorGoBack
bee run
```

* 如果未安装 bee：

```bash
go install github.com/beego/bee/v2@latest
```

---

### 3. 启动前端服务

进入前端目录：

```bash
cd ../Astral3DEditor
npm run dev
```

---

## 运行成功表现

* 后端启动成功控制台显示：

```
______
| ___ \
| |_/ /  ___   ___
| ___ \ / _ \ / _ \
| |_/ /|  __/|  __/
\____/  \___| \___| v2.3.0
...
http server Running on http://:8080
```

* 前端启动成功控制台显示：

```
VITE v5.0.12  ready in xxx ms
➜  Local:   http://localhost:3000/
➜  Network: http://192.168.x.x:3000/
```

* 浏览器访问 `http://localhost:3000`，显示3D编辑器页面，无报错。

---

## 常见问题与解决方案

| 问题                         | 解决方案                                                 |
| -------------------------- | ---------------------------------------------------- |
| MySQL连接失败，socket路径错误       | 使用正确socket参数，如`--socket=/var/run/mysqld/mysqld.sock` |
| MySQL访问权限拒绝                | 修改用户权限，确保MySQL用户有对应数据库权限                             |
| 表不存在错误                     | 执行正确的建表SQL，确认连接的数据库和表名是否一致                           |
| 字段类型过大错误（coverPicture）     | 修改字段类型为`TEXT`替代超长`VARCHAR`                           |
| 后端连接数据库失败                  | 检查后端配置文件数据库用户名密码是否正确                                 |
| 后端启动报错“register db Ping”失败 | 确认数据库配置正确，数据库名、用户、密码匹配                               |
| 连接数据库错误权限问题                | 确认MySQL授权，用户`astral`有`astral2d`访问权限                  |

---

## 版本兼容性与注意事项

* Go建议使用1.20及以上版本。
* Bee框架版本为v2.3.0及以上。
* Node.js建议16.x或18.x。
* MySQL推荐8.0，使用utf8mb4字符集。
* 注意MySQL socket路径，Linux不同发行版路径可能不同。
* 前端使用Vite 5.x，Unocss插件版本不稳定，警告无阻使用。
* 端口默认：前端3000，后端8080。
* 代码目录清晰分前端后端，启动顺序必须数据库→后端→前端。

---

