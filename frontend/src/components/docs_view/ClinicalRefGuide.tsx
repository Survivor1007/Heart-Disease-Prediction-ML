import React from 'react';
import { BookOpen, ShieldCheck, HeartPulse, Activity } from 'lucide-react';
import { Card } from '../common/Card';

export const ClinicalRefGuide: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
          <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Clinical Reference & Diagnostic Thresholds
          </h3>
        </div>

        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            CardioLens employs a multi-model ensemble (XGBoost, Random Forest, Logistic Regression) calibrated with Platt Scaling to estimate true statistical risk of angiographic coronary artery disease ($\ge 50\%$ luminal narrowing).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 text-sm block mb-1">
                Low Risk (&lt; 35%)
              </span>
              <p className="text-[11px] text-emerald-900/80 dark:text-emerald-300/80">
                Low likelihood of hemodynamically significant coronary obstruction. Lifestyle modification and routine primary prevention recommended.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <span className="font-bold text-amber-800 dark:text-amber-300 text-sm block mb-1">
                Moderate Risk (35% - 65%)
              </span>
              <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80">
                Intermediate ischemic probability. Secondary lab workup (coronary calcium scoring, CT angiography, stress echocardiography) advised.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
              <span className="font-bold text-rose-800 dark:text-rose-300 text-sm block mb-1">
                High Risk (&gt; 65%)
              </span>
              <p className="text-[11px] text-rose-900/80 dark:text-rose-300/80">
                High pre-test probability of significant obstructive coronary disease. Urgent cardiology consultation and invasive evaluation indicated.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
          Dynamic Missing Data Imputation (MICE / KNN)
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          To accommodate fast triage environments where advanced tests (such as thallium perfusion scans or fluoroscopy) have not yet been performed, the system dynamically estimates missing secondary values using a trained KNN imputer. Every missing field is highlighted in the certainty audit log.
        </p>
      </Card>
    </div>
  );
};
