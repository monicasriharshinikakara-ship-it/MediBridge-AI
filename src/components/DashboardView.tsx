import React from 'react';
import {
  Stethoscope,
  Calendar,
  TestTube2,
  Pill,
  Coins,
  ArrowRight,
  AlertTriangle,
  FolderHeart,
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import {
  Patient,
  Doctor,
  Appointment,
  HealthcareCase,
  TestResultItem,
  ActiveTab,
} from '../types';

interface DashboardViewProps {
  patient: Patient;
  doctors: Doctor[];
  appointments: Appointment[];
  cases: HealthcareCase[];
  testResults: TestResultItem[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenBookingModal: (doctor?: Doctor) => void;
  onOpenNewCaseModal: () => void;
  onOpenTestResultModal: () => void;
  onSelectPrompt: (promptText: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  patient,
  doctors,
  appointments,
  cases,
  testResults,
  setActiveTab,
  onOpenBookingModal,
  onOpenNewCaseModal,
  onOpenTestResultModal,
  onSelectPrompt,
}) => {
  const activeCase = cases.find((c) => c.caseStatus !== 'Case Closed') || cases[0];
  const upcomingAppointment = appointments.find(
    (a) => a.status === 'Confirmed' || a.status === 'Scheduled'
  );

  // Compute "Your Next Step" in simple words
  const getNextStepInfo = () => {
    if (!activeCase) {
      return {
        title: 'Tell us how you are feeling',
        description: 'Start with the Health Assistant to get guidance on what doctor or tests you might need.',
        buttonLabel: 'Start Health Assistant',
        action: () => setActiveTab('assistant'),
        color: 'sky',
      };
    }

    if (activeCase.caseStatus === 'Active Triage') {
      return {
        title: 'Book a doctor visit',
        description: `We recommend booking a visit with a specialist like ${activeCase.doctorName || 'a certified doctor'} to evaluate your symptoms.`,
        buttonLabel: 'Book a Doctor Visit',
        action: () => {
          const doc = doctors.find((d) => d.id === activeCase.doctorId);
          onOpenBookingModal(doc);
        },
        color: 'emerald',
      };
    }

    if (activeCase.caseStatus === 'Appointment Scheduled') {
      const hasPendingResults = activeCase.testResults.some((t) => t.status === 'Pending');
      if (hasPendingResults) {
        return {
          title: 'Upload or complete your test result',
          description: 'You have medical tests pending. Once you receive your lab report, add it here for your doctor.',
          buttonLabel: 'Add Test Result',
          action: () => onOpenTestResultModal(),
          color: 'indigo',
        };
      }
      return {
        title: 'Check your upcoming visit',
        description: `Your doctor visit is scheduled for ${activeCase.appointmentDate || 'an upcoming date'}. Please arrive 10 minutes early.`,
        buttonLabel: 'Check My Visit',
        action: () => setActiveTab('appointments'),
        color: 'sky',
      };
    }

    if (activeCase.caseStatus === 'Diagnostics In-Progress' || activeCase.caseStatus === 'Awaiting Clinician Review') {
      return {
        title: 'Wait for doctor review',
        description: 'Your test results have been received. Your doctor is currently reviewing the values to prepare your care plan.',
        buttonLabel: 'View Test Results',
        action: () => setActiveTab('tests'),
        color: 'amber',
      };
    }

    if (activeCase.caseStatus === 'Treatment Formulated') {
      return {
        title: 'Check your doctor’s prescription',
        description: 'Your doctor has formulated your care steps and medicines. Review the instructions and how to take them.',
        buttonLabel: 'Check Medicines',
        action: () => setActiveTab('medicines'),
        color: 'violet',
      };
    }

    return {
      title: 'No action needed right now',
      description: 'Your recent health case is completed. You can check your health records or book a routine checkup anytime.',
      buttonLabel: 'View Health Records',
      action: () => setActiveTab('profile'),
      color: 'slate',
    };
  };

  const nextStep = getNextStepInfo();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Page Purpose Banner with Emergency Alert */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Welcome to Your Health Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Hello, {patient.name}
            </h1>
            <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
              MediBridge AI helps you talk to doctors, book visits, understand test results, and check expected costs in simple everyday words.
            </p>

            {/* What are you feeling pills */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-slate-500 font-medium">What are you feeling:</span>
              {patient.currentSymptoms.map((symptom, idx) => (
                <span
                  key={idx}
                  className="bg-sky-50 text-sky-900 px-3 py-1 rounded-full text-xs font-semibold border border-sky-200"
                >
                  {symptom}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Assistant Callout */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('assistant')}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask Health Assistant</span>
            </button>
            <button
              onClick={() => onOpenBookingModal()}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 text-sm font-medium rounded-xl border border-slate-300 transition-colors"
            >
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Book a Doctor Visit</span>
            </button>
          </div>
        </div>

        {/* Small Emergency Warning Notice */}
        <div className="mt-5 p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3 text-xs sm:text-sm text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Need urgent medical help? </span>
            If you have sudden chest pain, trouble breathing, or sudden numbness, please call emergency services immediately (911 / 112 / 108) or go to the nearest hospital.
          </div>
        </div>
      </div>

      {/* 2. "Your Next Step" Card (Requirement 6) */}
      <div className="bg-gradient-to-r from-sky-50 to-indigo-50/40 rounded-2xl border-2 border-sky-300 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-600 text-white rounded-md text-xs font-bold uppercase tracking-wider">
              <span>Your Next Step</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 pt-1">
              {nextStep.title}
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl">
              {nextStep.description}
            </p>
          </div>

          <button
            onClick={nextStep.action}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-xl shadow-xs transition-colors shrink-0"
          >
            <span>{nextStep.buttonLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. "What do you need help with?" Section (Requirement 4) */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">What do you need help with?</h2>
          <p className="text-xs text-slate-500">Pick any option below to get started quickly</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Talk to a Doctor */}
          <button
            onClick={() => setActiveTab('doctors')}
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-sky-400 hover:shadow-sm text-left transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center text-xl mb-3 group-hover:scale-105 transition-transform">
                🩺
              </div>
              <div className="font-bold text-sm text-slate-900 group-hover:text-sky-700">
                Talk to a Doctor
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Find a specialist doctor for your problem
              </p>
            </div>
            <div className="text-xs text-sky-700 font-semibold mt-3 flex items-center gap-1">
              <span>Find Doctor</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Book a Visit */}
          <button
            onClick={() => setActiveTab('appointments')}
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 hover:shadow-sm text-left transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-3 group-hover:scale-105 transition-transform">
                📅
              </div>
              <div className="font-bold text-sm text-slate-900 group-hover:text-emerald-700">
                Book a Visit
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Choose a time for in-person or phone visit
              </p>
            </div>
            <div className="text-xs text-emerald-700 font-semibold mt-3 flex items-center gap-1">
              <span>Check Times</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Check Medical Tests */}
          <button
            onClick={() => setActiveTab('medical_tests')}
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-sm text-left transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-3 group-hover:scale-105 transition-transform">
                🧪
              </div>
              <div className="font-bold text-sm text-slate-900 group-hover:text-indigo-700">
                Check Medical Tests
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Learn what tests do and how to prepare
              </p>
            </div>
            <div className="text-xs text-indigo-700 font-semibold mt-3 flex items-center gap-1">
              <span>View Tests</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Medicine Information */}
          <button
            onClick={() => setActiveTab('medicines')}
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-violet-400 hover:shadow-sm text-left transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center text-xl mb-3 group-hover:scale-105 transition-transform">
                💊
              </div>
              <div className="font-bold text-sm text-slate-900 group-hover:text-violet-700">
                Medicine Information
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Check doses and affordable generic options
              </p>
            </div>
            <div className="text-xs text-violet-700 font-semibold mt-3 flex items-center gap-1">
              <span>Check Medicines</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Check Expected Cost */}
          <button
            onClick={() => setActiveTab('costs')}
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-amber-400 hover:shadow-sm text-left transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xl mb-3 group-hover:scale-105 transition-transform">
                💰
              </div>
              <div className="font-bold text-sm text-slate-900 group-hover:text-amber-700">
                Check Expected Cost
              </div>
              <p className="text-xs text-slate-500 mt-1">
                See transparent price estimates before care
              </p>
            </div>
            <div className="text-xs text-amber-700 font-semibold mt-3 flex items-center gap-1">
              <span>See Cost</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* 4. Two Main Status Panels: Upcoming Visits + My Health Case */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Booked Doctor Visit */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Your Doctor Visits</h3>
              </div>
              <button
                onClick={() => setActiveTab('appointments')}
                className="text-xs text-sky-700 font-semibold hover:underline"
              >
                View all visits →
              </button>
            </div>

            {upcomingAppointment ? (
              <div className="mt-4 p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                    {upcomingAppointment.status}
                  </span>
                  <span className="font-semibold text-slate-600">{upcomingAppointment.mode}</span>
                </div>
                <div className="text-base font-bold text-slate-900">
                  {upcomingAppointment.doctorName}
                </div>
                <div className="text-xs text-slate-600">
                  Department: {upcomingAppointment.specialization}
                </div>
                <div className="text-xs text-slate-800 font-medium pt-1">
                  📅 Date: <strong>{upcomingAppointment.date}</strong> at <strong>{upcomingAppointment.timeSlot}</strong>
                </div>
                <div className="text-xs text-slate-500 pt-1">
                  Reason: {upcomingAppointment.chiefComplaint}
                </div>
              </div>
            ) : (
              // Helpful Empty State (Requirement 12)
              <div className="mt-4 p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                <p className="text-sm text-slate-600">You don't have any doctor visits booked yet.</p>
                <button
                  onClick={() => setActiveTab('doctors')}
                  className="px-4 py-2 bg-sky-600 text-white text-xs font-semibold rounded-lg hover:bg-sky-700"
                >
                  Find a Doctor
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Need to see someone sooner?</span>
            <button
              onClick={() => onOpenBookingModal()}
              className="text-xs text-sky-700 font-semibold hover:underline"
            >
              + Book Another Visit
            </button>
          </div>
        </div>

        {/* My Health Case Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FolderHeart className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-base">My Health Case</h3>
              </div>
              <button
                onClick={() => setActiveTab('cases')}
                className="text-xs text-sky-700 font-semibold hover:underline"
              >
                View case timeline →
              </button>
            </div>

            {activeCase ? (
              <div className="mt-4 p-4 bg-sky-50/70 border border-sky-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-sky-800">{activeCase.id}</span>
                  <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-semibold text-[11px]">
                    {activeCase.caseStatus}
                  </span>
                </div>
                <div className="text-base font-bold text-slate-900">{activeCase.title}</div>
                <div className="text-xs text-slate-600">
                  Doctor: <strong>{activeCase.doctorName}</strong> ({activeCase.doctorSpecialty})
                </div>
                <div className="text-xs text-slate-600">
                  Recommended Tests: {activeCase.testsRecommended.length} tests listed
                </div>
                <div className="text-xs text-slate-500 line-clamp-2 pt-1">
                  Summary: {activeCase.aiTriageNotes}
                </div>
              </div>
            ) : (
              // Helpful Empty State (Requirement 12)
              <div className="mt-4 p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                <p className="text-sm text-slate-600">You don't have an active health case.</p>
                <button
                  onClick={() => setActiveTab('assistant')}
                  className="px-4 py-2 bg-sky-600 text-white text-xs font-semibold rounded-lg hover:bg-sky-700"
                >
                  Start Health Assistant
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Track all 7 steps of your care</span>
            <button
              onClick={() => setActiveTab('cases')}
              className="text-xs text-sky-700 font-semibold hover:underline"
            >
              Open Health Case →
            </button>
          </div>
        </div>
      </div>

      {/* 5. Recent Test Results Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">My Test Results</h3>
            <p className="text-xs text-slate-500">Explained in plain everyday words</p>
          </div>
          <button
            onClick={() => setActiveTab('tests')}
            className="text-xs text-sky-700 font-semibold hover:underline"
          >
            See all reports ({testResults.length}) →
          </button>
        </div>

        {testResults.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {testResults.slice(0, 2).map((test) => (
              <div
                key={test.id}
                onClick={() => setActiveTab('tests')}
                className="p-4 rounded-xl border border-slate-200 hover:border-sky-300 transition-all cursor-pointer bg-slate-50/50"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-900">{test.testName}</span>
                  <span className="text-[11px] font-semibold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                    Doctor Should Check This
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 mb-2 leading-relaxed">
                  {test.aiSummary}
                </p>
                <div className="text-[11px] text-sky-700 font-medium">
                  Click to check reference ranges and questions for doctor →
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
            <p className="text-sm text-slate-600">No test results have been added yet.</p>
            <button
              onClick={onOpenTestResultModal}
              className="px-4 py-2 bg-sky-600 text-white text-xs font-semibold rounded-lg hover:bg-sky-700"
            >
              Add Test Result
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
