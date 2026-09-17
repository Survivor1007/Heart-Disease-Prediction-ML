import React from 'react';
import { Heart, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>CardioLens Clinical AI &copy; 2026. For research and clinical decision support.</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Platt Scaled Probabilities</span>
            </div>
            <span>&bull;</span>
            <span>SHAP TreeExplainer</span>
            <span>&bull;</span>
            <span>PostgreSQL Audit Storage</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
