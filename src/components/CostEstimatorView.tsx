import React, { useState } from 'react';
import {
  Coins,
  ShieldCheck,
  CheckCircle2,
  Info,
  Package,
  Layers,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { Patient } from '../types';
import { PROCEDURE_PACKAGES } from '../data/mockData';

interface CostEstimatorViewProps {
  patient: Patient;
}

export const CostEstimatorView: React.FC<CostEstimatorViewProps> = ({ patient }) => {
  // Preset package selection or custom
  const [selectedPackageId, setSelectedPackageId] = useState<string>('PKG-CARDIO');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [hasInsurance, setHasInsurance] = useState<boolean>(true);
  const [insuranceCoverPercentage, setInsuranceCoverPercentage] = useState<number>(80);

  const currentPackage =
    PROCEDURE_PACKAGES.find((p) => p.id === selectedPackageId) || PROCEDURE_PACKAGES[0];

  // Currency multiplier or direct demo values from mockData
  const isINR = currency === 'INR';
  const currencySymbol = isINR ? '₹' : '$';

  // Exact categories specified by user prompt
  const doctorVisitCost = isINR ? currentPackage.consultationInr : currentPackage.consultation;
  const medicalTestsCost = isINR ? currentPackage.testsInr : currentPackage.tests;
  const medicinesCost = isINR ? currentPackage.medicinesInr : currentPackage.medicines;
  const treatmentCost = isINR ? currentPackage.treatmentInr : currentPackage.treatment;
  const hospitalRoomCost = isINR ? currentPackage.roomInr : currentPackage.room;

  const totalCost =
    doctorVisitCost + medicalTestsCost + medicinesCost + treatmentCost + hospitalRoomCost;

  const insurancePays = hasInsurance
    ? Math.round((totalCost * insuranceCoverPercentage) / 100)
    : 0;
  const youPay = Math.max(0, totalCost - insurancePays);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Page Header: What this page is for, what to do, main action button */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Price Transparency
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Expected Cost
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            <strong>What this page is for:</strong> Know your expected medical costs before your doctor visit.
            <br />
            <strong>What you should do:</strong> Choose a common health package or check what you might pay after insurance.
          </p>
        </div>

        {/* Currency Switcher & Quick Action */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setCurrency('INR')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                isINR ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ₹ INR
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                !isINR ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              $ USD
            </button>
          </div>
        </div>
      </div>

      {/* 2. Choose a Health Package */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Choose a common checkup package:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {PROCEDURE_PACKAGES.map((pkg) => {
            const isSelected = selectedPackageId === pkg.id;
            const pkgTotal = isINR ? pkg.totalInr : pkg.totalUsd;
            return (
              <div
                key={pkg.id}
                onClick={() => setSelectedPackageId(pkg.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-sky-50 border-2 border-sky-400 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-slate-900">{pkg.name}</span>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{pkg.description}</p>
                </div>
                <div className="pt-3 border-t border-slate-200 mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Estimated Total:</span>
                  <span className="font-bold text-base text-slate-900 font-mono">
                    {currencySymbol}{pkgTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. The Main Expected Cost Card (Exact format from Requirement 7) */}
      <div className="bg-white rounded-2xl border-2 border-sky-200 p-6 sm:p-8 shadow-xs max-w-2xl mx-auto space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
            Clear Breakdown for {currentPackage.name}
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Expected Cost</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Prices for your doctor visit, recommended tests, and basic treatment
          </p>
        </div>

        {/* The 5 Key Categories */}
        <div className="space-y-3.5 text-base font-medium text-slate-800">
          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span>Doctor Visit:</span>
            <span className="font-bold font-mono text-slate-900">
              {currencySymbol}{doctorVisitCost.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span>Medical Tests:</span>
            <span className="font-bold font-mono text-slate-900">
              {currencySymbol}{medicalTestsCost.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span>Medicines:</span>
            <span className="font-bold font-mono text-slate-900">
              {currencySymbol}{medicinesCost.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span>Treatment / Procedure:</span>
            <span className="font-bold font-mono text-slate-900">
              {currencySymbol}{treatmentCost.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span>Hospital/Room:</span>
            <span className="font-bold font-mono text-slate-900">
              {currencySymbol}{hospitalRoomCost.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Total Expected Cost */}
        <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 flex items-center justify-between">
          <span className="text-lg font-bold text-sky-950">Total Expected Cost:</span>
          <span className="text-2xl font-extrabold text-sky-900 font-mono">
            {currencySymbol}{totalCost.toLocaleString()}
          </span>
        </div>

        {/* Requirement 7 Mandatory Note */}
        <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 text-center font-medium">
          "This is only an estimate. The final cost may be different."
        </div>

        {/* Optional Insurance Slider */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Do you have health insurance? ({patient.insuranceProvider})
            </span>
            <button
              onClick={() => setHasInsurance(!hasInsurance)}
              className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                hasInsurance ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {hasInsurance ? 'Yes, Covered' : 'No Insurance'}
            </button>
          </div>

          {hasInsurance && (
            <div className="bg-slate-50 p-4 rounded-xl space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Typical Insurance Coverage:</span>
                <span className="font-bold text-slate-900 font-mono">{insuranceCoverPercentage}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={insuranceCoverPercentage}
                onChange={(e) => setInsuranceCoverPercentage(parseInt(e.target.value, 10))}
                className="w-full accent-sky-600"
              />
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                <div>
                  <span className="text-slate-500">Insurance Pays:</span>
                  <div className="font-bold text-emerald-700 text-sm font-mono">
                    {currencySymbol}{insurancePays.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">You Pay:</span>
                  <div className="font-bold text-slate-900 text-sm font-mono">
                    {currencySymbol}{youPay.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
