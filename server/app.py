"""
轻 · 日历 - 后端服务
QING Weight Calendar Backend

极简 Flask 后端，提供：
- 版本检查接口
- 静态文件托管（可选）

运行: python app.py
访问: http://localhost:5000
"""

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__, static_folder='../app', static_url_path='')
CORS(app)

# 应用版本
APP_VERSION = "1.0.0"

# 最新版本信息（实际项目中可以从配置文件或数据库读取）
LATEST_VERSION = {
    "version": "1.0.0",
    "release_date": "2026-08-25",
    "changelog": [
        "体重日历记录，直观显示每日变化",
        "每日待办清单，支持常用任务快速添加",
        "日笺随笔，记录心情与每日感想",
        "数据本地存储，支持导入导出",
        "简约纸墨风格设计"
    ],
    "download_url": "",
    "is_force_update": False
}


@app.route('/')
def index():
    """首页 - 返回日历页面"""
    return send_from_directory('../app', 'index.html')


@app.route('/api/version')
def check_version():
    """
    版本检查接口
    GET /api/version?current=1.0.0
    
    返回:
    {
        "latest": "1.0.0",
        "has_update": false,
        "release_date": "2026-08-25",
        "changelog": [...],
        "download_url": "",
        "is_force_update": false
    }
    """
    current_version = app.config.get('CURRENT_VERSION', '')
    
    latest = LATEST_VERSION["version"]
    has_update = compare_versions(latest, current_version) > 0 if current_version else False
    
    return jsonify({
        "latest": latest,
        "has_update": has_update,
        "release_date": LATEST_VERSION["release_date"],
        "changelog": LATEST_VERSION["changelog"],
        "download_url": LATEST_VERSION["download_url"],
        "is_force_update": LATEST_VERSION["is_force_update"]
    })


@app.route('/api/health')
def health():
    """健康检查"""
    return jsonify({
        "status": "ok",
        "version": APP_VERSION,
        "service": "qing-calendar"
    })


def compare_versions(v1, v2):
    """
    比较版本号
    返回: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
    """
    try:
        parts1 = [int(x) for x in v1.split('.')]
        parts2 = [int(x) for x in v2.split('.')]
        max_len = max(len(parts1), len(parts2))
        parts1 += [0] * (max_len - len(parts1))
        parts2 += [0] * (max_len - len(parts2))
        for a, b in zip(parts1, parts2):
            if a > b:
                return 1
            if a < b:
                return -1
        return 0
    except:
        return 0


if __name__ == '__main__':
    print("=" * 50)
    print("  轻 · 日历 后端服务")
    print(f"  版本: v{APP_VERSION}")
    print("=" * 50)
    print()
    print("  访问地址: http://localhost:5000")
    print("  前端页面: http://localhost:5000/index.html")
    print("  版本检查: http://localhost:5000/api/version")
    print("  健康检查: http://localhost:5000/api/health")
    print()
    print("  按 Ctrl+C 停止服务")
    print("=" * 50)
    print()
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=False
    )
