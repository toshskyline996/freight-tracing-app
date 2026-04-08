// Shipment Manager Module — FreightRacing 货柜管理
// 调用 BIH Worker API 向客人发送货运追踪通知邮件

const BIH_API_URL = 'https://borealironheavy.ca/api/notify-shipment'
const FREIGHT_API_SECRET = import.meta.env.VITE_FREIGHT_API_SECRET || ''

const CARRIERS = [
  'MSC', 'MAERSK', 'COSCO', 'OOCL', 'EVERGREEN',
  'YANG MING', 'CMA CGM', 'HAPAG-LLOYD', 'OTHER'
]

export default class ShipmentManager {
  constructor() {
    this.shipments = this._loadFromStorage()
  }

  _loadFromStorage() {
    try {
      return JSON.parse(localStorage.getItem('bih_shipments') || '[]')
    } catch {
      return []
    }
  }

  _saveToStorage() {
    localStorage.setItem('bih_shipments', JSON.stringify(this.shipments))
  }

  async sendNotification(data) {
    const res = await fetch(BIH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FREIGHT_API_SECRET}`,
      },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(err.error || `HTTP ${res.status}`)
    }

    return res.json()
  }

  renderView() {
    return `
      <section class="card" style="grid-column: span 12;">
        <div class="card-title">
          📦 Shipment Notification Manager
          <span style="font-size:0.75rem;color:var(--text-secondary);font-weight:400;">
            发货通知 — 自动发邮件给客人
          </span>
        </div>

        <!-- New Shipment Form -->
        <div style="background:rgba(100,255,218,0.03);border:1px solid var(--glass-border);border-radius:10px;padding:1.5rem;margin-bottom:2rem;">
          <div style="font-size:0.9rem;color:var(--accent-blue);font-weight:600;margin-bottom:1.25rem;">
            ✉️ 新建发货通知
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">
            <div class="input-group">
              <label>BIH 订单号 *</label>
              <input type="text" id="sm-order-number" placeholder="e.g. BIH-2026-0042" style="width:100%;box-sizing:border-box;">
            </div>
            <div class="input-group">
              <label>柜号 (Container #) *</label>
              <input type="text" id="sm-container-number" placeholder="e.g. MSCU1234567" style="width:100%;box-sizing:border-box;text-transform:uppercase;">
            </div>
            <div class="input-group">
              <label>承运商 *</label>
              <select id="sm-carrier" style="width:100%;box-sizing:border-box;">
                <option value="">— 选择承运商 —</option>
                ${CARRIERS.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>
            <div class="input-group">
              <label>预计到港日期 *</label>
              <input type="date" id="sm-eta" style="width:100%;box-sizing:border-box;">
            </div>
            <div class="input-group">
              <label>起运港</label>
              <input type="text" id="sm-origin" value="Yantai, China" style="width:100%;box-sizing:border-box;">
            </div>
            <div class="input-group">
              <label>目的港</label>
              <input type="text" id="sm-destination" value="Vancouver, BC" style="width:100%;box-sizing:border-box;">
            </div>
            <div class="input-group">
              <label>客人姓名 *</label>
              <input type="text" id="sm-customer-name" placeholder="John Smith" style="width:100%;box-sizing:border-box;">
            </div>
            <div class="input-group">
              <label>客人邮箱 *</label>
              <input type="email" id="sm-customer-email" placeholder="client@company.com" style="width:100%;box-sizing:border-box;">
            </div>
          </div>

          <div class="input-group" style="margin-bottom:1rem;">
            <label>备注（不发给客人）</label>
            <input type="text" id="sm-notes" placeholder="内部备注..." style="width:100%;box-sizing:border-box;">
          </div>

          <div style="display:flex;align-items:center;gap:1rem;">
            <button id="sm-send-btn" style="
              padding:0.75rem 2rem;
              background:var(--accent-blue);
              color:#0a192f;
              border:none;
              border-radius:8px;
              font-weight:700;
              font-size:0.9rem;
              cursor:pointer;
              transition:all 0.2s;
            ">
              🚀 发送追踪通知
            </button>
            <div id="sm-status" style="font-size:0.85rem;"></div>
          </div>
        </div>

        <!-- History -->
        <div>
          <div style="font-size:0.9rem;color:var(--text-secondary);font-weight:600;margin-bottom:1rem;">
            📋 历史记录 (${this.shipments.length} 条)
          </div>
          ${this._renderHistory()}
        </div>
      </section>
    `
  }

  _renderHistory() {
    if (this.shipments.length === 0) {
      return `<div style="text-align:center;padding:2rem;color:var(--text-secondary);">暂无发货记录</div>`
    }

    return `
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
          <thead>
            <tr style="border-bottom:1px solid var(--glass-border);color:var(--text-secondary);">
              <th style="text-align:left;padding:0.6rem 0.8rem;">订单号</th>
              <th style="text-align:left;padding:0.6rem 0.8rem;">柜号</th>
              <th style="text-align:left;padding:0.6rem 0.8rem;">承运商</th>
              <th style="text-align:left;padding:0.6rem 0.8rem;">客人</th>
              <th style="text-align:left;padding:0.6rem 0.8rem;">预计到港</th>
              <th style="text-align:left;padding:0.6rem 0.8rem;">发送时间</th>
              <th style="text-align:left;padding:0.6rem 0.8rem;">状态</th>
            </tr>
          </thead>
          <tbody>
            ${this.shipments.slice().reverse().map(s => `
              <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                <td style="padding:0.6rem 0.8rem;color:var(--accent-blue);font-weight:600;">${s.orderNumber}</td>
                <td style="padding:0.6rem 0.8rem;font-family:monospace;">${s.containerNumber}</td>
                <td style="padding:0.6rem 0.8rem;">${s.carrier}</td>
                <td style="padding:0.6rem 0.8rem;">
                  <div>${s.customerName}</div>
                  <div style="color:var(--text-secondary);font-size:0.75rem;">${s.customerEmail}</div>
                </td>
                <td style="padding:0.6rem 0.8rem;color:#4ade80;">${s.etaDate}</td>
                <td style="padding:0.6rem 0.8rem;color:var(--text-secondary);">${new Date(s.sentAt).toLocaleString()}</td>
                <td style="padding:0.6rem 0.8rem;">
                  <span style="
                    padding:3px 10px;border-radius:20px;font-size:0.75rem;font-weight:600;
                    background:${s.success ? 'rgba(74,222,128,0.1)' : 'rgba(255,107,107,0.1)'};
                    color:${s.success ? '#4ade80' : '#ff6b6b'};
                  ">${s.success ? '✓ 已发送' : '✗ 失败'}</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `
  }

  attachListeners(onRefresh) {
    const sendBtn = document.getElementById('sm-send-btn')
    const statusEl = document.getElementById('sm-status')

    if (!sendBtn) return

    sendBtn.addEventListener('click', async () => {
      const orderNumber = document.getElementById('sm-order-number').value.trim()
      const containerNumber = document.getElementById('sm-container-number').value.trim().toUpperCase()
      const carrier = document.getElementById('sm-carrier').value
      const etaDate = document.getElementById('sm-eta').value
      const origin = document.getElementById('sm-origin').value.trim()
      const destination = document.getElementById('sm-destination').value.trim()
      const customerName = document.getElementById('sm-customer-name').value.trim()
      const customerEmail = document.getElementById('sm-customer-email').value.trim()
      const notes = document.getElementById('sm-notes').value.trim()

      // 验证必填项
      if (!orderNumber || !containerNumber || !carrier || !etaDate || !customerName || !customerEmail) {
        statusEl.innerHTML = '<span style="color:#ff6b6b;">⚠️ 请填写所有必填项</span>'
        return
      }

      sendBtn.disabled = true
      sendBtn.textContent = '⏳ 发送中...'
      statusEl.innerHTML = ''

      try {
        const result = await this.sendNotification({
          orderNumber, containerNumber, carrier,
          origin, destination, etaDate,
          customerEmail, customerName, notes,
        })

        // 存本地记录
        this.shipments.push({
          orderNumber, containerNumber, carrier,
          origin, destination, etaDate,
          customerName, customerEmail, notes,
          trackingUrl: result.trackingUrl,
          emailId: result.emailId,
          sentAt: new Date().toISOString(),
          success: true,
        })
        this._saveToStorage()

        statusEl.innerHTML = `<span style="color:#4ade80;">✓ 邮件已发送给 ${customerEmail}</span>`

        // 清空表单
        ;['sm-order-number','sm-container-number','sm-eta','sm-customer-name','sm-customer-email','sm-notes'].forEach(id => {
          const el = document.getElementById(id)
          if (el) el.value = id === 'sm-origin' ? 'Yantai, China' : id === 'sm-destination' ? 'Vancouver, BC' : ''
        })
        document.getElementById('sm-carrier').value = ''

        // 刷新历史记录
        onRefresh?.()
      } catch (err) {
        this.shipments.push({
          orderNumber, containerNumber, carrier,
          customerName, customerEmail,
          sentAt: new Date().toISOString(),
          success: false,
          error: err.message,
        })
        this._saveToStorage()
        statusEl.innerHTML = `<span style="color:#ff6b6b;">✗ 发送失败: ${err.message}</span>`
      } finally {
        sendBtn.disabled = false
        sendBtn.textContent = '🚀 发送追踪通知'
      }
    })
  }
}
