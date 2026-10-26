import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Building2, 
  CreditCard, 
  FileText, 
  Tag, 
  Plus, 
  Trash2, 
  Check, 
  ShieldCheck,
  Save
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TermsSection } from '../types';

export const SettingsManager: React.FC = () => {
  const { 
    companySettings, 
    updateCompanySettings, 
    categories, 
    addCategory, 
    updateCategory, 
    deleteCategory,
    termsAndConditions,
    updateTermsAndConditions
  } = useApp();

  const [activeTab, setActiveTab] = useState<'company' | 'categories' | 'terms' | 'numbering'>('company');
  const [saveAlert, setSaveAlert] = useState(false);

  // Form states
  const [compForm, setCompForm] = useState({ ...companySettings });
  const [newCatName, setNewCatName] = useState('');
  const [termsList, setTermsList] = useState<TermsSection[]>([...termsAndConditions]);

  const handleCompanySave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings(compForm);
    setSaveAlert(true);
    setTimeout(() => setSaveAlert(false), 3000);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(newCatName.trim());
    setNewCatName('');
  };

  const handleTermsChange = (id: string, field: 'title' | 'content', val: string) => {
    setTermsList(prev => prev.map(t => t.id === id ? { ...t, [field]: val } : t));
  };

  const handleToggleTerm = (id: string) => {
    setTermsList(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
  };

  const handleAddTerm = () => {
    const newTerm: TermsSection = {
      id: `term-${Date.now()}`,
      title: 'New Commercial Clause',
      content: 'Specify standard commercial conditions, obligations, or timeline details here.',
      enabled: true,
    };
    setTermsList([...termsList, newTerm]);
  };

  const handleDeleteTerm = (id: string) => {
    setTermsList(prev => prev.filter(t => t.id !== id));
  };

  const handleSaveTerms = () => {
    updateTermsAndConditions(termsList);
    setSaveAlert(true);
    setTimeout(() => setSaveAlert(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <SettingsIcon className="w-5 h-5 mr-2 text-amber-500" />
            System & Commercial Settings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure Yantratech Solutions company identity, bank details, quotation numbering format, product categories, and standard terms.
          </p>
        </div>
        {saveAlert && (
          <div className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center animate-fade-in">
            <Check className="w-4 h-4 mr-1 text-emerald-600" />
            Settings saved successfully!
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-2">
        <button
          onClick={() => setActiveTab('company')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all border-b-2 flex items-center ${
            activeTab === 'company'
              ? 'border-amber-500 text-amber-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900 bg-transparent'
          }`}
        >
          <Building2 className="w-4 h-4 mr-1.5" />
          Company Information & Bank Details
        </button>

        <button
          onClick={() => setActiveTab('numbering')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all border-b-2 flex items-center ${
            activeTab === 'numbering'
              ? 'border-amber-500 text-amber-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900 bg-transparent'
          }`}
        >
          <CreditCard className="w-4 h-4 mr-1.5" />
          Quotation Numbering & Defaults
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all border-b-2 flex items-center ${
            activeTab === 'categories'
              ? 'border-amber-500 text-amber-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900 bg-transparent'
          }`}
        >
          <Tag className="w-4 h-4 mr-1.5" />
          Product Categories ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('terms')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all border-b-2 flex items-center ${
            activeTab === 'terms'
              ? 'border-amber-500 text-amber-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900 bg-transparent'
          }`}
        >
          <FileText className="w-4 h-4 mr-1.5" />
          Default Terms & Conditions ({termsList.length})
        </button>
      </div>

      {/* Tab 1: Company Info */}
      {activeTab === 'company' && (
        <form onSubmit={handleCompanySave} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-bold text-slate-900 text-base">Corporate Details & Head Office</h3>
            <p className="text-xs text-slate-500">These details will be rendered on the header, tax invoice headers, and footer of all exported proposal documents.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                required
                value={compForm.name}
                onChange={(e) => setCompForm({ ...compForm, name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Website</label>
              <input
                type="text"
                value={compForm.website}
                onChange={(e) => setCompForm({ ...compForm, website: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tagline / Positioning Statement</label>
              <input
                type="text"
                value={compForm.tagline}
                onChange={(e) => setCompForm({ ...compForm, tagline: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Central Contact Phone</label>
              <input
                type="text"
                value={compForm.phone}
                onChange={(e) => setCompForm({ ...compForm, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Central Sales Email</label>
              <input
                type="email"
                value={compForm.email}
                onChange={(e) => setCompForm({ ...compForm, email: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company GSTIN</label>
              <input
                type="text"
                value={compForm.gstin}
                onChange={(e) => setCompForm({ ...compForm, gstin: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-sm font-mono uppercase rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Office Address</label>
              <input
                type="text"
                value={compForm.address}
                onChange={(e) => setCompForm({ ...compForm, address: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City / State / Pincode</label>
              <input
                type="text"
                value={`${compForm.city}, ${compForm.state} - ${compForm.pincode}`}
                onChange={(e) => {
                  const parts = e.target.value.split(',');
                  setCompForm({
                    ...compForm,
                    city: parts[0]?.trim() || compForm.city,
                  });
                }}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Bank Details for Commercial Acceptance */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-1">Banking Information (Printed on Proposals for RTGS/NEFT)</h4>
            <p className="text-xs text-slate-500 mb-3">Enables clients to make advance and milestone payments directly to Yantratech Solutions bank account.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={compForm.bankName}
                  onChange={(e) => setCompForm({ ...compForm, bankName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number</label>
                <input
                  type="text"
                  value={compForm.accountNumber}
                  onChange={(e) => setCompForm({ ...compForm, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={compForm.ifscCode}
                  onChange={(e) => setCompForm({ ...compForm, ifscCode: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-sm font-mono uppercase rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Branch</label>
                <input
                  type="text"
                  value={compForm.branch}
                  onChange={(e) => setCompForm({ ...compForm, branch: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button
              type="submit"
              className="flex items-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-lg shadow transition-colors text-sm"
            >
              <Save className="w-4 h-4 mr-1.5" />
              Save Company Settings
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Numbering & Defaults */}
      {activeTab === 'numbering' && (
        <form onSubmit={handleCompanySave} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-bold text-slate-900 text-base">Quotation Numbering Scheme & Tax Defaults</h3>
            <p className="text-xs text-slate-500">Configure how unique proposal IDs are formulated (e.g. YTS/2026-27/0104).</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Prefix (Company Code)</label>
              <input
                type="text"
                value={compForm.quotationPrefix}
                onChange={(e) => setCompForm({ ...compForm, quotationPrefix: e.target.value.toUpperCase() })}
                placeholder="YTS"
                className="w-full px-3 py-2 text-sm font-mono uppercase rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Financial Year Code</label>
              <input
                type="text"
                value={compForm.quotationYearFormat}
                onChange={(e) => setCompForm({ ...compForm, quotationYearFormat: e.target.value })}
                placeholder="2026-27"
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Next Serial Number</label>
              <input
                type="number"
                min="1"
                value={compForm.nextSequence}
                onChange={(e) => setCompForm({ ...compForm, nextSequence: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-3 bg-amber-50/60 p-3 rounded-lg border border-amber-200 text-xs">
              <span className="font-bold text-amber-900">Next Quotation Preview: </span>
              <span className="font-mono text-amber-800 font-bold ml-1 text-sm">
                {`${compForm.quotationPrefix}/${compForm.quotationYearFormat}/${String(compForm.nextSequence).padStart(4, '0')}`}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Default GST Model</label>
              <select
                value={compForm.defaultTaxType}
                onChange={(e) => setCompForm({ ...compForm, defaultTaxType: e.target.value as any })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              >
                <option value="IGST">IGST (Inter-state 18% Integrated Tax)</option>
                <option value="CGST_SGST">CGST + SGST (Intra-state 9% + 9%)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Default Currency</label>
              <input
                type="text"
                value={compForm.defaultCurrency}
                disabled
                className="w-full px-3 py-2 text-sm bg-slate-50 font-mono rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={compForm.defaultCurrencySymbol}
                disabled
                className="w-full px-3 py-2 text-sm bg-slate-50 font-mono rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button
              type="submit"
              className="flex items-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-lg shadow transition-colors text-sm"
            >
              <Save className="w-4 h-4 mr-1.5" />
              Save Numbering Scheme
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Product Categories */}
      {activeTab === 'categories' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Industrial Product & Solution Categories</h3>
            <p className="text-xs text-slate-500">Categories represent Yantratech Solutions business offerings across India.</p>
          </div>

          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter new category name (e.g. Hazardous Area Instruments, Laser Sensors)..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm flex items-center shadow"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Category
            </button>
          </form>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-amber-400 transition-colors bg-slate-50/50"
              >
                <div className="flex items-center space-x-2">
                  <Tag className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-sm font-medium text-slate-800">{cat.name}</span>
                </div>
                {categories.length > 1 && (
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Terms and Conditions */}
      {activeTab === 'terms' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Standard Commercial Terms & Conditions</h3>
              <p className="text-xs text-slate-500">Predefined commercial clauses loaded into every new quotation. Clauses can be customized during draft creation.</p>
            </div>
            <button
              type="button"
              onClick={handleAddTerm}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center"
            >
              <Plus className="w-3.5 h-3.5 mr-1 text-amber-400" />
              Add New Clause
            </button>
          </div>

          <div className="space-y-3">
            {termsList.map((term, index) => (
              <div key={term.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
                    <input
                      type="text"
                      value={term.title}
                      onChange={(e) => handleTermsChange(term.id, 'title', e.target.value)}
                      className="px-2 py-1 text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-1.5 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={term.enabled}
                        onChange={() => handleToggleTerm(term.id)}
                        className="rounded text-amber-500"
                      />
                      <span>Active</span>
                    </label>
                    <button
                      onClick={() => handleDeleteTerm(term.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={term.content}
                  onChange={(e) => handleTermsChange(term.id, 'content', e.target.value)}
                  className="w-full p-2.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button
              onClick={handleSaveTerms}
              className="flex items-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-lg shadow transition-colors text-sm"
            >
              <Save className="w-4 h-4 mr-1.5" />
              Save Default Terms & Conditions
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
