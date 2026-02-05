
import ProductManager from './src/productManager.js';

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) {
      return store[key] || null;
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    clear: function() {
      store = {};
    }
  };
})();

global.localStorage = localStorageMock;

// Mock document
global.document = {
    getElementById: () => ({ addEventListener: () => {} }),
    querySelectorAll: () => [],
    body: { insertAdjacentHTML: () => {} }
};

console.log("Running ProductManager XSS Reproduction...");

const pm = new ProductManager();
const maliciousProduct = {
    name: "<img src=x onerror=alert('XSS')>",
    description: "Malicious Description",
    hsCode: "1234.56",
    weight: "10",
    value: "100",
    origin: "China"
};

// Add malicious product
pm.hsLookup.addProduct(maliciousProduct);

// Render library
const html = pm.renderProductLibrary();

console.log("\n--- Rendered HTML ---");
console.log(html);

console.log("\n--- Result ---");
if (html.includes("<img src=x onerror=alert('XSS')>")) {
    console.log("FAIL: XSS Vulnerability confirmed (tags preserved).");
} else {
    console.log("PASS: Tags escaped.");
}
