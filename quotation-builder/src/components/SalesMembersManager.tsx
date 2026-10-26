import React, { useState } from 'react';
import { 
  Award, 
  Plus, 
  Edit3, 
  Trash2, 
  Mail, 
  Phone, 
  ShieldCheck, 
  UserCheck, 
  CheckCircle,
  FileSignature
} from 'lucide-react';
import { SalesMember } from '../types';
import { useApp } from '../context/AppContext';

export const SalesMembersManager: React.FC = () => {
  const { salesMembers, addSalesMember, updateSalesMember, deleteSalesMember } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<SalesMember | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    email: '',
    phone: '',
    isActive: true,
  });

  const openAddModal = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      designation: 'Technical Sales Engineer',
      email: '',
      phone: '+91 ',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (member: SalesMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      designation: member.designation,
      email: member.email,
      phone: member.phone,
      isActive: member.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Name is required.');
      return;
    }

    if (editingMember) {
      updateSalesMember(editingMember.id, formData);
    } else {
      addSalesMember(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (salesMembers.length <= 1) {
      alert('You must keep at least one active sales signatory in the system.');
      return;
    }
    if (window.confirm(`Are you sure you want to remove sales member "${name}"?`)) {
      deleteSalesMember(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <Award className="w-5 h-5 mr-2 text-amber-500" />
            Proposal Senders & Signatories
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage authorized sales engineers and directors who sign and issue proposals on behalf of Yantratech Solutions.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-lg shadow transition-colors text-sm"
        >
          <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
          Add Sales Member
        </button>
      </div>

      {/* Grid of Sales Members */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {salesMembers.map((member) => (
          <div
            key={member.id}
            className={`bg-white rounded-xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
              member.isActive ? 'border-slate-200 hover:border-amber-400' : 'border-slate-200 opacity-60 bg-slate-50'
            }`}
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-full bg-slate-900 text-amber-400 font-bold text-lg flex items-center justify-center shadow">
                  {member.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEditModal(member)}
                    title="Edit Member"
                    className="p-1.5 text-slate-500 hover:text-blue-600 rounded"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id, member.name)}
                    title="Remove Member"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <h3 className="font-bold text-slate-900 text-base flex items-center">
                  {member.name}
                  {member.isActive && (
                    <span className="ml-2 w-2 h-2 rounded-full bg-emerald-500" title="Active Signatory" />
                  )}
                </h3>
                <p className="text-xs font-semibold text-amber-700 mt-0.5">{member.designation}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-2 text-slate-600">
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{member.phone}</span>
                </div>
              </div>
            </div>

            {/* Signature Preview Block */}
            <div className="mt-5 pt-3 border-t border-slate-100">
              <div className="text-[11px] text-slate-400 font-medium mb-1">Quotation Sign-off Block:</div>
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded p-2.5 text-center">
                <span className="text-[11px] font-bold text-slate-700 block">For Yantratech Solutions</span>
                <span className="font-serif italic text-slate-800 text-sm block my-1">
                  [{member.name}]
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                  {member.designation}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg flex items-center">
                <Award className="w-5 h-5 mr-2 text-amber-400" />
                {editingMember ? 'Edit Sales Member' : 'Add Sales Signatory'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Mahesh Joshi"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Designation *</label>
                <input
                  type="text"
                  required
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Director - Technical Sales"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@yantratechsolutions.co.in"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 8655813866"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <label htmlFor="isActive" className="text-xs font-medium text-slate-700">
                  Active (Allowed to sign quotations)
                </label>
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
                  {editingMember ? 'Update Member' : 'Add Signatory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
