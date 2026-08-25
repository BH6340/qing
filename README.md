# 轻 · 日历 QING

> 极简体重记录与待办工具 · 纸墨质感设计

一款简约不简单的体重日历应用，低调又高级。记录每日体重，管理每日待办，书写日笺随笔。数据全部本地存储，无需注册登录。

---

## ✨ 功能特性

### 📅 体重日历
- 日历形式展示每日体重（日期 + 体重 + 变化量 三行显示）
- 左右滑动 / 点击年月切换月份，年月滚轮选择器
- "今"字按钮一键回到今天
- 直观显示与前一天的体重变化（红↑增重 / 绿↓减重 / — 持平）
- 体重录入：滚轮选择 + 0.1 微调 + 记录时间修改
- 录入初始值自动取前一天体重，加减更有仪式感
- 底部卡片：体重 + 变化 + 待办概览，点击进入日笺
- 毒舌 + 鼓励混搭的每日文案
- 未来日期灰色显示，不可录入

### ✅ 每日待办
- 待完成 / 已完成任务列表
- 快速添加任务，支持删除和拖拽排序
- 常用任务：完全自定义，折叠式入口，底部抽屉多选
- 常用任务管理：增删、拖拽排序、多选按点击顺序添加
- 点击勾选完成，再次点击取消

### 📝 日笺随笔
- 历史某天的完整回顾
- 体重记录（点击可修改）+ 心情 + 待办完成情况 + 随笔
- 6 种心情可选
- 首字下沉的书卷排版风格
- 无随笔时自动隐藏该模块
- 支持左右切换日期 / 日期选择器跳转任意日期

### ⚙️ 设置
- 数据导出 / 导入（JSON 格式）
- 毒舌模式开关
- 版本更新检查（Android APP 内下载安装，PWA 刷新更新）
- 清空所有数据

---

## 🛠 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | HTML + CSS + 原生 JS | 无框架依赖，加载快 |
| 数据存储 | localStorage | 数据全部保存在本地 |
| PWA | Service Worker + Manifest | iOS/浏览器 可安装到桌面，离线可用 |
| 移动端 | Capacitor | Android 原生 APK，双端覆盖 |
| 后端 | Python Flask | 极简后端，版本检查 + APK 分发 |
| 部署 | Docker + Nginx | 容器化部署，Docker Nginx 反代 |
| 设计风格 | 纸墨质感 · 焦糖色点缀 | 思源宋体 + 黑体 |

---

## 📁 项目结构

```
qing/
├── app/                     # 前端应用
│   ├── index.html           # 日历页（首页）
│   ├── todo.html            # 待办页
│   ├── detail.html          # 日笺详情页
│   ├── settings.html        # 设置页
│   ├── css/
│   │   └── style.css        # 共享样式
│   ├── js/
│   │   ├── storage.js       # 数据存储层（localStorage 封装）
│   │   ├── messages.js      # 文案库（毒舌 + 鼓励）
│   │   └── app-native.js    # Capacitor 原生功能（返回键处理）
│   ├── icons/               # 应用图标
│   ├── manifest.json        # PWA 清单
│   └── sw.js                # Service Worker
├── server/                  # Python 后端
│   ├── app.py               # Flask 应用（版本检查 + APK 下载）
│   └── requirements.txt     # Python 依赖
├── android/                 # Capacitor Android 原生工程
│   ├── app/
│   │   ├── build.gradle     # 构建配置（含 release 签名）
│   │   └── src/main/res/    # 原生资源（图标、启动屏）
│   └── qing-release.keystore # APK 签名密钥
├── apks/                    # APK 产物目录
│   └── app-release.apk      # Release APK（10.4 MB）
├── capacitor.config.json    # Capacitor 配置
├── package.json             # Node 依赖
├── Dockerfile               # Docker 镜像配置
├── docker-compose.yml       # Docker Compose 配置（含网络连接）
├── nginx-qing.conf          # Nginx 配置模板
├── build-apk.ps1            # 本地 APK 构建脚本
├── publish.ps1              # 本地一键发布脚本
├── deploy.sh                # 服务器部署脚本
├── build.bat                # Windows 纯静态打包脚本
├── build.sh                 # Linux/macOS 纯静态打包脚本
├── DEPLOY.md                # 部署与构建指南
└── README.md                # 项目说明
```

---

## 🚀 快速开始

### 本地开发

```bash
cd qing/server
pip install -r requirements.txt
python app.py
```

访问 http://localhost:5000

### Docker 部署

```bash
cd qing
docker compose up -d
```

访问 http://localhost:5000

---

## 📱 移动端方案

| 平台 | 方案 | 安装方式 | 更新方式 |
|------|------|---------|---------|
| Android | Capacitor APK | 下载 APK 安装 | APP 内检查更新 → 下载安装 |
| iOS | PWA | Safari 添加到主屏幕 | 设置 → 版本更新 → 刷新页面 |
| 浏览器 | PWA | 安装到桌面 | 刷新页面自动更新 |

### APK 构建

```powershell
powershell -ExecutionPolicy Bypass -File e:\BH\Android\qing\build-apk.ps1
```

产物：`apks\app-release.apk`（10.4 MB，已签名）

### 一键发布

```powershell
powershell -ExecutionPolicy Bypass -File e:\BH\Android\qing\publish.ps1 -Version "1.0.2" -Changelog "开屏时间调整为1秒`n修复设置页白屏"
```

自动完成：改版本号 → 构建 APK → Git 推送 → 服务器拉取重启

---

## 📜 脚本说明

### 本地脚本

| 脚本 | 作用 | 执行命令 |
|------|------|---------|
| `build-apk.ps1` | 构建 Release APK | `powershell -ExecutionPolicy Bypass -File build-apk.ps1` |
| `publish.ps1` | 一键发布（构建+推送+部署） | `powershell -ExecutionPolicy Bypass -File publish.ps1 -Version "1.0.2" -Changelog "更新内容"` |
| `build.bat` | 纯静态打包（无后端） | 双击 `build.bat` |
| `build.sh` | 纯静态打包（Linux/macOS） | `./build.sh` |

#### `build-apk.ps1`

**功能：** 同步 Web 资源到 Android 工程 → 构建 Release APK → 复制到 `apks/` 目录

**流程：**
1. `npx cap copy android` — 同步 `app/` 到 Android 工程
2. `gradlew assembleRelease` — 构建 Release APK（含签名）
3. 复制到 `apks/app-release.apk`

**产物：** `apks\app-release.apk`（10.4 MB）

#### `publish.ps1`

**功能：** 一键完成版本发布（构建 + 推送 + 部署）

**参数：**
- `-Version`：版本号，如 `"1.0.2"`
- `-Changelog`：更新内容，用 `` `n `` 换行分隔多条

**流程（7 步）：**
1. 更新 `settings.html` 的 `APP_VERSION` + `server/app.py` 的版本号/日期/changelog
2. `npx cap copy android` — 同步代码
3. `gradlew assembleRelease` — 构建 Release APK
4. 复制 APK 到 `apks/` 目录
5. `git add` + `commit` + `push`
6. SSH 服务器 `git pull` + `docker compose restart`
7. 输出发布信息

### 服务器脚本

| 脚本 | 作用 | 执行命令 |
|------|------|---------|
| `deploy.sh` | 拉取代码 + 重启容器 | `sudo ./deploy.sh` |

#### `deploy.sh`

**功能：** 在云服务器上拉取最新代码并重启 Docker 容器

**流程：**
1. `cd ~/qing`
2. `git pull` — 拉取最新代码
3. `docker compose down` + `docker compose up -d --build` — 重建并启动容器

**执行：**
```bash
cd ~/qing
sudo ./deploy.sh
```

---

## 🌐 部署架构

```
用户
├─ Android APP（Capacitor APK）
│   └─ 数据本地存储（localStorage）
├─ iOS / 浏览器（PWA）
│   └─ 数据本地存储（localStorage + Service Worker）
│
云服务器（Docker）
├─ icube_nginx（Docker Nginx，占 80/443）
│   ├─ 旧项目（原有配置不变）
│   └─ qing6340.duckdns.org → qing-calendar:5000
├─ qing-calendar（Flask 容器）
│   ├─ /api/version    → 版本检查
│   ├─ /api/download/apk → APK 下载
│   └─ /                → PWA 静态文件
└─ Let's Encrypt 证书（自动续期）
```

### 服务器接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/version` | GET | 返回最新版本信息（版本号、changelog、下载地址） |
| `/api/download/apk` | GET | 下载 APK 文件 |
| `/api/health` | GET | 健康检查 |
| `/` | GET | PWA 首页 |

---

## 💾 数据说明

- **所有数据保存在你的设备本地**，不上传任何服务器
- 数据格式：JSON
- 包含：体重记录、待办任务、常用任务、日笺随笔、心情记录
- 可随时在设置页导出备份，或从备份文件导入

> 清除应用数据会导致所有记录丢失，请定期导出备份。

---

## 🎨 设计理念

**纸墨·温暖米白风**
- 米白纸质感背景，配合细微颗粒纹理
- 焦糖色点缀，温暖不刺眼
- 思源宋体标题 + 思源黑体正文
- 柔和阴影，丝滑过渡动效
- 简约不简单，低调又高级

---

## 📋 版本历史

### v1.0.1 (2026-08-25)
- 恢复 PWA 离线缓存（iOS 可用）
- 支持 APP 内检查更新并下载安装
- 清理多余开屏资源
- 修复设置页编码问题
- Release APK 签名（10.4 MB）
- Capacitor 双端方案（Android APK + iOS PWA）

### v1.0.0 (2026-08-25)
- 🎉 首次发布
- 📅 体重日历记录与展示
- ✅ 每日待办清单与常用任务
- 📝 日笺随笔与心情记录
- 💾 数据本地存储 + 导入导出
- 🎨 纸墨质感设计
- 📱 PWA 支持，可安装到桌面
- 🐳 Docker 部署支持

---

## 📄 License

MIT License - 自由使用，自由修改。

---

**愿你每天都比昨天更轻盈一点。** ☕
