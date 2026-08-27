# -*- coding: utf-8 -*-
"""
QING Weight Calendar Backend
Flask backend: version check + APK download + static hosting
"""

from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
import os
import uuid
import time
import json

app = Flask(__name__, static_folder='../app', static_url_path='')
CORS(app)

APP_VERSION = "1.1.0"
APK_DIR = os.path.join(os.path.dirname(__file__), '..', 'apks')
EXPORT_DIR = os.path.join(os.path.dirname(__file__), '..', 'export_tmp')
EXPORT_TTL_SECONDS = 3600  # 临时文件保留 1 小时
_export_store = {}  # {token: {"file_path": str, "expire_at": float, "filename": str}}

# === LATEST_VERSION_START ===
LATEST_VERSION = {
    "version": "1.1.0",
    "release_date": "2026-08-27",
    "changelog": [
        "新增config.js统一配置文件，版本号通道API地址集中管理",
        "版本更新弹窗优化：最新版本与当前版本上下排列",
        "Beta切换弹窗优化：导出备份/直接下载二选一列表",
        "导出数据改为浏览器下载，后端生成临时文件1小时自动过期",
        "修复Service Worker在APK环境下误注册导致缓存旧文件的问题",
        "修复发布脚本构建缓存和stderr误报等问题"
    ],
    "apk_url": "/api/download/apk",
    "is_force_update": False,
    "min_version": "1.0.0"
}
# === LATEST_VERSION_END ===

# === LATEST_BETA_VERSION_START ===
LATEST_BETA_VERSION = {
    "version": "1.1.1-beta.2",
    "release_date": "2026-08-27",
    "changelog": [
        "修复版本号显示undefined的问题",
        "新增待办事项模块，长期目标不限日期全局共用",
        "今日待办改名为今日打卡，概念更清晰",
        "过去日期未完成打卡显示红叉灰色，操作有毒舌确认提醒",
        "主页底部卡片升级：体重待办打卡三列展示"
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
    apk_path = os.path.join(APK_DIR, 'app-formal-latest.apk')
    if not os.path.exists(apk_path):
        apk_path = os.path.join(APK_DIR, 'app-release.apk')
    if not os.path.exists(apk_path):
        return jsonify({"error": "APK not found"}), 404
    return send_from_directory(
        APK_DIR,
        os.path.basename(apk_path),
        as_attachment=True,
        download_name='qing-calendar.apk'
    )


@app.route('/api/download/apk/beta')
def download_beta_apk():
    apk_path = os.path.join(APK_DIR, 'app-beta-latest.apk')
    if not os.path.exists(apk_path):
        apk_path = os.path.join(APK_DIR, 'app-release.apk')
    if not os.path.exists(apk_path):
        return jsonify({"error": "Beta APK not found"}), 404
    return send_from_directory(
        APK_DIR,
        os.path.basename(apk_path),
        as_attachment=True,
        download_name='qing-calendar-beta.apk'
    )


def _cleanup_expired_exports():
    """清理过期的导出文件"""
    now = time.time()
    expired = [t for t, info in _export_store.items() if info["expire_at"] < now]
    for token in expired:
        info = _export_store.pop(token)
        try:
            if os.path.exists(info["file_path"]):
                os.remove(info["file_path"])
        except OSError:
            pass


@app.route('/api/export', methods=['POST'])
def create_export():
    """接收前端数据，生成临时文件，返回下载链接"""
    _cleanup_expired_exports()

    data = request.get_data(as_text=True)
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # 基本校验：必须是合法 JSON
    try:
        json.loads(data)
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON data"}), 400

    # 大小限制：5MB
    if len(data) > 5 * 1024 * 1024:
        return jsonify({"error": "Data too large"}), 413

    os.makedirs(EXPORT_DIR, exist_ok=True)

    token = uuid.uuid4().hex
    now = time.strftime("%Y%m%d")
    filename = f"qing-backup-{now}.json"
    file_path = os.path.join(EXPORT_DIR, f"{token}.json")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(data)

    _export_store[token] = {
        "file_path": file_path,
        "expire_at": time.time() + EXPORT_TTL_SECONDS,
        "filename": filename
    }

    return jsonify({
        "token": token,
        "download_url": f"/api/export/download/{token}",
        "expire_in": EXPORT_TTL_SECONDS
    })


@app.route('/api/export/download/<token>')
def download_export(token):
    """下载导出的备份文件"""
    _cleanup_expired_exports()

    info = _export_store.get(token)
    if not info:
        return jsonify({"error": "Export not found or expired"}), 404

    if time.time() > info["expire_at"]:
        _export_store.pop(token, None)
        try:
            if os.path.exists(info["file_path"]):
                os.remove(info["file_path"])
        except OSError:
            pass
        return jsonify({"error": "Export expired"}), 404

    if not os.path.exists(info["file_path"]):
        _export_store.pop(token, None)
        return jsonify({"error": "File not found"}), 404

    return send_from_directory(
        EXPORT_DIR,
        os.path.basename(info["file_path"]),
        as_attachment=True,
        download_name=info["filename"]
    )


@app.route('/api/health')
def health():
    return jsonify({
        "status": "ok",
        "version": APP_VERSION,
        "service": "qing-calendar"
    })


def compare_versions(v1, v2):
    """1 if v1 > v2, -1 if v1 < v2, 0 if equal. Supports beta suffix."""
    import re
    def parse(v):
        m = re.match(r'^(\d+)\.(\d+)\.(\d+)(?:-beta\.(\d+))?$', v)
        if m:
            major, minor, patch, beta = m.groups()
            return (int(major), int(minor), int(patch), int(beta) if beta else None)
        parts = []
        for x in v.split('.'):
            try:
                parts.append(int(x))
            except ValueError:
                parts.append(0)
        while len(parts) < 4:
            parts.append(0)
        return tuple(parts[:3]) + (None,)

    p1 = parse(v1)
    p2 = parse(v2)

    for i in range(3):
        if p1[i] > p2[i]: return 1
        if p1[i] < p2[i]: return -1

    b1, b2 = p1[3], p2[3]
    if b1 is None and b2 is None: return 0
    if b1 is None: return 1
    if b2 is None: return -1
    if b1 > b2: return 1
    if b1 < b2: return -1
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
