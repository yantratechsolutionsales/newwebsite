import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Copy, 
  Eye, 
  Trash2, 
  Edit3, 
  Download, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building2,
  TrendingUp,
  Tag
} from 'lucide-react';
import { Quotation, QuotationStatus } from '../types';
import { formatINR } from '../utils/calculations';
import { useApp } from '../context/AppContext';

interface QuotationDashboardProps {
  onNewQuotation: () => void;
  onEditQuotation: (id: string) => void;
  onPreviewQuotation: (id: string) => void;
}

export const QuotationDashboard: React.FC<QuotationDashboardProps> = ({
  onNewQuotation,
  onEditQuotation,
  onPreviewQuotation,
}) => {
  const { quotations, duplicateQuotation, deleteQuotation } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'date' | 'grandTotal' | 'quotationNumber'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter & Search logic
  const filteredQuotations = quotations
    .filter((q) => {
      const matchSearch =
        q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.signatoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.enquiryRefNumber && q.enquiryRefNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'ALL' || q.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === 'grandTotal') {
        comparison = a.grandTotal - b.grandTotal;
      } else if (sortField === 'quotationNumber') {
        comparison = a.quotationNumber.localeCompare(b.quotationNumber);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Summary Metrics
  const totalValue = quotations.reduce((acc, q) => acc + (q.grandTotal || 0), 0);
  const approvedValue = quotations
    .filter((q) => q.status === 'Approved')
    .reduce((acc, q) => acc + (q.grandTotal || 0), 0);
  const activeCount = quotations.filter((q) => q.status !== 'Rejected' && q.status !== 'Expired').length;

  const getStatusBadge = (status: QuotationStatus) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Sent':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Under Discussion':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Revised':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Expired':
        return 'bg-slate-200 text-slate-700 border-slate-300';
      case 'Draft':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const duplicated = duplicateQuotation(id);
    if (duplicated) {
      onEditQuotation(duplicated.id);
    }
  };

  const handleDelete = (id: string, number: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to permanently delete quotation ${number}?`)) {
      deleteQuotation(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Proposals</p>
            <h3 className="text-2xl font-bold text-slate-900">{quotations.length}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Pipeline Value</p>
            <h3 className="text-xl font-bold text-slate-900">{formatINR(totalValue)}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Approved Value</p>
            <h3 className="text-xl font-bold text-emerald-600">{formatINR(approvedValue)}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Quotations</p>
            <h3 className="text-2xl font-bold text-slate-900">{activeCount}</h3>
          </div>
        </div>
      </div>

      {/* Action Header & Search Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Commercial Proposals & Quotations</h2>
            <p className="text-xs text-slate-500">
              Manage industrial quotations, track client approvals, and export stamped PDFs.
            </p>
          </div>
          <button
            onClick={onNewQuotation}
            className="flex items-center justify-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-lg shadow transition-colors text-sm"
          >
            <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            Create Quotation
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3 pt-2">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Quotation #, Client Name, Title, Signatory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Status selector */}
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="ALL">All Statuses ({quotations.length})</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Under Discussion">Under Discussion</option>
              <option value="Revised">Revised</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          {/* Sort selector */}
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Sort By:</label>
            <select
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split('-') as [typeof sortField, typeof sortOrder];
                setSortField(f);
                setSortOrder(o);
              }}
              className="py-2 px-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="grandTotal-desc">Amount: High to Low</option>
              <option value="grandTotal-asc">Amount: Low to High</option>
              <option value="quotationNumber-asc">Quotation # (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Proposals Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredQuotations.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">No quotations found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'ALL'
                ? 'Try adjusting your search query or filter options.'
                : 'Click "Create Quotation" to draft your first proposal for Yantratech Solutions.'}
            </p>
            <button
              onClick={onNewQuotation}
              className="mt-4 inline-flex items-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
              Create Quotation
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Quotation No. & Date</th>
                  <th className="py-3 px-4">Customer / Title</th>
                  <th className="py-3 px-4">Sales Engineer</th>
                  <th className="py-3 px-4 text-right">Taxable</th>
                  <th className="py-3 px-4 text-right">Grand Total (GST Incl.)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredQuotations.map((q) => (
                  <tr
                    key={q.id}
                    onClick={() => onPreviewQuotation(q.id)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                        {q.quotationNumber}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center mt-0.5">
                        <Clock className="w-3 h-3 mr-1" />
                        {q.date}
                        {q.validUntil && (
                          <span className="ml-1 text-slate-400">
                            • Valid till {q.validUntil}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 flex items-center">
                        <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{q.customerName || 'Unnamed Customer'}</span>
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5" title={q.title}>
                        {q.title}
                      </div>
                      {q.enquiryRefNumber && (
                        <div className="text-[11px] text-amber-700 font-mono mt-0.5">
                          Ref: {q.enquiryRefNumber}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium text-xs">{q.signatoryName}</div>
                      <div className="text-[11px] text-slate-500">{q.signatoryDesignation}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-600">
                      {formatINR(q.taxableSubtotal)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="font-bold font-mono text-slate-900">
                        {formatINR(q.grandTotal)}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {q.taxType === 'IGST' ? 'IGST (18%)' : 'CGST+SGST (9%+9%)'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                          q.status
                        )}`}
                      >
                        {q.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => onPreviewQuotation(q.id)}
                          title="Preview & Export PDF"
                          className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditQuotation(q.id)}
                          title="Edit Quotation"
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDuplicate(q.id, e)}
                          title="Duplicate Proposal"
                          className="p-1.5 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(q.id, q.quotationNumber, e)}
                          title="Delete Quotation"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
