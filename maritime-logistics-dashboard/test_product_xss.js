// Mock browser environment
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
    },
    removeItem: function(key) {
      delete store[key];
    }
  };
})();

global.localStorage = localStorageMock;

global.document = {
  getElementById: () => null,
  querySelectorAll: () => [],
  body: {
    insertAdjacentHTML: () => {}
  }
};

global.window = {
  URL: {
    createObjectURL: () => {},
    revokeObjectURL: () => {}
  }
};

// Import the module
import ProductManager from './src/productManager.js';

console.log("Running ProductManager XSS Reproduction...");

// Seed malicious data
const maliciousProduct = {
  id: "123",
  name: "<script>alert('XSS Name')</script>",
  description: "<img src=x onerror=alert('XSS Desc')>",
  hsCode: "<b>1234.56</b>",
  weight: "10",
  value: "100",
  origin: "China",
  addedDate: new Date().toISOString()
};

localStorage.setItem('user_products', JSON.stringify([maliciousProduct]));

// Instantiate
const pm = new ProductManager();
const output = pm.renderProductLibrary();

console.log("\n--- Render Output Snippet ---");
// Log a substring to avoid flooding console, but enough to see the rows
const tableBodyIndex = output.indexOf('<tbody>');
const tableEndIndex = output.indexOf('</tbody>');
if (tableBodyIndex !== -1 && tableEndIndex !== -1) {
    console.log(output.substring(tableBodyIndex, tableEndIndex + 8));
} else {
    console.log(output);
}


console.log("\n--- Verification ---");
let fail = false;
if (output.includes("<script>alert('XSS Name')</script>")) {
  console.log("FAIL: XSS Vulnerability confirmed (Name tag preserved).");
  fail = true;
} else if (output.includes("&lt;script&gt;alert('XSS Name')&lt;/script&gt;")) {
  console.log("PASS: Name tag escaped.");
} else {
  console.log("UNCLEAR: Script tag not found in expected form.");
}

if (output.includes("<img src=x onerror=alert('XSS Desc')>")) {
  console.log("FAIL: XSS Vulnerability confirmed (Description tag preserved).");
  fail = true;
} else if (output.includes("&lt;img src=x onerror=alert('XSS Desc')&gt;")) {
  console.log("PASS: Description tag escaped.");
}

if (fail) {
    console.log("OVERALL: VULNERABLE");
} else {
    console.log("OVERALL: SECURE");
}
