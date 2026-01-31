// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

global.localStorage = localStorageMock;

// Mock document
global.document = {
    getElementById: () => null,
    querySelector: () => null,
    body: {
        insertAdjacentHTML: () => {}
    },
    querySelectorAll: () => []
};

// Mock window
global.window = {
    URL: {
        createObjectURL: () => {},
        revokeObjectURL: () => {}
    }
};

import ProductManager from './src/productManager.js';

console.log("Running Product Manager XSS Reproduction...");

// Setup malicious product
const maliciousPayload = "<img src=x onerror=alert('XSS')>";
const maliciousProduct = {
    name: maliciousPayload,
    description: maliciousPayload,
    hsCode: maliciousPayload,
    weight: "100",
    value: "100",
    origin: maliciousPayload
};

// Seed localStorage
const products = [
    {
        id: "1",
        ...maliciousProduct,
        addedDate: new Date().toISOString()
    }
];
localStorage.setItem('user_products', JSON.stringify(products));

const pm = new ProductManager();
const html = pm.renderProductLibrary();

console.log("\n--- Checking for Vulnerability ---");

if (html.includes(maliciousPayload)) {
    console.log("FAIL: XSS Vulnerability confirmed (Malicious payload present unescaped).");
    // We expect this to fail initially
} else {
    // Check if it is properly escaped
    const escapedPayload = "&lt;img src=x onerror=alert('XSS')&gt;";
    // Or other variations of escaping depending on implementation
    if (html.includes(escapedPayload) || html.includes("&lt;img")) {
         console.log("PASS: Payload is escaped.");
    } else {
         console.log("FAIL: Payload not found (unexpected).");
         console.log("Output snippet: " + html.substring(0, 500));
    }
}
