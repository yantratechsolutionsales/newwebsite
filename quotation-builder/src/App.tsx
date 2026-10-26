import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { QuotationDashboard } from './components/QuotationDashboard';
import { QuotationBuilder } from './components/QuotationBuilder';
import { QuotationPreviewModal } from './components/QuotationPreviewModal';
import { CustomersManager } from './components/CustomersManager';
import { ProductCatalogue } from './components/ProductCatalogue';
import { SalesMembersManager } from './components/SalesMembersManager';
import { SettingsManager } from './components/SettingsManager';
import { DatasheetViewerModal } from './components/DatasheetViewerModal';

export function AppContent() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeQuotationId, setActiveQuotationId] = useState<string | null>(null);
  const [previewQuotationId, setPreviewQuotationId] = useState<string | null>(null);

  // Standalone datasheet viewing from URL query parameters (e.g. ?datasheet=...&name=...)
  const [standaloneDatasheet, setStandaloneDatasheet] = useState<{
    name: string;
    url: string;
  } | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const url = params.get('datasheet');
      const name = params.get('name') || 'Industrial Product';
      if (url) {
        return { name, url };
      }
    } catch {
      // ignore
    }
    return null;
  });

  const handleNewQuotation = () => {
    setActiveQuotationId(null);
    setPreviewQuotationId(null);
    setCurrentTab('builder');
  };

  const handleEditQuotation = (id: string) => {
    setActiveQuotationId(id);
    setPreviewQuotationId(null);
    setCurrentTab('builder');
  };

  const handlePreviewQuotation = (id: string) => {
    setPreviewQuotationId(id);
    setCurrentTab('preview');
  };

  const handleSaveSuccess = (savedId: string) => {
    setPreviewQuotationId(savedId);
    setCurrentTab('preview');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab !== 'builder' && tab !== 'preview') {
            setActiveQuotationId(null);
            setPreviewQuotationId(null);
          }
          setCurrentTab(tab);
        }}
        onNewQuotation={handleNewQuotation}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <QuotationDashboard
            onNewQuotation={handleNewQuotation}
            onEditQuotation={handleEditQuotation}
            onPreviewQuotation={handlePreviewQuotation}
          />
        )}

        {currentTab === 'builder' && (
          <QuotationBuilder
            initialQuotationId={activeQuotationId || undefined}
            onCancel={() => setCurrentTab('dashboard')}
            onSaveSuccess={handleSaveSuccess}
            onPreview={(id) => {
              setPreviewQuotationId(id);
              setCurrentTab('preview');
            }}
          />
        )}

        {currentTab === 'preview' && previewQuotationId && (
          <QuotationPreviewModal
            quotationId={previewQuotationId}
            onClose={() => setCurrentTab('dashboard')}
            onEdit={handleEditQuotation}
          />
        )}

        {currentTab === 'customers' && (
          <CustomersManager
            onPreviewQuotation={handlePreviewQuotation}
          />
        )}

        {currentTab === 'catalogue' && (
          <ProductCatalogue />
        )}

        {currentTab === 'sales-members' && (
          <SalesMembersManager />
        )}

        {currentTab === 'settings' && (
          <SettingsManager />
        )}
      </main>

      {/* Standalone Datasheet Viewer (opens when query params are present, e.g. from quotations/emails) */}
      {standaloneDatasheet && (
        <DatasheetViewerModal
          productName={standaloneDatasheet.name}
          datasheetUrl={standaloneDatasheet.url}
          onClose={() => {
            setStandaloneDatasheet(null);
            if (window.history && window.history.replaceState) {
              window.history.replaceState({}, '', window.location.pathname);
            }
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
