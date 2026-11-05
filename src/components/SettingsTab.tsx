import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Globe, 
  DollarSign, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  Server, 
  Key, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  FileText, 
  Sparkles,
  Building,
  Sliders,
  AlertTriangle
} from 'lucide-react';
import { Currency, TargetCountry, ContentTone, Product, Order, SavedScenario, SavedCopy } from '../types';
import { CURRENCIES, formatCurrency } from '../utils/currencies';
import { localiseText } from '../utils/localisation';

interface SettingsTabProps {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  products: Product[];
  orders: Order[];
  savedScenarios: SavedScenario[];
  savedCopyList: SavedCopy[];
  onResetToDemo: () => void;
  onClearAll: () => void;
  onImportAllData: (data: any) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  currency,
  setCurrency,
  products,
  orders,
  savedScenarios,
  savedCopyList,
  onResetToDemo,
  onClearAll,
  onImportAllData,
}) => {
  // Store Settings (saved in localStorage)
  const [storeName, setStoreName] = useState(() => {
    return localStorage.getItem('sell_smart_store_name') || 'Artisan Goods & Gifts';
  });

  const [defaultCountry, setDefaultCountry] = useState<TargetCountry>(() => {
    return (localStorage.getItem('sell_smart_default_country') as TargetCountry) || 'USA';
  });

  const [canadianEnglish, setCanadianEnglish] = useState<boolean>(() => {
    const val = localStorage.getItem('sell_smart_canadian_english');
    return val === null ? true : val === 'true';
  });

  const [defaultTone, setDefaultTone] = useState<ContentTone>(() => {
    return (localStorage.getItem('sell_smart_default_tone') as ContentTone) || 'Friendly';
  });

  const [copiedKeyGuide, setCopiedKeyGuide] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Sync settings
  useEffect(() => {
    localStorage.setItem('sell_smart_store_name', storeName);
  }, [storeName]);

  useEffect(() => {
    localStorage.setItem('sell_smart_default_country', defaultCountry);
  }, [defaultCountry]);

  useEffect(() => {
    localStorage.setItem('sell_smart_canadian_english', String(canadianEnglish));
  }, [canadianEnglish]);

  useEffect(() => {
    localStorage.setItem('sell_smart_default_tone', defaultTone);
  }, [defaultTone]);

  // Compute localStorage byte usage
  const storageUsageKB = React.useMemo(() => {
    let total = 0;
    for (let x in localStorage) {
      if (localStorage.hasOwnProperty(x)) {
        total += ((localStorage[x].length + x.length) * 2);
      }
    }
    return (total / 1024).toFixed(1);
  }, [products, orders, savedScenarios, savedCopyList]);

  // Export full backup as JSON
  const handleExportBackup = () => {
    const fullBackup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      storeName,
      currency,
      defaultCountry,
      canadianEnglish,
      defaultTone,
      products,
      orders,
      savedScenarios,
      savedCopyList,
      history: JSON.parse(localStorage.getItem('sell_smart_content_history') || '[]'),
    };

    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sell-smart-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Invalid JSON format.');
        }

        onImportAllData(parsed);
        if (parsed.storeName) setStoreName(parsed.storeName);
        if (parsed.currency) setCurrency(parsed.currency);
        if (parsed.defaultCountry) setDefaultCountry(parsed.defaultCountry);
        if (parsed.canadianEnglish !== undefined) setCanadianEnglish(parsed.canadianEnglish);
        if (parsed.defaultTone) setDefaultTone(parsed.defaultTone);

        setImportStatus('Backup successfully imported!');
        setTimeout(() => setImportStatus(null), 4000);
      } catch (err: any) {
        setImportStatus(`Import failed: ${err.message || 'Corrupted file'}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Sample spelling demonstration
  const samplePhrase = "Personalized holiday decor in custom colors and stylish jewelry.";
  const localisedSample = localiseText(samplePhrase, {
    country: defaultCountry,
    useCanadianEnglish: canadianEnglish,
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <SettingsIcon className="h-3.5 w-3.5" />
            System Preferences & Localization
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Store Settings & Free Deployment
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Configure multi-currency display, regional spelling localization (USA, UK, Canada, Australia), backup your database, and view zero-cost deployment instructions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold border border-slate-700 transition shadow-sm"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            <span>Export Backup JSON</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Regional & Currency Localization */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Globe className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Market & Currency Localization</h2>
          </div>

          <div className="space-y-4 text-xs">
            {/* Currency Selection */}
            <div>
              <label className="font-semibold text-slate-200 block mb-1">
                Display Currency (Default: USD)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['USD', 'GBP', 'CAD', 'AUD'] as Currency[]).map((cCode) => {
                  const cfg = CURRENCIES[cCode];
                  const isSelected = currency === cCode;
                  return (
                    <button
                      key={cCode}
                      type="button"
                      onClick={() => setCurrency(cCode)}
                      className={`p-3 rounded-xl border text-left transition ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-sm ring-1 ring-emerald-500/30'
                          : 'bg-slate-800/60 border-slate-700/70 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm">{cfg.code}</span>
                        <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-900/80 text-emerald-400">
                          {cfg.symbol}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 truncate">{cfg.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Country Selection */}
            <div className="pt-2">
              <label className="font-semibold text-slate-200 block mb-1">
                Primary Target Marketplace
              </label>
              <select
                value={defaultCountry}
                onChange={(e) => setDefaultCountry(e.target.value as TargetCountry)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="USA">United States (US Dollar, US English: personalized, color)</option>
                <option value="UK">United Kingdom (British Pound, UK English: personalised, colour)</option>
                <option value="Canada">Canada (Canadian Dollar, Bilingual / Commonwealth English)</option>
                <option value="Australia">Australia (Australian Dollar, Commonwealth English: personalised, colour)</option>
              </select>
            </div>

            {/* Canadian English Preference Toggle */}
            {defaultCountry === 'Canada' && (
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Canadian English Spelling</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canadianEnglish}
                      onChange={(e) => setCanadianEnglish(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
                <p className="text-[11px] text-slate-400">
                  {canadianEnglish 
                    ? 'Using Canadian / Commonwealth spelling (colour, personalised, jewellery).' 
                    : 'Using American spelling standard (color, personalized, jewelry).'}
                </p>
              </div>
            )}

            {/* Live Spelling Localization Demonstrator */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">
                Live Regional Localization Engine:
              </span>
              <div className="space-y-1 text-xs">
                <p className="text-slate-400">
                  <span className="text-slate-500 font-mono">Input:</span> {samplePhrase}
                </p>
                <p className="text-emerald-400 font-medium">
                  <span className="text-slate-500 font-mono">Output ({defaultCountry}):</span> {localisedSample}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Card 2: Store & Brand Profile */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Building className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Store Identity & AI Brand Tone</h2>
          </div>

          <div className="space-y-4 text-xs">
            {/* Store Name */}
            <div>
              <label className="font-semibold text-slate-200 block mb-1">
                Store or Brand Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Haven Studio Goods"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Default Content Tone */}
            <div>
              <label className="font-semibold text-slate-200 block mb-1">
                Default Brand Copy Tone
              </label>
              <select
                value={defaultTone}
                onChange={(e) => setDefaultTone(e.target.value as ContentTone)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-indigo-500"
              >
                <option value="Friendly">Friendly & Approachable (Warm, conversational)</option>
                <option value="Professional">Professional & Trustworthy (Clear, concise, authoritative)</option>
                <option value="Luxury">Luxury & Boutique (Refined, premium, sophisticated)</option>
                <option value="Playful">Playful & Upbeat (Fun, catchy, enthusiastic)</option>
                <option value="Minimalist">Minimalist & Modern (Clean, functional, subtle)</option>
                <option value="Persuasive">Persuasive (Direct response, high conversion)</option>
              </select>
            </div>

            {/* Safe AI Status Banner */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <ShieldCheck className="h-4 w-4" />
                <span>Zero-API Key Exposure Architecture</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                SELL SMART AI connects to Gemini models via a secure backend proxy route (<code className="text-slate-300">/api/generate</code>). Your API key is never bundled in frontend code. If no key is set, the built-in Smart Template Fallback works 100% offline.
              </p>
            </div>

          </div>
        </div>

        {/* Card 3: Local Storage & Data Maintenance */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Database className="h-5 w-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Local Data Management & Backup</h2>
          </div>

          <div className="space-y-4 text-xs">
            {/* Storage Usage Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Products</span>
                <span className="text-base font-bold text-white mt-0.5 block">{products.length}</span>
              </div>
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Orders</span>
                <span className="text-base font-bold text-white mt-0.5 block">{orders.length}</span>
              </div>
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Saved Scenarios</span>
                <span className="text-base font-bold text-white mt-0.5 block">{savedScenarios.length}</span>
              </div>
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Storage Used</span>
                <span className="text-base font-bold text-emerald-400 mt-0.5 block">{storageUsageKB} KB</span>
              </div>
            </div>

            {/* Import Status Alert */}
            {importStatus && (
              <div className={`p-3 rounded-xl border text-xs font-semibold ${
                importStatus.includes('failed')
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}>
                {importStatus}
              </div>
            )}

            {/* Import File Button */}
            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer">
                <Upload className="h-4 w-4 text-indigo-400" />
                <span>Restore from JSON Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleExportBackup}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>

            {/* Dangerous Actions */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={onResetToDemo}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
              >
                <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                <span>Reset Demo Catalog</span>
              </button>

              <button
                onClick={onClearAll}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-medium border border-rose-800/60 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Wipe All Local Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: 100% Free Deployment Guide for Small Businesses */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Server className="h-5 w-5 text-teal-400" />
            <h2 className="text-base font-bold text-white">Free Hosting & Deployment Guide</h2>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <p>
              SELL SMART AI is a full-stack Node.js + React app designed for zero-cost hosting on generous free tiers:
            </p>

            {/* Option 1: Google Cloud Run */}
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="flex items-center justify-between font-bold text-white">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400" />
                  Option 1: Google Cloud Run (Free Tier)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono">Recommended</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Offers 2 million free requests per month. Auto-scales to 0 when idle, so it costs $0.00 for small sellers.
              </p>
            </div>

            {/* Option 2: Vercel / Render */}
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="flex items-center justify-between font-bold text-white">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  Option 2: Vercel or Render
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">1-Click Git</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Connect your GitHub repository. Build command: <code className="text-slate-200">npm run build</code>, Start command: <code className="text-slate-200">npm start</code>.
              </p>
            </div>

            {/* Setting GEMINI_API_KEY */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-amber-400" />
                Environment Variable Configuration
              </span>
              <p className="text-[11px] text-slate-400">
                In your host’s dashboard, add this single secret:
              </p>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between font-mono text-[11px] text-emerald-400">
                <span>GEMINI_API_KEY=&quot;your_free_gemini_key&quot;</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('GEMINI_API_KEY');
                    setCopiedKeyGuide(true);
                    setTimeout(() => setCopiedKeyGuide(false), 2000);
                  }}
                  className="text-slate-400 hover:text-white"
                  title="Copy var name"
                >
                  {copiedKeyGuide ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                Get a 100% free API key with generous rate limits from <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline">aistudio.google.com</a>.
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
