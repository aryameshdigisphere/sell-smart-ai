import React from 'react';
import { 
  TrendingUp, 
  Calculator, 
  Boxes, 
  Sparkles, 
  Settings as SettingsIcon,
  Globe, 
  RotateCcw, 
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';
import { Currency } from '../types';
import { CURRENCIES } from '../utils/currencies';

export type AppTab = 'overview' | 'calculator' | 'inventory' | 'content' | 'settings';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  lowStockCount: number;
  onOpenResetModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  lowStockCount,
  onOpenResetModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    {
      id: 'overview' as const,
      label: 'Overview',
      icon: TrendingUp,
      badge: null,
    },
    {
      id: 'calculator' as const,
      label: 'Profit Calculator',
      icon: Calculator,
      badge: null,
    },
    {
      id: 'inventory' as const,
      label: 'Orders & Inventory',
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} low` : null,
    },
    {
      id: 'content' as const,
      label: 'Content Studio',
      icon: Sparkles,
      badge: 'SEO',
    },
    {
      id: 'settings' as const,
      label: 'Settings',
      icon: SettingsIcon,
      badge: null,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  SELL SMART
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Ecommerce Profit & Operations Suite
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all relative ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700/80 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        item.badge.includes('low')
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Currency Selector & Demo Reset */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Currency Selector */}
            <div className="flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700/80 shadow-inner">
              <Globe className="h-3.5 w-3.5 text-slate-400 ml-2 hidden sm:block" />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer py-1 px-2 pr-1 rounded"
                title="Select Display Currency"
              >
                {Object.values(CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code} className="bg-slate-900 text-slate-200">
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Reset / Demo Data Button */}
            <button
              onClick={onOpenResetModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
              title="Reset Demo Data or Clear"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
              <span>Data Settings</span>
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold border-l-4 border-emerald-400'
                    : 'text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      item.badge.includes('low')
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-indigo-500/20 text-indigo-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-400">Manage Demo Data:</span>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenResetModal();
              }}
              className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium py-1 px-2.5 rounded bg-slate-800"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset / Settings</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
