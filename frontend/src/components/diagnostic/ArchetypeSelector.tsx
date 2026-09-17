import React from 'react';
import { UserCheck, Sparkles } from 'lucide-react';
import { PatientArchetype } from '../../types/patient';

interface ArchetypeSelectorProps {
  archetypes: PatientArchetype[];
  onSelect: (id: string) => void;
  loading: boolean;
}

export const ArchetypeSelector: React.FC<ArchetypeSelectorProps> = ({
  archetypes,
  onSelect,
  loading,
}) => {
  if (!archetypes || archetypes.length === 0) return null;

  return (
    <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-teal-900/10 via-slate-900/5 to-slate-900/10 dark:from-teal-950/40 dark:via-slate-900/40 dark:to-slate-900/60 border border-teal-500/20 dark:border-teal-500/30">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-teal-300">
          Load Sample Patient Persona (One-Click Clinical Edge-Cases)
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {archetypes.map((arch) => (
          <button
            key={arch.id}
            type="button"
            disabled={loading}
            onClick={() => onSelect(arch.id)}
            className="group p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-md transition-all text-left flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {arch.name}
                </span>
                <UserCheck className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-500" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {arch.description}
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
              <span className="font-semibold text-slate-600 dark:text-slate-300">{arch.tagline}</span>
              <span className="text-teal-600 dark:text-teal-400 font-mono font-medium">Load &rarr;</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
