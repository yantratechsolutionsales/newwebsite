import type { QuotationItem, TaxType } from '../types/index.ts';

/**
 * Rounds a number accurately to 2 decimal places to prevent floating-point artifacts.
 */
export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates a single quotation line item amounts based on quantity, rate, discount%, and GST%.
 */
export function calculateLineItem(
  quantity: number,
  rate: number,
  discountPercent: number,
  gstRate: number
): {
  discountAmount: number;
  taxableAmount: number;
  gstAmount: number;
  totalAmount: number;
} {
  const safeQty = Math.max(0, quantity || 0);
  const safeRate = Math.max(0, rate || 0);
  const safeDiscPercent = Math.min(100, Math.max(0, discountPercent || 0));
  const safeGstRate = Math.max(0, gstRate || 0);

  const gross = round2(safeQty * safeRate);
  const discountAmount = round2(gross * (safeDiscPercent / 100));
  const taxableAmount = round2(gross - discountAmount);
  const gstAmount = round2(taxableAmount * (safeGstRate / 100));
  const totalAmount = round2(taxableAmount + gstAmount);

  return {
    discountAmount,
    taxableAmount,
    gstAmount,
    totalAmount,
  };
}

export interface QuotationCommercialSummary {
  grossSubtotal: number;
  totalDiscount: number;
  taxableSubtotal: number;
  totalGst: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  freightAndOtherCharges: number;
  grandTotal: number;
}

/**
 * Centralized calculation function used across Quotation Builder, Preview, PDF generation, and Dashboard.
 * Ensures 100% calculation consistency and zero discrepancy.
 */
export function calculateQuotationTotals(
  items: QuotationItem[],
  taxType: TaxType,
  otherCharges: {
    freight?: number;
    installation?: number;
    packaging?: number;
  } = {}
): QuotationCommercialSummary {
  let grossSubtotal = 0;
  let totalDiscount = 0;
  let taxableSubtotal = 0;
  let totalGst = 0;

  for (const item of items) {
    const qty = Math.max(0, item.quantity || 0);
    const rate = Math.max(0, item.rate || 0);
    const discPercent = Math.min(100, Math.max(0, item.discountPercent || 0));
    const gstRate = Math.max(0, item.gstRate || 0);

    const gross = round2(qty * rate);
    const discAmt = round2(gross * (discPercent / 100));
    const taxable = round2(gross - discAmt);
    const gst = round2(taxable * (gstRate / 100));

    grossSubtotal += gross;
    totalDiscount += discAmt;
    taxableSubtotal += taxable;
    totalGst += gst;
  }

  grossSubtotal = round2(grossSubtotal);
  totalDiscount = round2(totalDiscount);
  taxableSubtotal = round2(taxableSubtotal);
  totalGst = round2(totalGst);

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (taxType === 'IGST') {
    igstAmount = totalGst;
    cgstAmount = 0;
    sgstAmount = 0;
  } else {
    // CGST + SGST split 50:50
    cgstAmount = round2(totalGst / 2);
    sgstAmount = round2(totalGst - cgstAmount); // avoids 1 paisa discrepancy
    igstAmount = 0;
  }

  const freight = Math.max(0, otherCharges.freight || 0);
  const installation = Math.max(0, otherCharges.installation || 0);
  const packaging = Math.max(0, otherCharges.packaging || 0);
  const freightAndOtherCharges = round2(freight + installation + packaging);

  const grandTotal = round2(taxableSubtotal + totalGst + freightAndOtherCharges);

  return {
    grossSubtotal,
    totalDiscount,
    taxableSubtotal,
    totalGst,
    cgstAmount,
    sgstAmount,
    igstAmount,
    freightAndOtherCharges,
    grandTotal,
  };
}

/**
 * Formats a number in Indian Rupee format (e.g. ₹ 1,25,000.00).
 */
export function formatINR(amount: number, showSymbol = true): string {
  const safeVal = isNaN(amount) ? 0 : amount;
  const parts = safeVal.toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  const isNegative = integerPart.startsWith('-');
  if (isNegative) {
    integerPart = integerPart.substring(1);
  }

  // Indian numbering format: last 3 digits, then groups of 2 digits
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInt = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  const result = `${isNegative ? '-' : ''}${formattedInt}.${decimalPart}`;
  return showSymbol ? `₹ ${result}` : result;
}

/**
 * Converts a number to words in Indian Numbering System (e.g. Rupees One Lakh Twenty-Five Thousand Only)
 */
export function numberToIndianWords(num: number): string {
  if (isNaN(num) || num === 0) return 'Rupees Zero Only';

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTens(n: number): string {
    if (n < 20) return a[n];
    return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
  }

  function convertHundreds(n: number): string {
    let str = '';
    if (n > 99) {
      str += a[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n > 0) {
      str += convertTens(n);
    }
    return str.trim();
  }

  const rounded = Math.round(num * 100) / 100;
  const intPart = Math.floor(rounded);
  const paise = Math.round((rounded - intPart) * 100);

  let crores = Math.floor(intPart / 10000000);
  let lakhs = Math.floor((intPart % 10000000) / 100000);
  let thousands = Math.floor((intPart % 100000) / 1000);
  let hundreds = intPart % 1000;

  let words = 'Rupees ';
  if (crores > 0) {
    words += convertHundreds(crores) + ' Crore ';
  }
  if (lakhs > 0) {
    words += convertHundreds(lakhs) + ' Lakh ';
  }
  if (thousands > 0) {
    words += convertHundreds(thousands) + ' Thousand ';
  }
  if (hundreds > 0) {
    words += convertHundreds(hundreds) + ' ';
  }

  if (words.trim() === 'Rupees') {
    words += 'Zero ';
  }

  if (paise > 0) {
    words += `and ${convertTens(paise)} Paise `;
  }

  return words.trim() + ' Only';
}
