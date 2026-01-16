// HS Code Lookup Module
// This module provides HS code classification for customs compliance

// Mock HS Code database (in production, integrate with Dutify/Avalara API)
const HS_CODE_DATABASE = [
  {
    code: '8703.23',
    fullCode: '8703.23.00',
    description: 'Vehicles with spark-ignition engine, cylinder capacity 1500-3000cc',
    chapter: '87 - Vehicles other than railway or tramway',
    heading: '8703 - Motor cars and other motor vehicles',
    dutyRate: '2.5%',
    keywords: ['car', 'automobile', 'vehicle', 'passenger car']
  },
  {
    code: '6203.42',
    fullCode: '6203.42.40',
    description: 'Men\'s or boys\' trousers, bib and brace overalls, breeches and shorts of cotton',
    chapter: '62 - Articles of apparel and clothing accessories',
    heading: '6203 - Men\'s suits, ensembles, jackets, blazers, trousers',
    dutyRate: '16.6%',
    keywords: ['trousers', 'pants', 'men', 'cotton', 'clothing']
  },
  {
    code: '8517.62',
    fullCode: '8517.62.00',
    description: 'Machines for reception, conversion and transmission of voice, images or data',
    chapter: '85 - Electrical machinery and equipment',
    heading: '8517 - Telephone sets, smartphones, routers',
    dutyRate: '0%',
    keywords: ['router', 'modem', 'network', 'telecommunications', 'wifi']
  },
  {
    code: '6109.10',
    fullCode: '6109.10.00',
    description: 'T-shirts, singlets and other vests of cotton, knitted or crocheted',
    chapter: '61 - Articles of apparel, knitted or crocheted',
    heading: '6109 - T-shirts, singlets and other vests',
    dutyRate: '16.5%',
    keywords: ['t-shirt', 'tshirt', 'vest', 'cotton', 'clothing', 'apparel']
  },
  {
    code: '8471.30',
    fullCode: '8471.30.01',
    description: 'Portable automatic data processing machines weighing not more than 10 kg',
    chapter: '84 - Nuclear reactors, boilers, machinery',
    heading: '8471 - Automatic data processing machines and units',
    dutyRate: '0%',
    keywords: ['laptop', 'computer', 'notebook', 'portable computer']
  },
  {
    code: '9403.60',
    fullCode: '9403.60.80',
    description: 'Other wooden furniture',
    chapter: '94 - Furniture; bedding, mattresses',
    heading: '9403 - Other furniture and parts',
    dutyRate: '0-4.4%',
    keywords: ['furniture', 'wooden', 'table', 'chair', 'desk']
  },
  {
    code: '6402.99',
    fullCode: '6402.99.31',
    description: 'Footwear with outer soles and uppers of rubber or plastics',
    chapter: '64 - Footwear, gaiters and the like',
    heading: '6402 - Other footwear with outer soles',
    dutyRate: '6%',
    keywords: ['shoes', 'footwear', 'sneakers', 'rubber shoes']
  },
  {
    code: '3926.90',
    fullCode: '3926.90.99',
    description: 'Other articles of plastics',
    chapter: '39 - Plastics and articles thereof',
    heading: '3926 - Other articles of plastics',
    dutyRate: '5.3%',
    keywords: ['plastic', 'plastic products', 'plastic items']
  }
]

class HSCodeLookup {
  constructor() {
    this.database = HS_CODE_DATABASE
    this.userProducts = this.loadUserProducts()
  }

  loadUserProducts() {
    const stored = localStorage.getItem('user_products')
    return stored ? JSON.parse(stored) : []
  }

  saveUserProducts() {
    localStorage.setItem('user_products', JSON.stringify(this.userProducts))
  }

  searchHSCode(query) {
    const lowercaseQuery = query.toLowerCase()
    const words = lowercaseQuery.split(' ').filter(w => w.length > 2)
    
    const results = this.database.map(item => {
      let score = 0
      
      // Exact code match
      if (item.code.includes(query) || item.fullCode.includes(query)) {
        score += 100
      }
      
      // Description match
      if (item.description.toLowerCase().includes(lowercaseQuery)) {
        score += 50
      }
      
      // Keyword match
      words.forEach(word => {
        item.keywords.forEach(keyword => {
          if (keyword.includes(word)) {
            score += 20
          }
        })
      })
      
      // Chapter/heading match
      if (item.chapter.toLowerCase().includes(lowercaseQuery) || 
          item.heading.toLowerCase().includes(lowercaseQuery)) {
        score += 30
      }
      
      return { ...item, score }
    })
    
    return results
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
  }

  addProduct(productData) {
    const product = {
      id: Date.now().toString(),
      name: productData.name,
      description: productData.description,
      hsCode: productData.hsCode,
      weight: productData.weight,
      value: productData.value,
      origin: productData.origin,
      addedDate: new Date().toISOString()
    }
    
    this.userProducts.unshift(product)
    if (this.userProducts.length > 50) {
      this.userProducts = this.userProducts.slice(0, 50)
    }
    
    this.saveUserProducts()
    return product
  }

  deleteProduct(productId) {
    this.userProducts = this.userProducts.filter(p => p.id !== productId)
    this.saveUserProducts()
  }

  getProducts() {
    return this.userProducts
  }

  exportProductsCSV() {
    if (this.userProducts.length === 0) {
      return ''
    }
    
    const headers = ['Name', 'Description', 'HS Code', 'Weight (kg)', 'Value (USD)', 'Origin', 'Added Date']
    const rows = this.userProducts.map(p => [
      p.name,
      p.description,
      p.hsCode,
      p.weight,
      p.value,
      p.origin,
      new Date(p.addedDate).toLocaleDateString()
    ])
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    return csv
  }
}

export default HSCodeLookup
