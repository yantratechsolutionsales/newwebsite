import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  CompanySettings, 
  SalesMember, 
  ProductCategory, 
  CatalogueProduct, 
  Customer, 
  TermsSection,
  Quotation,
  QuotationItem
} from '../types';
import {
  INITIAL_COMPANY_SETTINGS,
  INITIAL_SALES_MEMBERS,
  INITIAL_PRODUCT_CATEGORIES,
  INITIAL_CATALOGUE_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_TERMS_AND_CONDITIONS,
  INITIAL_QUOTATIONS
} from '../data/initialData';
import { calculateQuotationTotals } from '../utils/calculations';

interface AppContextType {
  companySettings: CompanySettings;
  updateCompanySettings: (settings: Partial<CompanySettings>) => void;
  
  salesMembers: SalesMember[];
  addSalesMember: (member: Omit<SalesMember, 'id'>) => SalesMember;
  updateSalesMember: (id: string, member: Partial<SalesMember>) => void;
  deleteSalesMember: (id: string) => void;
  
  categories: ProductCategory[];
  addCategory: (name: string, description?: string) => ProductCategory;
  updateCategory: (id: string, updates: Partial<ProductCategory>) => void;
  deleteCategory: (id: string) => void;

  catalogueProducts: CatalogueProduct[];
  addProduct: (product: Omit<CatalogueProduct, 'id'>) => CatalogueProduct;
  updateProduct: (id: string, updates: Partial<CatalogueProduct>) => void;
  deleteProduct: (id: string) => void;

  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  termsAndConditions: TermsSection[];
  updateTermsAndConditions: (terms: TermsSection[]) => void;

  quotations: Quotation[];
  getQuotation: (id: string) => Quotation | undefined;
  saveQuotation: (quotation: Quotation) => void;
  duplicateQuotation: (id: string) => Quotation | undefined;
  deleteQuotation: (id: string) => void;
  generateNextQuotationNumber: () => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SETTINGS: 'yts_settings_v1',
  SALES_MEMBERS: 'yts_sales_members_v1',
  CATEGORIES: 'yts_categories_v1',
  PRODUCTS: 'yts_products_v1',
  CUSTOMERS: 'yts_customers_v1',
  TERMS: 'yts_terms_v1',
  QUOTATIONS: 'yts_quotations_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or seed
  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_COMPANY_SETTINGS;
  });

  const [salesMembers, setSalesMembers] = useState<SalesMember[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SALES_MEMBERS);
    return saved ? JSON.parse(saved) : INITIAL_SALES_MEMBERS;
  });

  const [categories, setCategories] = useState<ProductCategory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCT_CATEGORIES;
  });

  const [catalogueProducts, setCatalogueProducts] = useState<CatalogueProduct[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_CATALOGUE_PRODUCTS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [termsAndConditions, setTermsAndConditions] = useState<TermsSection[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TERMS);
    return saved ? JSON.parse(saved) : INITIAL_TERMS_AND_CONDITIONS;
  });

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QUOTATIONS);
    return saved ? JSON.parse(saved) : INITIAL_QUOTATIONS;
  });

  // Sync to local storage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(companySettings));
  }, [companySettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALES_MEMBERS, JSON.stringify(salesMembers));
  }, [salesMembers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(catalogueProducts));
  }, [catalogueProducts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TERMS, JSON.stringify(termsAndConditions));
  }, [termsAndConditions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(quotations));
  }, [quotations]);

  // Company settings handlers
  const updateCompanySettings = (settings: Partial<CompanySettings>) => {
    setCompanySettings(prev => ({ ...prev, ...settings }));
  };

  // Sales member handlers
  const addSalesMember = (member: Omit<SalesMember, 'id'>): SalesMember => {
    const newMember: SalesMember = {
      ...member,
      id: `sm-${Date.now()}`,
    };
    setSalesMembers(prev => [...prev, newMember]);
    return newMember;
  };

  const updateSalesMember = (id: string, updates: Partial<SalesMember>) => {
    setSalesMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteSalesMember = (id: string) => {
    setSalesMembers(prev => prev.filter(m => m.id !== id));
  };

  // Category handlers
  const addCategory = (name: string, description?: string): ProductCategory => {
    const newCat: ProductCategory = {
      id: `cat-${Date.now()}`,
      name,
      description,
      isActive: true,
    };
    setCategories(prev => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = (id: string, updates: Partial<ProductCategory>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Product handlers
  const addProduct = (product: Omit<CatalogueProduct, 'id'>): CatalogueProduct => {
    const newProd: CatalogueProduct = {
      ...product,
      id: `prod-${Date.now()}`,
    };
    setCatalogueProducts(prev => [newProd, ...prev]);
    return newProd;
  };

  const updateProduct = (id: string, updates: Partial<CatalogueProduct>) => {
    setCatalogueProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    setCatalogueProducts(prev => prev.filter(p => p.id !== id));
  };

  // Customer handlers
  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const newCust: Customer = {
      ...customer,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCustomers(prev => [newCust, ...prev]);
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  // Terms handlers
  const updateTermsAndConditions = (terms: TermsSection[]) => {
    setTermsAndConditions(terms);
  };

  // Quotation sequence generator
  const generateNextQuotationNumber = (): string => {
    const seq = companySettings.nextSequence || 101;
    const formattedSeq = String(seq).padStart(4, '0');
    return `${companySettings.quotationPrefix}/${companySettings.quotationYearFormat}/${formattedSeq}`;
  };

  // Quotation handlers
  const getQuotation = (id: string) => {
    return quotations.find(q => q.id === id);
  };

  const saveQuotation = (quotation: Quotation) => {
    // Recalculate totals to guarantee 100% integrity before persistence
    const calc = calculateQuotationTotals(quotation.items, quotation.taxType, {
      freight: quotation.delivery?.freightCharges,
      installation: quotation.delivery?.installationCharges,
      packaging: quotation.delivery?.packagingCharges,
    });

    const finalizedQuotation: Quotation = {
      ...quotation,
      grossSubtotal: calc.grossSubtotal,
      totalDiscount: calc.totalDiscount,
      taxableSubtotal: calc.taxableSubtotal,
      totalGst: calc.totalGst,
      cgstAmount: calc.cgstAmount,
      sgstAmount: calc.sgstAmount,
      igstAmount: calc.igstAmount,
      freightAndOtherCharges: calc.freightAndOtherCharges,
      grandTotal: calc.grandTotal,
      updatedAt: new Date().toISOString(),
    };

    setQuotations(prev => {
      const exists = prev.some(q => q.id === finalizedQuotation.id);
      if (exists) {
        return prev.map(q => q.id === finalizedQuotation.id ? finalizedQuotation : q);
      } else {
        // Increment nextSequence
        setCompanySettings(cs => ({ ...cs, nextSequence: (cs.nextSequence || 100) + 1 }));
        return [finalizedQuotation, ...prev];
      }
    });
  };

  const duplicateQuotation = (id: string): Quotation | undefined => {
    const source = quotations.find(q => q.id === id);
    if (!source) return undefined;

    const newQuotationNumber = generateNextQuotationNumber();
    setCompanySettings(cs => ({ ...cs, nextSequence: (cs.nextSequence || 100) + 1 }));

    const duplicated: Quotation = {
      ...JSON.parse(JSON.stringify(source)),
      id: `q-${Date.now()}`,
      quotationNumber: newQuotationNumber,
      title: `${source.title} (Copy)`,
      date: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Draft',
      items: source.items.map(it => ({ ...it, id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}` })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setQuotations(prev => [duplicated, ...prev]);
    return duplicated;
  };

  const deleteQuotation = (id: string) => {
    setQuotations(prev => prev.filter(q => q.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        companySettings,
        updateCompanySettings,
        salesMembers,
        addSalesMember,
        updateSalesMember,
        deleteSalesMember,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        catalogueProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        termsAndConditions,
        updateTermsAndConditions,
        quotations,
        getQuotation,
        saveQuotation,
        duplicateQuotation,
        deleteQuotation,
        generateNextQuotationNumber,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
