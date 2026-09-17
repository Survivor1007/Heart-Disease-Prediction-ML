import React, { useRef, useState } from 'react';
import { Download, Printer, Activity } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PredictionResponse } from '../../types/prediction';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface ClinicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  prediction: PredictionResponse;
}

export const ClinicalReportModal: React.FC<ClinicalReportModalProps> = ({
  isOpen,
  onClose,
  prediction,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`CardioLens_Clinical_Report_${prediction.id ? prediction.id.slice(0, 8) : 'Assessment'}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const vitals = prediction.input_vitals;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Diagnostic Clinical Report" maxWidth="4xl">
      <div className="flex justify-end gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>
          Print
        </Button>
        <Button
          variant="primary"
          size="sm"
          isLoading={downloading}
          onClick={handleDownloadPdf}
          leftIcon={<Download className="w-4 h-4" />}
        >
          Download PDF
        </Button>
      </div>

      {/* Printable Report Document (White background for print cleanliness) */}
      <div
        ref={reportRef}
        className="p-8 bg-white text-slate-900 border border-slate-200 rounded-xl font-sans"
        style={{ color: '#0f172a' }}
      >
        {/* Header */}
        <div className="flex justify-between items-start pb-6 border-b-2 border-teal-600 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                CardioLens Clinical AI
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Multi-Model Decision Support Assessment
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono">
            <p className="font-bold text-slate-800">Report ID: {prediction.id ? prediction.id.slice(0, 13) : 'DEMO'}</p>
            <p>Generated: {new Date(prediction.timestamp).toLocaleString()}</p>
          </div>
        </div>

        {/* Executive Summary Banner */}
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 mb-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Diagnostic Consensus Risk
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-3xl font-black font-mono text-slate-900">
                {prediction.calibrated_risk_score}%
              </span>
              <span
                className={`text-sm font-bold px-3 py-1 rounded-full ${
                  prediction.risk_tier === 'Low Risk'
                    ? 'bg-emerald-100 text-emerald-800'
                    : prediction.risk_tier === 'Moderate Risk'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {prediction.risk_tier}
              </span>
            </div>
          </div>
          <div className="text-right text-xs">
            <p className="font-semibold text-slate-700">Data Certainty Score</p>
            <p className="text-lg font-bold font-mono text-teal-700">{prediction.certainty_score}%</p>
            <p className="text-[10px] text-slate-500 max-w-[200px] mt-0.5">{prediction.confidence_message}</p>
          </div>
        </div>

        {/* Patient Vitals Grid */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 pb-1 border-b border-slate-200">
            Recorded Patient Vitals & Clinical Markers
          </h2>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block">Age / Sex</span>
              <span className="font-bold font-mono">{vitals.age} yrs &bull; {vitals.sex}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block">Resting Blood Pressure</span>
              <span className="font-bold font-mono">{vitals.resting_bp} mm Hg</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block">Chest Pain Type</span>
              <span className="font-bold font-mono">{vitals.chest_pain_type.replace('_', ' ')}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block">Max Heart Rate</span>
              <span className="font-bold font-mono">{vitals.max_hr} bpm</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block">Exercise Angina</span>
              <span className="font-bold font-mono">{vitals.exercise_angina === 'yes' ? 'Positive' : 'Negative'}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block">Serum Cholesterol</span>
              <span className="font-bold font-mono">{vitals.cholesterol ? `${vitals.cholesterol} mg/dL` : 'Imputed'}</span>
            </div>
          </div>
        </div>

        {/* Model Consensus Summary */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 pb-1 border-b border-slate-200">
            Multi-Model Consensus Breakdown
          </h2>
          <div className="grid grid-cols-3 gap-3 text-xs">
            {prediction.models_consensus.map((m) => (
              <div key={m.model_name} className="p-3 rounded bg-slate-50 border border-slate-100 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">{m.model_name}</p>
                  <p className="text-[11px] text-slate-500">{m.risk_tier}</p>
                </div>
                <span className="text-base font-bold font-mono text-slate-900">{m.predicted_probability}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Explainability Drivers */}
        <div className="grid grid-cols-2 gap-4 text-xs mb-6">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
            <h3 className="font-bold text-rose-800 uppercase text-[11px] mb-2">Top Risk Elevators</h3>
            <ul className="space-y-1.5">
              {prediction.explainability.top_positive_drivers.map((d) => (
                <li key={d.feature} className="flex justify-between text-rose-950">
                  <span>{d.display_name}</span>
                  <span className="font-mono font-bold">+{d.percentage_impact}%</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <h3 className="font-bold text-emerald-800 uppercase text-[11px] mb-2">Top Protective Factors</h3>
            <ul className="space-y-1.5">
              {prediction.explainability.top_protective_factors.map((d) => (
                <li key={d.feature} className="flex justify-between text-emerald-950">
                  <span>{d.display_name}</span>
                  <span className="font-mono font-bold">{d.percentage_impact}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 flex justify-between items-center">
          <span>CardioLens CDSS v1.0 &bull; Automated Diagnostic Aid</span>
          <span>Requires physician review before clinical intervention</span>
        </div>
      </div>
    </Modal>
  );
};
