
// Mock global objects for Node environment
global.localStorage = {
  getItem: (key) => {
    if (key === 'user_products') {
      return JSON.stringify([{
        id: '1',
        name: '<script>alert("XSS")</script>',
        description: '<b>Bold</b> & "Quote"',
        hsCode: '1234.56',
        weight: '10',
        value: '100',
        origin: 'China'
      }]);
    }
    return null;
  },
  setItem: () => {},
};

// Mock document.getElementById since ProductManager uses it in constructor (not really, but attachEventListeners might be called if we weren't careful)
// Actually ProductManager constructor only does this.hsLookup = new HSCodeLookup()
// HSCodeLookup constructor only does this.userProducts = this.loadUserProducts()
// So we are safe from DOM access in constructor.

import ProductManager from './src/productManager.js';

console.log("Running ProductManager XSS Verification...");

try {
  const pm = new ProductManager();
  const html = pm.renderProductLibrary();

  // Check for escaped characters
  const checks = [
    { name: 'Script Tag', expected: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;', regex: /&lt;script&gt;alert\(&quot;XSS&quot;\)&lt;\/script&gt;/ },
    { name: 'HTML Entity', expected: '&lt;b&gt;Bold&lt;/b&gt; &amp; &quot;Quote&quot;', regex: /&lt;b&gt;Bold&lt;\/b&gt; &amp; &quot;Quote&quot;/ }
  ];

  let allPass = true;

  checks.forEach(check => {
    if (check.regex.test(html)) {
      console.log(`PASS: ${check.name} escaped correctly.`);
    } else {
      console.log(`FAIL: ${check.name} NOT escaped correctly.`);
      console.log(`Expected to find regex match for: ${check.expected}`);
      allPass = false;
    }
  });

  if (html.includes('<script>')) {
     console.log('FAIL: Raw <script> tag found!');
     allPass = false;
  } else {
     console.log('PASS: No raw <script> tag found.');
  }

  if (allPass) {
    console.log("\n✅ SUCCESS: Stored XSS vulnerability fixed.");
    process.exit(0);
  } else {
    console.log("\n❌ FAILURE: Vulnerability still exists or verification failed.");
    console.log("Output HTML snippet:");
    console.log(html.substring(html.indexOf('<tbody>'), html.indexOf('</tbody>')));
    process.exit(1);
  }

} catch (error) {
  console.error("An error occurred during verification:", error);
  process.exit(1);
}
