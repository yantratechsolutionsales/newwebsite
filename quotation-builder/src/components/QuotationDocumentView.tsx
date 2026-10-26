import React from 'react';
import { Quotation, CompanySettings } from '../types';
import { formatINR, numberToIndianWords } from '../utils/calculations';

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
      className={`bg-white text-slate-900 leading-relaxed font-sans mx-auto ${
        isPrintView
          ? 'w-[210mm] min-h-[297mm] p-[12mm] shadow-none'
          : 'max-w-[210mm] w-full p-8 sm:p-12 shadow-2xl border border-slate-200 rounded-xl my-4'
      }`}
      style={{
        boxSizing: 'border-box',
        color: '#111827',
      }}
    >
      {/* 1. Header & Brand Block with Official Yantratech Logo */}
      {sections.showCoverHeader && (
        <div className="border-b-2 border-[#F3B93E] pb-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <img 
                src="/yantratech-logo.webp" 
                alt="Yantratech Solutions" 
                className="h-16 sm:h-20 w-auto object-contain drop-shadow-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/yantratech-logo.png';
                }}
              />
              <div className="border-l-2 border-slate-200 pl-3.5">
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
            <div className="text-right text-[11px] text-slate-600 space-y-0.5 self-end sm:self-center">
              <p className="text-slate-900 font-bold">{companySettings.address}</p>
              <p>{companySettings.city}, {companySettings.state} - {companySettings.pincode}, {companySettings.country}</p>
              <p className="font-mono text-slate-800">Phone: {companySettings.phone}</p>
              <p className="text-[#c79124] font-semibold">Email: {companySettings.email}</p>
              <p className="text-slate-500">{companySettings.website}</p>
            </div>
          </div>

          {/* Quotation Title Banner */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#a8740f] block font-outfit">
                COMMERCIAL PROPOSAL & TECHNICAL QUOTATION
              </span>
              <h2 className="text-base font-bold text-[#191A18] leading-snug font-outfit">
                {quotation.title}
              </h2>
            </div>
            <div className="sm:text-right bg-amber-50/70 px-3.5 py-1.5 rounded-lg border border-[#F3B93E]/50">
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                Quotation No:
              </span>
              <span className="font-mono font-bold text-sm text-[#191A18]">
                {quotation.quotationNumber}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Quotation Info & Customer Grid */}
      <div className="grid grid-cols-2 gap-4 text-xs mb-6">
        {/* Customer / Client Details */}
        {sections.showCustomerInfo && (
          <div className="bg-slate-50/80 p-3.5 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-[#a8740f] uppercase tracking-wider block mb-1 font-outfit">
              Quotation Issued To:
            </span>
            <div className="font-bold text-slate-950 text-sm font-outfit">{quotation.customerName}</div>
            <div className="text-slate-700 font-medium">
              Attn: {quotation.customerContactPerson}
              {quotation.customerDesignation ? ` (${quotation.customerDesignation})` : ''}
            </div>
            <div className="text-slate-600 leading-tight">
              <strong>Billing Address:</strong> {quotation.customerBillingAddress || 'As per record'}
            </div>
            {quotation.customerShippingAddress && quotation.customerShippingAddress !== quotation.customerBillingAddress && (
              <div className="text-slate-600 leading-tight pt-1">
                <strong>Delivery Site:</strong> {quotation.customerShippingAddress}
              </div>
            )}
            <div className="pt-1 flex flex-wrap gap-x-3 text-slate-600">
              {quotation.customerEmail && <span>Email: {quotation.customerEmail}</span>}
              {quotation.customerPhone && <span>Phone: {quotation.customerPhone}</span>}
            </div>
            {quotation.customerGstin && (
              <div className="text-[11px] font-mono text-slate-800 font-semibold pt-0.5">
                Client GSTIN: {quotation.customerGstin}
              </div>
            )}
          </div>
        )}

        {/* Commercial Metadata */}
        <div className="bg-slate-50/80 p-3.5 rounded-lg border border-slate-200 flex flex-col justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-outfit">
              Proposal Metadata:
            </span>
            <div className="flex justify-between border-b border-slate-200/60 pb-1">
              <span className="text-slate-500">Quotation Date:</span>
              <span className="font-semibold text-slate-900">{quotation.date}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-1">
              <span className="text-slate-500">Quotation Validity:</span>
              <span className="font-semibold text-slate-900">
                {quotation.validUntil ? `${quotation.validUntil} (30 Days)` : '30 Calendar Days'}
              </span>
            </div>
            {quotation.enquiryRefNumber && (
              <div className="flex justify-between border-b border-slate-200/60 pb-1">
                <span className="text-slate-500">Enquiry / RFQ Ref:</span>
                <span className="font-mono font-bold text-[#a8740f]">{quotation.enquiryRefNumber}</span>
              </div>
            )}
            {quotation.purchaseOrderRef && (
              <div className="flex justify-between border-b border-slate-200/60 pb-1">
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

          <div className="mt-2 pt-1 text-[11px] text-slate-500 italic">
            Prepared by: <strong className="text-slate-800">{quotation.signatoryName}</strong> ({quotation.signatoryDesignation})
          </div>
        </div>
      </div>

      {/* 3. Introduction Note */}
      {sections.showIntroduction && quotation.introductionNote && (
        <div className="mb-5 text-xs text-slate-700 bg-amber-50/40 p-3 rounded-lg border-l-4 border-[#F3B93E] italic leading-relaxed">
          {quotation.introductionNote}
        </div>
      )}

      {/* 4. Products Table */}
      {sections.showProductDetails && (
        <div className="mb-6">
          <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center justify-between font-outfit">
            <span>Scope of Supply & Pricing Breakdown</span>
            <span className="text-slate-400 font-normal normal-case text-[10px]">
              (All figures in Indian Rupees ₹)
            </span>
          </div>

          <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
            <thead>
              <tr className="bg-[#191A18] text-white font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-2.5 border border-slate-700 text-center w-8 text-[#F3B93E]">#</th>
                <th className="py-2.5 px-2.5 border border-slate-700">Product / Instrument Description</th>
                <th className="py-2.5 px-2 border border-slate-700 text-center w-16">HSN/SAC</th>
                <th className="py-2.5 px-2 border border-slate-700 text-center w-12">Qty</th>
                <th className="py-2.5 px-2 border border-slate-700 text-center w-12">Unit</th>
                <th className="py-2.5 px-2 border border-slate-700 text-right w-20">Rate (₹)</th>
                <th className="py-2.5 px-2 border border-slate-700 text-right w-16">Disc %</th>
                <th className="py-2.5 px-2 border border-slate-700 text-right w-24">Taxable (₹)</th>
                <th className="py-2.5 px-2 border border-slate-700 text-center w-14">GST %</th>
                <th className="py-2.5 px-2.5 border border-slate-700 text-right w-24 text-[#F3B93E]">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {quotation.items.map((item, idx) => (
                <tr key={item.id || idx} className={idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}>
                  <td className="py-2 px-2.5 border border-slate-300 text-center font-bold text-slate-700 align-top">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-2.5 border border-slate-300 align-top">
                    <div className="font-bold text-slate-950 text-xs font-outfit">{item.name}</div>
                    <div className="text-[10px] text-slate-600 mt-0.5">
                      {item.brand && <span className="font-semibold text-slate-700 mr-2">Brand: {item.brand}</span>}
                      {item.model && <span className="font-mono text-slate-600">Model: {item.model}</span>}
                    </div>
                    {item.description && (
                      <div className="text-[10px] text-slate-600 mt-1 leading-snug">
                        {item.description}
                      </div>
                    )}
                    {/* Technical Specs bullet line */}
                    {sections.showTechSpecs && item.technicalSpecs && (
                      <div className="mt-1.5 pt-1 border-t border-slate-200/80 text-[10px] text-slate-700 font-mono bg-slate-100/70 p-1.5 rounded">
                        <strong className="text-slate-900 block font-sans text-[9px] uppercase tracking-wider mb-0.5">
                          Technical Parameters:
                        </strong>
                        {item.technicalSpecs}
                      </div>
                    )}
                    {item.warranty && (
                      <div className="text-[10px] text-[#a8740f] mt-1 font-medium">
                        Warranty: {item.warranty}
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-2 border border-slate-300 text-center font-mono text-slate-600 align-top">
                    {item.hsnSac || '—'}
                  </td>
                  <td className="py-2 px-2 border border-slate-300 text-center font-bold text-slate-900 align-top">
                    {item.quantity}
                  </td>
                  <td className="py-2 px-2 border border-slate-300 text-center text-slate-600 align-top">
                    {item.unit}
                  </td>
                  <td className="py-2 px-2 border border-slate-300 text-right font-mono text-slate-900 align-top">
                    {formatINR(item.rate, false)}
                  </td>
                  <td className="py-2 px-2 border border-slate-300 text-right font-mono text-slate-600 align-top">
                    {item.discountPercent > 0 ? `${item.discountPercent}%` : '—'}
                  </td>
                  <td className="py-2 px-2 border border-slate-300 text-right font-mono font-semibold text-slate-900 align-top">
                    {formatINR(item.taxableAmount, false)}
                  </td>
                  <td className="py-2 px-2 border border-slate-300 text-center font-mono text-slate-700 align-top">
                    {item.gstRate}%
                  </td>
                  <td className="py-2 px-2.5 border border-slate-300 text-right font-mono font-bold text-slate-950 align-top">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 pt-1">
          {/* Amount in words & Bank info */}
          <div className="space-y-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5 font-outfit">
                Grand Total Amount In Words:
              </span>
              <p className="text-xs font-bold text-slate-900 italic font-outfit">
                {numberToIndianWords(quotation.grandTotal)}
              </p>
            </div>

            {sections.showBankDetails && (
              <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200 text-[11px] space-y-1">
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1 font-outfit">
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
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs space-y-1.5">
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

            <div className="flex justify-between text-slate-900 font-semibold border-t border-slate-200 pt-1.5">
              <span>Taxable Subtotal:</span>
              <span className="font-mono">{formatINR(quotation.taxableSubtotal)}</span>
            </div>

            {/* Clear GST Selection Logic: never show IGST and CGST together */}
            {quotation.taxType === 'IGST' ? (
              <div className="flex justify-between text-slate-700">
                <span>Integrated GST (IGST 18%):</span>
                <span className="font-mono font-semibold">{formatINR(quotation.igstAmount)}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-slate-700">
                  <span>Central GST (CGST 9%):</span>
                  <span className="font-mono font-semibold">{formatINR(quotation.cgstAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>State GST (SGST 9%):</span>
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

            <div className="flex justify-between text-[#191A18] font-black text-sm border-t-2 border-[#191A18] pt-2.5 bg-amber-50/90 -mx-3.5 -mb-3.5 p-3.5 rounded-b-lg border-b border-[#F3B93E]/40 font-outfit">
              <span className="uppercase tracking-wider">Grand Total (INR):</span>
              <span className="font-mono text-base text-[#a8740f]">{formatINR(quotation.grandTotal)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. Commercial Terms & Delivery Logistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-6">
        {sections.showDeliveryInfo && quotation.delivery && (
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block mb-1 font-outfit">
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
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block mb-1 font-outfit">
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
        <div className="mb-6 border-t border-slate-200 pt-4">
          <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest block mb-2 font-outfit">
            General Commercial Terms & Conditions:
          </span>
          <ol className="list-decimal pl-4 text-[10px] text-slate-600 space-y-1 leading-snug">
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
        <div className="border-t border-slate-200 pt-6 mt-4 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs">
          {/* Customer Acceptance Signoff */}
          <div className="w-full sm:w-1/2 border border-dashed border-slate-300 p-3 rounded-lg text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-6 font-outfit">
              Client Acceptance & Work Authorization
            </span>
            <div className="border-t border-slate-300 pt-1 text-[10px] text-slate-500">
              Authorized Signature & Official Stamp
            </div>
          </div>

          {/* Yantratech Solutions Signatory */}
          <div className="w-full sm:w-1/2 text-right">
            <span className="text-[11px] font-bold text-slate-800 block font-outfit">
              For Yantratech Solutions
            </span>
            
            {/* Signature Area */}
            <div className="h-12 flex items-center justify-end my-1">
              <span className="font-serif italic text-lg text-slate-800 px-4 py-1 border-b border-slate-400">
                {quotation.signatoryName}
              </span>
            </div>

            <div className="font-bold text-slate-900 text-xs font-outfit">
              {quotation.signatoryName}
            </div>
            <div className="text-[11px] text-slate-600 font-medium">
              {quotation.signatoryDesignation}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              {quotation.signatoryEmail} • {quotation.signatoryPhone}
            </div>
          </div>
        </div>
      )}

      {/* 9. Footer */}
      <div className="border-t border-slate-200 mt-6 pt-3 text-center text-[10px] text-slate-400">
        <p>{companySettings.footerText}</p>
        <p className="mt-0.5 font-medium">
          {companySettings.website} | Pan-India Delivery | Genuine Industrial Solutions
        </p>
      </div>
    </div>
  );
};
