import { test } from "node:test";
import assert from "node:assert/strict";

import { escapeRegExp } from "../src/utils/escapeRegExp.js";
import hashToken from "../src/utils/hashToken.js";
import { encryptBuffer, decryptBuffer } from "../src/utils/encryption.js";
import generateInvoiceEmailContent from "../src/utils/generateInvoiceEmailContent.js";
import otpTemplate from "../src/templates/otp.template.js";
import { PAYMENT_STATUS } from "../src/utils/invoice.constant.js";

test("escapeRegExp neutralises regex metacharacters", () => {
    const input = "a.b*c+(d)[e]";
    const regex = new RegExp(escapeRegExp(input));
    assert.ok(regex.test(input));
    assert.ok(!regex.test("aXbbc"));
});

test("hashToken is a stable sha-256 hex digest", () => {
    assert.equal(hashToken("abc"), hashToken("abc"));
    assert.notEqual(hashToken("abc"), hashToken("abd"));
    assert.match(hashToken("abc"), /^[0-9a-f]{64}$/);
});

test("encryptBuffer / decryptBuffer round trip", () => {
    process.env.CACHE_ENCRYPTION_KEY = "0".repeat(64);
    const original = Buffer.from("%PDF-1.4 test");
    const encrypted = encryptBuffer(original);
    assert.notDeepEqual(encrypted, original);
    assert.deepEqual(decryptBuffer(encrypted), original);
});

test("decryptBuffer rejects tampered data", () => {
    process.env.CACHE_ENCRYPTION_KEY = "0".repeat(64);
    const encrypted = encryptBuffer(Buffer.from("secret"));
    encrypted[encrypted.length - 1] ^= 1;
    assert.throws(() => decryptBuffer(encrypted));
});

test("invoice email escapes HTML in user supplied fields", () => {
    const { subject, body } = generateInvoiceEmailContent({
        invoiceNumber: "INV-2",
        status: "Pending",
        grandTotal: 118,
        dueDate: "2030-01-01",
        business: { businessName: "<script>alert(1)</script>", currency: "INR" },
        customer: { customerName: "A & B" },
        items: [{ productName: "Item", quantity: 1, lineTotal: 118 }],
    });
    assert.ok(!body.includes("<script>alert(1)</script>"));
    assert.ok(body.includes("A &amp; B"));
    assert.match(subject, /INV-2/);
});

test("OTP e-mail escapes the username", () => {
    const html = otpTemplate("<b>x</b>", "123456");
    assert.ok(!html.includes("<b>x</b>"));
    assert.ok(html.includes("123456"));
});

test("payment statuses match the invoice schema enum", () => {
    assert.deepEqual(Object.values(PAYMENT_STATUS).sort(), [
        "Cancelled",
        "Draft",
        "Overdue",
        "Paid",
        "Partially Paid",
        "Pending",
    ]);
});
