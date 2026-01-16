# 🚢 Maritime Logistics Dashboard - 海运物流追踪系统

**单用户海运物流管理平台**，提供路由优化、实时船舶追踪、HS代码查询和货物管理功能。

🌐 **生产环境**: https://freightracing.ca

---

## ✨ 核心功能

### 1. 📊 智能路由计算
- 多式联运路线优化（海运+铁路）
- 地缘政治风险评估（红海绕行等）
- 三种服务模式：标准/优先/最安全
- 实时运输时间计算
- 历史路线记录

### 2. 🗺️ 实时船舶追踪
- 交互式地图显示船舶位置
- 航线可视化（起点→船舶→终点）
- 港口标记和信息
- 船舶详情弹窗（速度、航向、ETA、货物）
- 每分钟自动更新位置

### 3. 🏷️ 产品信息管理
- HS代码智能搜索
- 产品库管理（名称、描述、重量、价值、原产地）
- 关税税率查询
- CSV导出功能
- 支持多种HS代码分类

### 4. 🏙️ 区域物流中心
- Toronto Hub：401/407高速公路流量监控
- 多式联运枢纽状态（CN Brampton, CPKC Vaughan）
- 可扩展到其他区域（Vancouver, Montreal）

### 5. 🔐 安全访问控制
- Caddy Basic Auth 单用户认证
- SSL/TLS 自动证书（Let's Encrypt）
- 安全HTTP头配置
- 无多余的用户管理复杂度

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| **前端框架** | Vanilla JavaScript (ES6+) |
| **构建工具** | Vite |
| **地图库** | Leaflet.js + OpenStreetMap |
| **样式** | 自定义CSS (Dark Theme) |
| **Web服务器** | Caddy 2.x |
| **数据持久化** | localStorage |
| **部署** | 单机部署 + SSL |

---

## 📦 项目结构

```
frieght-tracing-app/
├── maritime-logistics-dashboard/    # 主应用
│   ├── src/
│   │   ├── mapTracker.js           # 地图追踪模块
│   │   ├── hsCodeLookup.js         # HS代码查询引擎
│   │   └── productManager.js       # 产品管理UI
│   ├── main.js                     # 应用入口
│   ├── style.css                   # 全局样式
│   ├── index.html                  # HTML模板
│   ├── Caddyfile                   # Web服务器配置
│   ├── package.json                # 依赖管理
│   └── vite.config.js              # 构建配置
├── .cascade/                        # Cascade AI配置
│   ├── skills.md                   # 技能文档
│   ├── workflow.md                 # 工作流程
│   └── rules.md                    # 开发规则
├── DEPLOYMENT.md                    # 部署指南
└── README.md                        # 本文件
```

---

## 🚀 快速开始

### 开发环境

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd frieght-tracing-app/maritime-logistics-dashboard

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 浏览器打开
# http://localhost:5173
```

### 生产部署

查看详细部署指南：[DEPLOYMENT.md](./DEPLOYMENT.md)

```bash
# 1. 构建生产版本
npm run build

# 2. 配置 Caddyfile（设置域名和认证）

# 3. 启动 Caddy
sudo systemctl start caddy
```

---

## 🔑 身份验证设置

**默认凭据（仅开发环境）**:
- 用户名: `admin`
- 密码: 请使用 `caddy hash-password` 生成

**生产环境设置**:
1. 生成强密码哈希：
   ```bash
   caddy hash-password --plaintext 'YourSecurePassword123!'
   ```

2. 更新 `Caddyfile` 中的 `basicauth` 配置

3. 重启 Caddy

---

## 📚 功能使用指南

### 路由计算
1. 选择起点（Shanghai/Mumbai/Rotterdam）
2. 选择终点（Toronto/Chicago/Memphis）
3. 选择服务模式
4. 点击"Calculate Best Route"
5. 查看最优路线和备选方案

### 船舶追踪
1. 点击侧边栏"Live Tracking"
2. 地图显示所有活跃船舶
3. 点击船舶图标查看详情
4. 点击"Track on Map"聚焦特定船舶

### 产品管理
1. 点击"Product & HS Codes"
2. 搜索框输入产品描述
3. 系统返回匹配的HS代码
4. 点击"Use This Code"添加产品
5. 填写产品详情并保存

---

## 🔄 更新流程

```bash
# 1. 进入项目目录
cd /home/kermityuan/frieght-tracing-app/maritime-logistics-dashboard

# 2. 拉取最新代码
git pull origin main

# 3. 重新构建
npm run build

# 4. 重载 Caddy
sudo systemctl reload caddy
```

---

## 🌟 特色优势

- ✅ **单用户优化**：无复杂的用户管理，快速部署
- ✅ **自托管**：完全掌控数据，无第三方依赖
- ✅ **轻量级**：vanilla JS，构建产物小于500KB
- ✅ **安全**：Basic Auth + SSL + 安全头
- ✅ **快速迭代**：Vite HMR，秒级热更新
- ✅ **可扩展**：模块化设计，易于添加新功能

---

## 🛣️ 开发路线图

### ✅ 已完成
- [x] 路由计算引擎
- [x] 地图实时追踪
- [x] HS代码查询
- [x] 产品信息管理
- [x] Basic Auth 认证
- [x] SSL 自动化

### 🔄 进行中
- [ ] 集成真实AIS船舶数据API
- [ ] 接入货运报价API（SeaRates/Freightify）
- [ ] 历史价格图表（Chart.js）

### 📋 计划中
- [ ] 移动端适配优化
- [ ] 邮件通知（船舶到港提醒）
- [ ] 多语言支持（中/英）
- [ ] 数据导出（PDF报关单）

---

## 🐛 故障排除

### 地图无法加载
- 检查网络连接
- 确认 Leaflet CSS 已加载
- 查看浏览器控制台错误

### 认证失败
- 验证密码哈希是否正确生成
- 清除浏览器缓存
- 检查 Caddyfile 配置

### SSL 证书问题
- 确认 DNS 已正确指向服务器
- 检查端口 80/443 是否开放
- 查看 Caddy 日志：`journalctl -u caddy -f`

---

## 📖 相关文档

- [Cascade Skills](/.cascade/skills.md) - 项目技能库
- [Cascade Workflow](/.cascade/workflow.md) - 开发工作流
- [Cascade Rules](/.cascade/rules.md) - 编码规范
- [Deployment Guide](/DEPLOYMENT.md) - 部署详解

---

## 🤝 贡献指南

本项目为个人单用户系统，暂不接受外部贡献。如有建议，请联系项目维护者。

---

## 📄 许可证

Private Project - All Rights Reserved

---

## 📞 联系方式

- **域名**: freightracing.ca
- **邮箱**: YXJ19980410@GMAIL.COM
- **部署**: Caddy 2.x on Linux

---

**构建时间**: 2026-01-16  
**版本**: v1.0.0  
**状态**: ✅ Production Ready

🎉 **海运物流追踪系统 - 让全球货运管理更简单！**
