---
name: "qing-publish"
description: "轻日历一键发布技能，支持正式版和 Beta 版发布，自动更新版本号、构建APK、更新README、git推送、服务器部署。Invoke when user asks to publish, 发版, 发布正式版, 发beta版, or deploy the app."
---

# 轻日历发布助手

「轻 · 日历」项目的一键发布工具，支持正式版和 Beta 版。

## 触发时机

- 用户说"发布"、"发版"、"发正式版"、"发 beta 版"
- 用户说"部署"、"上线"
- 用户说"更新版本"

## 项目信息

- 项目目录：`e:\BH\Android\qing`
- 正式发布脚本：`publish.ps1`
- Beta 发布脚本：`publish-beta.ps1`
- 服务器地址：`bh@103.100.211.146`
- 服务器目录：`~/qing`
- 服务器部署命令：`cd ~/qing && git pull && docker compose restart`
- 健康检查：`https://qing6340.duckdns.org/api/health`

## 发布流程

### 第一步：确认发布信息

向用户确认以下信息：

| 信息 | 说明 |
|------|------|
| **发布类型** | 正式版 / Beta 版 |
| **版本号** | 正式版：`1.0.2` / `1.1.0`<br>Beta 版：`1.1.0-beta.1` / `1.1.0-beta.2` |
| **更新内容** | changelog 列表（可调用 qing-changelog 技能生成） |

如果用户没给 changelog，先调用 qing-changelog 技能生成，再让用户确认。

### 第二步：预览并确认

展示发布预览：

```
即将发布：v1.1.0-beta.1（Beta 版）
更新内容：
  1. 新增 Beta 测试计划
  2. 优化日历切换动画
  3. 修复时间滚轮越界

确认发布吗？
```

用户确认后再执行。

### 第三步：执行发布

#### 正式版发布

调用 `publish.ps1` 脚本：
```powershell
powershell -ExecutionPolicy Bypass -File publish.ps1 -Version "X.Y.Z" -Changelog "line1`nline2`nline3"
```

脚本自动完成：
1. 更新 `settings.html` 的 `APP_VERSION`
2. 更新所有 HTML 页面的 `meta name="app-channel"` 为 `content="formal"`
3. 更新 `server/app.py` 的 `LATEST_VERSION`、release_date、changelog
4. `npx cap copy android` 同步代码
5. 构建 Release APK
6. 复制 APK 到 `apks/app-release.apk`
7. Git add + commit + push
8. SSH 服务器 `git pull && docker compose restart`

#### Beta 版发布

调用 `publish-beta.ps1` 脚本：
```powershell
powershell -ExecutionPolicy Bypass -File publish-beta.ps1 -Version "X.Y.Z-beta.N" -Changelog "line1`nline2`nline3"
```

脚本自动完成：
1. 更新 `server/app.py` 的 `LATEST_BETA_VERSION`
2. 更新 `settings.html` 的 `APP_VERSION`
3. 更新所有 HTML 页面的 `meta name="app-channel"` 为 `content="beta"`
4. `npx cap copy android` 同步代码
5. 构建 Release APK
6. 复制 APK 到 `apks/app-beta-{version}.apk` 和 `apks/app-beta-latest.apk`
7. Git add + commit + push
8. SSH 服务器 `git pull && docker compose restart`

### 第四步：更新 README.md

**正式版**需要更新 README.md 的版本历史：
1. 在"版本历史"章节最上方插入新版本
2. 格式：`### vX.Y.Z (YYYY-MM-DD)`
3. 下面列 changelog

**Beta 版不需要更新 README.md**（保持简洁）。

> 注意：脚本本身不会自动更新 README，发布完成后需要手动补上，或者在发布前先改好 README 再发布。

### 第五步：验证

发布完成后：
1. 调用健康检查接口验证服务正常：`https://qing6340.duckdns.org/api/health`
2. 调用版本接口验证版本号正确：`https://qing6340.duckdns.org/api/version`
3. 展示发布结果

### 第六步：输出报告

```
✅ 发布成功！

  版本：v1.1.0-beta.1（Beta 版）
  APK：xx.x MB
  日期：2026-08-26

  测试地址：https://qing6340.duckdns.org
  健康检查：正常

  更新内容：
  - ...
  - ...
```

## 注意事项

- **语言**：始终用中文
- **安全**：不要在输出中暴露密码、密钥等敏感信息
- **确认**：执行发布前必须让用户确认，不能擅自发布
- **回滚**：如果发布失败，提示用户可以 `git revert` 回滚
- **README 更新**：正式版发布后提醒用户要不要顺便更新 README 版本历史
- **服务器**：确保 SSH 免密登录可用，docker 命令无需 sudo
- **通道机制**：通道由 APK 中的 `meta name="app-channel"` 标签决定，不再通过 localStorage 手动切换。用户切换版本通过下载安装另一个 APK 实现
- **Capacitor 插件**：settings.html 中通过 `Capacitor.registerPlugin('Filesystem')` 和 `Capacitor.registerPlugin('FileOpener')` 注册插件，不依赖 ES module import
