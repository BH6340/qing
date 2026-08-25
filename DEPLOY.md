# 轻 · 日历 — 部署与构建指南

> 本文档涵盖本地运行、打包构建、服务器部署、Docker 部署、PWA 安装等全部流程。

---

## 一、环境要求

| 项目 | 要求 |
|------|------|
| Python | 3.8+（推荐 3.12） |
| 浏览器 | Chrome / Edge / Safari（支持 PWA） |
| 磁盘 | < 5MB（极轻量） |

无 Node.js 依赖，无编译步骤，开箱即用。

---

## 二、本地运行

### 方式 A：Flask 后端（推荐，功能最完整）

```bash
cd qing/server
pip install -r requirements.txt
python app.py
```

访问 http://localhost:5000

### 方式 B：纯静态服务器

```bash
cd qing/app
python -m http.server 8000
```

访问 http://localhost:8000

> 纯静态模式下，版本检查接口不可用，其余功能正常。

### 方式 C：直接打开

双击 `app/index.html` 即可。

> `file://` 协议下部分浏览器限制 localStorage，建议用上述服务器方式。

---

## 三、构建打包

应用无需编译，打包 = 复制 `app/` 目录 + `server/` 目录。

### Windows

```bash
# 双击运行
build.bat
```

或手动执行：

```powershell
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path dist
Copy-Item -Recurse app dist\app
Copy-Item -Recurse server dist\server
Copy-Item README.md dist\
Compress-Archive -Path dist\* -DestinationPath qing-calendar-v1.0.0.zip -Force
```

产出：`qing-calendar-v1.0.0.zip`

### Linux / macOS

```bash
chmod +x build.sh
./build.sh
```

产出：`qing-calendar-v1.0.0.tar.gz`

### 打包产物结构

```
dist/
├── app/              # 前端（可直接部署到任意静态服务器）
├── server/           # 后端（Flask）
└── README.md
```

---

## 四、服务器部署

### 4.1 纯静态部署（最简单）

将 `app/` 目录上传到任意静态服务器即可。

**Nginx 配置示例：**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/qing/app;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Service Worker 不缓存
    location = /sw.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

适用平台：Nginx / Apache / GitHub Pages / Vercel / Netlify / Cloudflare Pages

> 纯静态部署不支持版本检查接口，可忽略或自行接入。

### 4.2 Flask + Gunicorn 部署（推荐生产环境）

```bash
# 安装依赖
cd qing/server
pip install -r requirements.txt
pip install gunicorn

# 启动（4 worker，监听 5000）
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

**Nginx 反向代理配置：**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4.3 后台常驻（systemd）

创建 `/etc/systemd/system/qing.service`：

```ini
[Unit]
Description=Qing Weight Calendar
After=network.target

[Service]
User=www
WorkingDirectory=/opt/qing/server
ExecStart=/opt/qing/venv/bin/gunicorn -w 4 -b 0.0.0.0:5000 app:app
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable qing
sudo systemctl start qing
```

---

## 五、Docker 部署

### 5.1 构建镜像

```bash
cd qing
docker build -t qing-calendar:1.0.0 .
```

### 5.2 运行容器

```bash
docker run -d \
  --name qing \
  -p 5000:5000 \
  --restart unless-stopped \
  qing-calendar:1.0.0
```

访问 http://localhost:5000

### 5.3 Docker Compose

```bash
docker compose up -d
```

停止：`docker compose down`

---

## 六、PWA 安装（当原生应用用）

### 手机安装

**iOS (Safari)：**
1. Safari 打开网站
2. 底部分享按钮 → 「添加到主屏幕」
3. 命名后点「添加」

**Android (Chrome)：**
1. Chrome 打开网站
2. 菜单 → 「安装应用」或「添加到主屏幕」

### 桌面安装

**Chrome / Edge：**
1. 地址栏右侧出现安装图标（⊕）
2. 点击 → 「安装」
3. 应用以独立窗口运行，可在开始菜单/启动台找到

安装后完全离线可用，体验等同原生应用。

---

## 七、数据说明

- 所有数据存储在浏览器的 localStorage 中
- 不同设备、不同浏览器数据不互通
- 清除浏览器数据会导致丢失，请定期导出备份
- 设置页 → 导出数据 → 保存 JSON 文件
- 换设备时：设置页 → 导入数据 → 选择备份文件

---

## 八、版本更新流程

1. 修改 `server/app.py` 中 `LATEST_VERSION` 字段
2. 更新 `app/js/storage.js` 中 `version` 字段
3. 重启服务
4. 用户在设置页检查更新时自动获取新版本信息
