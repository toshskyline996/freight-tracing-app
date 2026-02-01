
// Mock global objects required by modules
global.localStorage = {
  getItem: () => JSON.stringify([{
    name: "<script>alert('XSS')</script>",
    description: "Malicious product",
    hsCode: "1234.56",
    weight: 10,
    value: 100,
    origin: "China",
    id: "1"
  }]),
  setItem: () => {}
};

// Mock document for ProductManager
global.document = {
    getElementById: () => ({ addEventListener: () => {} }),
    querySelectorAll: () => []
};

import ProductManager from './src/productManager.js';

console.log("Running ProductManager XSS Test...");

try {
    const pm = new ProductManager();
    const html = pm.renderProductLibrary();

    console.log("\nRendered HTML snippet:");
    // Log the relevant part
    const match = html.match(/<strong>(.*?)<\/strong>/);
    if (match) {
        console.log(match[0]);
    } else {
        console.log("Could not find product name in HTML");
    }

    if (html.includes("<script>alert('XSS')</script>")) {
        console.log("\n🚨 FAIL: VULNERABILITY CONFIRMED: Stored XSS found in ProductManager");
        console.log("The raw script tag was rendered into the HTML.");
        process.exit(1);
    } else {
        console.log("\n✅ PASS: Input appears to be sanitized");
        process.exit(0);
    }
} catch (error) {
    console.error("Error running test:", error);
    process.exit(1);
}
