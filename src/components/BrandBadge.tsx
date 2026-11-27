import React from 'react';

export const BrandBadge: React.FC = () => (
  <a
    href="https://aryameshdigisphere.online"
    target="_blank"
    rel="noreferrer"
    className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-slate-900/90 border border-slate-700 shadow-lg text-xs text-slate-200 hover:border-emerald-500"
  >
    <img src="/logo.png" alt="AryameshDigiSphere logo" className="h-6 w-6 object-contain" />
    <span className="font-semibold">AryameshDigiSphere</span>
  </a>
);