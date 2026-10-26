import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  FileText, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { CatalogueProduct, TechnicalSpecItem } from '../types';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/calculations';

interface ProductCatalogueProps {
  onSelectProductForQuotation?: (product: CatalogueProduct) => void;
}

export const ProductCatalogue: React.FC<ProductCatalogueProps> = ({
  onSelectProductForQuotation,
}) => {
  const { catalogueProducts, categories, addProduct, updateProduct, deleteProduct } = useApp();
  
  // Filters and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [onlyWithPdf, setOnlyWithPdf] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CatalogueProduct | null>(null);
  const [inspectingProduct, setInspectingProduct] = useState<CatalogueProduct | null>(null);

  // Form state for creating/editing product
  const [formData, setFormData] = useState<{
    name: string;
    sku: string;
    brand: string;
    model: string;
    category: string;
    subcategory: string;
    shortDescription: string;
    detailedDescription: string;
    specs: TechnicalSpecItem[];
    unit: string;
    hsnSac: string;
    gstRate: number;
    standardPrice: number;
    costPrice: number;
    warranty: string;
    leadTime: string;
    imageUrl: string;
    datasheetUrl: string;
    status: 'Active' | 'Inactive';
    notes: string;
  }>({
    name: '',
    sku: '',
    brand: '',
    model: '',
    category: categories[0]?.name || 'Testing & Measuring Instruments',
    subcategory: '',
    shortDescription: '',
    detailedDescription: '',
    specs: [{ id: '1', label: '', value: '' }],
    unit: 'Nos',
    hsnSac: '',
    gstRate: 18,
    standardPrice: 0,
    costPrice: 0,
    warranty: '12 Months standard warranty',
    leadTime: 'Immediate ex-stock / 3-5 days',
    imageUrl: '',
    datasheetUrl: '',
    status: 'Active',
    notes: '',
  });

  // Extract unique brands with counts
  const brandList = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of catalogueProducts) {
      if (p.brand) {
        map.set(p.brand, (map.get(p.brand) || 0) + 1);
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [catalogueProducts]);

  // Extract unique categories with counts
  const categoryList = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of catalogueProducts) {
      if (p.category) {
        map.set(p.category, (map.get(p.category) || 0) + 1);
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [catalogueProducts]);

  // Filtered list
  const filteredProducts = useMemo(() => {
    return catalogueProducts.filter((p) => {
      const matchSearch =
        !searchTerm ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.shortDescription && p.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.specs && p.specs.some(s => s.label.toLowerCase().includes(searchTerm.toLowerCase()) || s.value.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
      const matchBrand = brandFilter === 'ALL' || p.brand === brandFilter;
      const matchPdf = !onlyWithPdf || Boolean(p.datasheetUrl);

      return matchSearch && matchCategory && matchBrand && matchPdf;
    });
  }, [catalogueProducts, searchTerm, categoryFilter, brandFilter, onlyWithPdf]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handleFilterChange = (setter: (val: any) => void, val: any) => {
    setter(val);
    setCurrentPage(1);
  };

  // 1. Download Complete Catalogue as CSV
  const handleDownloadCsv = () => {
    const headers = [
      'Product Name',
      'Brand',
      'Model',
      'SKU',
      'Category',
      'Standard Price (INR)',
      'Unit',
      'HSN/SAC',
      'GST Rate %',
      'Warranty',
      'Lead Time',
      'Datasheet PDF URL',
      'Product Image URL',
      'Technical Specifications',
      'Description'
    ];

    const escapeCsv = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;

    const rows = filteredProducts.map(p => {
      const specsStr = (p.specs || []).map(s => `${s.label}: ${s.value}`).join(' | ');
      return [
        escapeCsv(p.name),
        escapeCsv(p.brand),
        escapeCsv(p.model),
        escapeCsv(p.sku),
        escapeCsv(p.category),
        p.standardPrice || 0,
        escapeCsv(p.unit),
        escapeCsv(p.hsnSac),
        p.gstRate || 18,
        escapeCsv(p.warranty),
        escapeCsv(p.leadTime),
        escapeCsv(p.datasheetUrl || ''),
        escapeCsv(p.imageUrl || ''),
        escapeCsv(specsStr),
        escapeCsv(p.shortDescription || '')
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Yantratech_Product_Catalogue_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Download Complete Catalogue as JSON
  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(filteredProducts, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Yantratech_Product_Catalogue_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. Download Single Product Specification Sheet
  const handleDownloadSingleSpec = (prod: CatalogueProduct, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    let content = `====================================================\n`;
    content += `YANTRATECH SOLUTIONS - TECHNICAL PRODUCT SPECIFICATION\n`;
    content += `Website: https://www.yantratechsolutions.co.in/\n`;
    content += `Contact: +91 8655813866 | sales@yantratechsolutions.co.in\n`;
    content += `====================================================\n\n`;
    content += `PRODUCT NAME: ${prod.name}\n`;
    content += `BRAND / MAKE: ${prod.brand}\n`;
    content += `MODEL NUMBER: ${prod.model || 'N/A'}\n`;
    content += `PRODUCT SKU : ${prod.sku}\n`;
    content += `CATEGORY    : ${prod.category}\n`;
    content += `HSN / SAC   : ${prod.hsnSac || '9030'}\n`;
    content += `APPLICABLE GST: ${prod.gstRate}%\n`;
    content += `STANDARD PRICE: ${prod.standardPrice > 0 ? formatINR(prod.standardPrice) : 'Price on Enquiry'}\n`;
    content += `WARRANTY    : ${prod.warranty}\n`;
    content += `LEAD TIME   : ${prod.leadTime}\n\n`;

    if (prod.datasheetUrl) {
      content += `OFFICIAL DATASHEET: ${prod.datasheetUrl}\n\n`;
    }

    content += `----------------------------------------------------\n`;
    content += `COMMERCIAL & TECHNICAL OVERVIEW:\n`;
    content += `----------------------------------------------------\n`;
    content += `${prod.detailedDescription || prod.shortDescription || 'High performance industrial instrumentation tool.'}\n\n`;

    content += `----------------------------------------------------\n`;
    content += `TECHNICAL PARAMETERS & SPECIFICATIONS:\n`;
    content += `----------------------------------------------------\n`;
    if (prod.specs && prod.specs.length > 0) {
      prod.specs.forEach((sp, idx) => {
        content += `${idx + 1}. ${sp.label.padEnd(28)} : ${sp.value}\n`;
      });
    } else {
      content += `Standard industrial specifications as per OEM datasheet.\n`;
    }

    content += `\n====================================================\n`;
    content += `Issued by Yantratech Solutions Technical Sales Team\n`;
    content += `Pan-India Delivery | Genuine Products Guaranteed\n`;
    content += `====================================================\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(prod.model || prod.sku || 'Product').replace(/[^a-zA-Z0-9_-]/g, '_')}_Spec_Sheet.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add / Edit handlers
  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `SKU-${Date.now().toString().slice(-4)}`,
      brand: '',
      model: '',
      category: categories[0]?.name || 'Testing & Measuring Instruments',
      subcategory: '',
      shortDescription: '',
      detailedDescription: '',
      specs: [
        { id: '1', label: 'Range', value: '' },
        { id: '2', label: 'Accuracy', value: '' },
      ],
      unit: 'Nos',
      hsnSac: '9030',
      gstRate: 18,
      standardPrice: 0,
      costPrice: 0,
      warranty: '12 Months warranty against manufacturing defects',
      leadTime: 'Ex-stock 3-5 days',
      imageUrl: '',
      datasheetUrl: '',
      status: 'Active',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (prod: CatalogueProduct, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      sku: prod.sku,
      brand: prod.brand,
      model: prod.model,
      category: prod.category,
      subcategory: prod.subcategory || '',
      shortDescription: prod.shortDescription,
      detailedDescription: prod.detailedDescription || '',
      specs: prod.specs && prod.specs.length > 0 ? [...prod.specs] : [{ id: '1', label: '', value: '' }],
      unit: prod.unit,
      hsnSac: prod.hsnSac,
      gstRate: prod.gstRate,
      standardPrice: prod.standardPrice,
      costPrice: prod.costPrice || 0,
      warranty: prod.warranty,
      leadTime: prod.leadTime,
      imageUrl: prod.imageUrl || '',
      datasheetUrl: prod.datasheetUrl || '',
      status: prod.status,
      notes: prod.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleAddSpecRow = () => {
    setFormData((prev) => ({
      ...prev,
      specs: [...prev.specs, { id: Date.now().toString(), label: '', value: '' }],
    }));
  };

  const handleRemoveSpecRow = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      specs: prev.specs.filter((s) => s.id !== id),
    }));
  };

  const handleSpecChange = (id: string, field: 'label' | 'value', text: string) => {
    setFormData((prev) => ({
      ...prev,
      specs: prev.specs.map((s) => (s.id === id ? { ...s, [field]: text } : s)),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Product Name is required.');
      return;
    }

    const cleanedSpecs = formData.specs.filter((s) => s.label.trim() || s.value.trim());

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      category: formData.category,
      subcategory: formData.subcategory.trim() || undefined,
      shortDescription: formData.shortDescription.trim(),
      detailedDescription: formData.detailedDescription.trim() || undefined,
      specs: cleanedSpecs,
      unit: formData.unit.trim() || 'Nos',
      hsnSac: formData.hsnSac.trim() || '9030',
      gstRate: Number(formData.gstRate) || 18,
      standardPrice: Number(formData.standardPrice) || 0,
      costPrice: Number(formData.costPrice) || undefined,
      warranty: formData.warranty.trim(),
      leadTime: formData.leadTime.trim(),
      imageUrl: formData.imageUrl.trim() || undefined,
      datasheetUrl: formData.datasheetUrl.trim() || undefined,
      status: formData.status,
      notes: formData.notes.trim() || undefined,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
    } else {
      addProduct(payload);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove "${name}" from catalogue?`)) {
      deleteProduct(id);
    }
  };

  const totalWithPdfs = catalogueProducts.filter(p => Boolean(p.datasheetUrl)).length;

  return (
    <div className="space-y-6">
      {/* Top Banner with Stats & Catalogue Export Actions */}
      <div className="bg-[#191A18] text-white p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center space-x-2 text-[#F3B93E] text-xs font-bold uppercase tracking-wider font-outfit mb-1">
            <Package className="w-4 h-4" />
            <span>Industrial Products & Instrument Catalogue</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-outfit text-white">
            Yantratech Industrial Catalogue Database
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Over <strong className="text-white">{catalogueProducts.length}</strong> industrial instruments, calibration tools, thermal cameras & sensors.
            Directly linked with official OEM datasheets, technical specifications & instant quote builder integration.
          </p>

          <div className="flex items-center gap-4 mt-3 text-xs text-slate-300 flex-wrap">
            <span className="bg-[#252724] px-3 py-1 rounded-full border border-slate-700/80">
              Total Products: <strong className="text-[#F3B93E]">{catalogueProducts.length}</strong>
            </span>
            <span className="bg-[#252724] px-3 py-1 rounded-full border border-slate-700/80">
              Brands Available: <strong className="text-[#F3B93E]">{brandList.length}</strong>
            </span>
            <span className="bg-[#252724] px-3 py-1 rounded-full border border-slate-700/80">
              PDF Datasheets: <strong className="text-emerald-400">{totalWithPdfs}</strong>
            </span>
          </div>
        </div>

        {/* Global Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadCsv}
            title="Download complete catalogue in CSV / Excel format"
            className="flex items-center bg-[#252724] hover:bg-[#30332f] text-slate-200 hover:text-white font-semibold px-3.5 py-2 rounded-lg border border-slate-700 shadow transition-all text-xs"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-400" />
            Export to CSV
          </button>

          <button
            onClick={handleDownloadJson}
            title="Download full JSON dataset"
            className="flex items-center bg-[#252724] hover:bg-[#30332f] text-slate-200 hover:text-white font-semibold px-3.5 py-2 rounded-lg border border-slate-700 shadow transition-all text-xs"
          >
            <Download className="w-4 h-4 mr-1.5 text-blue-400" />
            Export JSON
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center bg-[#F3B93E] hover:bg-[#e0a426] text-[#191A18] font-bold px-4 py-2 rounded-lg shadow-md transition-all text-xs font-outfit"
          >
            <Plus className="w-4 h-4 mr-1 stroke-[2.5]" />
            Add Custom Product
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, model number, brand, SKU or specification..."
              value={searchTerm}
              onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => handleFilterChange(setCategoryFilter, e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="ALL">All Categories ({catalogueProducts.length})</option>
              {categoryList.map(([cat, count]) => (
                <option key={cat} value={cat}>
                  {cat} ({count})
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div className="md:col-span-2">
            <select
              value={brandFilter}
              onChange={(e) => handleFilterChange(setBrandFilter, e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="ALL">All Brands ({brandList.length})</option>
              {brandList.map(([b, count]) => (
                <option key={b} value={b}>
                  {b} ({count})
                </option>
              ))}
            </select>
          </div>

          {/* Only with Datasheet checkbox */}
          <div className="md:col-span-2 flex items-center justify-end">
            <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyWithPdf}
                onChange={(e) => handleFilterChange(setOnlyWithPdf, e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4"
              />
              <span>With Datasheet PDF</span>
            </label>
          </div>
        </div>

        {/* Results count & active filter badges */}
        <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div>
            Showing <strong className="text-slate-900">{filteredProducts.length}</strong> matching products
            {searchTerm && <span> for &ldquo;{searchTerm}&rdquo;</span>}
          </div>
          {totalPages > 1 && (
            <div>
              Page <strong className="text-slate-900">{currentPage}</strong> of <strong className="text-slate-900">{totalPages}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Catalogue Cards Grid */}
      {paginatedProducts.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No products match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting your search query or selecting a different category/brand.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('ALL');
              setBrandFilter('ALL');
              setOnlyWithPdf(false);
              setCurrentPage(1);
            }}
            className="mt-3 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedProducts.map((prod) => (
            <div
              key={prod.id}
              onClick={() => setInspectingProduct(prod)}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-amber-400 hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div>
                {/* Header Badges */}
                <div className="flex items-center justify-between text-xs mb-2.5">
                  <span className="font-semibold text-[#a8740f] bg-amber-50 px-2 py-0.5 rounded border border-[#F3B93E]/40 text-[11px] truncate max-w-[190px]">
                    {prod.category}
                  </span>
                  <span className="font-mono text-slate-400 text-[11px] font-semibold">{prod.sku}</span>
                </div>

                {/* Product Image & Title Row */}
                <div className="flex items-start space-x-3 mb-2.5">
                  {prod.imageUrl ? (
                    <img 
                      src={prod.imageUrl} 
                      alt={prod.name} 
                      className="w-16 h-16 object-contain rounded-lg border border-slate-200 bg-white p-1 flex-shrink-0 group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0 font-bold text-xs">
                      PI
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-[#a8740f] transition-colors font-outfit">
                      {prod.name}
                    </h3>

                    <div className="flex items-center space-x-2 mt-1 text-xs text-slate-600">
                      <span className="font-semibold text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded text-[11px]">
                        {prod.brand}
                      </span>
                      {prod.model && (
                        <span className="font-mono text-slate-700 truncate text-[11px]">
                          Mod: {prod.model}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                  {prod.shortDescription}
                </p>

                {/* Technical Specs pills */}
                {prod.specs && prod.specs.length > 0 && (
                  <div className="mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] space-y-1">
                    <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] font-outfit flex justify-between">
                      <span>Key Technical Specs</span>
                      <span className="text-[10px] text-slate-400 font-normal">({prod.specs.length} params)</span>
                    </div>
                    {prod.specs.slice(0, 3).map((sp, idx) => (
                      <div key={idx} className="flex justify-between text-slate-600 gap-2">
                        <span className="font-medium text-slate-500 truncate">{sp.label}:</span>
                        <span className="text-slate-900 font-mono text-right truncate">
                          {sp.value}
                        </span>
                      </div>
                    ))}
                    {prod.specs.length > 3 && (
                      <div className="text-[10px] text-[#a8740f] font-semibold pt-0.5">
                        +{prod.specs.length - 3} more technical parameters
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Meta, Actions & Datasheet */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex justify-between items-baseline mb-2.5">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Indicative Price</span>
                    <span className="text-base font-bold font-mono text-slate-900">
                      {prod.standardPrice > 0 ? formatINR(prod.standardPrice) : 'On Enquiry'}
                    </span>
                    <span className="text-[11px] text-slate-500 ml-1">/ {prod.unit}</span>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-[10px] text-slate-400 block font-medium">HSN / GST</span>
                    <span className="font-mono text-slate-700 font-semibold">{prod.hsnSac || '9030'}</span>
                    <span className="ml-1 text-[#a8740f] font-bold">({prod.gstRate}%)</span>
                  </div>
                </div>

                {/* Per-Product Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {prod.datasheetUrl ? (
                      <a
                        href={prod.datasheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="Open Official PDF Datasheet"
                        className="inline-flex items-center bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-1 rounded text-[11px] font-bold transition-colors"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Datasheet PDF
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">No PDF</span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleDownloadSingleSpec(prod, e)}
                      title="Download Specification Sheet (TXT)"
                      className="inline-flex items-center bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-2 py-1 rounded text-[11px] font-medium transition-colors"
                    >
                      <Download className="w-3 h-3 mr-0.5 text-slate-500" />
                      Spec Sheet
                    </button>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => openEditModal(prod, e)}
                      title="Edit Product"
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(prod.id, prod.name, e)}
                      title="Delete Product"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between text-xs">
          <div className="text-slate-600">
            Showing <strong className="text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong className="text-slate-900">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</strong> of <strong className="text-slate-900">{filteredProducts.length}</strong> items
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-200 disabled:opacity-30 hover:bg-slate-50 text-slate-700 font-semibold"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 bg-amber-50 border border-amber-300 rounded font-bold text-amber-900">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-slate-200 disabled:opacity-30 hover:bg-slate-50 text-slate-700 font-semibold"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Inspect Product Modal */}
      {inspectingProduct && (
        <div 
          onClick={() => setInspectingProduct(null)}
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[90vh] flex flex-col"
          >
            <div className="bg-[#191A18] px-6 py-4 flex justify-between items-center text-white border-b border-[#F3B93E]/40">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#F3B93E] font-outfit">
                  Technical Product Dossier
                </span>
                <h3 className="font-bold text-base sm:text-lg font-outfit text-white">
                  {inspectingProduct.name}
                </h3>
              </div>
              <button
                onClick={() => setInspectingProduct(null)}
                className="text-slate-400 hover:text-white text-2xl font-bold p-1 leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Product header summary */}
              <div className="flex flex-col sm:flex-row gap-4 items-start bg-slate-50 p-4 rounded-xl border border-slate-200">
                {inspectingProduct.imageUrl ? (
                  <img 
                    src={inspectingProduct.imageUrl} 
                    alt={inspectingProduct.name} 
                    className="w-24 h-24 object-contain rounded-lg border border-slate-200 bg-white p-2"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg border border-slate-200 bg-slate-200 flex items-center justify-center text-slate-400 font-bold">
                    PI
                  </div>
                )}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-[#191A18] text-[#F3B93E] font-bold px-2 py-0.5 rounded text-xs font-outfit">
                      Brand: {inspectingProduct.brand}
                    </span>
                    {inspectingProduct.model && (
                      <span className="bg-white border border-slate-200 font-mono font-semibold px-2 py-0.5 rounded text-slate-800">
                        Model: {inspectingProduct.model}
                      </span>
                    )}
                    <span className="text-slate-500 font-mono">SKU: {inspectingProduct.sku}</span>
                  </div>

                  <div className="text-slate-600 font-medium">
                    Category: <strong>{inspectingProduct.category}</strong>
                  </div>

                  <div className="flex items-center gap-4 text-slate-700 pt-1">
                    <span>GST: <strong>{inspectingProduct.gstRate}%</strong></span>
                    <span>HSN: <strong className="font-mono">{inspectingProduct.hsnSac || '9030'}</strong></span>
                    <span>Warranty: <strong>{inspectingProduct.warranty}</strong></span>
                  </div>
                </div>
              </div>

              {/* Description & Features */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1 font-outfit">
                  Product Overview & Features
                </h4>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/70 p-3 rounded-lg border border-slate-200">
                  {inspectingProduct.detailedDescription || inspectingProduct.shortDescription}
                </p>
              </div>

              {/* Specifications Table */}
              {inspectingProduct.specs && inspectingProduct.specs.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 font-outfit">
                    Full Technical Specifications ({inspectingProduct.specs.length} Parameters)
                  </h4>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <tbody>
                        {inspectingProduct.specs.map((sp, idx) => (
                          <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                            <td className="py-2 px-3 border-b border-slate-200 font-semibold text-slate-700 w-2/5">
                              {sp.label}
                            </td>
                            <td className="py-2 px-3 border-b border-slate-200 font-mono text-slate-900">
                              {sp.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-200 flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  {inspectingProduct.datasheetUrl && (
                    <a
                      href={inspectingProduct.datasheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-lg text-xs shadow transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1" />
                      Open Datasheet PDF
                    </a>
                  )}
                  <button
                    onClick={() => handleDownloadSingleSpec(inspectingProduct)}
                    className="inline-flex items-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-2 rounded-lg text-xs border border-slate-300 transition-all"
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    Download Spec Sheet
                  </button>
                </div>

                <button
                  onClick={() => setInspectingProduct(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-[#191A18] px-6 py-4 flex justify-between items-center text-white border-b border-amber-500/40">
              <h3 className="font-bold text-lg flex items-center font-outfit text-white">
                <Package className="w-5 h-5 mr-2 text-[#F3B93E]" />
                {editingProduct ? 'Edit Catalogue Product' : 'Add New Industrial Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Product / Solution Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Fluke 115 True-RMS Digital Multimeter"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Product Code / SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Brand / Make</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Fluke, Meco, Lutron"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Model / Part No.</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g. 115, 63+, E8 Pro"
                    className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Short Description (Appears in quotation item table)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="Concise commercial summary of the equipment..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Datasheet PDF URL
                  </label>
                  <input
                    type="text"
                    value={formData.datasheetUrl}
                    onChange={(e) => setFormData({ ...formData, datasheetUrl: e.target.value })}
                    placeholder="https://.../datasheet.pdf"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* Technical Specifications Builder */}
                <div className="sm:col-span-3 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-outfit">
                        Technical Specifications & Parameters
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Add key engineering specs (e.g. Range, Accuracy, Battery, Safety Standards).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSpecRow}
                      className="px-2.5 py-1 bg-[#F3B93E] hover:bg-[#e0a426] text-[#191A18] text-xs font-bold rounded-md flex items-center"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add Parameter
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formData.specs.map((sp) => (
                      <div key={sp.id} className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Parameter (e.g. Range, Accuracy)"
                          value={sp.label}
                          onChange={(e) => handleSpecChange(sp.id, 'label', e.target.value)}
                          className="w-1/3 px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white focus:ring-1 focus:ring-amber-500"
                        />
                        <input
                          type="text"
                          placeholder="Specification value (e.g. 1000V AC/DC, Class 0.5)"
                          value={sp.value}
                          onChange={(e) => handleSpecChange(sp.id, 'value', e.target.value)}
                          className="flex-1 px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white focus:ring-1 focus:ring-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecRow(sp.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Standard Rate (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.standardPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, standardPrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measure</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                  >
                    <option value="Nos">Nos</option>
                    <option value="Set">Set</option>
                    <option value="Mtr">Mtr</option>
                    <option value="Kg">Kg</option>
                    <option value="Lot">Lot</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">HSN / SAC Code</label>
                  <input
                    type="text"
                    value={formData.hsnSac}
                    onChange={(e) => setFormData({ ...formData, hsnSac: e.target.value })}
                    placeholder="e.g. 9030"
                    className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-[#F3B93E] hover:bg-[#e0a426] text-[#191A18] rounded-lg shadow transition-colors font-outfit"
                >
                  {editingProduct ? 'Update Product' : 'Add to Catalogue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
