#!/bin/bash

# GitHub仓库初始化脚本
# 用法: ./GITHUB_SETUP.sh <your_github_username>

set -e

if [ -z "$1" ]; then
    echo "错误: 请提供你的GitHub用户名"
    echo "用法: ./GITHUB_SETUP.sh YOUR_GITHUB_USERNAME"
    exit 1
fi

GITHUB_USERNAME="$1"
REPO_NAME="freight-tracing-app"

echo "🚢 Maritime Logistics Dashboard - GitHub设置"
echo "============================================"
echo ""
echo "GitHub用户名: $GITHUB_USERNAME"
echo "仓库名称: $REPO_NAME"
echo ""

# 检查是否已经是Git仓库
if [ ! -d ".git" ]; then
    echo "📦 初始化Git仓库..."
    git init
    echo "✅ Git仓库已初始化"
else
    echo "✅ Git仓库已存在"
fi

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo ""
    echo "📝 添加所有文件..."
    git add .
    
    echo "💾 提交更改..."
    git commit -m "Initial commit: Maritime Logistics Dashboard v1.0

Features:
- Real-time vessel tracking with Leaflet.js
- Multi-modal route optimization
- HS code lookup and product management
- Cloudflare Pages deployment ready
- Complete documentation

Tech Stack: Vite, Vanilla JS, Leaflet, Cloudflare Pages"
    echo "✅ 更改已提交"
else
    echo "✅ 没有待提交的更改"
fi

# 设置远程仓库
REMOTE_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

if git remote | grep -q "origin"; then
    echo ""
    echo "🔄 更新远程仓库URL..."
    git remote set-url origin "$REMOTE_URL"
else
    echo ""
    echo "🔗 添加远程仓库..."
    git remote add origin "$REMOTE_URL"
fi

echo "✅ 远程仓库已配置: $REMOTE_URL"

# 设置主分支名称
echo ""
echo "🌿 设置主分支为main..."
git branch -M main

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Git配置完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 下一步操作："
echo ""
echo "1. 在GitHub创建仓库:"
echo "   访问: https://github.com/new"
echo "   - Repository name: $REPO_NAME"
echo "   - Description: Maritime Logistics Dashboard"
echo "   - Public或Private都可以"
echo "   - 不要初始化README、.gitignore或license"
echo ""
echo "2. 推送代码到GitHub:"
echo "   git push -u origin main"
echo ""
echo "3. 如果需要认证，GitHub会提示你输入token或使用SSH"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 准备就绪！执行推送命令即可。"
echo ""
