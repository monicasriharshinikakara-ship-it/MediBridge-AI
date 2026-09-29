import React, { useState } from 'react';
import {
  TestTube2,
  Plus,
  Sparkles,
  Info,
  Clock,
  Coins,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Search,
} from 'lucide-react';
import { Patient, HealthcareCase, ActiveTab } from '../types';
import { COMMON_MEDICAL_TESTS, CommonMedicalTest } from '../data/mockData';

interface MedicalTestsViewProps {
  patient: Patient;
  cases: HealthcareCase[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenTestResultModal: () => void;
}

export const MedicalTestsView: React.FC<MedicalTestsViewProps> = ({
  patient,
  cases,
  setActiveTab,
  onOpenTestResultModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  const activeCase = cases.find((c) => c.caseStatus !== 'Case Closed') || cases[0];
  const recommendedTests = activeCase?.testsRecommended || [];

  const filteredTests = COMMON_MEDICAL_TESTS.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.simpleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Page Header: What this page is for, what to do, main action button */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Test Guide
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Medical Tests
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            <strong>What this page is for:</strong> Understand the medical tests your doctor may recommend.
            <br />
            <strong>What you should do:</strong> Learn what each test does, how to prepare, and estimated costs.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('assistant')}
            className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask Assistant About Tests</span>
          </button>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 flex items-start gap-3 text-xs sm:text-sm text-sky-950">
        <ShieldCheck className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-sky-900">Doctor Should Check This: </span>
          Only a qualified doctor can order diagnostic tests for your specific health needs. Always follow the preparation instructions given by your clinic.
        </div>
      </div>

      {/* 2. Recommended Tests for Your Active Health Case */}
      {recommendedTests.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-sky-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                Recommended For You
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Tests for {activeCase?.title}
              </h2>
            </div>
            <button
              onClick={onOpenTestResultModal}
              className="text-xs text-sky-700 font-bold hover:underline"
            >
              + Upload Test Result
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {recommendedTests.map((testName, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-sky-200 bg-sky-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-900">
                    <TestTube2 className="w-4 h-4 text-sky-600" />
                    <span>{testName}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Recommended by {activeCase?.doctorName} to evaluate your symptoms.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-sky-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Status: Waiting</span>
                  <button
                    onClick={onOpenTestResultModal}
                    className="text-sky-700 font-bold hover:underline"
                  >
                    Add Result →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Common Medical Tests Catalog with Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Common Medical Tests & How to Prepare</h2>
            <p className="text-xs text-slate-500">Clear explanations of everyday lab tests and imaging</p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tests (e.g. Sugar, ECG)..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{test.simpleName}</h3>
                  <div className="text-xs font-medium text-slate-500 font-mono">
                    Medical Name: {test.name}
                  </div>
                </div>
                <span className="text-[11px] font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full shrink-0">
                  {test.department}
                </span>
              </div>

              <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                <strong className="text-slate-900">What it is for: </strong>
                {test.whatItIsFor}
              </div>

              <div className="text-xs text-emerald-800 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                <strong className="text-emerald-950">How to prepare: </strong>
                {test.howToPrepare}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Typical test cost:</span>
                <span className="font-bold text-slate-900 font-mono">
                  ₹{test.typicalCostInr} (or ${test.typicalCostUsd})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
