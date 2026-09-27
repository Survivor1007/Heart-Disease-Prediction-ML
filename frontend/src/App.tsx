import React, { useState } from 'react';
import { Activity, AlertCircle, Sparkles, Layers, TrendingUp, Sliders, ChevronDown, ChevronUp } from 'lucide-react';
import { Navbar, TabType } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Home } from './components/home/Home';
import { TrainingPage } from './components/training/TrainingPage';
import { ArchetypeSelector } from './components/diagnostic/ArchetypeSelector';
import { PatientForm } from './components/diagnostic/PatientForm';
import { RiskGauge } from './components/diagnostic/RiskGauge';
import { ConsensusMatrix } from './components/diagnostic/ConsensusMatrix';
import { ShapWaterfall } from './components/diagnostic/ShapWaterfall';
import { WhatIfSimulator } from './components/diagnostic/WhatIfSimulator';
import { ClinicalReportModal } from './components/diagnostic/ClinicalReportModal';
import { HistoryTable } from './components/history/HistoryTable';
import { ClinicalRefGuide } from './components/docs_view/ClinicalRefGuide';
import { ApiRefGuide } from './components/docs_view/ApiRefGuide';
import { usePrediction } from './hooks/usePrediction';
import { useHistory } from './hooks/useHistory';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  // Optional Analytics View Toggles (Glassmorphic inspection modules)
  const [showConsensus, setShowConsensus] = useState<boolean>(false);
  const [showShap, setShowShap] = useState<boolean>(false);
  const [showWhatIf, setShowWhatIf] = useState<boolean>(false);

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
        {/* HOME */}
        {activeTab === 'home' && <Home onNavigate={setActiveTab} />}

        {/* DIAGNOSTIC ASSESSMENT */}
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

            {/* Top Row: Patient Payload Form (Left) & Consensus Calibrated Risk (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Column: Input Form */}
              <div className="lg:col-span-6">
                <PatientForm
                  patientData={patientData}
                  onChange={setPatientData}
                  onSubmit={() => handlePredict()}
                  onReset={resetForm}
                  loading={predicting}
                />
              </div>

              {/* Right Column: Consensus Calibrated Risk */}
              <div className="lg:col-span-6 flex flex-col">
                {prediction ? (
                  <RiskGauge
                    prediction={prediction}
                    onOpenReport={() => setIsReportOpen(true)}
                  />
                ) : (
                  <div className="flex-1 min-h-[380px] p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md flex flex-col items-center justify-center">
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

            {/* Bottom Section: Advanced Clinical Insights (Full Width Below Payload & Risk Gauge) */}
            {prediction && (
              <div className="space-y-6 pt-2">
                {/* Glassmorphism Analytics Module Selector Toolbar */}
                <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Advanced Clinical Insights
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      Click to toggle modules below
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Toggle 1: Consensus */}
                    <button
                      type="button"
                      onClick={() => setShowConsensus(!showConsensus)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-200 backdrop-blur-md border ${
                        showConsensus
                          ? 'bg-teal-500/15 border-teal-500/50 text-teal-700 dark:text-teal-300 shadow-[0_0_15px_-3px_rgba(20,184,166,0.3)]'
                          : 'bg-white/40 dark:bg-slate-800/40 border-white/60 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <span>Multi-Model Consensus</span>
                      </div>
                      {showConsensus ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {/* Toggle 2: SHAP */}
                    <button
                      type="button"
                      onClick={() => setShowShap(!showShap)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-200 backdrop-blur-md border ${
                        showShap
                          ? 'bg-teal-500/15 border-teal-500/50 text-teal-700 dark:text-teal-300 shadow-[0_0_15px_-3px_rgba(20,184,166,0.3)]'
                          : 'bg-white/40 dark:bg-slate-800/40 border-white/60 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <span>Feature Attribution (SHAP)</span>
                      </div>
                      {showShap ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {/* Toggle 3: What-If */}
                    <button
                      type="button"
                      onClick={() => setShowWhatIf(!showWhatIf)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-200 backdrop-blur-md border ${
                        showWhatIf
                          ? 'bg-teal-500/15 border-teal-500/50 text-teal-700 dark:text-teal-300 shadow-[0_0_15px_-3px_rgba(20,184,166,0.3)]'
                          : 'bg-white/40 dark:bg-slate-800/40 border-white/60 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Sliders className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <span>"What-If" Simulator</span>
                      </div>
                      {showWhatIf ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Optional Glassmorphism Modules (Rendered Full Width) */}
                {showConsensus && (
                  <ConsensusMatrix
                    consensusItems={prediction.models_consensus}
                    agreementRate={prediction.consensus_agreement_rate}
                    onClose={() => setShowConsensus(false)}
                  />
                )}

                {showShap && (
                  <ShapWaterfall
                    explainability={prediction.explainability}
                    onClose={() => setShowShap(false)}
                  />
                )}

                {showWhatIf && (
                  <WhatIfSimulator
                    patient={prediction.input_vitals}
                    baselineRisk={prediction.calibrated_risk_score}
                    onClose={() => setShowWhatIf(false)}
                  />
                )}
              </div>
            )}

            {prediction && (
              <ClinicalReportModal
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
                prediction={prediction}
              />
            )}
          </div>
        )}

        {/* MODEL TRAINING & JUDGEMENT METRICS */}
        {activeTab === 'training' && <TrainingPage />}

        {/* HISTORICAL AUDITS */}
        {activeTab === 'history' && (
          <HistoryTable
            records={records}
            loading={loadingHistory}
            filterTier={filterTier}
            onFilterChange={setFilterTier}
            onRefresh={refetchHistory}
          />
        )}

        {/* CLINICAL & API DOCS */}
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