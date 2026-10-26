import React, { useState } from 'react';
import { X, Download, ExternalLink, FileText, Loader2, Maximize2 } from 'lucide-react';
import { downloadDatasheetPdf, openCleanDatasheetWindow } from '../utils/datasheetViewer';

interface DatasheetViewerModalProps {
  productName: string;
  datasheetUrl: string;
  brand?: string;
  modelNumber?: string;
  onClose: () => void;
}

export const DatasheetViewerModal: React.FC<DatasheetViewerModalProps> = ({
  productName,
  datasheetUrl,
  brand,
  modelNumber,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadDatasheetPdf(productName, datasheetUrl);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenWindow = () => {
    openCleanDatasheetWindow(productName, datasheetUrl);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#191A18] text-white rounded-2xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl border border-amber-500/40 overflow-hidden">
        {/* Header - ONLY Product Name and Yantratech branding displayed */}
        <header className="px-5 py-3.5 bg-[#191A18] border-b border-amber-500/30 flex justify-between items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white font-outfit truncate max-w-xl">
                  {productName}
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Official Technical Datasheet
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                {brand ? `${brand} ` : ''}{modelNumber ? `• Model: ${modelNumber} ` : ''}• Yantratech Solutions
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              title="Download OEM Datasheet PDF"
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Download PDF</span>
            </button>

            <button
              onClick={handleOpenWindow}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium rounded-lg text-xs border border-slate-700 transition-all cursor-pointer"
              title="Open in Dedicated Window"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dedicated Tab</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              aria-label="Close datasheet viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Embedded PDF Viewer */}
        <div className="flex-1 bg-slate-900 relative w-full h-full">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-10 gap-3">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-xs text-slate-300 font-medium">Loading {productName} datasheet...</p>
            </div>
          )}

          <iframe
            src={datasheetUrl}
            title={`${productName} - Technical Datasheet`}
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
          />
        </div>

        {/* Footer info bar */}
        <footer className="px-5 py-2.5 bg-[#141513] border-t border-slate-800/80 flex justify-between items-center text-xs text-slate-400">
          <span className="truncate">
            Showing official datasheet specifications for <strong className="text-slate-200">{productName}</strong>
          </span>
          <span className="text-[11px] text-amber-400/80 font-medium hidden sm:inline">
            Yantratech Solutions Technical Catalog
          </span>
        </footer>
      </div>
    </div>
  );
};
