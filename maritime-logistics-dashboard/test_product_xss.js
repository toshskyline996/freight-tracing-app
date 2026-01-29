import ProductManager from './src/productManager.js';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
        delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

global.localStorage = localStorageMock;

// Mock DOM
global.document = {
    getElementById: () => ({ value: '' }), // Minimal mock
    querySelectorAll: () => [],
    body: {
        insertAdjacentHTML: () => {}
    }
};

console.log("Running ProductManager Stored XSS Verification...");

const pm = new ProductManager();

// Manually inject malicious product into the lookup to simulate stored data
const maliciousProduct = {
    id: '123',
    name: '<img src=x onerror=alert(1)>',
    description: 'Malicious Description <script>alert(1)</script>',
    hsCode: '<b>Bold</b>',
    weight: '10',
    value: '100',
    origin: 'China',
    addedDate: new Date().toISOString()
};

pm.hsLookup.userProducts = [maliciousProduct];

const html = pm.renderProductLibrary();

let failed = false;

// Check Name
if (html.includes('<img src=x onerror=alert(1)>')) {
    console.log("❌ FAIL: Malicious 'name' tag preserved.");
    failed = true;
} else if (html.includes('&lt;img src=x onerror=alert(1)&gt;')) {
    console.log("✅ PASS: Malicious 'name' tag escaped.");
} else {
    console.log("⚠️ UNCERTAIN: Name check failed to find expected string.");
    // It might be formatted differently or partial match, but for this specific string it should be exact.
    failed = true;
}

// Check Description
if (html.includes('<script>alert(1)</script>')) {
    console.log("❌ FAIL: Malicious 'description' tag preserved.");
    failed = true;
} else if (html.includes('&lt;script&gt;alert(1)&lt;/script&gt;')) {
    console.log("✅ PASS: Malicious 'description' tag escaped.");
} else {
    console.log("⚠️ UNCERTAIN: Description check failed to find expected string.");
    failed = true;
}

// Check HS Code
if (html.includes('<b>Bold</b>')) {
    console.log("❌ FAIL: Malicious 'hsCode' tag preserved.");
    failed = true;
} else if (html.includes('&lt;b&gt;Bold&lt;/b&gt;')) {
    console.log("✅ PASS: Malicious 'hsCode' tag escaped.");
} else {
    console.log("⚠️ UNCERTAIN: HS Code check failed to find expected string.");
    failed = true;
}


if (failed) {
    console.error("\nTEST FAILED: Vulnerabilities detected.");
    process.exit(1);
} else {
    console.log("\nTEST PASSED: Inputs properly sanitized.");
    process.exit(0);
}
