"""
�?· 日历 - 后端服务
QING Weight Calendar Backend

极简 Flask 后端，提供：
- 版本检查接�?- APK 下载接口
- 静态文件托管（PWA 备用�?
运行: python app.py
访问: http://localhost:5000
"""

from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
import os

app = Flask(__name__, static_folder='../app', static_url_path='')
CORS(app)

# 应用版本
APP_VERSION = "1.0.1"

# APK 目录
APK_DIR = os.path.join(os.path.dirname(__file__), '..', 'apks')

# 最新版本信�?LATEST_VERSION = {
    "version": "1.0.1",
    "release_date: "2026-08-25",
    "changelog: [
        "�ָ�PWA���߻��棨iOS���ã�
֧��APP�ڼ����²����ذ�װ
�������࿪����Դ"
    ],
    "apk_url": "/api/download/apk",
    "is_force_update": False,
    "min_version": "1.0.0"
}


@app.route('/')
def index():
    """首页 - 返回日历页面"""
    return send_from_directory('../app', 'index.html')


@app.route('/api/version')
def check_version():
    """
    版本检查接�?    GET /api/version?current=1.0.0
    """
    current_version = request.args.get('current', '')

    latest = LATEST_VERSION["version"]
    has_update = compare_versions(latest, current_version) > 0 if current_version else False

    return jsonify({
        "latest": latest,
        "has_update": has_update,
        "release_date": LATEST_VERSION["release_date"],
        "changelog": LATEST_VERSION["changelog"],
        "apk_url": LATEST_VERSION["apk_url"],
        "is_force_update": LATEST_VERSION["is_force_update"],
        "min_version": LATEST_VERSION["min_version"]
    })


@app.route('/api/download/apk')
def download_apk():
    """APK 下载接口"""
    apk_path = os.path.join(APK_DIR, 'app-release.apk')
    if not os.path.exists(apk_path):
        apk_path = os.path.join(APK_DIR, 'app-debug.apk')
    if not os.path.exists(apk_path):
        return jsonify({"error": "APK not found"}), 404

    return send_from_directory(
        os.path.dirname(apk_path),
        os.path.basename(apk_path),
        as_attachment=True,
        download_name='qing-calendar.apk'
    )


@app.route('/api/health')
def health():
    """健康检�?""
    return jsonify({
        "status": "ok",
        "version": APP_VERSION,
        "service": "qing-calendar"
    })


def compare_versions(v1, v2):
    """比较版本�? 1 if v1 > v2, -1 if v1 < v2, 0 if equal"""
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
    print("  �?· 日历 后端服务")
    print(f"  版本: v{APP_VERSION}")
    print("=" * 50)
    print()
    print("  访问地址: http://localhost:5000")
    print("  版本检�? http://localhost:5000/api/version")
    print("  APK下载: http://localhost:5000/api/download/apk")
    print("  健康检�? http://localhost:5000/api/health")
    print()
    print("  �?Ctrl+C 停止服务")
    print("=" * 50)
    print()

    app.run(
        host='0.0.0.0',
        port=5000,
        debug=False
    )
