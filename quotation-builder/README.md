# Yantratech Solutions - Proposal & Quotation Builder

Production-ready B2B Proposal and Quotation Builder web application built specifically for **Yantratech Solutions** ([https://www.yantratechsolutions.co.in/](https://www.yantratechsolutions.co.in/)).

---

## 🌟 Key Features & Implementation Highlights

1. **Continuous Typing (Focus-Retaining Input Engine)**
   - Resolves the cursor-loss bug when typing into line item fields (`name`, `description`, `technicalSpecs`, `quantity`, `unit`, `rate`, `discountPercent`, `hsnSac`).
   - Uses `React.memo` and granular state updates to guarantee uninterrupted continuous keystrokes.

2. **Accurate GST & Commercial Calculation Engine (`src/utils/calculations.ts`)**
   - **IGST vs CGST + SGST**: Explicit toggle with strict isolation—never outputs IGST together with CGST/SGST.
   - Product-level GST overrides (0%, 5%, 12%, 18%, 28%).
   - Dynamic line items: `Gross = Qty × Rate`, `Discount = Gross × Disc%`, `Taxable = Gross - Discount`, `GST = Taxable × GST%`.
   - Indian Rupee Currency Formatting (`₹ 1,25,000.00`) and Indian number-to-words (`Rupees One Lakh Twenty Five Thousand Only`).
   - Verified against test cases:
     - **Test 1**: ₹1,00,000 @ 18% IGST = ₹18,000 IGST, ₹1,18,000 Grand Total.
     - **Test 2**: ₹1,00,000 @ CGST 9% (₹9,000) + SGST 9% (₹9,000) = ₹18,000 GST, ₹1,18,000 Grand Total.
     - **Test 5 & 22**: 10% discount on ₹1,00,000 gross = ₹10,000 discount, ₹90,000 taxable, ₹16,200 GST, ₹1,06,200 total.

3. **High-Fidelity PDF Export & Print Engine (`src/utils/pdfExport.ts`)**
   - Standard A4 document format with margins, corporate branding, bank details, and dynamic signatures.
   - Multi-page rasterization using `html2canvas` & `jsPDF` without overlapping text or clipped tables.
   - Browser print stylesheet (`@media print`) for instant direct printing.

4. **Product Catalogue & Technical Specifications (`src/components/ProductCatalogue.tsx`)**
   - Industrial catalogue categories: Testing & Measuring, Calibration, Thermal Imaging, Safety Accessories, Panel Meters, IT Hardware, Contracts / Services.
   - Built-in technical specifications parameters (Range, Accuracy, Display Counts, Safety Ratings, Standards).
   - One-click insertion from catalogue into active quotation with auto-population of standard prices, units, HSN codes, and specs.

5. **Customer Management & Quotation Dossier (`src/components/CustomersManager.tsx`)**
   - Separate Billing & Shipping addresses with "Same as Billing" toggle.
   - GSTIN & PAN tracking.
   - Client proposal history dossier displaying past quotations and values.

6. **Sales Members & Dynamic Signatories (`src/components/SalesMembersManager.tsx`)**
   - Dedicated team management for authorized proposal senders.
   - Dynamic signatory rendering on quotation footer ("For Yantratech Solutions" + Selected Sales Member Name + Designation).

7. **System Settings & Customization (`src/components/SettingsManager.tsx`)**
   - Company details, address, contact phone (`+91 8655813866`), email (`sales@yantratechsolutions.co.in`), and GSTIN (`27AAECY4821N1ZM`).
   - RTGS/NEFT bank details (Bank name, Account number, IFSC code, Branch).
   - Configurable quotation numbering format (e.g. `YTS/2026-27/0104`).
   - Customizable commercial terms and conditions clauses.

8. **Data Persistence**
   - Browser local storage persistence for draft recovery, saved quotations, customers, products, sales members, and settings.

---

## 🚀 Running the Project

```bash
cd yantratech-quotation-builder
npm install
npm run dev
```

To build for production:
```bash
npm run build
```
