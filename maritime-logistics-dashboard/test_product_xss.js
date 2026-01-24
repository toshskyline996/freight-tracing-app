// Mock localStorage before imports
global.localStorage = {
  store: {},
  getItem: function(key) { return this.store[key] || null; },
  setItem: function(key, value) { this.store[key] = value.toString(); },
  clear: function() { this.store = {}; }
};

// Import the module
import ProductManager from './src/productManager.js';

async function test() {
    console.log("Running Stored XSS Reproduction in ProductManager...");

    // Setup malicious data
    const maliciousPayload = "<script>alert('XSS')</script>";
    const products = [
        {
            id: '1',
            name: maliciousPayload,
            description: "Desc with " + maliciousPayload,
            hsCode: "123",
            weight: 10,
            value: 100,
            origin: "China",
            addedDate: new Date().toISOString()
        }
    ];

    // Inject into mock storage
    localStorage.setItem('user_products', JSON.stringify(products));

    // Instantiate Manager
    const manager = new ProductManager();

    // Render
    const html = manager.renderProductLibrary();

    console.log("--- Render Output (Snippet) ---");

    if (html.includes(maliciousPayload)) {
        console.log("VULNERABILITY CONFIRMED: Found raw malicious payload in output.");
        console.log("Output contains unescaped script tags.");
    } else {
        console.log("SAFE: Malicious payload not found in raw form.");
        // Check if escaped
        if (html.includes("&lt;script&gt;")) {
            console.log("VERIFIED: Payload is properly escaped.");
        } else {
            console.log("WARNING: Payload missing entirely?");
        }
    }
}

test();
