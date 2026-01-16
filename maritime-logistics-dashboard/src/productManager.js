// Product Manager UI Module
import HSCodeLookup from './hsCodeLookup.js'

class ProductManager {
  constructor() {
    this.hsLookup = new HSCodeLookup()
  }

  renderProductLibrary() {
    const products = this.hsLookup.getProducts()
    
    return `
      <section class="card" style="grid-column: span 12;">
        <div class="card-title">
          <span>Product Library & HS Code Manager</span>
          <button id="add-product-btn" style="width: auto; padding: 0.5rem 1rem; margin: 0;">
            + Add Product
          </button>
        </div>
        
        <div id="product-search" style="margin-bottom: 1.5rem;">
          <div class="input-group">
            <label>Search HS Code by Product Description</label>
            <input type="text" id="hs-search-input" placeholder="e.g., cotton t-shirt, laptop computer, wooden furniture...">
          </div>
          <div id="hs-search-results"></div>
        </div>

        <div id="product-list">
          ${products.length === 0 ? `
            <p style="color: var(--text-secondary); text-align: center; padding: 2rem;">
              No products added yet. Start by searching for HS codes above or add a product manually.
            </p>
          ` : `
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>HS Code</th>
                  <th>Weight</th>
                  <th>Value</th>
                  <th>Origin</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${products.map(p => `
                  <tr>
                    <td>
                      <strong>${p.name}</strong>
                      <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">
                        ${p.description}
                      </div>
                    </td>
                    <td><code style="color: var(--accent-blue)">${p.hsCode}</code></td>
                    <td>${p.weight} kg</td>
                    <td>$${p.value}</td>
                    <td>${p.origin}</td>
                    <td>
                      <button class="delete-product-btn" data-id="${p.id}" 
                        style="padding: 0.25rem 0.5rem; font-size: 0.75rem; background: rgba(255,107,107,0.1); 
                        color: var(--accent-orange); border: 1px solid var(--accent-orange);">
                        Delete
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div style="margin-top: 1rem; display: flex; gap: 1rem;">
              <button id="export-csv-btn" style="width: auto; padding: 0.5rem 1rem;">
                Export to CSV
              </button>
              <span style="color: var(--text-secondary); font-size: 0.8rem; line-height: 2.5;">
                Total: ${products.length} products
              </span>
            </div>
          `}
        </div>
      </section>
    `
  }

  attachEventListeners() {
    // HS Code search
    const searchInput = document.getElementById('hs-search-input')
    if (searchInput) {
      let searchTimeout
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout)
        searchTimeout = setTimeout(() => {
          this.performHSSearch(e.target.value)
        }, 500)
      })
    }

    // Add product button
    const addBtn = document.getElementById('add-product-btn')
    if (addBtn) {
      addBtn.addEventListener('click', () => this.showAddProductModal())
    }

    // Delete product buttons
    document.querySelectorAll('.delete-product-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.getAttribute('data-id')
        if (confirm('Are you sure you want to delete this product?')) {
          this.hsLookup.deleteProduct(productId)
          this.refreshProductList()
        }
      })
    })

    // Export CSV button
    const exportBtn = document.getElementById('export-csv-btn')
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportToCSV())
    }
  }

  performHSSearch(query) {
    const resultsDiv = document.getElementById('hs-search-results')
    if (!query || query.length < 3) {
      resultsDiv.innerHTML = ''
      return
    }

    const results = this.hsLookup.searchHSCode(query)
    
    if (results.length === 0) {
      resultsDiv.innerHTML = `
        <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.5rem;">
          No matching HS codes found. Try different keywords.
        </p>
      `
      return
    }

    resultsDiv.innerHTML = `
      <div style="margin-top: 1rem; border: 1px solid var(--glass-border); border-radius: 8px; overflow: hidden;">
        ${results.map(item => `
          <div style="padding: 1rem; border-bottom: 1px solid var(--glass-border); background: rgba(100, 255, 218, 0.02);">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                  <code style="background: rgba(100, 255, 218, 0.1); padding: 0.25rem 0.5rem; 
                    border-radius: 4px; color: var(--accent-blue); font-weight: 700; font-size: 0.9rem;">
                    ${item.fullCode}
                  </code>
                  <span style="color: var(--accent-orange); font-size: 0.75rem; font-weight: 600;">
                    Duty: ${item.dutyRate}
                  </span>
                </div>
                <p style="font-size: 0.85rem; margin-bottom: 0.5rem;">${item.description}</p>
                <p style="font-size: 0.75rem; color: var(--text-secondary);">
                  ${item.chapter}<br/>
                  ${item.heading}
                </p>
              </div>
              <button class="use-hs-code-btn" data-code="${item.fullCode}" data-description="${item.description}"
                style="padding: 0.5rem 1rem; font-size: 0.75rem; white-space: nowrap; margin-left: 1rem;">
                Use This Code
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `

    // Attach click handlers to "Use This Code" buttons
    document.querySelectorAll('.use-hs-code-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const code = e.target.getAttribute('data-code')
        const description = e.target.getAttribute('data-description')
        this.showAddProductModal(code, description)
      })
    })
  }

  showAddProductModal(hsCode = '', hsDescription = '') {
    const modalHTML = `
      <div id="product-modal" style="
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(2, 12, 27, 0.9); z-index: 1000;
        display: flex; align-items: center; justify-content: center;">
        <div class="card" style="width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto;">
          <div class="card-title">
            <span>Add New Product</span>
            <button id="close-modal-btn" style="width: auto; padding: 0.25rem 0.5rem; margin: 0; font-size: 0.85rem;">
              ✕ Close
            </button>
          </div>
          <form id="add-product-form">
            <div class="input-group">
              <label>Product Name *</label>
              <input type="text" id="product-name" required placeholder="e.g., Men's Cotton T-Shirt">
            </div>
            <div class="input-group">
              <label>Description</label>
              <textarea id="product-description" rows="3" 
                style="width: 100%; padding: 0.75rem; background: var(--bg-deep); 
                border: 1px solid var(--glass-border); border-radius: 6px; color: var(--text-primary); 
                resize: vertical; font-family: inherit;"
                placeholder="Detailed product description...">${hsDescription}</textarea>
            </div>
            <div class="input-group">
              <label>HS Code *</label>
              <input type="text" id="product-hs-code" required value="${hsCode}" placeholder="e.g., 6109.10.00">
              <small style="color: var(--text-secondary); font-size: 0.75rem;">
                Search above to find the correct HS code
              </small>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="input-group">
                <label>Weight (kg) *</label>
                <input type="number" id="product-weight" step="0.01" required placeholder="0.00">
              </div>
              <div class="input-group">
                <label>Value (USD) *</label>
                <input type="number" id="product-value" step="0.01" required placeholder="0.00">
              </div>
            </div>
            <div class="input-group">
              <label>Origin Country *</label>
              <select id="product-origin" required>
                <option value="">Select origin...</option>
                <option value="China">China</option>
                <option value="USA">United States</option>
                <option value="India">India</option>
                <option value="Vietnam">Vietnam</option>
                <option value="Bangladesh">Bangladesh</option>
                <option value="Mexico">Mexico</option>
                <option value="Germany">Germany</option>
                <option value="Italy">Italy</option>
                <option value="Turkey">Turkey</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <button type="submit" style="margin-top: 1rem;">Save Product</button>
          </form>
        </div>
      </div>
    `

    document.body.insertAdjacentHTML('beforeend', modalHTML)

    // Close modal
    document.getElementById('close-modal-btn').addEventListener('click', () => {
      document.getElementById('product-modal').remove()
    })

    // Form submission
    document.getElementById('add-product-form').addEventListener('submit', (e) => {
      e.preventDefault()
      
      const productData = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        hsCode: document.getElementById('product-hs-code').value,
        weight: document.getElementById('product-weight').value,
        value: document.getElementById('product-value').value,
        origin: document.getElementById('product-origin').value
      }

      this.hsLookup.addProduct(productData)
      document.getElementById('product-modal').remove()
      this.refreshProductList()
    })
  }

  refreshProductList() {
    const dashboardGrid = document.querySelector('.dashboard-grid')
    if (dashboardGrid) {
      dashboardGrid.innerHTML = this.renderProductLibrary()
      this.attachEventListeners()
    }
  }

  exportToCSV() {
    const csv = this.hsLookup.exportProductsCSV()
    if (!csv) {
      alert('No products to export')
      return
    }

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `products_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }
}

export default ProductManager
