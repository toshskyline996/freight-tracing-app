# Deployment Guide - Maritime Logistics Dashboard

## 🚀 快速部署到 freightracing.ca

### 前置要求
1. 服务器已安装 Caddy 2.x
2. DNS已配置：`freightracing.ca` A记录指向服务器IP
3. 防火墙开放端口 80 和 443

---

## 步骤 1: 构建生产版本

```bash
cd /home/kermityuan/frieght-tracing-app/maritime-logistics-dashboard
npm run build
```

构建完成后，`dist/` 目录包含所有生产文件。

---

## 步骤 2: 生成安全密码

```bash
# 生成 bcrypt 密码哈希
caddy hash-password --plaintext 'YourStrongPassword123!'

# 复制输出的哈希值，例如:
# $2a$14$HFNv..PynRutGxCLgSdCZ.NuWiNGAi.gCBUwcYBFOzsy8aeBbb4gu
```

**重要**: 将哈希值替换到 `Caddyfile` 的 `basicauth` 部分。

---

## 步骤 3: 更新 Caddyfile

编辑 `Caddyfile`，确保：
- ✅ `root` 路径正确指向 `dist/` 目录
- ✅ `basicauth` 包含你生成的密码哈希
- ✅ `tls` 邮箱地址正确
- ✅ 域名设置为 `freightracing.ca`

---

## 步骤 4: 验证配置

```bash
# 检查 Caddyfile 语法
caddy validate --config /home/kermityuan/frieght-tracing-app/maritime-logistics-dashboard/Caddyfile

# 应该输出: Valid configuration
```

---

## 步骤 5: 启动 Caddy

```bash
# 方式 1: 使用 systemd（推荐）
sudo systemctl start caddy
sudo systemctl enable caddy  # 开机自启

# 方式 2: 直接运行
cd /home/kermityuan/frieght-tracing-app/maritime-logistics-dashboard
caddy run --config ./Caddyfile

# 方式 3: 后台运行
caddy start --config ./Caddyfile
```

---

## 步骤 6: 验证部署

1. **检查 SSL 证书**
   ```bash
   curl -I https://freightracing.ca
   # 应该返回 401 Unauthorized（需要认证）
   ```

2. **测试认证**
   - 浏览器访问：https://freightracing.ca
   - 应该弹出登录框
   - 输入用户名和密码
   - 成功后看到仪表板

3. **检查日志**
   ```bash
   tail -f /var/log/caddy/freightracing.log
   ```

---

## 🔐 安全配置检查清单

- [ ] Basic Auth 已启用且密码强度足够
- [ ] SSL 证书自动更新已启用
- [ ] 防火墙仅开放必要端口（80, 443）
- [ ] 所有 API 密钥存储在环境变量中（不在代码里）
- [ ] 定期备份 localStorage 数据（如需要）
- [ ] 日志文件定期轮转

---

## 🔄 更新应用

每次代码更新后：

```bash
cd /home/kermityuan/frieght-tracing-app/maritime-logistics-dashboard

# 1. 拉取最新代码
git pull origin main

# 2. 安装依赖（如有变化）
npm install

# 3. 构建生产版本
npm run build

# 4. 重启 Caddy
sudo systemctl reload caddy
# 或
caddy reload --config ./Caddyfile
```

---

## 📊 监控和维护

### 查看访问日志
```bash
tail -f /var/log/caddy/freightracing.log
```

### 查看 Caddy 状态
```bash
sudo systemctl status caddy
```

### 查看 SSL 证书到期时间
```bash
echo | openssl s_client -connect freightracing.ca:443 2>/dev/null | openssl x509 -noout -dates
```

---

## 🆘 故障排除

### 问题 1: 无法访问网站
```bash
# 检查 DNS 解析
dig freightracing.ca

# 检查 Caddy 是否运行
sudo systemctl status caddy

# 检查端口占用
sudo netstat -tulpn | grep :443
```

### 问题 2: SSL 证书获取失败
```bash
# 查看详细日志
journalctl -u caddy -f

# 确保端口 80 和 443 可访问
sudo ufw status
```

### 问题 3: 认证失败
- 确认密码哈希生成正确
- 检查 Caddyfile 中的 basicauth 配置
- 清除浏览器缓存和 cookies

---

## 🎯 性能优化建议

1. **启用 HTTP/2**（Caddy 默认启用）
2. **Gzip 压缩**（已配置）
3. **静态资源缓存**
   ```
   # 在 Caddyfile 添加
   header /assets/* Cache-Control "public, max-age=31536000, immutable"
   ```
4. **CDN 加速**（可选，使用 Cloudflare）

---

## 🔧 开发环境配置

本地开发时：
```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
# 无需认证，方便调试
```

---

## 📝 环境变量管理

1. 复制 `.env.example` 为 `.env`
2. 填入实际配置值
3. **永远不要提交 `.env` 到 Git**

```bash
cp .env.example .env
nano .env  # 编辑配置
```

---

## 📞 支持

遇到问题？检查：
1. Caddy 官方文档：https://caddyserver.com/docs/
2. 项目 README.md
3. `.cascade/` 目录下的 skills.md, workflow.md, rules.md

---

## ✅ 部署完成确认

部署成功后，你应该能够：
- ✅ 通过 HTTPS 访问 freightracing.ca
- ✅ 看到 SSL 锁标志（绿色）
- ✅ 需要输入用户名密码才能访问
- ✅ 所有功能正常工作（路由计算、地图追踪、产品管理）
- ✅ 浏览器控制台无错误

恭喜！你的海运物流追踪系统已成功部署！🎉
