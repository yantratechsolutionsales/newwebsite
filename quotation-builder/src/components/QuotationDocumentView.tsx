import React from 'react';
import { Quotation, CompanySettings } from '../types';
import { formatINR, numberToIndianWords } from '../utils/calculations';
import { openCleanDatasheetWindow } from '../utils/datasheetViewer';
import { YANTRATECH_LOGO_BASE64 } from '../assets/logoBase64';

interface QuotationDocumentViewProps {
  quotation: Quotation;
  companySettings: CompanySettings;
  isPrintView?: boolean;
}

export const QuotationDocumentView: React.FC<QuotationDocumentViewProps> = ({
  quotation,
  companySettings,
  isPrintView = false,
}) => {
  const sections = quotation.sections || {
    showCoverHeader: true,
    showCustomerInfo: true,
    showEnquiryRef: true,
    showIntroduction: true,
    showProductDetails: true,
    showTechSpecs: true,
    showCommercialProposal: true,
    showDeliveryInfo: true,
    showPaymentTerms: true,
    showWarranty: true,
    showTermsAndConditions: true,
    showBankDetails: true,
    showSignatory: true,
  };

  const enabledTerms = (quotation.termsAndConditions || []).filter((t) => t.enabled);

  return (
    <div
      id="quotation-print-document"
      className="bg-white text-slate-900 leading-relaxed font-sans mx-auto w-[210mm] max-w-[210mm] min-h-[297mm] p-[10mm] sm:p-[12mm] box-border"
      style={{
        boxSizing: 'border-box',
        color: '#111827',
        backgroundColor: '#ffffff',
      }}
    >
      {/* 1. Header & Brand Block with Official Yantratech Logo */}
      {sections.showCoverHeader && (
        <div className="border-b-2 border-[#F3B93E] pb-3 mb-4 page-break-avoid">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center space-x-3.5">
              <img 
                src={YANTRATECH_LOGO_BASE64} 
                alt="Yantratech Solutions" 
                className="h-14 sm:h-16 w-auto object-contain"
              />
              <div className="border-l-2 border-slate-200 pl-3">
                <p className="text-[11px] font-semibold text-slate-700 max-w-sm leading-tight">
                  {companySettings.tagline}
                </p>
                <div className="text-[10px] text-slate-500 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                  <span>GSTIN: <strong className="font-mono text-slate-900 font-bold">{companySettings.gstin}</strong></span>
                  <span>PAN: <strong className="font-mono text-slate-900 font-bold">{companySettings.pan}</strong></span>
                </div>
              </div>
            </div>

            {/* Corporate contact details */}
            <div className="text-right text-[10px] sm:text-[11px] text-slate-600 space-y-0.5">
              <p className="text-slate-900 font-bold">{companySettings.address}</p>
              <p>{companySettings.city}, {companySettings.state} - {companySettings.pincode}, {companySettings.country}</p>
              <p className="font-mono text-slate-800">Phone: {companySettings.phone}</p>
              <p className="text-[#a8740f] font-semibold">Email: {companySettings.email}</p>
              <p className="text-slate-500 font-medium">{companySettings.website}</p>
            </div>
          </div>

          {/* Quotation Title Banner */}
          <div className="mt-3 pt-2.5 border-t border-slate-200 flex justify-between items-center gap-2">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#a8740f] block font-outfit">
                COMMERCIAL PROPOSAL & TECHNICAL QUOTATION
              </span>
              <h2 className="text-sm sm:text-base font-bold text-[#191A18] leading-snug font-outfit">
                {quotation.title}
              </h2>
            </div>
            <div className="text-right bg-amber-50 px-3 py-1 rounded border border-[#F3B93E]/60">
              <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">
                Quotation No:
              </span>
              <span className="font-mono font-bold text-xs sm:text-sm text-[#191A18]">
                {quotation.quotationNumber}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Quotation Info & Customer Grid */}
      <div className="grid grid-cols-2 gap-3.5 text-xs mb-4 page-break-avoid">
        {/* Customer / Client Details */}
        {sections.showCustomerInfo && (
          <div className="bg-slate-50/90 p-3 rounded border border-slate-200 space-y-1">
            <span className="text-[9px] font-bold text-[#a8740f] uppercase tracking-wider block mb-0.5 font-outfit">
              Quotation Issued To:
            </span>
            <div className="font-bold text-slate-950 text-xs sm:text-sm font-outfit">{quotation.customerName}</div>
            <div className="text-slate-700 font-medium text-[11px]">
              Attn: {quotation.customerContactPerson}
              {quotation.customerDesignation ? ` (${quotation.customerDesignation})` : ''}
            </div>
            <div className="text-slate-600 leading-tight text-[10px]">
              <strong>Billing Address:</strong> {quotation.customerBillingAddress || 'As per record'}
            </div>
            {quotation.customerShippingAddress && quotation.customerShippingAddress !== quotation.customerBillingAddress && (
              <div className="text-slate-600 leading-tight text-[10px] pt-0.5">
                <strong>Delivery Site:</strong> {quotation.customerShippingAddress}
              </div>
            )}
            <div className="pt-0.5 flex flex-wrap gap-x-3 text-[10px] text-slate-600">
              {quotation.customerEmail && <span>Email: {quotation.customerEmail}</span>}
              {quotation.customerPhone && <span>Phone: {quotation.customerPhone}</span>}
            </div>
            {quotation.customerGstin && (
              <div className="text-[10px] font-mono text-slate-800 font-semibold pt-0.5">
                Client GSTIN: {quotation.customerGstin}
              </div>
            )}
          </div>
        )}

        {/* Commercial Metadata */}
        <div className="bg-slate-50/90 p-3 rounded border border-slate-200 flex flex-col justify-between">
          <div className="space-y-1 text-[11px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block font-outfit">
              Proposal Metadata:
            </span>
            <div className="flex justify-between border-b border-slate-200/60 pb-0.5">
              <span className="text-slate-500">Quotation Date:</span>
              <span className="font-semibold text-slate-900">{quotation.date}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-0.5">
              <span className="text-slate-500">Quotation Validity:</span>
              <span className="font-semibold text-slate-900">
                {quotation.validUntil ? `${quotation.validUntil} (30 Days)` : '30 Calendar Days'}
              </span>
            </div>
            {quotation.enquiryRefNumber && (
              <div className="flex justify-between border-b border-slate-200/60 pb-0.5">
                <span className="text-slate-500">Enquiry / RFQ Ref:</span>
                <span className="font-mono font-bold text-[#a8740f]">{quotation.enquiryRefNumber}</span>
              </div>
            )}
            {quotation.purchaseOrderRef && (
              <div className="flex justify-between border-b border-slate-200/60 pb-0.5">
                <span className="text-slate-500">PO Reference:</span>
                <span className="font-mono text-slate-800">{quotation.purchaseOrderRef}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">GST Tax Structure:</span>
              <span className="font-bold text-slate-900">
                {quotation.taxType === 'IGST' ? 'IGST (Integrated Tax)' : 'CGST + SGST (Central + State)'}
              </span>
            </div>
          </div>

          <div className="mt-1.5 pt-1 border-t border-slate-200/60 text-[10px] text-slate-500 italic">
            Prepared by: <strong className="text-slate-800">{quotation.signatoryName}</strong> ({quotation.signatoryDesignation})
          </div>
        </div>
      </div>

      {/* 3. Introduction Note */}
      {sections.showIntroduction && quotation.introductionNote && (
        <div className="mb-4 text-[11px] text-slate-700 bg-amber-50/50 p-2.5 rounded border-l-4 border-[#F3B93E] italic leading-relaxed page-break-avoid">
          {quotation.introductionNote}
        </div>
      )}

      {/* 4. Products Table - Aligned with 100% Page Width & Proportional Columns */}
      {sections.showProductDetails && (
        <div className="mb-4 w-full">
          <div className="text-[10px] font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center justify-between font-outfit">
            <span>Scope of Supply & Pricing Breakdown</span>
            <span className="text-slate-400 font-normal normal-case text-[9px]">
              (All figures in Indian Rupees ₹)
            </span>
          </div>

          <table 
            className="w-full text-left border-collapse border border-slate-300 text-[10px] sm:text-[11px]"
            style={{ tableLayout: 'fixed', width: '100%' }}
          >
            <thead>
              <tr className="bg-[#191A18] text-white font-semibold uppercase tracking-wider text-[9px] sm:text-[10px]">
                <th style={{ width: '4%' }} className="py-2 px-1 border border-slate-700 text-center text-[#F3B93E]">#</th>
                <th style={{ width: '38%' }} className="py-2 px-2.5 border border-slate-700 text-left">Product / Description</th>
                <th style={{ width: '8%' }} className="py-2 px-1 border border-slate-700 text-center">HSN/SAC</th>
                <th style={{ width: '5%' }} className="py-2 px-1 border border-slate-700 text-center">Qty</th>
                <th style={{ width: '5%' }} className="py-2 px-1 border border-slate-700 text-center">Unit</th>
                <th style={{ width: '10%' }} className="py-2 px-1.5 border border-slate-700 text-right">Rate (₹)</th>
                <th style={{ width: '6%' }} className="py-2 px-1 border border-slate-700 text-right">Disc %</th>
                <th style={{ width: '12%' }} className="py-2 px-1.5 border border-slate-700 text-right">Taxable (₹)</th>
                <th style={{ width: '5%' }} className="py-2 px-1 border border-slate-700 text-center">GST</th>
                <th style={{ width: '12%' }} className="py-2 px-2 border border-slate-700 text-right text-[#F3B93E]">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {quotation.items.map((item, idx) => (
                <tr 
                  key={item.id || idx} 
                  className={`page-break-avoid ${idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}`}
                >
                  <td style={{ width: '4%' }} className="py-2 px-1 border border-slate-300 text-center font-bold text-slate-700 align-top">
                    {idx + 1}
                  </td>
                  <td style={{ width: '38%' }} className="py-2 px-2.5 border border-slate-300 align-top">
                    <div className="font-bold text-slate-950 text-xs font-outfit leading-tight">{item.name}</div>
                    <div className="text-[10px] text-slate-600 mt-0.5 flex flex-wrap gap-x-2">
                      {item.brand && <span className="font-semibold text-slate-700">Brand: {item.brand}</span>}
                      {item.model && <span className="font-mono text-slate-600">Model: {item.model}</span>}
                    </div>
                    {item.description && (
                      <div className="text-[10px] text-slate-600 mt-1 leading-snug">
                        {item.description}
                      </div>
                    )}
                    {/* Technical Specs formatted box */}
                    {sections.showTechSpecs && item.technicalSpecs && (
                      <div className="mt-1 pt-1 border-t border-slate-200/80 text-[9.5px] text-slate-700 font-mono bg-slate-100/80 p-1.5 rounded whitespace-pre-line leading-tight">
                        <strong className="text-slate-900 block font-sans text-[8.5px] uppercase tracking-wider mb-0.5">
                          Technical Parameters:
                        </strong>
                        {item.technicalSpecs}
                      </div>
                    )}
                    {item.warranty && (
                      <div className="text-[9.5px] text-[#a8740f] mt-0.5 font-medium">
                        Warranty: {item.warranty}
                      </div>
                    )}
                    {item.datasheetRef && (
                      <div className="text-[9.5px] mt-1 font-semibold">
                        <button 
                          type="button"
                          onClick={() => openCleanDatasheetWindow(item.name, item.datasheetRef!)} 
                          className="hover:underline flex items-center gap-1 text-[#a8740f] cursor-pointer text-left font-medium"
                          title={`Open ${item.name} Technical Datasheet`}
                        >
                          📄 {item.name} - Technical Datasheet (PDF)
                        </button>
                      </div>
                    )}
                  </td>
                  <td style={{ width: '8%' }} className="py-2 px-1 border border-slate-300 text-center font-mono text-slate-600 align-top">
                    {item.hsnSac || '—'}
                  </td>
                  <td style={{ width: '5%' }} className="py-2 px-1 border border-slate-300 text-center font-bold text-slate-900 align-top">
                    {item.quantity}
                  </td>
                  <td style={{ width: '5%' }} className="py-2 px-1 border border-slate-300 text-center text-slate-600 align-top">
                    {item.unit}
                  </td>
                  <td style={{ width: '10%' }} className="py-2 px-1.5 border border-slate-300 text-right font-mono text-slate-900 align-top">
                    {formatINR(item.rate, false)}
                  </td>
                  <td style={{ width: '6%' }} className="py-2 px-1 border border-slate-300 text-right font-mono text-slate-600 align-top">
                    {item.discountPercent > 0 ? `${item.discountPercent}%` : '—'}
                  </td>
                  <td style={{ width: '12%' }} className="py-2 px-1.5 border border-slate-300 text-right font-mono font-semibold text-slate-900 align-top">
                    {formatINR(item.taxableAmount, false)}
                  </td>
                  <td style={{ width: '5%' }} className="py-2 px-1 border border-slate-300 text-center font-mono text-slate-700 align-top">
                    {item.gstRate}%
                  </td>
                  <td style={{ width: '12%' }} className="py-2 px-2 border border-slate-300 text-right font-mono font-bold text-slate-950 align-top">
                    {formatINR(item.totalAmount, false)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. Commercial Calculations & Summary */}
      {sections.showCommercialProposal && (
        <div className="grid grid-cols-2 gap-4 mb-4 pt-1 page-break-avoid">
          {/* Amount in words & Bank info */}
          <div className="space-y-2.5">
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5 font-outfit">
                Grand Total Amount In Words:
              </span>
              <p className="text-[11px] font-bold text-slate-900 italic font-outfit">
                {numberToIndianWords(quotation.grandTotal)}
              </p>
            </div>

            {sections.showBankDetails && (
              <div className="bg-slate-50/90 p-2.5 rounded border border-slate-200 text-[10px] space-y-1">
                <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider block mb-1 font-outfit">
                  Bank Details for Electronic Remittance (RTGS / NEFT):
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bank Name:</span>
                  <span className="font-semibold text-slate-900">{companySettings.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account No:</span>
                  <span className="font-mono font-bold text-slate-900">{companySettings.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">IFSC Code:</span>
                  <span className="font-mono font-bold text-[#a8740f]">{companySettings.ifscCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Branch:</span>
                  <span className="text-slate-800">{companySettings.branch}</span>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Tax Breakdown Table */}
          <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Gross Total:</span>
              <span className="font-mono">{formatINR(quotation.grossSubtotal)}</span>
            </div>

            {quotation.totalDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Total Discount Applied:</span>
                <span className="font-mono">- {formatINR(quotation.totalDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-900 font-semibold border-t border-slate-200 pt-1">
              <span>Taxable Subtotal:</span>
              <span className="font-mono">{formatINR(quotation.taxableSubtotal)}</span>
            </div>

            {/* Clear GST Selection Logic */}
            {quotation.taxType === 'IGST' ? (
              <div className="flex justify-between text-slate-700">
                <span>Integrated GST (IGST):</span>
                <span className="font-mono font-semibold">{formatINR(quotation.igstAmount)}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-slate-700">
                  <span>Central GST (CGST):</span>
                  <span className="font-mono font-semibold">{formatINR(quotation.cgstAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>State GST (SGST):</span>
                  <span className="font-mono font-semibold">{formatINR(quotation.sgstAmount)}</span>
                </div>
              </>
            )}

            <div className="flex justify-between text-slate-700">
              <span>Total GST:</span>
              <span className="font-mono">{formatINR(quotation.totalGst)}</span>
            </div>

            {quotation.freightAndOtherCharges > 0 && (
              <div className="flex justify-between text-slate-700">
                <span>Freight, Packing & Insurance:</span>
                <span className="font-mono">{formatINR(quotation.freightAndOtherCharges)}</span>
              </div>
            )}

            <div className="flex justify-between text-[#191A18] font-black text-xs sm:text-sm border-t-2 border-[#191A18] pt-2 bg-amber-50 -mx-3 -mb-3 p-3 rounded-b border-b border-[#F3B93E]/40 font-outfit">
              <span className="uppercase tracking-wider">Grand Total (INR):</span>
              <span className="font-mono text-sm sm:text-base text-[#a8740f]">{formatINR(quotation.grandTotal)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. Commercial Terms & Delivery Logistics */}
      <div className="grid grid-cols-2 gap-3.5 text-xs mb-4 page-break-avoid">
        {sections.showDeliveryInfo && quotation.delivery && (
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-0.5 text-[10.5px]">
            <span className="text-[9px] font-bold text-slate-800 uppercase tracking-wider block mb-1 font-outfit">
              Delivery & Logistics Schedule
            </span>
            <div className="text-slate-600">
              <strong>Delivery Location:</strong> {quotation.delivery.deliveryLocation || 'Customer Plant Site'}
            </div>
            <div className="text-slate-600">
              <strong>Lead Time:</strong> {quotation.delivery.leadTime || 'As per product schedule'}
            </div>
            <div className="text-slate-600">
              <strong>Transit Mode:</strong> {quotation.delivery.deliveryMethod || 'Insured Road Logistics'}
            </div>
            <div className="text-slate-600">
              <strong>Dispatch Terms:</strong> {quotation.delivery.dispatchTerms || 'F.O.R Destination'}
            </div>
          </div>
        )}

        {sections.showPaymentTerms && (
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-0.5 text-[10.5px]">
            <span className="text-[9px] font-bold text-slate-800 uppercase tracking-wider block mb-1 font-outfit">
              Payment & Warranty Terms
            </span>
            <div className="text-slate-600">
              <strong>Payment Terms:</strong> {quotation.customPaymentTerms || quotation.paymentTerms}
            </div>
            <div className="text-slate-600">
              <strong>Warranty Coverage:</strong> {quotation.warrantyTerms}
            </div>
            <div className="text-slate-600">
              <strong>Installation / Commissioning:</strong>{' '}
              {quotation.delivery?.installationRequired
                ? 'Provided by Yantratech Technical Engineers'
                : 'Not Applicable / Optional on request'}
            </div>
          </div>
        )}
      </div>

      {/* 7. Terms & Conditions */}
      {sections.showTermsAndConditions && enabledTerms.length > 0 && (
        <div className="mb-4 border-t border-slate-200 pt-3 page-break-avoid">
          <span className="text-[9px] font-bold text-slate-800 uppercase tracking-widest block mb-1.5 font-outfit">
            General Commercial Terms & Conditions:
          </span>
          <ol className="list-decimal pl-4 text-[9.5px] text-slate-600 space-y-0.5 leading-snug">
            {enabledTerms.map((t) => (
              <li key={t.id}>
                <strong className="text-slate-800">{t.title}:</strong> {t.content}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* 8. Signature Block */}
      {sections.showSignatory && (
        <div className="border-t border-slate-200 pt-4 mt-3 grid grid-cols-2 gap-4 text-xs page-break-avoid">
          {/* Customer Acceptance Signoff */}
          <div className="border border-dashed border-slate-300 p-2.5 rounded text-center flex flex-col justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-outfit">
              Client Acceptance & Work Authorization
            </span>
            <div className="border-t border-slate-300 pt-1 text-[9px] text-slate-500 mt-8">
              Authorized Signature & Official Stamp
            </div>
          </div>

          {/* Yantratech Solutions Signatory */}
          <div className="text-right flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-800 block font-outfit">
                For Yantratech Solutions
              </span>
              <div className="h-8 flex items-center justify-end my-0.5">
                <span className="font-serif italic text-base text-slate-800 px-3 py-0.5 border-b border-slate-400">
                  {quotation.signatoryName}
                </span>
              </div>
            </div>

            <div>
              <div className="font-bold text-slate-900 text-[11px] font-outfit">
                {quotation.signatoryName}
              </div>
              <div className="text-[10px] text-slate-600 font-medium">
                {quotation.signatoryDesignation}
              </div>
              <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                {quotation.signatoryEmail} • {quotation.signatoryPhone}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. Footer */}
      <div className="border-t border-slate-200 mt-4 pt-2 text-center text-[9px] text-slate-400 page-break-avoid">
        <p>{companySettings.footerText}</p>
        <p className="mt-0.5 font-medium">
          {companySettings.website} | Pan-India Delivery | Genuine Industrial Solutions
        </p>
      </div>
    </div>
  );
};
