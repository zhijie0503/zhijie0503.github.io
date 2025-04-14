#!/usr/bin/env sh

# 发生错误时终止
set -e

echo "=== 开始部署方格消除游戏 ==="

# 构建
echo "=== 构建项目 ==="
npm run build

# 进入构建文件夹
cd dist

# 如果你要部署到自定义域名
# echo 'www.example.com' > CNAME

# 初始化git仓库
echo "=== 初始化git仓库 ==="
rm -rf .git
git init

# 添加生成时间信息
echo "<!-- 生成时间: $(date) -->" >> index.html
echo "<!-- 方格消除游戏 - GitHub Pages部署 -->" >> index.html

# 将所有文件添加到git
git add -A
git commit -m 'deploy: 方格消除游戏'

# 配置远程仓库 - 使用GitHub个人令牌，避免SSH和密码问题
echo "=== 配置远程仓库 ==="
git remote add origin https://github.com/zhijie0503/zhijie0503.github.io.git || git remote set-url origin https://github.com/zhijie0503/zhijie0503.github.io.git

# 强制推送到main分支
echo "=== 推送到GitHub Pages ==="
git push -f origin master:main

cd -

echo "=== 部署完成! ==="
echo "请访问 https://zhijie0503.github.io 查看结果"
echo "注意: 如果使用GitHub令牌，请确保已配置正确的访问权限" 