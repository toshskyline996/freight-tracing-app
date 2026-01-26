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
    },
    removeItem: function(key) {
      delete store[key];
    }
  };
})();

global.localStorage = localStorageMock;

// Mock window/document references if strictly needed.
// ProductManager accesses document in attachEventListeners but we won't call it.
// However, if any other part accesses global objects, we might need them.
global.window = {};

console.log("Running ProductManager XSS Test...");

const pm = new ProductManager();

// Add a malicious product directly to hsLookup (simulating stored data)
const maliciousProduct = {
    name: "<img src=x onerror=alert('XSS')>",
    description: "Descr <script>alert(1)</script>",
    hsCode: "1234<b>bold</b>",
    weight: "10",
    value: "100",
    origin: "China"
};

// We can use pm.hsLookup.addProduct, but it generates ID and date.
pm.hsLookup.addProduct(maliciousProduct);

const html = pm.renderProductLibrary();

console.log("Rendered HTML length:", html.length);

// Check if tags are escaped
const failures = [];

// Name check
if (html.includes("<img src=x")) {
    failures.push("Name XSS not escaped: <img src=x");
} else if (html.includes("&lt;img src=x")) {
    console.log("PASS: Name is escaped.");
} else {
    failures.push("Name check failed (pattern not found).");
}

// Description check
if (html.includes("<script>")) {
    failures.push("Description XSS not escaped: <script>");
} else if (html.includes("&lt;script&gt;")) {
    console.log("PASS: Description is escaped.");
} else {
    failures.push("Description check failed (pattern not found).");
}

// HS Code check
if (html.includes("<b>bold</b>")) {
    failures.push("HS Code XSS not escaped: <b>");
} else if (html.includes("&lt;b&gt;bold&lt;/b&gt;")) {
    console.log("PASS: HS Code is escaped.");
} else {
    failures.push("HS Code check failed (pattern not found).");
}

if (failures.length > 0) {
    console.error("FAILURES found:");
    failures.forEach(f => console.error("- " + f));
    process.exit(1);
} else {
    console.log("SUCCESS: All XSS vectors escaped.");
}
