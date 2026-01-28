// Verification script for Stored XSS in ProductManager

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = value.toString();
  },
  removeItem(key) {
    delete this.store[key];
  }
};
global.localStorage = localStorageMock;

// Import ProductManager (dynamic import to ensure global.localStorage is set first)
async function verify() {
  const { default: ProductManager } = await import('./src/productManager.js');

  console.log("Running ProductManager XSS Verification...");

  const pm = new ProductManager();

  // Inject malicious product
  const maliciousProduct = {
    name: "<img src=x onerror=alert('XSS Name')>",
    description: "<script>alert('XSS Description')</script>",
    hsCode: "<b>1234.56</b>",
    weight: 10,
    value: 100,
    origin: "China"
  };

  // Add product via HSCodeLookup (accessed via pm.hsLookup)
  pm.hsLookup.addProduct(maliciousProduct);

  // Render the product library
  const html = pm.renderProductLibrary();

  console.log("\n--- Rendered HTML Output (Snippet) ---");
  // Extract the table row part
  const rowMatch = html.match(/<tr>[\s\S]*?<\/tr>/g);
  // Find the row with our product (it should be the first one as addProduct unshifts)
  const firstRow = rowMatch ? rowMatch[1] : null; // index 0 is the header row, wait.
  // No, renderProductLibrary renders <thead> then <tbody> with map.

  // Let's just log the relevant parts
  const nameCheck = html.includes("&lt;img src=x onerror=alert(&#039;XSS Name&#039;)&gt;");
  const descCheck = html.includes("&lt;script&gt;alert(&#039;XSS Description&#039;)&lt;/script&gt;");
  const codeCheck = html.includes("&lt;b&gt;1234.56&lt;/b&gt;");

  console.log(`Name escaped: ${nameCheck}`);
  console.log(`Description escaped: ${descCheck}`);
  console.log(`HS Code escaped: ${codeCheck}`);

  if (nameCheck && descCheck && codeCheck) {
    console.log("\n✅ PASS: All inputs are correctly escaped.");
  } else {
    console.log("\n❌ FAIL: XSS vulnerability detected.");
    console.log("Expected name to contain: &lt;img src=x onerror=alert(&#039;XSS Name&#039;)&gt;");
    console.log("Expected description to contain: &lt;script&gt;alert(&#039;XSS Description&#039;)&lt;/script&gt;");

    // Log actual output if failed
    if (!nameCheck) console.log("Actual Name Output: " + html.match(/<strong>(.*?)<\/strong>/)[1]);

    process.exit(1);
  }
}

verify().catch(console.error);
