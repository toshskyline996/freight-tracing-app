# 🚀 部署前检查清单

## 当前状态
- ✅ 代码构建完成 (dist/ 207KB)
- ✅ Caddyfile 配置验证通过
- ✅ 日志目录已创建
- ✅ 所有文档齐全

## 部署前必须确认

### 1. DNS配置
```bash
# 检查DNS解析
dig freightracing.ca +short
# 应该返回你的服务器IP
```

### 2. 服务器访问
- [ ] 可以SSH到生产服务器
- [ ] 服务器已安装Caddy 2.x
- [ ] 防火墙已开放端口 80, 443

### 3. 生成生产密码
```bash
# 在服务器上执行
caddy hash-password --plaintext 'YourStrongPassword'
# 复制生成的哈希值
```

### 4. 更新Caddyfile密码
编辑 Caddyfile 第13行，替换为你的密码哈希

## 部署步骤

### 方式1: 本地构建+上传（推荐）
```bash
# 1. 本地构建（已完成）
npm run build

# 2. 打包dist目录
tar -czf dist.tar.gz dist/

# 3. 上传到服务器
scp dist.tar.gz user@your-server:/path/to/app/
scp Caddyfile user@your-server:/path/to/app/

# 4. SSH到服务器
ssh user@your-server

# 5. 解压并启动
cd /path/to/app
tar -xzf dist.tar.gz
sudo systemctl restart caddy
```

### 方式2: 服务器上直接构建
```bash
# 1. SSH到服务器
ssh user@your-server

# 2. 克隆/拉取代码
git pull origin main

# 3. 安装依赖并构建
npm install
npm run build

# 4. 启动Caddy
sudo systemctl restart caddy
```

## 部署后验证

```bash
# 1. 检查SSL证书
curl -I https://freightracing.ca

# 2. 测试认证
# 浏览器访问 https://freightracing.ca
# 应该弹出登录框

# 3. 查看日志
tail -f logs/freightracing.log
```

## 回滚计划

如果出现问题：
```bash
# 停止Caddy
sudo systemctl stop caddy

# 恢复之前的配置
# ...

# 重启
sudo systemctl start caddy
```
