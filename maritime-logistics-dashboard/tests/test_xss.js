import AIAssistant from '../src/aiAssistant.js';

console.log("Running XSS Reproduction...");

const ai = new AIAssistant();
const maliciousInput = "<img src=x onerror=alert('XSS')>";
const markdownInput = "**Bold Text** and *Italic*";
const mixedInput = "**<script>alert(1)</script>**";

const outputMalicious = ai.formatMessage(maliciousInput);
const outputMarkdown = ai.formatMessage(markdownInput);
const outputMixed = ai.formatMessage(mixedInput);

console.log("\n--- Test 1: Malicious Input ---");
console.log("Input: " + maliciousInput);
console.log("Output: " + outputMalicious);

console.log("\n--- Test 2: Markdown Input ---");
console.log("Input: " + markdownInput);
console.log("Output: " + outputMarkdown);

console.log("\n--- Test 3: Mixed Input ---");
console.log("Input: " + mixedInput);
console.log("Output: " + outputMixed);

console.log("\n--- Result ---");
if (outputMalicious.includes("<img")) {
    console.log("FAIL: XSS Vulnerability confirmed (tags preserved).");
} else {
    console.log("PASS: Tags escaped.");
}
