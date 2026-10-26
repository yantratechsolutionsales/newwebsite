import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Tag, 
  Layers, 
  Check, 
  FileSpreadsheet, 
  Filter,
  SlidersHorizontal,
  ChevronDown
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
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CatalogueProduct | null>(null);

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
    status: 'Active',
    notes: '',
  });

  const filteredProducts = catalogueProducts.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

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
      status: 'Active',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (prod: CatalogueProduct) => {
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
      hsnSac: formData.hsnSac.trim(),
      gstRate: Number(formData.gstRate) || 18,
      standardPrice: Number(formData.standardPrice) || 0,
      costPrice: Number(formData.costPrice) || undefined,
      warranty: formData.warranty.trim(),
      leadTime: formData.leadTime.trim(),
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

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from catalogue?`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <Package className="w-5 h-5 mr-2 text-amber-500" />
            Industrial Product & Solutions Catalogue
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain instruments, switchgears, thermal cameras, IT servers, HSN codes, and technical specifications.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-lg shadow transition-colors text-sm"
        >
          <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
          Add Catalogue Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name, model number, brand, or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-2 px-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white max-w-xs truncate"
          >
            <option value="ALL">All Categories ({catalogueProducts.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Catalogue Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px] truncate max-w-[180px]">
                  {prod.category}
                </span>
                <span className="font-mono text-slate-400 text-[11px]">{prod.sku}</span>
              </div>

              {/* Product Title */}
              <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">
                {prod.name}
              </h3>

              <div className="flex items-center space-x-2 mt-1 text-xs text-slate-600">
                <span className="font-medium text-slate-800">Brand: {prod.brand || 'Yantratech'}</span>
                {prod.model && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-slate-700">Model: {prod.model}</span>
                  </>
                )}
              </div>

              <p className="text-xs text-slate-500 mt-2 line-clamp-2">{prod.shortDescription}</p>

              {/* Technical Specs pills */}
              {prod.specs && prod.specs.length > 0 && (
                <div className="mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] space-y-1">
                  <div className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
                    Technical Highlights
                  </div>
                  {prod.specs.slice(0, 3).map((sp, idx) => (
                    <div key={idx} className="flex justify-between text-slate-600">
                      <span className="font-medium text-slate-500">{sp.label}:</span>
                      <span className="text-slate-800 font-mono text-right truncate ml-2">
                        {sp.value}
                      </span>
                    </div>
                  ))}
                  {prod.specs.length > 3 && (
                    <div className="text-[10px] text-amber-600 font-medium pt-0.5">
                      +{prod.specs.length - 3} more specifications
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Meta & Pricing */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex justify-between items-baseline mb-2">
                <div>
                  <span className="text-[11px] text-slate-400 block">Selling Price</span>
                  <span className="text-lg font-bold font-mono text-slate-900">
                    {formatINR(prod.standardPrice)}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">/ {prod.unit}</span>
                </div>
                <div className="text-right text-xs">
                  <span className="text-[11px] text-slate-400 block">HSN / GST</span>
                  <span className="font-mono text-slate-700 font-semibold">{prod.hsnSac || '—'}</span>
                  <span className="ml-1 text-amber-700 font-bold">({prod.gstRate}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-500 truncate max-w-[150px]">
                  Lead: {prod.leadTime}
                </span>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => openEditModal(prod)}
                    title="Edit Product"
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(prod.id, prod.name)}
                    title="Delete Product"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg flex items-center">
                <Package className="w-5 h-5 mr-2 text-amber-400" />
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
                    placeholder="e.g. Fluke 87V Industrial Multimeter"
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
                    placeholder="e.g. Fluke, FLIR, Schneider"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Model / Part No.</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g. 87V-MAX"
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

                {/* Technical Specifications Builder */}
                <div className="sm:col-span-3 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Technical Specifications & Parameters
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Add key engineering specs (e.g. Voltage Range, Accuracy, Ingress Protection, Standards).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSpecRow}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-md flex items-center"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Standard Rate (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
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
                    <option value="Year">Year</option>
                    <option value="Month">Month</option>
                    <option value="Hrs">Hrs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">HSN / SAC Code</label>
                  <input
                    type="text"
                    value={formData.hsnSac}
                    onChange={(e) => setFormData({ ...formData, hsnSac: e.target.value })}
                    placeholder="e.g. 90303100"
                    className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">GST Rate (%)</label>
                  <select
                    value={formData.gstRate}
                    onChange={(e) => setFormData({ ...formData, gstRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                  >
                    <option value={18}>18% (Standard Industrial)</option>
                    <option value={28}>28% (Luxury / Specific Panels)</option>
                    <option value={12}>12% (Specified Instruments)</option>
                    <option value={5}>5% (Solar / Special)</option>
                    <option value={0}>0% (Exempt)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Warranty Period</label>
                  <input
                    type="text"
                    value={formData.warranty}
                    onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                    placeholder="e.g. 1 Year Standard"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Lead Time</label>
                  <input
                    type="text"
                    value={formData.leadTime}
                    onChange={(e) => setFormData({ ...formData, leadTime: e.target.value })}
                    placeholder="e.g. Ex-stock / 1-2 weeks"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
                  className="px-5 py-2 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow transition-colors"
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
