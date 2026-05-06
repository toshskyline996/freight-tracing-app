# 🔐 Cloudflare Access 私密访问配置指南

## 问题12回答：如何隐藏App不让公众看到

使用 **Cloudflare Access** 可以完全免费地保护你的应用，只允许授权用户访问。

---

## 🎯 方案概览

**Cloudflare Access** 提供三种认证方式：
1. **邮箱验证码** (One-time PIN) - 最简单，完全免费
2. **第三方登录** (Google/GitHub) - 需要OAuth配置
3. **IP白名单** - 限制特定IP地址访问

**推荐**: 邮箱验证码方式（最适合单用户）

---

## 📋 Step-by-Step配置教程

### 步骤1: 启用Cloudflare Zero Trust

1. 访问 https://dash.cloudflare.com
2. 左侧菜单选择 **Zero Trust**
3. 如果是第一次使用，会提示创建团队名称
   - 输入一个团队名（例如：`freight-tracing`）
   - 选择免费计划（Free）
   - 点击 **Complete setup**

### 步骤2: 创建Access Application

1. 在Zero Trust界面，导航到 **Access** → **Applications**
2. 点击 **Add an application** 按钮
3. 选择 **Self-hosted**（自托管应用）

### 步骤3: 配置Application设置

#### Application Configuration
```yaml
Application name: Maritime Logistics Dashboard
Session Duration: 24 hours
```

#### Application Domain
```yaml
Subdomain: freightracing
Domain: ca
```
或者如果使用pages.dev：
```yaml
Subdomain: freight-tracing-app
Domain: pages.dev
```

#### 其他设置
- **Same-site cookie attribute**: Lax
- **HTTP Only cookie**: ✅ 启用
- **Binding cookie**: ✅ 启用

点击 **Next**

### 步骤4: 添加认证方式（Identity providers）

1. 如果还没配置认证方式，点击 **Add new**
2. 选择 **One-time PIN**
3. 保持默认设置
4. 点击 **Save**

### 步骤5: 配置访问策略（Access Policy）

#### Policy 1: 只允许你的邮箱
```yaml
Policy name: Admin Only
Action: Allow

Include:
  Rule type: Emails
  Value: YXJ19980410@GMAIL.COM
```

#### （可选）Policy 2: 限制IP地址
```yaml
Policy name: Office IP Only
Action: Allow

Include:
  Rule type: IP ranges
  Value: 你的办公室IP/32
```

点击 **Next**，然后点击 **Add application**

---

## ✅ 验证配置

### 测试步骤

1. **打开无痕模式窗口**（避免cookie干扰）
2. 访问 https://freightracing.ca
3. 应该看到Cloudflare Access登录页面
4. 输入你的邮箱：`YXJ19980410@GMAIL.COM`
5. 检查邮箱收到验证码
6. 输入验证码
7. 成功登录后看到应用

### 预期结果
- ✅ 未授权用户看到登录页面，无法访问
- ✅ 只有你的邮箱收到验证码
- ✅ 验证后24小时内免登录
- ✅ 其他人完全无法访问

---

## 🔧 高级配置

### 1. 添加多个邮箱

如果需要允许其他人访问：

```yaml
Include:
  Rule type: Emails
  Values:
    - YXJ19980410@GMAIL.COM
    - colleague1@example.com
    - colleague2@example.com
```

### 2. 使用Google登录（可选）

#### 配置Google OAuth

1. 访问 https://console.cloud.google.com
2. 创建新项目或选择现有项目
3. 启用 **Google+ API**
4. 创建OAuth 2.0凭据
   - Application type: Web application
   - Authorized redirect URIs: `https://YOUR_TEAM.cloudflareaccess.com/cdn-cgi/access/callback`
5. 复制 Client ID 和 Client Secret

#### 在Cloudflare配置

1. Zero Trust → Settings → Authentication
2. 点击 **Add new** → 选择 **Google**
3. 输入 Client ID 和 Client Secret
4. 在Application的Policy中选择Google作为认证方式

### 3. 配置会话超时

```yaml
Session Duration: 选项
  - 15 minutes
  - 30 minutes
  - 6 hours
  - 12 hours
  - 24 hours (推荐)
  - 1 week
  - 1 month
```

### 4. 启用审计日志

1. Zero Trust → Logs → Access
2. 可以查看所有登录记录：
   - 谁访问了
   - 什么时间
   - 从哪个IP
   - 使用什么设备

---

## 🚫 从完全公开到完全隐藏

### Before (没有Access)
```
任何人 → https://freightracing.ca → ✅ 直接访问
```

### After (配置Access)
```
未授权用户 → https://freightracing.ca → ❌ 登录页面（验证码）
你的邮箱 → 输入验证码 → ✅ 访问应用
其他人 → 无验证码 → ❌ 完全无法进入
```

---

## 💡 使用场景建议

### 场景1: 完全私密（只有你）
```yaml
Policy: Admin Only
Include: Emails = YXJ19980410@GMAIL.COM
```

### 场景2: 小团队（2-10人）
```yaml
Policy: Team Access
Include: Emails = [你的邮箱列表]
```

### 场景3: 办公室内网
```yaml
Policy: Office Only
Include: IP ranges = 你的办公室IP段
```

### 场景4: 混合（邮箱+IP）
```yaml
Policy: Secure Access
Include:
  - Emails = YXJ19980410@GMAIL.COM
  - IP ranges = 你的家庭IP
```

---

## ⚠️ 重要注意事项

### 1. 免费限额
- **Cloudflare Access Free Plan**:
  - ✅ 最多50个用户
  - ✅ 无限应用数量
  - ✅ 基础认证方式
  - ✅ 完全免费，无需信用卡

### 2. 邮箱验证码特点
- ✅ 优点：
  - 零配置
  - 完全免费
  - 简单易用
  - 支持任何邮箱
  
- ⚠️ 缺点：
  - 需要查收邮件
  - 每24小时重新验证
  - 依赖邮件送达

### 3. 不影响Cloudflare Pages部署
- ✅ Access只在**用户访问时**生效
- ✅ GitHub推送仍然自动部署
- ✅ 不影响构建过程
- ✅ 开发环境（localhost）不受限制

### 4. 可以随时开关
- 在Application设置中可以暂时禁用Access
- 不需要删除配置，只需toggle开关

---

## 🔍 故障排查

### 问题1: 收不到验证码邮件
**解决方案**:
- 检查垃圾邮件文件夹
- 确认邮箱地址拼写正确
- 等待2-5分钟（有时有延迟）
- 尝试重新发送

### 问题2: 验证码过期
**解决方案**:
- 验证码有效期10分钟
- 点击 "Resend code"
- 使用最新的验证码

### 问题3: 配置后仍然可以直接访问
**解决方案**:
- 清除浏览器cookie
- 使用无痕模式测试
- 等待1-2分钟配置生效
- 检查Policy是否正确保存

### 问题4: 被锁在外面
**解决方案**:
- 在Cloudflare Dashboard → Zero Trust → Applications
- 找到你的应用，点击 **Edit**
- 临时禁用Access或修改Policy
- 重新添加你的邮箱

---

## 📊 监控和分析

### 查看访问日志

1. Zero Trust → Logs → Access
2. 可以看到：
   - **Allowed**: 成功登录的记录
   - **Blocked**: 被拒绝的访问尝试
   - 时间戳、IP地址、用户身份

### 导出日志
- 可以导出CSV格式
- 用于审计或分析

---

## 🎯 最终配置检查清单

部署Access前确认：

- [ ] Zero Trust已启用
- [ ] Application已创建并指向正确域名
- [ ] 认证方式已配置（One-time PIN）
- [ ] Policy已添加你的邮箱
- [ ] 在无痕模式测试成功
- [ ] 验证码邮件能正常收到
- [ ] Session duration设置合理（24小时推荐）
- [ ] 审计日志已启用（可选）

---

## 🚀 一键配置脚本（API方式）

如果你想通过API自动配置：

```bash
#!/bin/bash
# Cloudflare Access自动配置脚本

ACCOUNT_ID="35d7271d53af8f34a439961ddb44ee38"
API_TOKEN="yhg_cyHx6wUFVl98VF8iBIt9PDIGiBKSj5fZUxuj"
APP_DOMAIN="freightracing.ca"
YOUR_EMAIL="YXJ19980410@GMAIL.COM"

# 创建Access Application
curl -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/access/apps" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maritime Logistics Dashboard",
    "domain": "'$APP_DOMAIN'",
    "session_duration": "24h",
    "policies": [{
      "name": "Admin Only",
      "decision": "allow",
      "include": [{
        "email": {
          "email": "'$YOUR_EMAIL'"
        }
      }]
    }]
  }'
```

---

## 💼 总结

### 配置Access后的效果

**对公众**:
- ❌ 无法看到你的应用
- ❌ 无法访问任何页面
- ❌ 无法绕过认证
- ✅ 只看到Cloudflare登录页面

**对你**:
- ✅ 使用邮箱验证码登录
- ✅ 24小时内免重复登录
- ✅ 完全正常使用所有功能
- ✅ 可以从任何设备访问（验证后）

**成本**: 
- 💰 **$0/月** - 完全免费

**安全性**:
- 🔒 企业级身份验证
- 🔒 SSL/TLS加密
- 🔒 审计日志
- 🔒 IP限制（可选）

---

## 📞 需要帮助？

如果配置过程中遇到问题：

1. **Cloudflare文档**: https://developers.cloudflare.com/cloudflare-one/
2. **社区支持**: https://community.cloudflare.com/
3. **视频教程**: 搜索 "Cloudflare Access tutorial"

---

**配置完成后，你的应用将完全隐藏，只有你能访问！** 🎉🔒
