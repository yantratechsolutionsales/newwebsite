import React, { useState } from 'react';
import { 
  Download, 
  Printer, 
  ArrowLeft, 
  Edit3, 
  Copy, 
  CheckCircle, 
  Share2,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { Quotation } from '../types';
import { useApp } from '../context/AppContext';
import { QuotationDocumentView } from './QuotationDocumentView';
import { exportQuotationToPdf, printQuotation } from '../utils/pdfExport';

interface QuotationPreviewModalProps {
  quotationId: string;
  onClose: () => void;
  onEdit: (id: string) => void;
}

export const QuotationPreviewModal: React.FC<QuotationPreviewModalProps> = ({
  quotationId,
  onClose,
  onEdit,
}) => {
  const { getQuotation, companySettings, duplicateQuotation, saveQuotation } = useApp();
  const quotation = getQuotation(quotationId);

  const [isExporting, setIsExporting] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  if (!quotation) {
    return (
      <div className="p-8 text-center bg-white rounded-xl max-w-lg mx-auto my-12 border">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-2" />
        <h3 className="text-lg font-bold text-slate-800">Quotation Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">This proposal might have been deleted.</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleDownloadPdf = async () => {
    try {
      setIsExporting(true);
      await exportQuotationToPdf('quotation-print-document', quotation.quotationNumber);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      // Fallback directly to native print/Save-as-PDF dialog so user is never blocked
      printQuotation();
    } finally {
      setIsExporting(false);
    }
  };

  const handleStatusChange = (newStatus: Quotation['status']) => {
    saveQuotation({ ...quotation, status: newStatus });
  };

  const handleDuplicate = () => {
    const dup = duplicateQuotation(quotation.id);
    if (dup) {
      onEdit(dup.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Floating Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-16 z-40 no-print">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 text-base">
                {quotation.quotationNumber}
              </span>
              <span className="text-xs font-medium text-slate-500">• {quotation.customerName}</span>
            </div>
            <div className="text-xs text-slate-500">
              Signatory: <strong className="text-slate-700">{quotation.signatoryName}</strong> | Issued: {quotation.date}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Dropdown */}
          <div className="flex items-center space-x-1.5 mr-2">
            <span className="text-xs font-semibold text-slate-600">Status:</span>
            <select
              value={quotation.status}
              onChange={(e) => handleStatusChange(e.target.value as Quotation['status'])}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 font-semibold bg-white text-slate-800 focus:ring-1 focus:ring-amber-500"
            >
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Under Discussion">Under Discussion</option>
              <option value="Revised">Revised</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          <button
            onClick={() => onEdit(quotation.id)}
            className="flex items-center px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1" />
            Edit Proposal
          </button>

          <button
            onClick={handleDuplicate}
            className="flex items-center px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            <Copy className="w-3.5 h-3.5 mr-1" />
            Duplicate
          </button>

          <button
            onClick={printQuotation}
            className="flex items-center px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 mr-1" />
            Print
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex items-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs shadow transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            {isExporting ? 'Generating PDF...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Actual Rendered Document Container */}
      <div className="overflow-x-auto pb-12 flex justify-center">
        <div className="bg-white shadow-2xl border border-slate-200/80 rounded-sm">
          <QuotationDocumentView quotation={quotation} companySettings={companySettings} />
        </div>
      </div>
    </div>
  );
};
