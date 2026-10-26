import React, { useState, useCallback, useMemo } from 'react';
import { 
  Plus, 
  Package, 
  Trash2, 
  Save, 
  Eye, 
  ArrowLeft, 
  Building2, 
  UserCheck, 
  Check, 
  Layers, 
  Percent, 
  Truck, 
  FileText,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { 
  Quotation, 
  QuotationItem, 
  TaxType, 
  Customer, 
  CatalogueProduct, 
  SalesMember,
  TermsSection,
  QuotationContentSections
} from '../types';
import { useApp } from '../context/AppContext';
import { calculateLineItem, calculateQuotationTotals, formatINR, numberToIndianWords } from '../utils/calculations';
import { QuotationItemRow } from './QuotationItemRow';

interface QuotationBuilderProps {
  initialQuotationId?: string;
  onCancel: () => void;
  onSaveSuccess: (quotationId: string) => void;
  onPreview: (quotationId: string) => void;
}

export const QuotationBuilder: React.FC<QuotationBuilderProps> = ({
  initialQuotationId,
  onCancel,
  onSaveSuccess,
  onPreview,
}) => {
  const { 
    quotations, 
    companySettings, 
    salesMembers, 
    customers, 
    catalogueProducts, 
    termsAndConditions, 
    saveQuotation, 
    generateNextQuotationNumber 
  } = useApp();

  const existingQuotation = initialQuotationId ? quotations.find((q) => q.id === initialQuotationId) : undefined;

  // Active default sales signatory
  const defaultSalesMember = salesMembers.find((m) => m.isActive) || salesMembers[0];

  // Core Form State
  const [quotationId] = useState<string>(() => existingQuotation?.id || `q-${Date.now()}`);
  const [quotationNumber, setQuotationNumber] = useState<string>(() => existingQuotation?.quotationNumber || generateNextQuotationNumber());
  const [date, setDate] = useState<string>(() => existingQuotation?.date || new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState<string>(() => {
    if (existingQuotation?.validUntil) return existingQuotation.validUntil;
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [title, setTitle] = useState<string>(() => existingQuotation?.title || 'Commercial Proposal & Quotation for Industrial Equipment');
  const [enquiryRefNumber, setEnquiryRefNumber] = useState<string>(() => existingQuotation?.enquiryRefNumber || '');
  const [purchaseOrderRef, setPurchaseOrderRef] = useState<string>(() => existingQuotation?.purchaseOrderRef || '');

  // Customer State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(() => existingQuotation?.customerId || '');
  const [customerName, setCustomerName] = useState<string>(() => existingQuotation?.customerName || '');
  const [customerContactPerson, setCustomerContactPerson] = useState<string>(() => existingQuotation?.customerContactPerson || '');
  const [customerDesignation, setCustomerDesignation] = useState<string>(() => existingQuotation?.customerDesignation || '');
  const [customerEmail, setCustomerEmail] = useState<string>(() => existingQuotation?.customerEmail || '');
  const [customerPhone, setCustomerPhone] = useState<string>(() => existingQuotation?.customerPhone || '');
  const [customerBillingAddress, setCustomerBillingAddress] = useState<string>(() => existingQuotation?.customerBillingAddress || '');
  const [customerShippingAddress, setCustomerShippingAddress] = useState<string>(() => existingQuotation?.customerShippingAddress || '');
  const [customerCity, setCustomerCity] = useState<string>(() => existingQuotation?.customerCity || '');
  const [customerState, setCustomerState] = useState<string>(() => existingQuotation?.customerState || '');
  const [customerGstin, setCustomerGstin] = useState<string>(() => existingQuotation?.customerGstin || '');

  // Tax State (IGST vs CGST+SGST)
  const [taxType, setTaxType] = useState<TaxType>(() => existingQuotation?.taxType || companySettings.defaultTaxType || 'IGST');

  // Items State
  const [items, setItems] = useState<QuotationItem[]>(() => {
    if (existingQuotation?.items && existingQuotation.items.length > 0) {
      return existingQuotation.items;
    }
    // Default initial row
    const defaultProd = catalogueProducts[0];
    if (defaultProd) {
      const calc = calculateLineItem(1, defaultProd.standardPrice, 0, defaultProd.gstRate);
      return [
        {
          id: `item-${Date.now()}-1`,
          productId: defaultProd.id,
          name: defaultProd.name,
          brand: defaultProd.brand,
          model: defaultProd.model,
          description: defaultProd.shortDescription,
          technicalSpecs: defaultProd.specs.map(s => `${s.label}: ${s.value}`).join(' | '),
          quantity: 1,
          unit: defaultProd.unit,
          rate: defaultProd.standardPrice,
          discountPercent: 0,
          discountAmount: calc.discountAmount,
          taxableAmount: calc.taxableAmount,
          gstRate: defaultProd.gstRate,
          gstAmount: calc.gstAmount,
          totalAmount: calc.totalAmount,
          hsnSac: defaultProd.hsnSac,
          warranty: defaultProd.warranty,
          deliveryTime: defaultProd.leadTime,
        },
      ];
    }
    return [];
  });

  // Delivery & Charges
  const [delivery, setDelivery] = useState(() => existingQuotation?.delivery || {
    enabled: true,
    deliveryLocation: 'Customer Plant Site',
    deliveryMethod: 'Insured Road Logistics',
    expectedDeliveryTime: 'Within 7-10 days',
    leadTime: 'Ex-stock to 2 weeks',
    dispatchTerms: 'Door Delivery Free On Road (F.O.R.)',
    installationRequired: false,
    installationCharges: 0,
    freightCharges: 0,
    packagingCharges: 0,
  });

  // Payment & Terms
  const [paymentTerms, setPaymentTerms] = useState<string>(() => existingQuotation?.paymentTerms || '50% Advance / 50% Before Dispatch');
  const [customPaymentTerms, setCustomPaymentTerms] = useState<string>(() => existingQuotation?.customPaymentTerms || '');
  const [warrantyTerms, setWarrantyTerms] = useState<string>(() => existingQuotation?.warrantyTerms || '12 Months standard manufacturer warranty against manufacturing defects');
  const [introductionNote, setIntroductionNote] = useState<string>(() => existingQuotation?.introductionNote || 'We thank you for your valued enquiry. Yantratech Solutions is pleased to submit our commercial proposal and technical offer for the equipment listed below.');
  const [terms, setTerms] = useState<TermsSection[]>(() => existingQuotation?.termsAndConditions || termsAndConditions);

  // Signatory State
  const [selectedSalesMemberId, setSelectedSalesMemberId] = useState<string>(() => existingQuotation?.salesMemberId || defaultSalesMember?.id || '');

  // Content Sections
  const [sections, setSections] = useState<QuotationContentSections>(() => existingQuotation?.sections || {
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
  });

  // Catalogue quick modal state
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [catalogueSearch, setCatalogueSearch] = useState('');

  // 1. Customer Selection Handler
  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const custId = e.target.value;
    setSelectedCustomerId(custId);
    if (!custId) return;

    const found = customers.find((c) => c.id === custId);
    if (found) {
      setCustomerName(found.companyName);
      setCustomerContactPerson(found.contactPerson);
      setCustomerDesignation(found.designation);
      setCustomerEmail(found.email);
      setCustomerPhone(found.phone);
      setCustomerBillingAddress(found.billingAddress);
      setCustomerShippingAddress(found.shippingAddress);
      setCustomerCity(found.city);
      setCustomerState(found.state);
      setCustomerGstin(found.gstin);
    }
  };

  // 2. Stable item update callback: guaranteed continuous typing
  const handleUpdateItem = useCallback((id: string, updates: Partial<QuotationItem>) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, ...updates };

        // If qty, rate, discountPercent, or gstRate changed, recalculate
        if (
          'quantity' in updates ||
          'rate' in updates ||
          'discountPercent' in updates ||
          'gstRate' in updates
        ) {
          const calc = calculateLineItem(
            updated.quantity,
            updated.rate,
            updated.discountPercent,
            updated.gstRate
          );
          updated.discountAmount = calc.discountAmount;
          updated.taxableAmount = calc.taxableAmount;
          updated.gstAmount = calc.gstAmount;
          updated.totalAmount = calc.totalAmount;
        }

        return updated;
      })
    );
  }, []);

  const handleDuplicateItem = useCallback((id: string) => {
    setItems((prevItems) => {
      const idx = prevItems.findIndex((it) => it.id === id);
      if (idx === -1) return prevItems;
      const original = prevItems[idx];
      const copy: QuotationItem = {
        ...original,
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: `${original.name} (Copy)`,
      };
      const copyList = [...prevItems];
      copyList.splice(idx + 1, 0, copy);
      return copyList;
    });
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setItems((prevItems) => {
      if (prevItems.length <= 1) {
        alert('A proposal must contain at least one line item.');
        return prevItems;
      }
      return prevItems.filter((it) => it.id !== id);
    });
  }, []);

  const handleAddBlankRow = () => {
    const newItem: QuotationItem = {
      id: `item-${Date.now()}`,
      name: '',
      brand: '',
      model: '',
      description: '',
      technicalSpecs: '',
      quantity: 1,
      unit: 'Nos',
      rate: 0,
      discountPercent: 0,
      discountAmount: 0,
      taxableAmount: 0,
      gstRate: 18,
      gstAmount: 0,
      totalAmount: 0,
      hsnSac: '9030',
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleAddCatalogueProduct = (product: CatalogueProduct) => {
    const calc = calculateLineItem(1, product.standardPrice, 0, product.gstRate);
    const newItem: QuotationItem = {
      id: `item-${Date.now()}`,
      productId: product.id,
      name: product.name,
      brand: product.brand,
      model: product.model,
      description: product.shortDescription,
      technicalSpecs: product.specs.map(s => `${s.label}: ${s.value}`).join(' | '),
      quantity: 1,
      unit: product.unit,
      rate: product.standardPrice,
      discountPercent: 0,
      discountAmount: calc.discountAmount,
      taxableAmount: calc.taxableAmount,
      gstRate: product.gstRate,
      gstAmount: calc.gstAmount,
      totalAmount: calc.totalAmount,
      hsnSac: product.hsnSac,
      warranty: product.warranty,
      deliveryTime: product.leadTime,
    };
    setItems((prev) => [...prev, newItem]);
    setIsProductPickerOpen(false);
  };

  // Instant calculated totals using centralized calculation utility
  const totals = useMemo(() => {
    return calculateQuotationTotals(items, taxType, {
      freight: delivery.freightCharges,
      installation: delivery.installationCharges,
      packaging: delivery.packagingCharges,
    });
  }, [items, taxType, delivery.freightCharges, delivery.installationCharges, delivery.packagingCharges]);

  // Selected Sales Member / Signatory
  const currentSalesMember = salesMembers.find((m) => m.id === selectedSalesMemberId) || defaultSalesMember;

  // Save Quotation Handler
  const handleSave = (status: Quotation['status'] = 'Draft') => {
    if (!quotationNumber.trim()) {
      alert('Quotation Number is required.');
      return;
    }
    if (!customerName.trim()) {
      alert('Customer / Company Name is required.');
      return;
    }
    if (items.length === 0 || !items[0].name.trim()) {
      alert('Please add at least one valid product/service line item.');
      return;
    }

    const payload: Quotation = {
      id: quotationId,
      quotationNumber: quotationNumber.trim(),
      date,
      validUntil,
      title: title.trim(),
      enquiryRefNumber: enquiryRefNumber.trim(),
      purchaseOrderRef: purchaseOrderRef.trim() || undefined,
      customerId: selectedCustomerId || undefined,
      customerName: customerName.trim(),
      customerContactPerson: customerContactPerson.trim(),
      customerDesignation: customerDesignation.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      customerBillingAddress: customerBillingAddress.trim(),
      customerShippingAddress: customerShippingAddress.trim() || customerBillingAddress.trim(),
      customerCity: customerCity.trim(),
      customerState: customerState.trim(),
      customerCountry: 'India',
      customerGstin: customerGstin.trim(),
      items,
      taxType,
      grossSubtotal: totals.grossSubtotal,
      totalDiscount: totals.totalDiscount,
      taxableSubtotal: totals.taxableSubtotal,
      totalGst: totals.totalGst,
      cgstAmount: totals.cgstAmount,
      sgstAmount: totals.sgstAmount,
      igstAmount: totals.igstAmount,
      freightAndOtherCharges: totals.freightAndOtherCharges,
      grandTotal: totals.grandTotal,
      delivery,
      paymentTerms,
      customPaymentTerms: customPaymentTerms.trim() || undefined,
      warrantyTerms,
      introductionNote,
      termsAndConditions: terms,
      sections,
      salesMemberId: currentSalesMember.id,
      signatoryName: currentSalesMember.name,
      signatoryDesignation: currentSalesMember.designation,
      signatoryEmail: currentSalesMember.email,
      signatoryPhone: currentSalesMember.phone,
      status,
      createdAt: existingQuotation?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveQuotation(payload);
    onSaveSuccess(payload.id);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-16 z-30">
        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 text-lg">
                {existingQuotation ? `Edit Quotation ${quotationNumber}` : 'Draft New Proposal'}
              </span>
              <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                YTS Engine
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Interactive proposal builder with continuous-typing support & multi-product catalogue integration.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => handleSave('Draft')}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-sm transition-colors"
          >
            Save as Draft
          </button>

          <button
            type="button"
            onClick={() => {
              handleSave('Draft');
              onPreview(quotationId);
            }}
            className="px-4 py-2 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg shadow-sm transition-colors flex items-center"
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            Preview Proposal
          </button>

          <button
            type="button"
            onClick={() => handleSave('Sent')}
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow transition-colors flex items-center"
          >
            <Save className="w-4 h-4 mr-1.5" />
            Finalize & Save
          </button>
        </div>
      </div>

      {/* Step A & B: Quotation & Customer Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section A: Quotation Metadata */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-amber-700">
              A. Quotation Information
            </h3>
            <p className="text-[11px] text-slate-500">Quotation numbering, validity, and enquiry references.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quotation Number *</label>
              <input
                type="text"
                required
                value={quotationNumber}
                onChange={(e) => setQuotationNumber(e.target.value)}
                className="w-full px-3 py-1.5 font-mono font-bold text-slate-900 rounded border border-slate-300 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quotation Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-slate-300 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Quotation Title / Subject *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Supply of Industrial Instruments & Calibration Tools"
                className="w-full px-3 py-1.5 font-medium rounded border border-slate-300 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Valid Until</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-slate-300 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Enquiry / RFQ Ref</label>
              <input
                type="text"
                value={enquiryRefNumber}
                onChange={(e) => setEnquiryRefNumber(e.target.value)}
                placeholder="e.g. RFQ/2026/09"
                className="w-full px-3 py-1.5 font-mono rounded border border-slate-300 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Section B: Customer Information */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-200 pb-2 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-amber-700">
                B. Customer Information
              </h3>
              <p className="text-[11px] text-slate-500">Pick from existing customers or enter new client details.</p>
            </div>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>

          {/* Quick Select Customer */}
          <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/60 text-xs">
            <label className="block font-semibold text-amber-900 mb-1">
              Select Saved Customer (Auto-populates fields):
            </label>
            <select
              value={selectedCustomerId}
              onChange={handleCustomerSelect}
              className="w-full px-2.5 py-1.5 bg-white text-xs rounded border border-amber-300 focus:ring-1 focus:ring-amber-500 font-medium"
            >
              <option value="">-- Choose Customer or Enter Custom Below --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName} ({c.city})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Larsen & Toubro Heavy Engineering"
                className="w-full px-3 py-1.5 font-bold rounded border border-slate-300 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
              <input
                type="text"
                value={customerContactPerson}
                onChange={(e) => setCustomerContactPerson(e.target.value)}
                placeholder="e.g. Sunil Nair"
                className="w-full px-3 py-1.5 rounded border border-slate-300 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                value={customerDesignation}
                onChange={(e) => setCustomerDesignation(e.target.value)}
                placeholder="e.g. Chief Procurement Manager"
                className="w-full px-3 py-1.5 rounded border border-slate-300 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="procurement@client.com"
                className="w-full px-3 py-1.5 rounded border border-slate-300 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+91 9820012345"
                className="w-full px-3 py-1.5 rounded border border-slate-300 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Billing Address</label>
              <input
                type="text"
                value={customerBillingAddress}
                onChange={(e) => setCustomerBillingAddress(e.target.value)}
                placeholder="Gate No. 1, Powai Campus..."
                className="w-full px-3 py-1.5 rounded border border-slate-300 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">City & State</label>
              <input
                type="text"
                value={`${customerCity}${customerCity && customerState ? ', ' : ''}${customerState}`}
                onChange={(e) => {
                  const parts = e.target.value.split(',');
                  setCustomerCity(parts[0]?.trim() || '');
                  setCustomerState(parts[1]?.trim() || '');
                }}
                placeholder="Mumbai, Maharashtra"
                className="w-full px-3 py-1.5 rounded border border-slate-300 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer GSTIN</label>
              <input
                type="text"
                value={customerGstin}
                onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
                placeholder="27AAACL0140P1ZL"
                className="w-full px-3 py-1.5 font-mono uppercase rounded border border-slate-300 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Introduction Narrative */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
        <label className="block font-semibold text-slate-800 mb-1">Introduction / Opening Note</label>
        <textarea
          rows={2}
          value={introductionNote}
          onChange={(e) => setIntroductionNote(e.target.value)}
          placeholder="Introductory text before product pricing breakdown..."
          className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-amber-500 text-xs"
        />
      </div>

      {/* Step C: Product / Service Line Items Builder */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base uppercase tracking-wider text-amber-700">
              C. Products & Industrial Services
            </h3>
            <p className="text-xs text-slate-500">
              Add products dynamically, select from Yantratech Catalogue, configure quantities, discounts, and HSN/GST.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsProductPickerOpen(true)}
              className="flex items-center bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold px-3 py-2 rounded-lg text-xs shadow transition-colors"
            >
              <Package className="w-4 h-4 mr-1.5" />
              Pick from Catalogue
            </button>
            <button
              type="button"
              onClick={handleAddBlankRow}
              className="flex items-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-lg text-xs shadow transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Custom Item
            </button>
          </div>
        </div>

        {/* Dynamic Item Rows */}
        <div className="space-y-4">
          {items.map((item, index) => (
            <QuotationItemRow
              key={item.id}
              index={index}
              item={item}
              onUpdate={handleUpdateItem}
              onDuplicate={handleDuplicateItem}
              onRemove={handleRemoveItem}
            />
          ))}
        </div>

        {/* Bottom add button */}
        <div className="pt-2 flex justify-start space-x-3">
          <button
            type="button"
            onClick={handleAddBlankRow}
            className="flex items-center text-xs font-bold text-slate-700 hover:text-amber-700 py-1.5 px-3 rounded border border-dashed border-slate-300 hover:border-amber-500 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            + Add Another Row
          </button>
          <button
            type="button"
            onClick={() => setIsProductPickerOpen(true)}
            className="flex items-center text-xs font-bold text-slate-700 hover:text-amber-700 py-1.5 px-3 rounded border border-dashed border-slate-300 hover:border-amber-500 transition-colors"
          >
            <Package className="w-3.5 h-3.5 mr-1" />
            + Select from Product Catalogue
          </button>
        </div>
      </div>

      {/* Step D & E: GST Configuration & Commercial Calculations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GST Structure & Logistics Charges */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-amber-700">
              D. GST Tax Selection & Logistics
            </h3>
            <p className="text-[11px] text-slate-500">
              Explicitly select IGST or CGST+SGST. Add Freight, Packaging, or Installation charges.
            </p>
          </div>

          {/* GST Selection Radio Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">Applicable GST Tax Regime:</label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                  taxType === 'IGST'
                    ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">IGST (Inter-State)</span>
                  <input
                    type="radio"
                    name="taxType"
                    checked={taxType === 'IGST'}
                    onChange={() => setTaxType('IGST')}
                    className="text-amber-500 focus:ring-amber-400"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  18% Integrated Goods and Service Tax for shipments outside Maharashtra.
                </p>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                  taxType === 'CGST_SGST'
                    ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">CGST + SGST (Intra-State)</span>
                  <input
                    type="radio"
                    name="taxType"
                    checked={taxType === 'CGST_SGST'}
                    onChange={() => setTaxType('CGST_SGST')}
                    className="text-amber-500 focus:ring-amber-400"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  9% Central GST + 9% State GST for deliveries within Maharashtra.
                </p>
              </label>
            </div>
          </div>

          {/* Additional Charges: Freight, Installation, Packaging */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Freight (₹)</label>
              <input
                type="number"
                min="0"
                value={delivery.freightCharges || ''}
                onChange={(e) =>
                  setDelivery({ ...delivery, freightCharges: parseFloat(e.target.value) || 0 })
                }
                placeholder="0"
                className="w-full px-2.5 py-1.5 font-mono rounded border border-slate-300 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Installation (₹)</label>
              <input
                type="number"
                min="0"
                value={delivery.installationCharges || ''}
                onChange={(e) =>
                  setDelivery({ ...delivery, installationCharges: parseFloat(e.target.value) || 0 })
                }
                placeholder="0"
                className="w-full px-2.5 py-1.5 font-mono rounded border border-slate-300 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Packaging (₹)</label>
              <input
                type="number"
                min="0"
                value={delivery.packagingCharges || ''}
                onChange={(e) =>
                  setDelivery({ ...delivery, packagingCharges: parseFloat(e.target.value) || 0 })
                }
                placeholder="0"
                className="w-full px-2.5 py-1.5 font-mono rounded border border-slate-300 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Live Commercial Calculations Box */}
        <div className="bg-slate-900 text-white p-5 rounded-xl shadow-lg space-y-3">
          <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
            <h3 className="font-bold text-amber-400 text-sm uppercase tracking-wider">
              E. Commercial Summary
            </h3>
            <span className="text-[11px] text-slate-400">Accurate decimal calculation</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Gross Total:</span>
              <span className="font-mono text-sm">{formatINR(totals.grossSubtotal)}</span>
            </div>

            {totals.totalDiscount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount Applied:</span>
                <span className="font-mono text-sm">- {formatINR(totals.totalDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between text-white font-semibold border-t border-slate-800 pt-2">
              <span>Taxable Value (Subtotal):</span>
              <span className="font-mono text-base">{formatINR(totals.taxableSubtotal)}</span>
            </div>

            {/* Displaying selected GST structure clearly */}
            {taxType === 'IGST' ? (
              <div className="flex justify-between text-amber-300">
                <span>IGST (Integrated Tax):</span>
                <span className="font-mono text-base">{formatINR(totals.igstAmount)}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-amber-300">
                  <span>CGST (Central Tax 9%):</span>
                  <span className="font-mono text-sm">{formatINR(totals.cgstAmount)}</span>
                </div>
                <div className="flex justify-between text-amber-300">
                  <span>SGST (State Tax 9%):</span>
                  <span className="font-mono text-sm">{formatINR(totals.sgstAmount)}</span>
                </div>
              </>
            )}

            {totals.freightAndOtherCharges > 0 && (
              <div className="flex justify-between text-slate-300">
                <span>Freight, Packaging & Installation:</span>
                <span className="font-mono">{formatINR(totals.freightAndOtherCharges)}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline text-white font-black text-lg border-t-2 border-amber-500 pt-3">
              <span className="uppercase tracking-wider">Grand Total (INR):</span>
              <span className="font-mono text-2xl text-amber-400">{formatINR(totals.grandTotal)}</span>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 italic">
              Amount in words: <span className="text-slate-200 font-semibold">{numberToIndianWords(totals.grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step F: Delivery, Payment & Signatory Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Logistics & Delivery */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-amber-700 border-b pb-2">
            F. Delivery Logistics
          </h3>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Delivery Location</label>
            <input
              type="text"
              value={delivery.deliveryLocation}
              onChange={(e) => setDelivery({ ...delivery, deliveryLocation: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lead Time</label>
            <input
              type="text"
              value={delivery.leadTime}
              onChange={(e) => setDelivery({ ...delivery, leadTime: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Dispatch Terms</label>
            <input
              type="text"
              value={delivery.dispatchTerms}
              onChange={(e) => setDelivery({ ...delivery, dispatchTerms: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Commercial Payment Terms */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-amber-700 border-b pb-2">
            G. Payment Terms
          </h3>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Standard Payment Term</label>
            <select
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:ring-1 focus:ring-amber-500 bg-white"
            >
              <option value="100% Advance along with formal Purchase Order">100% Advance</option>
              <option value="50% Advance / 50% Before Dispatch">50% Advance / 50% Before Dispatch</option>
              <option value="100% Against Delivery">100% Against Delivery</option>
              <option value="30 Days Net Credit against verified Purchase Order">30 Days Net Credit</option>
              <option value="Custom">Custom Terms...</option>
            </select>
          </div>

          {paymentTerms === 'Custom' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Enter Custom Payment Terms</label>
              <textarea
                rows={2}
                value={customPaymentTerms}
                onChange={(e) => setCustomPaymentTerms(e.target.value)}
                placeholder="Specify custom milestones or LC terms..."
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:ring-1 focus:ring-amber-500 text-xs"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Warranty Term</label>
            <input
              type="text"
              value={warrantyTerms}
              onChange={(e) => setWarrantyTerms(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Selected Sales Member / Proposal Sender */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-amber-700 border-b pb-2">
            H. Proposal Signatory
          </h3>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Sales Signatory *</label>
            <select
              value={selectedSalesMemberId}
              onChange={(e) => setSelectedSalesMemberId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:ring-1 focus:ring-amber-500 bg-white font-medium"
            >
              {salesMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.designation})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800 block text-[11px]">Sign-off representation:</span>
            <div className="font-serif italic text-sm text-slate-900">{currentSalesMember.name}</div>
            <div className="text-[10px] text-slate-500">{currentSalesMember.designation}</div>
            <div className="text-[10px] text-slate-500 font-mono">{currentSalesMember.email}</div>
          </div>
        </div>
      </div>

      {/* Catalogue Quick Selection Modal */}
      {isProductPickerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg flex items-center">
                <Package className="w-5 h-5 mr-2 text-amber-400" />
                Select Product from Yantratech Catalogue
              </h3>
              <button
                onClick={() => setIsProductPickerOpen(false)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <input
                type="text"
                placeholder="Search catalogue products by name, model, brand, or category..."
                value={catalogueSearch}
                onChange={(e) => setCatalogueSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="p-4 overflow-y-auto divide-y divide-slate-100 flex-1">
              {catalogueProducts
                .filter(
                  (p) =>
                    p.name.toLowerCase().includes(catalogueSearch.toLowerCase()) ||
                    p.brand.toLowerCase().includes(catalogueSearch.toLowerCase()) ||
                    p.model.toLowerCase().includes(catalogueSearch.toLowerCase()) ||
                    p.category.toLowerCase().includes(catalogueSearch.toLowerCase())
                )
                .map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => handleAddCatalogueProduct(prod)}
                    className="py-3 px-2 flex justify-between items-center hover:bg-amber-50/50 cursor-pointer rounded-lg transition-colors group"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-sm group-hover:text-amber-700">
                        {prod.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Brand: <strong>{prod.brand}</strong> | Model: {prod.model} | Category: {prod.category}
                      </div>
                      <div className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                        {prod.shortDescription}
                      </div>
                    </div>

                    <div className="text-right pl-4 flex-shrink-0">
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {formatINR(prod.standardPrice)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        GST: {prod.gstRate}% | HSN: {prod.hsnSac}
                      </div>
                      <button
                        type="button"
                        className="mt-1 bg-amber-500 group-hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1 rounded text-[11px]"
                      >
                        + Insert into Quotation
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
