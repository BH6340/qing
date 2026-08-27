---
name: "qing-publish"
description: "轻日历发布技能，支持正式版和 Beta 版发布，生成 PowerShell 一键发布指令供用户手动执行。Invoke when user asks to publish, 发版, 发布正式版, 发beta版, or deploy the app."
---

# 轻日历发布助手

「轻 · 日历」项目的发布工具，支持正式版和 Beta 版。
**当前模式：生成 PowerShell 指令，由用户手动执行**。等流程稳定后再改为自动运行。

## 触发时机

- 用户说"发布"、"发版"、"发正式版"、"发 beta 版"
- 用户说"部署"、"上线"
- 用户说"更新版本"

## 项目信息

- 项目目录：`e:\BH\Android\qing`
- 正式发布脚本：`publish.ps1`
- Beta 发布脚本：`publish-beta.ps1`
- 配置文件：`app/js/config.js`（版本号、通道、API地址统一管理）
- 服务器地址：`bh@103.100.211.146`
- 服务器目录：`~/qing`

## 发布流程

### 第一步：确认发布信息

向用户确认以下信息：

| 信息 | 说明 |
|------|------|
| **发布类型** | 正式版 / Beta 版 |
| **版本号** | 正式版：`1.0.2` / `1.1.0`<br>Beta 版：`1.1.0-beta.1` / `1.1.0-beta.2` |
| **更新内容** | changelog 列表（可调用 qing-changelog 技能生成） |

如果用户没给 changelog，先调用 qing-changelog 技能生成，再让用户确认。

### 第二步：预览并生成指令

展示发布预览，然后生成对应的 PowerShell 命令：

**预览格式：**
```
即将发布：v1.1.0-beta.1（Beta 版）
更新内容：
  1. 新增 Beta 测试计划
  2. 优化日历切换动画
  3. 修复时间滚轮越界

确认信息正确吗？我给你生成发布指令。
```

用户确认后，生成命令（只生成，不执行）：

#### 正式版发布命令

```powershell
cd e:\BH\Android\qing
powershell -ExecutionPolicy Bypass -File publish.ps1 -Version "X.Y.Z" -Changelog "更新内容1`n更新内容2`n更新内容3"
```

#### Beta 版发布命令

```powershell
cd e:\BH\Android\qing
powershell -ExecutionPolicy Bypass -File publish-beta.ps1 -Version "X.Y.Z-beta.N" -Changelog "更新内容1`n更新内容2`n更新内容3"
```

### 第三步：说明脚本做了什么

告诉用户脚本会自动完成以下步骤：

| 步骤 | 说明 |
|------|------|
| 1 | 更新 `app/js/config.js` 的版本号和通道 |
| 2 | 更新 `server/app.py` 的版本信息（LATEST_VERSION / LATEST_BETA_VERSION） |
| 3 | Clean 旧构建缓存（删除 `android/app/build/`） |
| 4 | `npx cap copy android` 同步 Web 资源 |
| 5 | Gradle 构建 Release APK |
| 6 | 验证 APK 内的版本号是否正确（不匹配则中止） |
| 7 | 复制 APK 到 `apks/app-formal-latest.apk` 或 `apks/app-beta-latest.apk` |
| 8 | Git add + commit + push（只推代码，APK 在 .gitignore） |
| 9 | SCP 上传 APK 到服务器 |
| 10 | SSH 服务器 `git pull && docker compose restart` |
| 11 | 健康检查验证 |

### 第四步：提醒注意事项

- 运行前确保 SSH 免密登录可用
- 运行前确保 git 工作区干净（没有未提交的改动）
- 脚本会自动 clean 旧构建，所以第一次构建会慢一点（约 2-3 分钟）
- 如果构建失败，脚本会立即中止，不会继续部署

## 注意事项

- **语言**：始终用中文，包括 changelog 内容
- **安全**：不要在输出中暴露密码、密钥等敏感信息
- **只生成指令**：当前模式下只生成 PowerShell 命令，不直接执行
- **README 更新**：正式版发布后提醒用户要不要顺便更新 README 版本历史
- **配置集中**：版本号和通道只在 `app/js/config.js` 管理，发布脚本只改这一个文件
- **构建验证**：脚本构建后会解压 APK 检查 config.js 中的版本号，不匹配直接中止
- **导出功能**：导出采用四重回退（Filesystem+FileOpener → Web Share → 剪贴板 → 浏览器下载）
- **APK 管理**：服务器上只保留 latest 文件，每次发布覆盖
