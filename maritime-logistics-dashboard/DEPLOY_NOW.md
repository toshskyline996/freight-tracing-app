# 🚀 立即部署到 freightracing.ca

## ✅ 本地测试完成

- 构建成功: 207 KB (gzip: 60 KB)
- Caddyfile验证通过
- 所有文件已打包: `freightracing-deploy.tar.gz`

---

## 📦 部署包内容

```
freightracing-deploy.tar.gz (已生成)
├── dist/                    # 生产构建产物
├── Caddyfile               # Web服务器配置
├── logs/                   # 日志目录
├── deploy.sh               # 部署脚本
└── .env.example            # 环境变量模板
```

---

## 🔐 第一步：生成生产密码（必须）

在**生产服务器**上执行：

```bash
caddy hash-password --plaintext 'YourStrongPassword123!'
```

**重要**: 复制输出的哈希值，例如：
```
$2a$14$abc123...xyz789
```

然后在本地编辑 `Caddyfile` 第13行，替换密码哈希：
```
admin $2a$14$abc123...xyz789
```

重新打包：
```bash
tar -czf freightracing-deploy.tar.gz dist/ Caddyfile logs/ deploy.sh .env.example
```

---

## 📤 第二步：上传到服务器

```bash
# 替换为你的服务器信息
SERVER_USER="your_username"
SERVER_IP="your_server_ip"
DEPLOY_PATH="/home/kermityuan/frieght-tracing-app/maritime-logistics-dashboard"

# 上传部署包
scp freightracing-deploy.tar.gz ${SERVER_USER}@${SERVER_IP}:${DEPLOY_PATH}/

# SSH到服务器
ssh ${SERVER_USER}@${SERVER_IP}
```

---

## 🚀 第三步：服务器上部署

SSH到服务器后执行：

```bash
# 1. 进入项目目录
cd /home/kermityuan/frieght-tracing-app/maritime-logistics-dashboard

# 2. 备份旧版本（如果存在）
if [ -d "dist.backup" ]; then rm -rf dist.backup; fi
if [ -d "dist" ]; then mv dist dist.backup; fi

# 3. 解压新版本
tar -xzf freightracing-deploy.tar.gz

# 4. 验证配置
caddy validate --config ./Caddyfile

# 5. 检查DNS解析
dig freightracing.ca +short
# 应该显示你的服务器IP

# 6. 启动/重启 Caddy
sudo systemctl restart caddy

# 7. 查看状态
sudo systemctl status caddy

# 8. 实时查看日志
tail -f logs/freightracing.log
```

---

## ✅ 第四步：验证部署

### 1. 测试HTTPS访问
```bash
curl -I https://freightracing.ca
```

应该看到：
- `HTTP/2 401` (需要认证)
- `www-authenticate: Basic realm="restricted"`

### 2. 浏览器测试
1. 打开 https://freightracing.ca
2. 应该弹出登录框
3. 输入用户名: `admin`
4. 输入密码: 你设置的密码
5. 成功登录后看到海运物流仪表板

### 3. 功能检查清单
- [ ] 📊 Dashboard页面加载正常
- [ ] 🗺️ Live Tracking地图显示船舶
- [ ] 🏷️ Product & HS Codes搜索功能正常
- [ ] 🏙️ Toronto Hub视图切换正常
- [ ] 🔒 SSL证书有效（绿色锁）
- [ ] 📱 浏览器控制台无错误

---

## 🔧 如果遇到问题

### DNS未解析到服务器
```bash
# 检查DNS记录
nslookup freightracing.ca

# 等待DNS传播（可能需要几分钟到几小时）
```

### SSL证书获取失败
```bash
# 检查端口是否开放
sudo ufw status
sudo ufw allow 80
sudo ufw allow 443

# 查看Caddy日志
journalctl -u caddy -f
```

### 认证失败
```bash
# 重新生成密码哈希
caddy hash-password --plaintext 'YourPassword'

# 更新Caddyfile
nano Caddyfile
# 修改第13行

# 重启Caddy
sudo systemctl restart caddy
```

### 页面404
```bash
# 检查dist目录
ls -la dist/

# 检查Caddyfile中的root路径
grep "root" Caddyfile

# 确保路径正确
```

---

## 🔄 回滚到之前版本

如果新版本有问题：

```bash
cd /home/kermityuan/frieght-tracing-app/maritime-logistics-dashboard

# 恢复备份
rm -rf dist
mv dist.backup dist

# 重启Caddy
sudo systemctl restart caddy
```

---

## 📊 监控和维护

### 查看访问日志
```bash
tail -f logs/freightracing.log
```

### 查看Caddy状态
```bash
sudo systemctl status caddy
```

### 查看SSL证书信息
```bash
echo | openssl s_client -connect freightracing.ca:443 2>/dev/null | openssl x509 -noout -dates
```

### 重启Caddy
```bash
sudo systemctl restart caddy
```

### 重载配置（无需停机）
```bash
sudo systemctl reload caddy
```

---

## 🎯 快速命令参考

```bash
# 一键部署（服务器上）
cd /home/kermityuan/frieght-tracing-app/maritime-logistics-dashboard && \
tar -xzf freightracing-deploy.tar.gz && \
sudo systemctl restart caddy

# 查看实时状态
watch -n 1 'systemctl status caddy | head -20'

# 测试认证
curl -u admin:YourPassword https://freightracing.ca

# 查看证书到期时间
curl -vI https://freightracing.ca 2>&1 | grep -i expire
```

---

## ✅ 部署完成确认

部署成功后，你应该能够：

- ✅ 通过 HTTPS 访问 https://freightracing.ca
- ✅ 看到绿色SSL锁标志
- ✅ 需要输入用户名密码才能访问
- ✅ 所有功能正常工作：
  - Dashboard路由计算
  - Live Tracking地图和船舶追踪
  - Product管理和HS代码搜索
  - Toronto Hub区域视图
- ✅ 浏览器控制台无错误
- ✅ 移动设备也能正常访问

---

## 📞 需要帮助？

如果遇到任何问题：

1. 检查Caddy日志: `journalctl -u caddy -f`
2. 检查应用日志: `tail -f logs/freightracing.log`
3. 验证DNS解析: `dig freightracing.ca`
4. 测试端口开放: `telnet freightracing.ca 443`

---

## 🎉 恭喜！

**Maritime Logistics Dashboard** 已成功部署到生产环境！

🌐 **访问地址**: https://freightracing.ca  
🔐 **用户名**: admin  
🔑 **密码**: 你设置的密码

享受你的海运物流追踪系统吧！🚢
