#!/usr/bin/env sh

# 发生错误时终止
set -e

# 检测默认分支名称
DEFAULT_BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || echo "master")
echo "当前默认分支: $DEFAULT_BRANCH"

# 构建
npm run build

# 进入构建文件夹
cd dist

# 如果你要部署到自定义域名
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# 将远程仓库设置为HTTPS方式
git remote add origin https://github.com/zhijie0503/zhijie0503.github.io.git || git remote set-url origin https://github.com/zhijie0503/zhijie0503.github.io.git

# 对于个人GitHub Pages仓库（<username>.github.io）
# 部署到main分支
git push -f origin $DEFAULT_BRANCH:main

cd -

echo "部署完成！请访问 https://zhijie0503.github.io 查看结果" 