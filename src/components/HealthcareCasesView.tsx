import React, { useState } from 'react';
import {
  FolderHeart,
  Plus,
  Calendar,
  User,
  TestTube2,
  Pill,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import {
  HealthcareCase,
  Patient,
  ActiveTab,
  SimpleTimelineStatus,
  HealthTimelineStep,
} from '../types';

interface HealthcareCasesViewProps {
  cases: HealthcareCase[];
  patient: Patient;
  onOpenNewCaseModal: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const HealthcareCasesView: React.FC<HealthcareCasesViewProps> = ({
  cases,
  patient,
  onOpenNewCaseModal,
  setActiveTab,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Completed'>('All');

  const filteredCases = cases.filter((c) => {
    if (statusFilter === 'Active') return c.caseStatus !== 'Case Closed';
    if (statusFilter === 'Completed') return c.caseStatus === 'Case Closed';
    return true;
  });

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || filteredCases[0] || cases[0];

  // Build the 7-step simple timeline for the selected case
  const getTimelineSteps = (c: HealthcareCase): HealthTimelineStep[] => {
    const steps: HealthTimelineStep[] = [];

    // Step 1: Health problem reported
    steps.push({
      stepNumber: 1,
      title: 'Health problem reported',
      description: `Reported symptoms: ${c.symptoms.join(', ')}`,
      status: 'Completed',
      date: c.createdAt,
    });

    // Step 2: Doctor selected
    if (c.doctorId && c.doctorName) {
      steps.push({
        stepNumber: 2,
        title: 'Doctor selected',
        description: `${c.doctorName} · ${c.doctorSpecialty}`,
        status: 'Completed',
      });
    } else {
      steps.push({
        stepNumber: 2,
        title: 'Doctor selected',
        description: 'Choose a doctor for an in-person or phone visit',
        status: 'Not Started',
      });
    }

    // Step 3: Visit booked
    if (c.appointmentDate) {
      const isPast = c.appointmentDate.includes('Completed') || c.caseStatus === 'Case Closed';
      steps.push({
        stepNumber: 3,
        title: 'Visit booked',
        description: c.appointmentDate,
        status: isPast ? 'Completed' : 'Booked',
      });
    } else {
      steps.push({
        stepNumber: 3,
        title: 'Visit booked',
        description: 'Choose a date and time slot with your doctor',
        status: 'Waiting',
      });
    }

    // Step 4: Tests completed
    if (c.testsRecommended.length > 0) {
      const allTested = c.testResults.length >= c.testsRecommended.length;
      steps.push({
        stepNumber: 4,
        title: 'Tests completed',
        description: `${c.testResults.length} of ${c.testsRecommended.length} recommended tests done`,
        status: allTested ? 'Completed' : 'Waiting',
      });
    }

    // Step 5: Results received
    if (c.testResults.length > 0) {
      const analyzed = c.testResults.every((t) => t.status !== 'Pending');
      steps.push({
        stepNumber: 5,
        title: 'Results received',
        description: analyzed
          ? 'All test values received and summarized'
          : 'Waiting for lab report upload',
        status: analyzed ? 'Completed' : 'Waiting',
      });
    }

    // Step 6: Doctor review
    if (c.caseStatus === 'Case Closed' || c.treatmentStatus === 'Clinician Approved & Finalized') {
      steps.push({
        stepNumber: 6,
        title: 'Doctor review',
        description: `Reviewed and approved by ${c.doctorName}`,
        status: 'Completed',
      });
    } else if (c.caseStatus === 'Awaiting Clinician Review' || c.treatmentStatus.includes('Prescription Formulated')) {
      steps.push({
        stepNumber: 6,
        title: 'Doctor review',
        description: 'Doctor is reviewing results and finalizing your care plan',
        status: 'Doctor Review',
      });
    } else {
      steps.push({
        stepNumber: 6,
        title: 'Doctor review',
        description: 'Will take place during or right after your appointment',
        status: 'Waiting',
      });
    }

    // Step 7: Treatment / follow-up
    if (c.caseStatus === 'Case Closed') {
      steps.push({
        stepNumber: 7,
        title: 'Treatment / follow-up',
        description: 'Care plan finalized. Routine follow-up scheduled.',
        status: 'Completed',
      });
    } else if (c.prescriptions.length > 0) {
      steps.push({
        stepNumber: 7,
        title: 'Treatment / follow-up',
        description: `${c.prescriptions.length} medicine(s) formulated. Doctor should sign off.`,
        status: 'Follow-up Needed',
      });
    } else {
      steps.push({
        stepNumber: 7,
        title: 'Treatment / follow-up',
        description: 'Awaiting doctor recommendations after visit',
        status: 'Not Started',
      });
    }

    return steps;
  };

  const getStatusBadge = (status: SimpleTimelineStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Completed</span>
          </span>
        );
      case 'Booked':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full">
            <Calendar className="w-3 h-3 text-sky-600" />
            <span>Booked</span>
          </span>
        );
      case 'Doctor Review':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">
            <Stethoscope className="w-3 h-3 text-purple-600" />
            <span>Doctor Review</span>
          </span>
        );
      case 'Follow-up Needed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            <span>Follow-up Needed</span>
          </span>
        );
      case 'Waiting':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Waiting</span>
          </span>
        );
      case 'Not Started':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            <span>Not Started</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header: What this page is for, what user should do, main action button */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Case Tracking
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            My Health Case
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            <strong>What this page is for:</strong> Follow your care journey step-by-step from your first symptom to recovery.
            <br />
            <strong>What you should do:</strong> Check your current step and see what happens next.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenNewCaseModal}
            className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Start New Health Case</span>
          </button>
        </div>
      </div>

      {/* Helpful Empty State if no cases (Requirement 12) */}
      {cases.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-sky-50 text-sky-600 mx-auto flex items-center justify-center text-3xl">
            🩺
          </div>
          <h2 className="text-xl font-bold text-slate-900">You don't have an active health case.</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Tell the Health Assistant what you are feeling to start an organized care journey with doctor recommendations and test planning.
          </p>
          <button
            onClick={() => setActiveTab('assistant')}
            className="px-6 py-3 bg-sky-600 text-white rounded-xl text-sm font-bold hover:bg-sky-700 shadow-xs"
          >
            Start Health Assistant
          </button>
        </div>
      ) : (
        /* Case Selector & Case Timeline Details */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side: Case list (4 columns) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
              <span>Your Health Cases</span>
              <div className="flex gap-1">
                {(['All', 'Active', 'Completed'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                      statusFilter === filter
                        ? 'bg-sky-100 text-sky-800 font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredCases.map((c) => {
                const isSelected = selectedCase?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCaseId(c.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-sky-50 border-2 border-sky-400 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-sky-800">{c.id}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          c.caseStatus === 'Case Closed'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {c.caseStatus === 'Case Closed' ? 'Completed' : 'In Progress'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                      {c.title}
                    </h3>

                    <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                      <span>{c.doctorName}</span>
                      <span className="font-semibold text-slate-700">₹{c.estimatedCost.total * 7} (or ${c.estimatedCost.total})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side: Simple 7-step timeline (8 columns) (Requirement 5) */}
          {selectedCase && (
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
              {/* Case Title Header */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded">
                    Case ID: {selectedCase.id}
                  </div>
                  <div className="text-xs text-slate-500">
                    Started on {selectedCase.createdAt}
                  </div>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-2">
                  {selectedCase.title}
                </h2>
                <div className="text-xs text-slate-600 mt-1 flex flex-wrap gap-4">
                  <span>Doctor: <strong>{selectedCase.doctorName}</strong></span>
                  <span>Department: <strong>{selectedCase.doctorSpecialty}</strong></span>
                </div>
              </div>

              {/* Simple Health Case Timeline (Requirement 5) */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Your Care Journey Timeline</h3>
                    <p className="text-xs text-slate-500">Simple 7-step roadmap of what has happened and what comes next</p>
                  </div>
                  <span className="text-xs font-semibold text-sky-700">
                    {selectedCase.caseStatus}
                  </span>
                </div>

                <div className="space-y-4 relative before:absolute before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                  {getTimelineSteps(selectedCase).map((step) => {
                    const isCompleted = step.status === 'Completed';
                    const isCurrent = step.status === 'Booked' || step.status === 'Doctor Review' || step.status === 'Follow-up Needed';

                    return (
                      <div key={step.stepNumber} className="relative flex items-start gap-4">
                        {/* Step Icon circle */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : isCurrent
                              ? 'bg-sky-600 text-white ring-4 ring-sky-100'
                              : 'bg-slate-100 text-slate-500 border border-slate-300'
                          }`}
                        >
                          {isCompleted ? '✓' : step.stepNumber}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1 bg-slate-50/80 rounded-xl p-4 border border-slate-200">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                            <span className="font-bold text-sm text-slate-900">
                              Step {step.stepNumber}: {step.title}
                            </span>
                            {getStatusBadge(step.status)}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Prescriptions & Doctor Review note */}
              {selectedCase.prescriptions.length > 0 && (
                <div className="p-4 bg-violet-50/70 border border-violet-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-violet-900 uppercase tracking-wider">
                      <Pill className="w-4 h-4 text-violet-600" />
                      <span>Doctor’s Prescription</span>
                    </div>
                    <span className="text-[11px] font-semibold text-violet-800 bg-violet-100 px-2 py-0.5 rounded">
                      Doctor Should Check This
                    </span>
                  </div>
                  {selectedCase.prescriptions.map((rx) => (
                    <div key={rx.id} className="text-xs text-slate-800 bg-white p-3 rounded-lg border border-violet-100">
                      <div className="font-bold text-slate-900">{rx.medication} ({rx.dosage})</div>
                      <div className="text-slate-600">{rx.frequency} · {rx.instructions}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setActiveTab('appointments')}
                  className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Check Booked Visit
                </button>
                <button
                  onClick={() => setActiveTab('tests')}
                  className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
                >
                  View Test Results
                </button>
                <button
                  onClick={() => setActiveTab('costs')}
                  className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
                >
                  Check Expected Cost
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
