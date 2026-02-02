import { escapeHtml } from '../src/utils.js';

const products = [{
    name: "<script>alert('XSS')</script>",
    description: "Malicious product with <img src=x onerror=alert(1)>",
    hsCode: "1234.56",
    weight: "10",
    value: "100",
    origin: "Nowhere"
}];

const render = (products) => {
    return `
      <tbody>
        ${products.map(p => `
          <tr>
            <td>
              <strong>${escapeHtml(p.name)}</strong>
              <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">
                ${escapeHtml(p.description)}
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    `
};

const output = render(products);
console.log("Rendered Output:\n", output);

if (output.includes("<script>alert('XSS')</script>") || output.includes("<img src=x onerror=alert(1)>")) {
    console.log("\n❌ VULNERABILITY STILL EXISTS: XSS payload present in output");
} else {
    // Check if it IS escaped
    if (output.includes("&lt;script&gt;alert(&#039;XSS&#039;)&lt;/script&gt;") && output.includes("&lt;img src=x onerror=alert(1)&gt;")) {
        console.log("\n✅ SAFE: XSS payload correctly escaped");
    } else {
        console.log("\n⚠️ INDETERMINATE: Payloads not found in raw form, but expected escaped form also not found.");
    }
}
