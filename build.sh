#!/bin/bash
set -e

VERSION="1.0.0"
OUTPUT="dist"
TAR="qing-calendar-v${VERSION}.tar.gz"

echo "========================================"
echo "  轻 · 日历 — 打包构建 v${VERSION}"
echo "========================================"
echo

rm -rf "$OUTPUT" "$TAR" 2>/dev/null || true
mkdir -p "$OUTPUT"

echo "[1/4] 复制前端文件..."
cp -r app "$OUTPUT/app"

echo "[2/4] 复制后端文件..."
cp -r server "$OUTPUT/server"
rm -rf "$OUTPUT/server/__pycache__" 2>/dev/null || true

echo "[3/4] 复制文档..."
cp README.md "$OUTPUT/"
cp DEPLOY.md "$OUTPUT/"

echo "[4/4] 压缩打包..."
tar czf "$TAR" -C "$OUTPUT" .

echo
echo "========================================"
echo "  构建完成!"
echo "  输出目录: $OUTPUT/"
echo "  压缩包: $TAR"
echo "========================================"
