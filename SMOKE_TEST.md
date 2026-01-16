# 🧪 模拟数据冒烟测试清单

**测试目的**: 验证所有Mock数据模块运行顺畅，无卡顿、崩溃或资源泄漏

**测试环境**: 
- 浏览器: Chrome/Firefox/Edge（最新版）
- URL: https://freightracing.ca 或 https://freight-tracing-app.pages.dev
- 测试时长: ~10分钟

---

## ✅ 测试前准备

1. **清除浏览器缓存**: `Ctrl+Shift+Delete` → 勾选"缓存的图片和文件" → 清除
2. **打开开发者工具**: `F12` → Console标签页
3. **确保无广告拦截器干扰**: 临时禁用uBlock/AdBlock
4. **记录Console输出**: 留意红色错误和警告

---

## 📋 测试用例

### 1️⃣ **Dashboard（路由计算）** - 基础功能

**步骤**:
1. 打开应用，默认显示Dashboard
2. 选择起点: `Shanghai`
3. 选择终点: `Toronto`
4. 服务模式: `Standard`
5. 点击"Calculate"

**预期结果**:
- ✅ 显示3条路线（Prince Rupert, Vancouver, LA）
- ✅ 最优路线标记为🏆
- ✅ 显示天数计算（Sea + Rail）
- ✅ Console无错误

**失败标志**:
- ❌ 无结果显示
- ❌ 计算错误（天数不对）
- ❌ Console红色错误

---

### 2️⃣ **Toronto Hub** - Mock数据渲染

**步骤**:
1. 点击导航栏 `Toronto Hub`
2. 等待页面渲染完成（~1秒）
3. 检查4个板块是否正常显示

**预期结果**:

**A. 高速公路状态** (左上)
- ✅ 显示6条高速公路（401, 407, 400, QEW, DVP, Gardiner）
- ✅ 每条高速有状态标签（HEAVY/MODERATE/FREE FLOW）
- ✅ 进度条颜色正确（橙色=拥堵，蓝色=畅通）
- ✅ 显示"Last updated"时间戳

**B. Pearson货运航班** (右上)
- ✅ 显示4个航班卡片（AC8945, CX889, LH8505, FX5102）
- ✅ 状态颜色正确：
  - 🟢 Landed = 绿色
  - 🔵 In Flight = 蓝色
  - ⚪ Scheduled = 灰色
- ✅ 显示货物重量和类型

**C. CN Rail** (左下)
- ✅ 显示3列车卡片（CN-308, CN-198, CN-405）
- ✅ 显示当前位置、ETA、货物信息
- ✅ 延误警报显示（如有）

**D. CPKC Rail** (右下)
- ✅ 显示2列车卡片（CPKC-140, CPKC-212）
- ✅ 延误状态用橙色高亮（CPKC-212）

**自动刷新测试**:
- ⏱️ 等待5分钟（可选，耗时）
- ✅ 页面应自动更新"Last updated"时间戳
- ✅ 无Console错误

**失败标志**:
- ❌ 任何板块显示"No data available"
- ❌ 卡片不完整（少于预期数量）
- ❌ 点击后页面空白

---

### 3️⃣ **Live Tracking** - 地图与筛选器

**步骤**:
1. 点击导航栏 `Live Tracking`
2. 等待地图加载（~2秒）
3. 检查筛选按钮和地图

**预期结果**:

**A. 筛选按钮**
- ✅ 显示3个按钮：🚢 Sea (3) / ✈️ Air (3) / 🚂 Rail (3)
- ✅ 默认全部激活（蓝色边框+背景）
- ✅ 点击按钮切换状态（激活↔️未激活）
- ✅ 点击后卡片数量动态变化

**B. 地图显示**
- ✅ 地图正常加载（深色主题）
- ✅ 可缩放、拖拽
- ✅ 显示港口标记（11个）
- ✅ 显示船舶标记（3艘，带名称标签）
- ✅ 船舶→港口连线（虚线）

**C. 车辆卡片**
- ✅ 默认显示9个卡片（3海运+3空运+3陆运）
- ✅ 卡片左侧彩色边框：
  - 🔵 蓝色 = 海运
  - 🟡 黄色 = 空运
  - 🟣 紫色 = 陆运
- ✅ 每张卡片显示：
  - 名称、状态、速度
  - 货物类型和数量
  - ETA
  - 起点→终点

**D. 交互测试**
1. 点击"🚢 Sea"按钮取消选择
   - ✅ 3艘船卡片消失
   - ✅ 剩余6张卡片（空运+陆运）
   - ✅ 地图重新初始化
   
2. 点击"Track on Map"按钮（任意卡片）
   - ✅ 地图聚焦到该车辆位置
   - ✅ 弹出详情窗口

3. 全部取消选择（3个按钮都点掉）
   - ✅ 显示"No vehicles match your filter criteria"

**失败标志**:
- ❌ 地图不加载（空白）
- ❌ 筛选按钮点击无反应
- ❌ 卡片数量不对
- ❌ Console报错"Leaflet is not defined"

---

### 4️⃣ **Route Planner** - 功能复用

**步骤**:
1. 点击导航栏 `Route Planner`
2. 执行与测试用例1相同操作

**预期结果**:
- ✅ 显示与Dashboard相同的路由计算界面
- ✅ 功能完全一致

---

### 5️⃣ **Market Intel** - 静态数据

**步骤**:
1. 点击导航栏 `Market Intel`

**预期结果**:
- ✅ 显示3个指标卡片：
  - 平均TEU运价: $2,450 (↓3.2%)
  - 运力利用率: 82% (↑5.1%)
  - 平均运输时间: 14.2d (↓1.8天)
- ✅ 颜色正确（蓝色=下降，橙色=上升）

---

### 6️⃣ **Logistics Tools** - HS Code查询

**步骤**:
1. 点击导航栏 `Logistics Tools`
2. 点击"Search HS Code"按钮
3. 搜索: `cotton`
4. 点击任意结果

**预期结果**:
- ✅ 显示搜索结果列表
- ✅ 点击后显示详细信息（描述、税率、章节）
- ✅ 可创建产品条目

---

### 7️⃣ **资源泄漏测试** - 切换压力测试

**步骤**:
1. 快速点击导航栏各项（循环10次）:
   - Dashboard → Toronto Hub → Live Tracking → Dashboard → ...
2. 打开Chrome DevTools → Performance → Memory
3. 点击"Take heap snapshot"

**预期结果**:
- ✅ 页面切换流畅无卡顿
- ✅ Console无重复错误
- ✅ 无"Warning: Duplicate interval"警告
- ✅ 内存占用稳定（<200MB）

**失败标志**:
- ❌ 页面卡死
- ❌ 地图多次初始化报错
- ❌ 内存持续增长（>500MB）

---

### 8️⃣ **Console日志检查** - 错误监控

**全程监控Console，允许的输出**:
- ✅ `[Vite] connected` (开发模式)
- ✅ `TorontoHub: Auto-refresh started` (正常日志)

**不允许的错误**:
- ❌ `Uncaught TypeError`
- ❌ `Failed to fetch`
- ❌ `Leaflet is not defined`
- ❌ `Cannot read property of undefined`
- ❌ 任何红色错误

---

## 🎯 关键性能指标

| 指标 | 目标值 | 测试方法 |
|------|--------|----------|
| **页面加载时间** | <2秒 | DevTools → Network → DOMContentLoaded |
| **地图初始化** | <1秒 | 点击Live Tracking后计时 |
| **筛选响应** | <100ms | 点击筛选按钮到卡片更新 |
| **刷新间隔** | 5分钟 | Toronto Hub时间戳观察 |
| **内存占用** | <200MB | DevTools → Memory → Heap snapshot |

---

## 🐛 常见问题排查

### 问题1: Toronto Hub显示空白
**原因**: 浏览器缓存
**解决**: 硬刷新 `Ctrl+Shift+R`

### 问题2: Live Tracking地图不加载
**原因**: Leaflet加载失败
**检查**: Console是否有`404 leaflet.css`
**解决**: 检查网络连接，等待CDN加载

### 问题3: 筛选按钮点击无反应
**原因**: 事件监听器未绑定
**检查**: Console输入 `typeof LiveTrackingFilter`，应显示`"function"`

### 问题4: 5分钟后Toronto Hub未刷新
**原因**: interval被清除
**检查**: Console是否有"Auto-refresh already active"警告

---

## ✅ 测试通过标准

**全部通过**: 
- 🟢 8个测试用例全部✅
- 🟢 Console无红色错误
- 🟢 性能指标达标

**部分通过**:
- 🟡 1-2个测试用例失败
- 🟡 有黄色警告但无错误
- 🟡 性能略低于目标

**失败**:
- 🔴 3个以上测试用例失败
- 🔴 Console有Uncaught错误
- 🔴 页面崩溃或卡死

---

## 📊 测试记录模板

```
测试日期: _____________
测试人员: _____________
浏览器: _____________
测试结果: ✅通过 / 🟡部分通过 / 🔴失败

失败项:
- [ ] _________________
- [ ] _________________

Console错误:
_________________________

性能指标:
- 页面加载: _____ 秒
- 内存占用: _____ MB
- 地图初始化: _____ 秒

备注:
_________________________
```

---

**测试完成后**:
1. 将结果填入上方模板
2. 如有失败，截图Console错误
3. 反馈给开发团队修复
