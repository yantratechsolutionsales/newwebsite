import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateLineItem, calculateQuotationTotals, formatINR, numberToIndianWords } from './src/utils/calculations.ts';

// TEST 1: Quotation with taxable amount ₹1,00,000 and IGST 18%
// Expected: Taxable Amount = ₹1,00,000, IGST = ₹18,000, Grand Total = ₹1,18,000
const test1Item = {
  id: 'test-1',
  name: 'Test Industrial Item',
  brand: 'Fluke',
  model: '87V',
  description: 'Test',
  technicalSpecs: 'Range: 1000V',
  quantity: 1,
  unit: 'Nos',
  rate: 100000,
  discountPercent: 0,
  discountAmount: 0,
  taxableAmount: 100000,
  gstRate: 18,
  gstAmount: 18000,
  totalAmount: 118000,
  hsnSac: '9030',
};

const test1Totals = calculateQuotationTotals([test1Item], 'IGST');
console.log('--- TEST 1: IGST ---');
console.log('Taxable:', test1Totals.taxableSubtotal, 'Expected: 100000');
console.log('IGST:', test1Totals.igstAmount, 'Expected: 18000');
console.log('CGST:', test1Totals.cgstAmount, 'Expected: 0');
console.log('SGST:', test1Totals.sgstAmount, 'Expected: 0');
console.log('Grand Total:', test1Totals.grandTotal, 'Expected: 118000');
assert.strictEqual(test1Totals.taxableSubtotal, 100000);
assert.strictEqual(test1Totals.igstAmount, 18000);
assert.strictEqual(test1Totals.cgstAmount, 0);
assert.strictEqual(test1Totals.sgstAmount, 0);
assert.strictEqual(test1Totals.grandTotal, 118000);

// TEST 2: Quotation with taxable amount ₹1,00,000 and CGST + SGST (9% + 9%)
// Expected: Taxable Amount = ₹1,00,000, CGST = ₹9,000, SGST = ₹9,000, Grand Total = ₹1,18,000
const test2Totals = calculateQuotationTotals([test1Item], 'CGST_SGST');
console.log('\n--- TEST 2: CGST + SGST ---');
console.log('Taxable:', test2Totals.taxableSubtotal, 'Expected: 100000');
console.log('CGST:', test2Totals.cgstAmount, 'Expected: 9000');
console.log('SGST:', test2Totals.sgstAmount, 'Expected: 9000');
console.log('IGST:', test2Totals.igstAmount, 'Expected: 0');
console.log('Grand Total:', test2Totals.grandTotal, 'Expected: 118000');
assert.strictEqual(test2Totals.taxableSubtotal, 100000);
assert.strictEqual(test2Totals.cgstAmount, 9000);
assert.strictEqual(test2Totals.sgstAmount, 9000);
assert.strictEqual(test2Totals.igstAmount, 0);
assert.strictEqual(test2Totals.grandTotal, 118000);

// TEST 5 & 22: Discount Applied
// Gross = 2 * 50,000 = 1,00,000; Discount 10% = 10,000; Taxable = 90,000; GST 18% = 16,200; Grand = 1,06,200
const lineCalc = calculateLineItem(2, 50000, 10, 18);
console.log('\n--- TEST 5: Line Item Discount & Tax ---');
console.log('Discount Amount:', lineCalc.discountAmount, 'Expected: 10000');
console.log('Taxable Amount:', lineCalc.taxableAmount, 'Expected: 90000');
console.log('GST Amount:', lineCalc.gstAmount, 'Expected: 16200');
console.log('Total Amount:', lineCalc.totalAmount, 'Expected: 106200');
assert.strictEqual(lineCalc.discountAmount, 10000);
assert.strictEqual(lineCalc.taxableAmount, 90000);
assert.strictEqual(lineCalc.gstAmount, 16200);
assert.strictEqual(lineCalc.totalAmount, 106200);

// Currency formatting test
console.log('\n--- TEST INR Formatting & Words ---');
console.log('Formatted:', formatINR(125000));
console.log('In words:', numberToIndianWords(125000));
assert.strictEqual(formatINR(125000), '₹ 1,25,000.00');

console.log('\nALL CALCULATION VERIFICATION TESTS PASSED SUCCESSFULLY! ✅');
