import React, { useState } from 'react';
import {
  FileText,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { TestResultItem, Patient } from '../types';

interface TestResultsViewProps {
  testResults: TestResultItem[];
  patient: Patient;
  onOpenNewTestResultModal: () => void;
  onUpdateAiSummary: (testId: string, newSummary: string) => void;
}

export const TestResultsView: React.FC<TestResultsViewProps> = ({
  testResults,
  patient,
  onOpenNewTestResultModal,
  onUpdateAiSummary,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(testResults[0]?.id || null);

  const categories = ['All', 'Cardiology', 'Metabolic', 'Blood Work'];

  const filteredResults = testResults.filter((tr) => {
    if (selectedCategory === 'All') return true;
    return tr.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Page Header: What this page is for, what to do, main action button */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Diagnostic Reports
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            My Test Results
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            <strong>What this page is for:</strong> See your medical test numbers explained in everyday words.
            <br />
            <strong>What you should do:</strong> Check if your result is within normal range and prepare questions for your doctor.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenNewTestResultModal}
            className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Test Result</span>
          </button>
        </div>
      </div>

      {/* 2. Mandatory Clear Safety Label (Doctor Should Check This) */}
      <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 flex items-start gap-3 text-xs sm:text-sm text-sky-950">
        <ShieldCheck className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-sky-900">Doctor Should Check This: </span>
          The test summaries here help you understand your numbers in simple words. They are NOT a medical diagnosis. Only a qualified doctor can diagnose health conditions and decide on treatments.
        </div>
      </div>

      {/* 3. Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Helpful Empty State (Requirement 12) */}
      {filteredResults.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-sky-50 text-sky-600 mx-auto flex items-center justify-center text-3xl">
            📋
          </div>
          <h2 className="text-xl font-bold text-slate-900">No test results have been added yet.</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            You can enter your blood test, cholesterol panel, or ECG numbers to see them explained in plain everyday English.
          </p>
          <button
            onClick={onOpenNewTestResultModal}
            className="px-6 py-3 bg-sky-600 text-white rounded-xl text-sm font-bold hover:bg-sky-700 shadow-xs"
          >
            Add Test Result
          </button>
        </div>
      ) : (
        /* Test Results Cards */
        <div className="space-y-4">
          {filteredResults.map((test) => {
            const isExpanded = expandedId === test.id;
            const hasOutsideRange = test.parameters.some((p) => p.flag === 'high' || p.flag === 'low');

            return (
              <div
                key={test.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-colors"
              >
                {/* Title Bar */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : test.id)}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer bg-white hover:bg-slate-50/70 transition-colors select-none"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 border border-sky-100 flex items-center justify-center text-xl shrink-0">
                      📄
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-base text-slate-900">{test.testName}</h2>
                        <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          Doctor Should Check This
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Report Date: {test.uploadedAt} · Category: {test.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {hasOutsideRange ? (
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        Outside standard range
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        All within standard range
                      </span>
                    )}
                    <button className="text-slate-400 p-1">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/50 space-y-6">
                    {/* Plain English AI Summary */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-sky-900 uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-sky-600" />
                        <span>Simple Explanation in Plain English</span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {test.aiSummary}
                      </p>
                    </div>

                    {/* Exact format from Requirement 8 */}
                    <div className="space-y-3">
                      <h3 className="font-bold text-sm text-slate-900">
                        Your Test Numbers & Reference Ranges
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {test.parameters.map((param, pIdx) => {
                          const isOutside = param.flag === 'high' || param.flag === 'low';
                          return (
                            <div
                              key={pIdx}
                              className={`p-4 rounded-xl border bg-white space-y-2 ${
                                isOutside ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-bold text-sm text-slate-900">
                                  {param.name}
                                </span>
                                {isOutside ? (
                                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                                    Outside Range
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                                    Normal Range
                                  </span>
                                )}
                              </div>

                              {/* Exact structure: Test, Your Result, Reference Range */}
                              <div className="text-xs space-y-1 text-slate-600 bg-slate-50 p-2.5 rounded-lg font-mono">
                                <div>
                                  <span className="text-slate-500 font-sans">Your Result: </span>
                                  <strong className="text-slate-900 text-sm">{param.value} {param.unit}</strong>
                                </div>
                                <div>
                                  <span className="text-slate-500 font-sans">Reference Range: </span>
                                  <span className="text-slate-700">{param.referenceRange}</span>
                                </div>
                              </div>

                              {/* Simple explanation */}
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {isOutside
                                  ? 'Your result is outside the provided reference range. Please discuss it with your doctor.'
                                  : 'Your result is within the provided reference range.'}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* "Ask your doctor about this result" (Requirement 8) */}
                    {test.questionsForDoctor && test.questionsForDoctor.length > 0 && (
                      <div className="bg-sky-50/70 p-5 rounded-xl border border-sky-200 space-y-2.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-sky-950 uppercase tracking-wider">
                          <HelpCircle className="w-4 h-4 text-sky-700" />
                          <span>Ask your doctor about this result</span>
                        </div>
                        <p className="text-xs text-slate-600">
                          You can write down or mention these simple questions during your next visit:
                        </p>
                        <ul className="space-y-1.5 pt-1">
                          {test.questionsForDoctor.map((q, qIdx) => (
                            <li key={qIdx} className="text-xs sm:text-sm text-slate-800 flex items-start gap-2">
                              <span className="text-sky-600 font-bold">•</span>
                              <span>{q}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
