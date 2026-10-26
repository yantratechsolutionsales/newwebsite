export type TaxType = 'IGST' | 'CGST_SGST';

export type QuotationStatus = 
  | 'Draft' 
  | 'Sent' 
  | 'Under Discussion' 
  | 'Revised' 
  | 'Approved' 
  | 'Rejected' 
  | 'Expired';

export interface CompanySettings {
  name: string;
  tagline: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  gstin: string;
  pan: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  logoUrl?: string;
  footerText: string;
  quotationPrefix: string;
  quotationYearFormat: string; // e.g. "2026-27"
  nextSequence: number;
  defaultTaxType: TaxType;
  defaultCurrency: string;
  defaultCurrencySymbol: string;
}

export interface SalesMember {
  id: string;
  name: string;
  designation: string;
  email: string;
  phone: string;
  signatureUrl?: string;
  isActive: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface TechnicalSpecItem {
  id: string;
  label: string;
  value: string;
}

export interface CatalogueProduct {
  id: string;
  name: string;
  sku: string;
  brand: string;
  model: string;
  category: string;
  subcategory?: string;
  shortDescription: string;
  detailedDescription?: string;
  specs: TechnicalSpecItem[];
  unit: string;
  hsnSac: string;
  gstRate: number; // e.g., 18 for 18%
  standardPrice: number;
  costPrice?: number;
  warranty: string;
  leadTime: string;
  imageUrl?: string;
  datasheetUrl?: string;
  status: 'Active' | 'Inactive';
  notes?: string;
}

export interface Customer {
  id: string;
  companyName: string;
  contactPerson: string;
  designation: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  billingAddress: string;
  shippingAddress: string;
  city: string;
  state: string;
  country: string;
  gstin: string;
  pan?: string;
  customerType: 'Industrial Client' | 'OEM' | 'Contractor' | 'Dealer' | 'Government / PSU' | 'Other';
  notes?: string;
  createdAt: string;
}

export interface QuotationItem {
  id: string;
  productId?: string;
  name: string;
  brand: string;
  model: string;
  partNumber?: string;
  description: string;
  technicalSpecs: string; // multi-line formatted or spec details
  quantity: number;
  unit: string;
  rate: number;
  discountPercent: number;
  discountAmount: number;
  taxableAmount: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
  hsnSac: string;
  warranty?: string;
  deliveryTime?: string;
  datasheetRef?: string;
}

export interface DeliveryDetails {
  enabled: boolean;
  deliveryLocation: string;
  deliveryMethod: string;
  expectedDeliveryTime: string;
  leadTime: string;
  dispatchTerms: string;
  installationRequired: boolean;
  installationCharges: number;
  freightCharges: number;
  packagingCharges: number;
}

export interface TermsSection {
  id: string;
  title: string;
  content: string;
  enabled: boolean;
}

export interface QuotationContentSections {
  showCoverHeader: boolean;
  showCustomerInfo: boolean;
  showEnquiryRef: boolean;
  showIntroduction: boolean;
  showProductDetails: boolean;
  showTechSpecs: boolean;
  showCommercialProposal: boolean;
  showDeliveryInfo: boolean;
  showPaymentTerms: boolean;
  showWarranty: boolean;
  showTermsAndConditions: boolean;
  showBankDetails: boolean;
  showSignatory: boolean;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  date: string;
  validUntil: string;
  title: string;
  enquiryRefNumber: string;
  purchaseOrderRef?: string;
  
  // Customer details (snapshot at quotation time)
  customerId?: string;
  customerName: string;
  customerContactPerson: string;
  customerDesignation: string;
  customerEmail: string;
  customerPhone: string;
  customerBillingAddress: string;
  customerShippingAddress: string;
  customerCity: string;
  customerState: string;
  customerCountry: string;
  customerGstin: string;
  customerPan?: string;

  // Items
  items: QuotationItem[];

  // Tax configuration
  taxType: TaxType;

  // Commercial summaries
  grossSubtotal: number;
  totalDiscount: number;
  taxableSubtotal: number;
  totalGst: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  freightAndOtherCharges: number;
  grandTotal: number;

  // Delivery & Payment
  delivery: DeliveryDetails;
  paymentTerms: string;
  customPaymentTerms?: string;
  warrantyTerms: string;

  // Introduction narrative
  introductionNote?: string;

  // Terms & Conditions
  termsAndConditions: TermsSection[];

  // Content Sections Visibility
  sections: QuotationContentSections;

  // Sales Member / Signatory
  salesMemberId: string;
  signatoryName: string;
  signatoryDesignation: string;
  signatoryEmail: string;
  signatoryPhone: string;
  signatorySignatureUrl?: string;

  // Status & Timestamps
  status: QuotationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
