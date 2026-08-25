# 轻 · 日历 QING

> 极简体重记录与待办工具 · 纸墨质感设计

一款简约不简单的体重日历应用，低调又高级。记录每日体重，管理每日待办，书写日笺随笔。数据全部本地存储，无需注册登录。

---

## ✨ 功能特性

### 📅 体重日历
- 日历形式展示每日体重（日期 + 体重 + 变化量 三行显示）
- 左右滑动 / 点击年月切换月份，年月滚轮选择器
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
- 版本更新检查
- 清空所有数据

---

## 🛠 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | HTML + CSS + 原生 JS | 无框架依赖，加载快 |
| 数据存储 | localStorage | 数据全部保存在本地 |
| PWA | Service Worker + Manifest | 可安装到手机桌面，离线可用 |
| 后端 | Python Flask | 极简后端，仅提供版本检查等接口 |
| 部署 | Docker / Nginx / 静态托管 | 灵活选择 |
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
│   │   └── messages.js      # 文案库（毒舌 + 鼓励）
│   ├── icons/               # 应用图标
│   ├── manifest.json        # PWA 清单
│   └── sw.js                # Service Worker
├── server/                  # Python 后端
│   ├── app.py               # Flask 应用
│   ├── requirements.txt     # Python 依赖
│   └── generate_icon.py     # 图标生成脚本
├── design/                  # 设计稿（开发阶段）
├── Dockerfile               # Docker 镜像配置
├── docker-compose.yml       # Docker Compose 配置
├── build.bat                # Windows 打包脚本
├── build.sh                 # Linux/macOS 打包脚本
├── DEPLOY.md                # 部署与构建指南
└── README.md                # 项目说明
```

---

## 🚀 快速开始

### 方式一：Flask 后端（推荐，最完整）

```bash
cd qing/server
pip install -r requirements.txt
python app.py
```

访问 http://localhost:5000

### 方式二：纯静态服务器

```bash
cd qing/app
python -m http.server 8000
```

访问 http://localhost:8000

### 方式三：Docker 一键部署

```bash
cd qing
docker compose up -d
```

访问 http://localhost:5000

> 详细的部署方案见 [DEPLOY.md](DEPLOY.md)

---

## 📦 构建打包

应用无需编译，打包即复制文件。

**Windows：**
```bash
双击 build.bat
```

**Linux / macOS：**
```bash
./build.sh
```

产出 `qing-calendar-v1.0.0.zip`（或 `.tar.gz`），可直接分发或上传服务器。

---

## 📱 安装到桌面（当原生应用用）

### iOS (Safari)
1. Safari 打开网站
2. 底部分享按钮 →「添加到主屏幕」
3. 命名后点「添加」

### Android (Chrome)
1. Chrome 打开网站
2. 菜单 →「安装应用」或「添加到主屏幕」

### 桌面 (Chrome / Edge)
1. 地址栏右侧安装图标（⊕）
2. 点击「安装」
3. 以独立窗口运行，离线可用

安装后体验等同原生应用，完全离线可用。

---

## 🌐 部署方案

| 方案 | 适用场景 | 说明 |
|------|----------|------|
| 纯静态托管 | 个人使用 | 上传 `app/` 到 Nginx / GitHub Pages / Vercel |
| Flask + Gunicorn | 生产环境 | Nginx 反向代理 + Gunicorn 多进程 |
| Docker | 容器化部署 | `docker compose up -d` 一键启动 |
| systemd 常驻 | Linux 服务器 | 后台服务，自动重启 |

详见 [DEPLOY.md](DEPLOY.md)

---

## 💾 数据说明

- **所有数据保存在你的浏览器本地**，不上传任何服务器
- 数据格式：JSON
- 包含：体重记录、待办任务、常用任务、日笺随笔、心情记录
- 可随时在设置页导出备份，或从备份文件导入

> 清除浏览器数据会导致所有记录丢失，请定期导出备份。

---

## 🎨 设计理念

**纸墨·温暖米白风**
- 米白纸质感背景，配合细微颗粒纹理
- 焦糖色点缀，温暖不刺眼
- 思源宋体标题 + 思源黑体正文
- 柔和阴影，丝滑过渡动效
- 简约不简单，低调又高级

---

## 🔧 开发说明

### 数据层 (storage.js)
统一封装所有数据操作，调用方式：

```javascript
// 体重
Store.setWeight('2026-8-25', 62.5, '09:00')
Store.getWeight('2026-8-25')
Store.getPrevWeight('2026-8-25')

// 任务
Store.addTask('2026-8-25', '跑步')
Store.completeTask('2026-8-25', taskId)
Store.reorderTasks('2026-8-25', fromIndex, toIndex)

// 常用任务
Store.getCommonTasks()
Store.addCommonTask('喝水')

// 日笺
Store.setNote('2026-8-25', { text: '...', mood: 'happy' })

// 导入导出
Store.exportData()
Store.importData(jsonString)
```

### 文案库 (messages.js)
根据不同场景返回随机文案：

```javascript
Messages.getWeightMessage(diff)          // 体重变化文案
Messages.getProgressMessage(total, done)  // 待办进度文案
Messages.getWeightReminder()              // 未记录提醒
Messages.getTaskComplete()                // 完成任务小鼓励
```

---

## 📋 版本历史

### v1.0.0 (2026-08-25)
- 🎉 首次发布
- 📅 体重日历记录与展示
- ✅ 每日待办清单与常用任务
- 📝 日笺随笔与心情记录
- 💾 数据本地存储 + 导入导出
- 🎨 纸墨质感设计
- 📱 PWA 支持，可安装到桌面
- 🐳 Docker 部署支持
- 📦 一键打包脚本

---

## 📄 License

MIT License - 自由使用，自由修改。

---

**愿你每天都比昨天更轻盈一点。** ☕
