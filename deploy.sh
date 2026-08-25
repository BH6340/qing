#!/bin/bash
# 轻·日历 部署脚本
# 用法: sudo ./deploy.sh

set -e

cd ~/qing

echo ">>> 拉取最新代码"
git pull

echo ">>> 重启容器"
docker compose down
docker compose up -d --build

echo ">>> 部署完成: https://qing6340.duckdns.org"
