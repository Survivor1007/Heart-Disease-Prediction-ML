import React, { useState } from 'react';
import { Activity, AlertCircle, Sparkles } from 'lucide-react';
import { Navbar, TabType } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ArchetypeSelector } from './components/diagnostic/ArchetypeSelector';
import { PatientForm } from './components/diagnostic/PatientForm';
import { RiskGauge } from './components/diagnostic/RiskGauge';
import { ConsensusMatrix } from './components/diagnostic/ConsensusMatrix';
import { ShapWaterfall } from './components/diagnostic/ShapWaterfall';
import { WhatIfSimulator } from './components/diagnostic/WhatIfSimulator';
import { ClinicalReportModal } from './components/diagnostic/ClinicalReportModal';
import { ModelComparisonTable } from './components/benchmarks/ModelComparisonTable';
import { RocCurveChart } from './components/benchmarks/RocCurveChart';
import { CalibrationPlot } from './components/benchmarks/CalibrationPlot';
import { HistoryTable } from './components/history/HistoryTable';
import { ClinicalRefGuide } from './components/docs_view/ClinicalRefGuide';
import { ApiRefGuide } from './components/docs_view/ApiRefGuide';
import { usePrediction } from './hooks/usePrediction';
import { useBenchmarks } from './hooks/useBenchmarks';
import { useHistory } from './hooks/useHistory';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('diagnostic');
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  // Diagnostic Hook
  const {
    patientData,
    setPatientData,
    prediction,
    archetypes,
    loading: predicting,
    error: predictError,
    handlePredict,
    loadArchetype,
    resetForm,
  } = usePrediction();

  // Benchmarks Hook
  const {
    benchmarks,
    loading: loadingBenchmarks,
    error: benchmarkError,
    refetch: refetchBenchmarks,
  } = useBenchmarks();

  // History Hook
  const {
    records,
    loading: loadingHistory,
    filterTier,
    setFilterTier,
    refetch: refetchHistory,
  } = useHistory();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#080d1a] transition-colors duration-200">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: DIAGNOSTIC ASSESSMENT */}
        {activeTab === 'diagnostic' && (
          <div className="space-y-6">
            {/* Quick Demo Archetypes Bar */}
            <ArchetypeSelector
              archetypes={archetypes}
              onSelect={loadArchetype}
              loading={predicting}
            />

            {predictError && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <div>
                  <p className="font-bold">Assessment Failed</p>
                  <p>{predictError}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Input Form (5 cols on lg) */}
              <div className="lg:col-span-6 space-y-6">
                <PatientForm
                  patientData={patientData}
                  onChange={setPatientData}
                  onSubmit={() => handlePredict()}
                  onReset={resetForm}
                  loading={predicting}
                />
              </div>

              {/* Right Column: Diagnostic Results Dashboard (6 cols on lg) */}
              <div className="lg:col-span-6 space-y-6">
                {prediction ? (
                  <>
                    <RiskGauge
                      prediction={prediction}
                      onOpenReport={() => setIsReportOpen(true)}
                    />
                    <ConsensusMatrix
                      consensusItems={prediction.models_consensus}
                      agreementRate={prediction.consensus_agreement_rate}
                    />
                    <ShapWaterfall explainability={prediction.explainability} />
                    <WhatIfSimulator
                      patient={prediction.input_vitals}
                      baselineRisk={prediction.calibrated_risk_score}
                    />
                  </>
                ) : (
                  <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/40 dark:bg-slate-900/40">
                    <Activity className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3 animate-pulse" />
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      No Diagnostic Assessment Computed Yet
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Fill out patient vitals on the left, or select a demo archetype above to compute calibrated multi-model risk and SHAP explainability.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {prediction && (
              <ClinicalReportModal
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
                prediction={prediction}
              />
            )}
          </div>
        )}

        {/* TAB 2: MODEL BENCHMARKS & JUDGMENT METRICS */}
        {activeTab === 'benchmarks' && (
          <div className="space-y-6">
            {benchmarkError && (
              <div className="p-4 rounded-xl bg-rose-50 text-rose-800 text-xs">
                {benchmarkError}
              </div>
            )}

            {benchmarks ? (
              <>
                <ModelComparisonTable benchmarks={benchmarks} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RocCurveChart benchmarks={benchmarks} />
                  <CalibrationPlot benchmarks={benchmarks} />
                </div>
              </>
            ) : (
              <div className="py-16 text-center text-slate-400 text-xs">
                Loading model benchmark metrics...
              </div>
            )}
          </div>
        )}

        {/* TAB 3: HISTORICAL AUDITS */}
        {activeTab === 'history' && (
          <HistoryTable
            records={records}
            loading={loadingHistory}
            filterTier={filterTier}
            onFilterChange={setFilterTier}
            onRefresh={refetchHistory}
          />
        )}

        {/* TAB 4: CLINICAL & API DOCS */}
        {activeTab === 'docs' && (
          <div className="space-y-6">
            <ClinicalRefGuide />
            <ApiRefGuide />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;
