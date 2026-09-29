import React, { useState } from 'react';
import {
  Pill,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  ArrowRight,
  Search,
  AlertCircle,
} from 'lucide-react';
import { Patient, HealthcareCase, ActiveTab } from '../types';
import { COMMON_MEDICINES, CommonMedicineInfo } from '../data/mockData';

interface MedicinesViewProps {
  patient: Patient;
  cases: HealthcareCase[];
  setActiveTab: (tab: ActiveTab) => void;
}

export const MedicinesView: React.FC<MedicinesViewProps> = ({
  patient,
  cases,
  setActiveTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Collect all prescriptions from patient cases
  const allPrescriptions = cases.flatMap((c) =>
    c.prescriptions.map((p) => ({ ...p, caseTitle: c.title, doctorName: c.doctorName }))
  );

  const filteredMedicines = COMMON_MEDICINES.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.brandExample.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.whatItDoes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Page Header: What this page is for, what to do, main action button */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pharmacy & Prescriptions
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Medicines
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            <strong>What this page is for:</strong> View your doctor’s prescriptions and learn how to take your medicines safely.
            <br />
            <strong>What you should do:</strong> Check your dose instructions and explore affordable generic options.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('assistant')}
            className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask Assistant About Medicines</span>
          </button>
        </div>
      </div>

      {/* Mandatory Safety Notice */}
      <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 flex items-start gap-3 text-xs sm:text-sm text-sky-950">
        <ShieldCheck className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-sky-900">Doctor Should Check This: </span>
          AI does not independently prescribe medications. All prescriptions displayed must be authorized and signed by a licensed doctor. Always take medicines exactly as your doctor instructs.
        </div>
      </div>

      {/* 2. Your Doctor's Prescriptions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Doctor’s Prescriptions</h2>
            <p className="text-xs text-slate-500">Medicines prescribed for your active health cases</p>
          </div>
        </div>

        {allPrescriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allPrescriptions.map((rx) => {
              const isApproved = rx.status === 'Clinician Approved';
              return (
                <div
                  key={rx.id}
                  className="p-5 rounded-2xl border border-violet-200 bg-violet-50/40 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{rx.medication}</h3>
                      <div className="text-xs text-slate-500">
                        Prescribed by {rx.doctorName}
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isApproved ? 'Approved by Doctor' : 'Doctor Should Check This'}
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-violet-100 space-y-1.5 text-xs text-slate-700">
                    <div>
                      <span className="font-semibold text-slate-900">Dose & Strength: </span>
                      {rx.dosage}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">When to take: </span>
                      {rx.frequency}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">Duration: </span>
                      {rx.duration}
                    </div>
                    <div className="pt-1 text-slate-600">
                      <strong className="text-slate-900">Instructions: </strong>
                      {rx.instructions}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
            <p className="text-sm text-slate-600">You don’t have any active prescriptions yet.</p>
            <p className="text-xs text-slate-500">
              When your doctor recommends a treatment, your prescription and dosage guide will appear here.
            </p>
          </div>
        )}
      </div>

      {/* 3. Simple Guide on Generic vs Brand Medicines */}
      <div className="p-5 bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-2xl flex items-start gap-3.5">
        <Info className="w-6 h-6 text-sky-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-slate-900">
            What is a Generic Medicine?
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            Generic medicines contain the <strong>exact same active ingredient</strong> and work in the exact same way as expensive brand names. They meet the same strict safety and quality standards, but usually cost <strong>50% to 80% less</strong>. You can ask your doctor or pharmacist: <em>"Is there an affordable generic option for my medicine?"</em>
          </p>
        </div>
      </div>

      {/* 4. Common Medicines Guide with Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Common Medicines & What They Do</h2>
            <p className="text-xs text-slate-500">Simple guide to common heart, blood pressure, and wellness medicines</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search medicines (e.g. Lipitor, Sugar)..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMedicines.map((med, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{med.name}</h3>
                  <div className="text-xs text-slate-500">
                    Brand Example: <strong>{med.brandExample}</strong>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-violet-800 bg-violet-50 border border-violet-200 px-2.5 py-0.5 rounded-full shrink-0">
                  Generic Available
                </span>
              </div>

              <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <strong className="text-slate-900">What it does: </strong>
                {med.whatItDoes}
              </div>

              <div className="text-xs text-slate-700 bg-sky-50/60 p-3 rounded-xl border border-sky-100">
                <strong className="text-sky-950">How to take: </strong>
                {med.howToTake}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Typical 90-day supply:</span>
                <span className="font-bold text-slate-900 font-mono">
                  ₹{med.typicalCostInr} (or ${med.typicalCostUsd})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
