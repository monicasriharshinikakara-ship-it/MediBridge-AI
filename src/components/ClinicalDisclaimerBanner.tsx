import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const ClinicalDisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-sky-900 text-sky-100 text-xs px-4 py-2.5 border-b border-sky-800">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sky-300 shrink-0" />
          <span className="font-semibold text-white">Student Prototype:</span>
          <span>
            MediBridge AI helps you organize your doctor visits and health records.
            <strong className="text-white ml-1 font-semibold">AI does not diagnose health problems or prescribe medicines. A doctor should always check your health in person.</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 text-sky-200 shrink-0 text-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
          <span>Medical Emergency? Call <strong>911 / 112 / 108</strong> or go to the nearest emergency hospital.</span>
        </div>
      </div>
    </div>
  );
};
