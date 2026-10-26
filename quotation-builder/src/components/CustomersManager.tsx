import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  FileText,
  FileCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Customer } from '../types';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/calculations';

interface CustomersManagerProps {
  onSelectCustomerForQuotation?: (customer: Customer) => void;
  onPreviewQuotation?: (quotationId: string) => void;
}

export const CustomersManager: React.FC<CustomersManagerProps> = ({
  onSelectCustomerForQuotation,
  onPreviewQuotation,
}) => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, quotations } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState<Customer | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    designation: '',
    email: '',
    phone: '',
    alternatePhone: '',
    billingAddress: '',
    shippingAddress: '',
    sameAsBilling: true,
    city: '',
    state: '',
    country: 'India',
    gstin: '',
    pan: '',
    customerType: 'Industrial Client' as Customer['customerType'],
    notes: '',
  });

  const filteredCustomers = customers.filter(
    (c) =>
      c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.gstin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      companyName: '',
      contactPerson: '',
      designation: '',
      email: '',
      phone: '',
      alternatePhone: '',
      billingAddress: '',
      shippingAddress: '',
      sameAsBilling: true,
      city: '',
      state: '',
      country: 'India',
      gstin: '',
      pan: '',
      customerType: 'Industrial Client',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormData({
      companyName: cust.companyName,
      contactPerson: cust.contactPerson,
      designation: cust.designation,
      email: cust.email,
      phone: cust.phone,
      alternatePhone: cust.alternatePhone || '',
      billingAddress: cust.billingAddress,
      shippingAddress: cust.shippingAddress,
      sameAsBilling: cust.billingAddress === cust.shippingAddress,
      city: cust.city,
      state: cust.state,
      country: cust.country,
      gstin: cust.gstin,
      pan: cust.pan || '',
      customerType: cust.customerType,
      notes: cust.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      alert('Company Name is required.');
      return;
    }

    const payload = {
      companyName: formData.companyName.trim(),
      contactPerson: formData.contactPerson.trim(),
      designation: formData.designation.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      alternatePhone: formData.alternatePhone.trim() || undefined,
      billingAddress: formData.billingAddress.trim(),
      shippingAddress: formData.sameAsBilling
        ? formData.billingAddress.trim()
        : formData.shippingAddress.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      country: formData.country.trim(),
      gstin: formData.gstin.trim(),
      pan: formData.pan.trim() || undefined,
      customerType: formData.customerType,
      notes: formData.notes.trim() || undefined,
    };

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, payload);
    } else {
      addCustomer(payload);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete customer record for "${name}"?`)) {
      deleteCustomer(id);
      if (selectedCustomerHistory?.id === id) {
        setSelectedCustomerHistory(null);
      }
    }
  };

  // Quotations for selected customer
  const customerQuotations = selectedCustomerHistory
    ? quotations.filter(
        (q) =>
          q.customerId === selectedCustomerHistory.id ||
          q.customerName.toLowerCase() === selectedCustomerHistory.companyName.toLowerCase()
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Header & Action */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <Users className="w-5 h-5 mr-2 text-amber-500" />
            Customer Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain B2B industrial clients, billing/shipping addresses, GSTIN, and proposal history.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-lg shadow transition-colors text-sm"
        >
          <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
          Add Customer
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search customers by company name, contact person, city, or GSTIN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Cards Grid (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          {filteredCustomers.length === 0 ? (
            <div className="bg-white p-10 rounded-xl border border-slate-200 text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600">No customers found</p>
            </div>
          ) : (
            filteredCustomers.map((cust) => {
              const isSelected = selectedCustomerHistory?.id === cust.id;
              const relatedCount = quotations.filter(
                (q) =>
                  q.customerId === cust.id ||
                  q.customerName.toLowerCase() === cust.companyName.toLowerCase()
              ).length;

              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomerHistory(cust)}
                  className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-sm hover:border-amber-400 ${
                    isSelected
                      ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/20'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-base">{cust.companyName}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
                          {cust.customerType}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-700 mt-1">
                        {cust.contactPerson} {cust.designation ? `• ${cust.designation}` : ''}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(cust);
                        }}
                        title="Edit Customer"
                        className="p-1 text-slate-500 hover:text-blue-600 rounded"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(cust.id, cust.companyName);
                        }}
                        title="Delete Customer"
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center space-x-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{cust.email || 'No email'}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{cust.phone || 'No phone'}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">
                        {cust.city}, {cust.state}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 font-mono text-[11px]">
                      <span className="font-semibold text-slate-500">GST:</span>
                      <span className="text-amber-800 font-bold">{cust.gstin || 'Unregistered'}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="text-slate-500">
                      Proposals on record:{' '}
                      <strong className="text-slate-800">{relatedCount}</strong>
                    </span>
                    <span className="text-amber-600 font-semibold flex items-center hover:underline">
                      View Proposal History
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Customer History & Detailed Dossier Sidebar */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-fit">
          {selectedCustomerHistory ? (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-[11px] font-bold text-amber-600 tracking-wider uppercase">
                  Customer History Dossier
                </span>
                <h3 className="font-bold text-slate-900 text-lg">
                  {selectedCustomerHistory.companyName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  GSTIN: <span className="font-mono text-slate-800">{selectedCustomerHistory.gstin}</span>
                </p>
              </div>

              {/* Address preview */}
              <div className="text-xs space-y-2 text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <strong className="text-slate-900 block mb-0.5">Billing Address:</strong>
                  <p className="text-slate-600">{selectedCustomerHistory.billingAddress}</p>
                </div>
                <div>
                  <strong className="text-slate-900 block mb-0.5">Shipping Address:</strong>
                  <p className="text-slate-600">{selectedCustomerHistory.shippingAddress}</p>
                </div>
              </div>

              {/* Quotations List for this client */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center">
                  <FileCheck className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  Past Proposals ({customerQuotations.length})
                </h4>

                {customerQuotations.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    No quotations generated for this client yet.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {customerQuotations.map((q) => (
                      <div
                        key={q.id}
                        onClick={() => onPreviewQuotation && onPreviewQuotation(q.id)}
                        className="p-2.5 rounded-lg border border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50/30 transition-all cursor-pointer text-xs"
                      >
                        <div className="flex justify-between items-center font-bold text-slate-900">
                          <span>{q.quotationNumber}</span>
                          <span className="text-amber-700 font-mono">{formatINR(q.grandTotal)}</span>
                        </div>
                        <div className="text-slate-500 truncate mt-0.5">{q.title}</div>
                        <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                          <span>{q.date}</span>
                          <span className="font-medium text-slate-600">{q.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Building2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-slate-600">Select a customer</p>
              <p className="text-xs mt-1 text-slate-400">
                Click any customer on the left to inspect billing details and proposal history.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg flex items-center">
                <Users className="w-5 h-5 mr-2 text-amber-400" />
                {editingCustomer ? 'Edit Customer Information' : 'Add New Industrial Client'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company / Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Larsen & Toubro Heavy Engineering"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="e.g. Sunil Nair"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Chief Procurement Manager"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="procurement@client.com"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone / Mobile *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9820012345"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alternate Phone
                  </label>
                  <input
                    type="text"
                    value={formData.alternatePhone}
                    onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                    placeholder="+91 22 6705 4500"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Customer Type
                  </label>
                  <select
                    value={formData.customerType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customerType: e.target.value as Customer['customerType'],
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                  >
                    <option value="Industrial Client">Industrial Client</option>
                    <option value="OEM">OEM</option>
                    <option value="Contractor">Contractor</option>
                    <option value="Dealer">Dealer</option>
                    <option value="Government / PSU">Government / PSU</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    GSTIN (15 Digits)
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    placeholder="27AAACL0140P1ZL"
                    className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={formData.pan}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                    placeholder="AAACL0140P"
                    className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none uppercase"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Billing Address *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.billingAddress}
                    onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                    placeholder="Gate No. 1, Powai Campus, Saki Vihar Road..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sameAsBilling}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sameAsBilling: e.target.checked,
                          shippingAddress: e.target.checked
                            ? formData.billingAddress
                            : formData.shippingAddress,
                        })
                      }
                      className="rounded text-amber-500 focus:ring-amber-400"
                    />
                    <span>Shipping Address is same as Billing Address</span>
                  </label>

                  {!formData.sameAsBilling && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Shipping / Delivery Site Address *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={formData.shippingAddress}
                        onChange={(e) =>
                          setFormData({ ...formData, shippingAddress: e.target.value })
                        }
                        placeholder="Plant site, Delivery Gate, Hazira Works, Gujarat..."
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Mumbai / Pune / Surat"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Maharashtra / Gujarat"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Instructions</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Special inspection requirements, delivery instructions..."
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
                  {editingCustomer ? 'Update Customer' : 'Save Customer Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
