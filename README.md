# 轻 · 日历 QING

> 极简体重记录与打卡待办工具 · 纸墨质感设计

一款简约的体重日历应用。记录每日体重，完成每日打卡，管理长期待办，书写日笺随笔。数据全部本地存储，无需注册登录。

支持 Android 原生 APK、iOS PWA、浏览器 PWA 三端覆盖。

---

## ✨ 功能特性

### 📅 体重日历
- 日历形式展示每日体重（日期 + 体重 + 变化量 三行显示）
- 左右滑动 / 点击年月切换月份，年月滚轮选择器
- "今"字按钮一键回到今天
- 直观显示与前一天的体重变化（红↑增重 / 绿↓减重 / — 持平）
- 体重录入：滚轮选择 + 记录时间修改
- 录入初始值自动取前一天体重，加减更有仪式感
- 底部卡片：体重 + 待办 + 打卡三列概览，点击进入日笺
- 毒舌 + 鼓励混搭的每日文案
- 未来日期灰色显示，不可录入

### ✅ 今日打卡
- 每日需要完成的任务（当天有效）
- 待打卡 / 已打卡任务列表
- 快速添加打卡，支持删除和拖拽排序
- 常用打卡：完全自定义，折叠式入口，底部抽屉多选
- 常用打卡管理：增删、拖拽排序、多选按点击顺序添加
- 点击勾选完成，再次点击取消
- 过去日期未完成打卡：灰色字体 + 红叉图标 + "未完成"状态
- 过期任务操作有毒舌确认提醒（毒舌模式下）

### 📋 待办事项
- 长期目标管理，不限日期，全局共用
- 待完成 / 已完成列表
- 完成后记录完成时间
- 主页底部卡片显示未完成数量

### 📝 日笺随笔
- 历史某天的完整回顾
- 体重记录（点击可修改）+ 心情 + 打卡完成情况 + 随笔
- 6 种心情可选
- 首字下沉的书卷排版风格
- 无随笔时自动隐藏该模块
- 支持左右切换日期 / 日期选择器跳转任意日期

### ⚙️ 设置
- 数据导出 / 导入（JSON 格式，浏览器下载备份）
- 毒舌模式开关
- 版本更新检查（Android APP 内跳转浏览器下载，PWA 刷新更新）
- 版本更新弹窗：最新版本与当前版本上下排列，已最新时显示历史版本
- Beta 测试计划：正式版与 Beta 版切换，数据独立隔离，切换时支持导出备份
- 清空所有数据

---

## 🛠 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | HTML + CSS + 原生 JS | 无框架依赖，加载快 |
| 数据存储 | localStorage | 数据全部保存在本地 |
| PWA | Service Worker + Manifest | iOS/浏览器 可安装到桌面，离线可用 |
| 移动端 | Capacitor | Android 原生 APK，release 签名 |
| Capacitor 插件 | Browser / Filesystem / FileOpener / StatusBar / SplashScreen / App | 原生能力扩展 |
| 后端 | Python Flask | 极简后端，版本检查 + APK 分发 + 数据导出 |
| 部署 | Docker + Nginx | 容器化部署，Docker Nginx 反代 |
| 签名 | JDK 21 + Gradle 8.14 | Release APK 签名构建 |
| 设计风格 | 纸墨质感 · 焦糖色点缀 | 思源宋体 + 黑体 |

---

## 📁 项目结构

```
qing/
├── app/                     # 前端应用（Capacitor Web 资源）
│   ├── index.html           # 日历页（首页）
│   ├── todo.html            # 今日打卡页
│   ├── todos.html           # 待办事项页（长期目标，全局共用）
│   ├── detail.html          # 日笺详情页
│   ├── settings.html        # 设置页
│   ├── css/
│   │   └── style.css        # 共享样式
│   ├── js/
│   │   ├── config.js        # 应用配置（版本号、通道、API地址统一管理）
│   │   ├── storage.js       # 数据存储层（localStorage 封装 + 通道隔离 + 数据迁移）
│   │   ├── messages.js      # 文案库（毒舌 + 鼓励）
│   │   └── app-native.js    # Capacitor 原生功能（返回键处理）
│   ├── icons/               # 应用图标
│   ├── manifest.json        # PWA 清单
│   └── sw.js                # Service Worker
├── server/                  # Python 后端
│   ├── app.py               # Flask 应用（版本检查 + APK 下载 + 数据导出）
│   └── requirements.txt     # Python 依赖
├── android/                 # Capacitor Android 原生工程
│   ├── app/
│   │   ├── build.gradle     # 构建配置（含 release 签名）
│   │   └── src/main/res/    # 原生资源（图标、启动屏）
│   └── qing-release.keystore # APK 签名密钥（10000 天有效期）
├── apks/                    # APK 产物目录
│   ├── app-formal-latest.apk  # 正式版最新 APK
│   ├── app-beta-latest.apk    # Beta 版最新 APK
│   └── archive/               # 历史版本归档（带版本号）
├── capacitor.config.json    # Capacitor 配置（appId、SplashScreen、StatusBar）
├── package.json             # Node 依赖（Capacitor 核心 + 插件）
├── Dockerfile               # Docker 镜像配置
├── docker-compose.yml       # Docker Compose 配置（端口 5000 + 网络连接）
├── nginx-qing.conf          # Nginx 配置模板
├── build-apk.ps1            # 本地 APK 构建脚本
├── publish.ps1              # 正式版一键发布脚本
├── publish-beta.ps1         # Beta 版一键发布脚本
├── deploy.sh                # 服务器部署脚本
├── build.bat                # Windows 纯静态打包脚本
├── build.sh                 # Linux/macOS 纯静态打包脚本
├── .gitignore               # Git 忽略规则
├── DEPLOY.md                # 部署与构建指南
└── README.md                # 项目说明
```

---

## 📲 下载

| 平台 | 协议 | 链接 |
|------|------|------|
| Android APK（正式版） | HTTPS | https://qing6340.duckdns.org/api/download/apk |
| Android APK（正式版） | HTTP | http://103.100.211.146:5000/api/download/apk |
| Android APK（Beta 版） | HTTP | http://103.100.211.146:5000/api/download/apk/beta |
| PWA 在线访问 | HTTPS | https://qing6340.duckdns.org |
| PWA 在线访问 | HTTP | http://103.100.211.146:5000 |

> Android 用户直接点击链接下载安装；iOS 用户用 Safari 打开 PWA 链接，添加到主屏幕。
> HTTPS 域名走 Nginx 反代，HTTP 直连端口速度更快。

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
| Android | Capacitor APK（约 10.5 MB） | 下载 APK 安装 | APP 内检查更新 → 跳转浏览器下载安装 |
| iOS | PWA | Safari 添加到主屏幕 | 设置 → 版本更新 → 刷新页面 |
| 浏览器 | PWA | 安装到桌面 | 刷新页面自动更新 |

### APK 构建

```powershell
powershell -ExecutionPolicy Bypass -File e:\BH\Android\qing\build-apk.ps1
```

产物：`apks\app-release.apk`（约 10.5 MB，已签名）

### 一键发布（正式版）

```powershell
powershell -ExecutionPolicy Bypass -File e:\BH\Android\qing\publish.ps1 -Version "1.1.1" -Changelog "新增A功能`n优化B体验"
```

自动完成：改配置 → 构建 APK → 版本验证 → Git 推送 → SCP上传APK → 归档历史版本 → 服务器拉取重启 → 健康检查

### 一键发布（Beta 版）

```powershell
powershell -ExecutionPolicy Bypass -File e:\BH\Android\qing\publish-beta.ps1 -Version "1.1.1-beta.1" -Changelog "新增A功能`n优化B体验"
```

自动完成：改 Beta 配置 → 构建 Beta APK → 版本验证 → Git 推送 → SCP上传APK → 归档历史版本 → 服务器拉取重启 → 健康检查（不影响正式版）

### APK 归档

每次发布会同时保存两份 APK：
- `apks/app-beta-latest.apk` / `app-formal-latest.apk` — 最新版（下载链接用这个）
- `apks/archive/app-beta-1.1.1-beta.2.apk` — 带版本号的历史归档（方便回退）

---

## 📜 脚本说明

### 本地脚本

| 脚本 | 作用 | 执行命令 |
|------|------|---------|
| `build-apk.ps1` | 构建 Release APK | `powershell -ExecutionPolicy Bypass -File build-apk.ps1` |
| `publish.ps1` | 一键发布正式版（构建+推送+部署+归档） | `powershell -ExecutionPolicy Bypass -File publish.ps1 -Version "1.1.1" -Changelog "更新内容"` |
| `publish-beta.ps1` | 一键发布 Beta 版（构建+推送+部署+归档） | `powershell -ExecutionPolicy Bypass -File publish-beta.ps1 -Version "1.1.1-beta.1" -Changelog "更新内容"` |
| `build.bat` | 纯静态打包（无后端） | 双击 `build.bat` |
| `build.sh` | 纯静态打包（Linux/macOS） | `./build.sh` |

#### `build-apk.ps1`

**功能：** 同步 Web 资源到 Android 工程 → 构建 Release APK → 复制到 `apks/` 目录

**流程：**
1. 设置环境变量（JDK 21、Android SDK）
2. Clean 旧 build 和 assets/public 目录（确保干净构建）
3. `npx cap copy android` — 同步 `app/` 到 Android 工程
4. `gradlew assembleRelease` — 构建 Release APK（含签名）
5. 复制到 `apks/app-release.apk`

**产物：** `apks\app-release.apk`（约 10.5 MB）

**环境依赖：**
- JDK 21：`C:\Program Files\Microsoft\jdk-21.0.9.10-hotspot`
- Android SDK：`E:\software\Android\SDK`
- Gradle 8.14.3（本地缓存）
- Node.js 22+

#### `publish.ps1`

**功能：** 一键完成版本发布（构建 + 推送 + 部署 + 归档）

**参数：**
- `-Version`：版本号，如 `"1.1.1"`
- `-Changelog`：更新内容，用 `` `n `` 换行分隔多条

**流程（8 步）：**
1. 更新 `app/js/config.js`（版本号 + 通道）+ 所有 HTML 的 `app-channel` meta 标签
2. 更新 `server/app.py` 的版本号/日期/changelog
3. Clean 旧 build + assets/public → Capacitor 同步
4. 构建 Release APK
5. 解压 APK 验证版本号是否正确（不匹配则中止发布）
6. 复制 APK 到 `apks/app-formal-latest.apk` + 归档到 `apks/archive/`
7. Git 提交推送 + SCP 上传 APK（latest + archive）到服务器 + 服务器拉取重启
8. 健康检查验证

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
云服务器 103.100.211.146（Docker）
├─ icube_nginx（Docker Nginx，占 80/443）
│   ├─ 旧项目（原有配置不变）
│   └─ qing6340.duckdns.org:443 → qing-calendar:5000
├─ qing-calendar（Flask 容器，端口 5000）
│   ├─ /api/version?channel=formal  → 正式版版本检查
│   ├─ /api/version?channel=beta    → Beta 版版本检查
│   ├─ /api/download/apk            → 正式版 APK 下载
│   ├─ /api/download/apk/beta       → Beta 版 APK 下载
│   ├─ /api/export                  → 数据导出（生成临时文件）
│   ├─ /api/export/download/<token> → 导出文件下载（1小时过期）
│   ├─ /api/health                  → 健康检查
│   └─ /                            → PWA 静态文件
├─ Let's Encrypt 证书（自动续期）
└─ DuckDNS 域名（qing6340.duckdns.org）
```

### 服务器端口

| 端口 | 用途 | 访问方式 |
|------|------|---------|
| 443 | HTTPS Nginx 反代 | `https://qing6340.duckdns.org` |
| 80 | HTTP Nginx（旧项目） | 旧项目使用 |
| 5000 | Flask 直连 | `http://103.100.211.146:5000` |

### 服务器接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/version` | GET | 返回最新版本信息（支持 `channel=formal/beta` 参数区分通道） |
| `/api/download/apk` | GET | 下载正式版 APK |
| `/api/download/apk/beta` | GET | 下载 Beta 版 APK |
| `/api/export` | POST | 提交 JSON 数据，生成临时导出文件，返回下载链接 |
| `/api/export/download/<token>` | GET | 下载导出的备份文件（1 小时后自动过期删除） |
| `/api/health` | GET | 健康检查 |
| `/` | GET | PWA 首页 |

---

## 💾 数据说明

- **所有数据保存在你的设备本地**，不上传任何服务器
- 数据格式：JSON
- 包含：体重记录、每日打卡、常用打卡、待办事项、日笺随笔、心情记录
- 可随时在设置页导出备份，或从备份文件导入

### 数据字段

| 字段 | 说明 |
|------|------|
| `weights` | 每日体重记录（按日期索引） |
| `checkins` | 每日打卡任务（按日期索引） |
| `commonCheckins` | 常用打卡库（用户自定义） |
| `todos` | 长期待办事项（全局共用，不限日期） |
| `notes` | 日笺随笔（按日期索引） |
| `moods` | 心情选项 |
| `settings` | 应用设置（毒舌模式等） |

> 旧版本字段 `tasks` / `commonTasks` 自动迁移到 `checkins` / `commonCheckins`，数据不丢。

### Beta 通道数据隔离

正式版和 Beta 版使用独立的 localStorage 命名空间，数据互不影响：

| 通道 | 存储 Key | 说明 |
|------|----------|------|
| 正式版 | `qing_data_v1` | 默认通道，兼容现有数据 |
| Beta 版 | `qing_data_v1_beta` | Beta 通道独立存储 |

> 正式版之间升级（如 1.1.0 → 1.1.1）数据无缝迁移，无需重新录入。
> 仅在「正式 ↔ Beta」切换时数据不互通，切换前 APP 会引导导出和导入。

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

### v1.1.1-beta.2 (2026-08-27)
- 修复版本号显示 undefined 的问题（config.js 去掉 BOM + 增加兜底容错）

### v1.1.1-beta.1 (2026-08-27)
- 新增待办事项模块：长期目标，不限日期，全局共用
- 今日待办改名为今日打卡，概念更清晰
- 过去日期未完成打卡显示红叉+灰色，操作有毒舌确认提醒
- 主页底部卡片升级：体重 / 待办 / 打卡三列展示
- 数据结构升级，新旧版本双向兼容，自动迁移

### v1.1.0 (2026-08-27)
- 新增 config.js 统一配置文件，版本号、通道、API地址集中管理
- 版本更新弹窗优化：最新版本与当前版本上下排列，更新内容旁加版本号标识
- Beta 切换弹窗优化：导出备份/直接下载二选一列表，避免同时触发两个下载
- 数据导出改为浏览器下载方案，后端生成临时文件 1 小时自动过期
- 修复 Service Worker 在 APK 环境下误注册导致缓存旧文件的问题
- 新增 @capacitor/browser 插件，导出和下载统一跳转系统浏览器
- 发布脚本优化：clean assets/public 确保干净构建、APK 版本验证、SCP 上传 APK
- 修复 Gradle Daemon 文件占用、stderr 误报、--offline 新插件构建失败等问题
- sw.js 缓存版本升级到 v5，新增 config.js 缓存

### v1.0.1 (2026-08-25)
- 恢复 PWA 离线缓存（iOS 可用）
- 支持 APP 内检查更新并下载安装
- 清理多余开屏资源
- 修复设置页编码问题
- Release APK 签名（约 10.5 MB）
- Capacitor 双端方案（Android APK + iOS PWA）
- 开屏动画（1 秒）
- 自定义返回键逻辑（子页面返回来源页，主页再按一次退出）
- 服务器端口 5000 对外开放（IP 直连下载）

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
