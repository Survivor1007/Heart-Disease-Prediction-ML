import React from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  Gauge,
  Layers,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
} from 'lucide-react';
import { TabType } from '../layout/Navbar';
import { Card } from '../common/Card';

interface HomeProps {
  onNavigate: (tab: TabType) => void;
}

const FEATURES = [
  {
    icon: <Layers className="w-5 h-5 text-teal-500" />,
    title: 'Multi-Model Consensus',
    description:
      'Calibrated XGBoost (primary), Random Forest, and Logistic Regression cross-check every assessment for trustworthy clinical output.',
  },
  {
    icon: <Gauge className="w-5 h-5 text-teal-500" />,
    title: 'Platt-Scaled Probabilities',
    description:
      '5-fold sigmoid calibration turns raw model scores into true statistical probabilities you can act on.',
  },
  {
    icon: <Brain className="w-5 h-5 text-teal-500" />,
    title: 'SHAP Explainability',
    description:
      'Every prediction is decomposed into positive risk drivers and protective factors, making the decision transparent.',
  },
  {
    icon: <Sparkles className="w-5 h-5 text-teal-500" />,
    title: 'What-If Simulations',
    description:
      'Adjust blood pressure, heart rate, or ST segments live to see how a patient\u2019s modelled risk responds.',
  },
  {
    icon: <BarChart3 className="w-5 h-5 text-teal-500" />,
    title: 'Retrainable Model Pipeline',
    description:
      'Upload your own labeled JSON or CSV anywhere the training endpoint is exposed and retrain on the spot.',
  },
  {
    icon: <Users className="w-5 h-5 text-teal-500" />,
    title: 'Full Audit History',
    description:
      'Every patient assessment is persisted and searchable in the audit log for review, research, and compliance.',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Assess',
    description: 'Enter core vitals or load a demo archetype to compute a calibrated multi-model risk score.',
  },
  {
    number: '02',
    title: 'Explain',
    description: 'Review SHAP drivers, protective factors, and counterfactual What-If simulations.',
  },
  {
    number: '03',
    title: 'Retrain',
    description: 'Upload labeled data to continuously improve the models and inspect the fresh judgement metrics.',
  },
];

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0e1a2e] to-[#082f2b] dark:from-[#0a1020] dark:via-[#0a1626] dark:to-[#04211f] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-teal-900/10">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative p-8 sm:p-12 lg:p-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-400/10 border border-teal-300/20 text-teal-300 text-xs font-semibold mb-6">
            <ShieldCheck className="w-4 h-4" />
            Calibrated Clinical Decision Support
          </div>

          <h1 className="max-w-3xl text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.05]">
            Cardiac risk,
            <span className="bg-gradient-to-r from-teal-300 to-emerald-400 bg-clip-text text-transparent">
              {' '}
              explained not guessed.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm sm:text-base leading-relaxed text-slate-300">
            CardioLens is a multi-model clinical decision support system for heart disease risk prediction.
            It blends three independently calibrated models, SHAP feature attribution, and dynamic missing-data
            imputation to give clinicians a risk score they can actually reason about.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('diagnostic')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-white text-sm font-bold shadow-lg shadow-teal-500/25 transition-all active:scale-[0.98]"
            >
              <Activity className="w-4 h-4" />
              Run a Risk Assessment
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('training')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-sm font-bold transition-all active:scale-[0.98]"
            >
              <Upload className="w-4 h-4" />
              Train the Model
            </button>
          </div>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 max-w-xl gap-4">
            {[
              { value: '3', label: 'Calibrated Models' },
              { value: 'SHAP', label: 'Feature Attribution' },
              { value: '0.5s', label: 'Median Response' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">
                <div className="text-2xl font-extrabold text-white">{stat.value}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Purpose-built for clinical trust
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Every feature exists to make model output inspectable, reproducible, and safe to use at the bedside.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature) => (
            <Card key={feature.title} hoverEffect className="p-6">
              <div className="w-11 h-11 rounded-xl bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{feature.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STEPS.map((step) => (
            <Card key={step.number} className="p-6">
              <div className="text-3xl font-extrabold text-transparent bg-gradient-to-r from-teal-600 to-emerald-400 bg-clip-text">
                {step.number}
              </div>
              <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{step.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {step.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 p-6">
        <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
          <strong>Clinical disclaimer:</strong> CardioLens is a decision-support tool for research and educational
          purposes. It is not a certified medical device and never overrides independent clinical judgment.
        </p>
      </section>
    </div>
  );
};