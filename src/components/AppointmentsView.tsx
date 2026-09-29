import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Video,
  Plus,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Appointment, Doctor, ActiveTab } from '../types';

interface AppointmentsViewProps {
  appointments: Appointment[];
  doctors: Doctor[];
  onOpenBookingModal: (doctor?: Doctor) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  doctors,
  onOpenBookingModal,
  setActiveTab,
}) => {
  const [filter, setFilter] = useState<'All' | 'Upcoming' | 'Past'>('All');

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'Upcoming') {
      return apt.status === 'Confirmed' || apt.status === 'Scheduled';
    }
    if (filter === 'Past') {
      return apt.status === 'Completed' || apt.status === 'Cancelled';
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Page Header: What this page is for, what to do, main action button */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Visit Management
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Book Visit
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            <strong>What this page is for:</strong> See and manage your upcoming and past doctor visits.
            <br />
            <strong>What you should do:</strong> Check your visit date, time, and doctor details.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onOpenBookingModal()}
            className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Book a Doctor Visit</span>
          </button>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 flex items-start gap-3 text-xs sm:text-sm text-sky-950">
        <ShieldCheck className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-sky-900">Visit Reminder: </span>
          For clinic visits, please arrive 10 minutes prior to your time slot. For video or phone visits, your doctor will call your contact number at the scheduled time.
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['All', 'Upcoming', 'Past'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
              filter === tab
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab} Visits
          </button>
        ))}
      </div>

      {/* Helpful Empty State (Requirement 12) */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-sky-50 text-sky-600 mx-auto flex items-center justify-center text-3xl">
            📅
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            You don't have any doctor visits booked yet.
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Choose a specialist doctor by department and select a date and time that fits your schedule.
          </p>
          <button
            onClick={() => setActiveTab('doctors')}
            className="px-6 py-3 bg-sky-600 text-white rounded-xl text-sm font-bold hover:bg-sky-700 shadow-xs"
          >
            Find a Doctor
          </button>
        </div>
      ) : (
        /* Appointment Cards List */
        <div className="space-y-4">
          {filteredAppointments.map((apt) => {
            const isCompleted = apt.status === 'Completed';
            const isConfirmed = apt.status === 'Confirmed' || apt.status === 'Scheduled';

            return (
              <div
                key={apt.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        isCompleted
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {apt.status}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 font-mono">
                      Visit ID: {apt.id}
                    </span>
                    <span className="text-xs text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full font-semibold">
                      {apt.mode}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{apt.doctorName}</h2>
                    <div className="text-xs font-semibold text-sky-700">
                      Department: {apt.specialization}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Calendar className="w-4 h-4 text-sky-600" />
                      <span>{apt.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>{apt.timeSlot}</span>
                    </div>
                    <div className="text-slate-500">
                      Reason: <strong>{apt.chiefComplaint}</strong>
                    </div>
                  </div>
                </div>

                {/* Right side Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <div className="text-[11px] text-slate-500 uppercase font-semibold">
                      Visit Fee
                    </div>
                    <div className="text-lg font-bold text-slate-900 font-mono">
                      ₹{(apt.feeInr || 1500).toLocaleString()} (or ${apt.fee})
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isConfirmed && (
                      <button
                        onClick={() => setActiveTab('assistant')}
                        className="px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-bold transition-colors"
                      >
                        Ask Assistant About Visit
                      </button>
                    )}
                    {apt.caseId && (
                      <button
                        onClick={() => setActiveTab('cases')}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                      >
                        View Health Case
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
