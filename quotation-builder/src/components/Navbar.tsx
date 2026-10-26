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
  ChevronRight,
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
    { id: 'dashboard', label: 'Quotations Dashboard', icon: FileText },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'catalogue', label: 'Product Catalogue', icon: Package },
    { id: 'sales-members', label: 'Sales Members', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
      {/* Top Banner / Corporate info */}
      <div className="bg-slate-950 px-4 py-1.5 text-xs text-slate-300 border-b border-slate-800/60 hidden sm:flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <span className="flex items-center text-amber-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Industrial Instruments • IT Hardware • Software Solutions & Contracts
          </span>
          <span className="text-slate-400">Pan-India Delivery</span>
        </div>
        <div className="flex items-center space-x-5 text-slate-300">
          <a href={`tel:${companySettings.phone}`} className="flex items-center hover:text-amber-400 transition-colors">
            <PhoneCall className="w-3 h-3 mr-1 text-slate-400" />
            {companySettings.phone}
          </a>
          <a href={`mailto:${companySettings.email}`} className="flex items-center hover:text-amber-400 transition-colors">
            <Mail className="w-3 h-3 mr-1 text-slate-400" />
            {companySettings.email}
          </a>
          <a 
            href={companySettings.website} 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center text-slate-400 hover:text-amber-400 transition-colors"
          >
            Website
            <ExternalLink className="w-2.5 h-2.5 ml-1" />
          </a>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => setCurrentTab('dashboard')} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center font-bold text-slate-950 text-xl shadow-md group-hover:scale-105 transition-transform">
              Y
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  YANTRATECH
                </span>
                <span className="text-sm font-semibold tracking-wider text-amber-400 uppercase">
                  SOLUTIONS
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium tracking-wide">
                Proposal & Quotation Engine
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center px-3.5 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* New Quotation Action Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onNewQuotation}
              className="flex items-center bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold px-4 py-2 rounded-lg shadow-md hover:shadow-amber-500/20 active:scale-95 transition-all text-sm"
            >
              <PlusCircle className="w-4 h-4 mr-1.5 stroke-[2.5]" />
              New Quotation
            </button>
          </div>
        </div>

        {/* Mobile Nav Links */}
        <div className="md:hidden flex overflow-x-auto py-2 border-t border-slate-800 space-x-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-medium ${
                  isActive 
                    ? 'bg-amber-500 text-slate-950 font-semibold' 
                    : 'text-slate-300 hover:bg-slate-800'
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
