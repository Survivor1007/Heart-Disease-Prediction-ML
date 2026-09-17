import React, { useState } from 'react';
import { History, Eye, Filter, RefreshCw } from 'lucide-react';
import { HistoryRecord } from '../../types/history';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { HistoryDetailModal } from './HistoryDetailModal';

interface HistoryTableProps {
  records: HistoryRecord[];
  loading: boolean;
  filterTier: string;
  onFilterChange: (tier: string) => void;
  onRefresh: () => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  records,
  loading,
  filterTier,
  onFilterChange,
  onRefresh,
}) => {
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Patient Assessment Audit Trail
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Persistent diagnostic runs stored in PostgreSQL database
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={filterTier}
              onChange={(e) => onFilterChange(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="">All Risk Tiers</option>
              <option value="Low Risk">Low Risk</option>
              <option value="Moderate Risk">Moderate Risk</option>
              <option value="High Risk">High Risk</option>
            </select>
          </div>
          <Button variant="ghost" size="sm" onClick={onRefresh} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          Loading historical assessments...
        </div>
      ) : records.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          No diagnostic audit records found. Run a prediction to record history.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">Date / ID</th>
                <th className="py-3 px-3">Patient Profile</th>
                <th className="py-3 px-3">Vitals (BP/HR)</th>
                <th className="py-3 px-3 text-center">Risk Score</th>
                <th className="py-3 px-3 text-center">Risk Tier</th>
                <th className="py-3 px-3 text-center">Certainty</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900 dark:text-white">{rec.id.slice(0, 8)}</p>
                    <p className="text-[10px] text-slate-400 font-sans">
                      {new Date(rec.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      {rec.age} yrs &bull; {rec.sex}
                    </span>
                    <p className="text-[10px] text-slate-400">{rec.chest_pain_type.replace('_', ' ')}</p>
                  </td>
                  <td className="py-3 px-3">
                    <span>{rec.resting_bp} mm Hg</span>
                    <p className="text-[10px] text-slate-400">{rec.max_hr} bpm</p>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-900 dark:text-white text-sm">
                    {rec.calibrated_risk_score}%
                  </td>
                  <td className="py-3 px-3 text-center font-sans">
                    <Badge
                      variant={
                        rec.risk_tier === 'Low Risk'
                          ? 'emerald'
                          : rec.risk_tier === 'Moderate Risk'
                          ? 'amber'
                          : 'rose'
                      }
                      size="sm"
                    >
                      {rec.risk_tier}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-center font-semibold text-teal-600 dark:text-teal-400">
                    {rec.certainty_score}%
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedRecord(rec)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      Audit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedRecord && (
        <HistoryDetailModal
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          record={selectedRecord}
        />
      )}
    </Card>
  );
};
