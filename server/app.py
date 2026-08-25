# -*- coding: utf-8 -*-
"""
QING Weight Calendar Backend
Flask backend: version check + APK download + static hosting
"""

from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
import os

app = Flask(__name__, static_folder='../app', static_url_path='')
CORS(app)

APP_VERSION = "1.0.1"
APK_DIR = os.path.join(os.path.dirname(__file__), '..', 'apks')

LATEST_VERSION = {
    "version": "1.0.1",
    "release_date": "2026-08-25",
    "changelog": [
        "恢复PWA离线缓存（iOS可用）",
        "支持APP内检查更新并下载安装",
        "清理多余开屏资源"
    ],
    "apk_url": "/api/download/apk",
    "is_force_update": False,
    "min_version": "1.0.0"
}


@app.route('/')
def index():
    return send_from_directory('../app', 'index.html')


@app.route('/api/version')
def check_version():
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
    return jsonify({
        "status": "ok",
        "version": APP_VERSION,
        "service": "qing-calendar"
    })


def compare_versions(v1, v2):
    """1 if v1 > v2, -1 if v1 < v2, 0 if equal"""
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
    print("  QING Calendar Backend")
    print(f"  Version: v{APP_VERSION}")
    print("=" * 50)
    print()
    print("  http://localhost:5000")
    print("  http://localhost:5000/api/version")
    print("  http://localhost:5000/api/download/apk")
    print("  http://localhost:5000/api/health")
    print()
    print("=" * 50)
    print()

    app.run(
        host='0.0.0.0',
        port=5000,
        debug=False
    )
