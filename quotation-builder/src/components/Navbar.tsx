import React from 'react';
import { 
  FileText, 
  PlusCircle, 
  Users, 
  Package, 
  Settings, 
  ShieldCheck, 
  PhoneCall, 
  Mail,
  ExternalLink,
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onNewQuotation: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onNewQuotation }) => {
  const { companySettings } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Proposals Dashboard', icon: FileText },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'catalogue', label: 'Product Catalogue', icon: Package },
    { id: 'sales-members', label: 'Sales Signatories', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="bg-[#191A18] text-white border-b border-[#2a2c28] sticky top-0 z-50 shadow-md no-print">
      {/* Top Banner / Corporate Contact bar matching Yantratech website */}
      <div className="bg-[#121311] px-4 py-1.5 text-xs text-slate-300 border-b border-[#252724] hidden sm:flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <span className="flex items-center text-[#F3B93E] font-medium tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Industrial Instruments • IT Hardware • Software Solutions & Contracts
          </span>
          <span className="text-slate-400">Pan-India Delivery</span>
        </div>
        <div className="flex items-center space-x-5 text-slate-300">
          <a href={`tel:${companySettings.phone}`} className="flex items-center hover:text-[#F3B93E] transition-colors">
            <PhoneCall className="w-3 h-3 mr-1 text-[#F3B93E]" />
            {companySettings.phone}
          </a>
          <a href={`mailto:${companySettings.email}`} className="flex items-center hover:text-[#F3B93E] transition-colors">
            <Mail className="w-3 h-3 mr-1 text-[#F3B93E]" />
            {companySettings.email}
          </a>
          <a 
            href={companySettings.website} 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center text-slate-400 hover:text-[#F3B93E] transition-colors"
          >
            Official Website
            <ExternalLink className="w-2.5 h-2.5 ml-1" />
          </a>
        </div>
      </div>

      {/* Main Navigation Bar with Official Yantratech Logo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => setCurrentTab('dashboard')} 
            className="flex items-center space-x-3 cursor-pointer group py-2"
          >
            <img 
              src="/yantratech-logo.webp" 
              alt="Yantratech Solutions" 
              className="h-12 sm:h-14 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform"
              onError={(e) => {
                // Fallback to PNG if webp is not supported
                (e.target as HTMLImageElement).src = '/yantratech-logo.png';
              }}
            />
            <div className="border-l border-slate-700/60 pl-3 hidden md:block">
              <span className="text-xs font-semibold tracking-wider text-[#F3B93E] uppercase block font-outfit">
                Commercial Proposal Engine
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Quotation & Contract Automation
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1.5 font-outfit">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive 
                      ? 'bg-[#F3B93E] text-[#191A18] shadow-md shadow-[#F3B93E]/20' 
                      : 'text-slate-300 hover:bg-[#252724] hover:text-[#F3B93E]'
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-[#191A18]' : 'text-[#F3B93E]'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* New Quotation CTA Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onNewQuotation}
              className="flex items-center bg-[#F3B93E] hover:bg-[#e0a426] text-[#191A18] font-extrabold px-4 sm:px-5 py-2.5 rounded-lg shadow-md shadow-[#F3B93E]/25 active:scale-95 transition-all text-sm font-outfit"
            >
              <PlusCircle className="w-4 h-4 mr-1.5 stroke-[2.5]" />
              New Quotation
            </button>
          </div>
        </div>

        {/* Mobile Nav Links */}
        <div className="md:hidden flex overflow-x-auto py-2 border-t border-[#2a2c28] space-x-1 scrollbar-none font-outfit">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-semibold ${
                  isActive 
                    ? 'bg-[#F3B93E] text-[#191A18]' 
                    : 'text-slate-300 hover:bg-[#252724]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 mr-1" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
