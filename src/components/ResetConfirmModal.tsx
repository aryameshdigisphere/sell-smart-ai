import React from 'react';
import { RotateCcw, Trash2, X, AlertTriangle } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetToDemo: () => void;
  onClearAll: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onResetToDemo,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-white">Data Management & Controls</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          SELL SMART AI stores your products, recorded orders, and calculations locally in your browser storage (localStorage). Choose an action below:
        </p>

        <div className="space-y-3">
          {/* Action 1: Reset to Demo Data */}
          <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/80 flex items-start justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5 text-emerald-400" />
                <span>Reset to Preloaded Demo Data</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Restores standard realistic products, order history, low-stock alerts, and scenario models.
              </p>
            </div>
            <button
              onClick={() => {
                onResetToDemo();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shrink-0 transition"
            >
              Reset Demo
            </button>
          </div>

          {/* Action 2: Clear All Data */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 flex items-start justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                <span>Clear All Custom Data</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Wipes all stored inventory, orders, and saved copy to start with a blank database.
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to completely erase all data in localStorage?')) {
                  onClearAll();
                  onClose();
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white font-semibold text-xs shrink-0 transition border border-rose-500/40"
            >
              Wipe Clean
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
