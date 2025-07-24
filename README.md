根据你的需求，我已将原始 `README.md` 的内容进行了修改和整理，以确保流程更加清晰且便于用户操作。下面是修改后的 `README.md`：

---

# Astral3d-editor-with-rocksi 项目使用教程

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

**Astral3d-editor-with-rocksi** 是一个集成了前端 3D 编辑器（基于 Rocksi 卡片式编程）和后端 Go 服务的 Web 应用。

* **前端**：Vue + Vite + Unocss，提供 3D 编辑界面。
* **后端**：Go (Beego 框架)，负责业务逻辑和数据库操作。
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

### 3. 配置 MySQL root 用户（解决 auth\_socket 权限问题）

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

CREATE DATABASE astral3d CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
CREATE USER 'astral'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON astral3d.* TO 'astral'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

### 5. 安装 Go（推荐 1.20 及以上）

```bash
wget https://go.dev/dl/go1.20.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.20.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin
go version
```

---

### 6. 安装 Node.js（推荐 16.x 或 18.x）

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
db_name=astral3d
db_host=127.0.0.1
db_port=3306
```

---

### 2. 建表 SQL

仓库中的 SQL 文件用于创建数据库表结构。执行以下步骤来创建数据库表：

1. **创建数据库和用户**（如果尚未执行）：

   ```sql
   CREATE DATABASE astral3d DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_general_ci;
   CREATE USER 'astral'@'%' IDENTIFIED BY 'yourpassword';
   GRANT ALL PRIVILEGES ON astral3d.* TO 'astral'@'%';
   FLUSH PRIVILEGES;
   ```

2. **导入数据库表结构**
   执行 `static/sql/astral-3d-editor.sql` 文件中的 SQL 创建表结构。

   * 方式 1：通过 MySQL 命令行导入：

     ```bash
     mysql -u astral -p --socket=/var/run/mysqld/mysqld.sock
     USE astral3d;
     SOURCE /path/to/static/sql/astral-3d-editor.sql;
     ```

   * 方式 2：通过命令行批量导入：

     ```bash
     # Linux/macOS
     mysql -u astral -pyourpassword -h127.0.0.1 astral3d < static/sql/astral-3d-editor.sql

     # Windows PowerShell
     mysql -u astral -pyourpassword -h127.0.0.1 astral3d < .\static\sql\astral-3d-editor.sql
     ```

---

## 关键配置文件说明

### 1. 前端环境变量 `.env`

放在 `Astral3DEditor/.env` 目录（Ctrl+H），示例：

```env
VITE_PORT=3000
VITE_GLOB_APP_TITLE='Astral 3D Editor'
VITE_GLOB_AUTHOR='ErSan'
VITE_GLOB_VERSION='1.0.0'
VITE_GLOB_BEIAN='XICP备XXXXXXXXXX号'
# 代理后端地址
VITE_PROXY_URL=http://127.0.0.1:8080
```

### 2. 前端环境变量 `.env.development`

放在 `Astral3DEditor/.env.development` 目录（Ctrl+H），示例：

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
conn = "astral:123456@tcp(127.0.0.1:3306)/astral3d?charset=utf8mb4&parseTime=true&loc=Local"
```

---

## 启动步骤

### 1. 启动 MySQL 数据库

确保数据库已经启动并运行，可以使用以下命令：

```bash
sudo service mysql start
```

### 2. 启动后端服务

完成数据库配置后，可以启动后端服务。根据你的环境选择合适的启动方式：


```bash
cd C:\Users\67097\Desktop\新建文件夹\Astral3DEditorGoBack
bee run      # 如果使用 Beego 框架
# 或者
go run main.go    # 如果直接使用 Go
```

### 3. 启动前端服务

```bash
cd Astral3DEditor
npm run dev    # 启动前端开发服务器
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

* 浏览器访问 `http://localhost:3000`，显示 3D 编辑器页面，无报错。

---

## 常见问题与解决方案

| 问题                         | 解决方案                                                   |
| -------------------------- | ------------------------------------------------------ |
| MySQL 连接失败，socket 路径错误     | 使用正确 socket 参数，如`--socket=/var/run/mysqld/mysqld.sock` |
| MySQL 访问权限拒绝               | 修改用户权限，确保 MySQL 用户有对应数据库权限                             |
| 表不存在错误                     | 执行正确的建表 SQL，确认连接的数据库和表名是否一致                            |
| 字段类型过大错误（coverPicture）     | 修改字段类型为 `TEXT` 替代超长 `VARCHAR`                          |
| 后端连接数据库失败                  | 检查后端配置文件数据库用户名密码是否正确                                   |
| 后端启动报错“register db Ping”失败 | 确认数据库配置正确，数据库名、用户、密码匹配                                 |
| 连接数据库错误权限问题                | 确认 MySQL 授权，用户 `astral` 有 `astral3d` 访问权限              |

---

## 版本兼容性与注意事项

* Go 建议使用 1.20 及以上版本。
* Bee 框架版本为 v2.3.0 及以上。
* Node.js 建议 16.x 或 18.x。
* MySQL 推荐 8.0，使用 utf8mb4 字符集。
* 注意 MySQL socket 路径，Linux 不同发行版路径可能不同。
* 前端使用 Vite 5.x，Unocss 插件版本不稳定，警告无阻使用。
* 端口默认：前端 3000，后端 8080。
* 代码目录清晰分前端后端，启动顺序必须数据库→后端→前端。


