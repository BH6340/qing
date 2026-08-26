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

# === LATEST_VERSION_START ===
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
# === LATEST_VERSION_END ===

# === LATEST_BETA_VERSION_START ===
LATEST_BETA_VERSION = {
    "version": "1.1.0-beta.2",
    "release_date": "2026-08-27",
    "changelog": [
        "Fix export data (Filesystem plugin register + EXTERNAL directory)",
        "Beta switch to download APK instead of channel switch",
        "Remove channel switch code",
        "Fix publish script encoding"
    ],
    "apk_url": "/api/download/apk/beta",
    "is_force_update": False,
    "min_version": "1.0.0"
}
# === LATEST_BETA_VERSION_END ===


@app.route('/')
def index():
    return send_from_directory('../app', 'index.html')


@app.route('/api/version')
def check_version():
    current_version = request.args.get('current', '')
    channel = request.args.get('channel', 'formal')  # formal / beta

    if channel == 'beta' and LATEST_BETA_VERSION.get('version'):
        info = LATEST_BETA_VERSION
    else:
        info = LATEST_VERSION

    latest = info["version"]
    has_update = compare_versions(latest, current_version) > 0 if current_version else False
    return jsonify({
        "latest": latest,
        "has_update": has_update,
        "release_date": info["release_date"],
        "changelog": info["changelog"],
        "apk_url": info["apk_url"],
        "is_force_update": info["is_force_update"],
        "min_version": info["min_version"],
        "channel": channel
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


@app.route('/api/download/apk/beta')
def download_beta_apk():
    # Find the latest beta apk in apks directory
    beta_apks = []
    if os.path.exists(APK_DIR):
        for f in os.listdir(APK_DIR):
            if f.startswith('app-beta') and f.endswith('.apk'):
                full_path = os.path.join(APK_DIR, f)
                beta_apks.append((os.path.getmtime(full_path), full_path))
    if beta_apks:
        beta_apks.sort(reverse=True)
        apk_path = beta_apks[0][1]
    else:
        # fallback to release
        apk_path = os.path.join(APK_DIR, 'app-release.apk')
    if not os.path.exists(apk_path):
        return jsonify({"error": "Beta APK not found"}), 404
    return send_from_directory(
        os.path.dirname(apk_path),
        os.path.basename(apk_path),
        as_attachment=True,
        download_name='qing-calendar-beta.apk'
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
