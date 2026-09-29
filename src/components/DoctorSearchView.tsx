import React, { useState } from 'react';
import {
  Stethoscope,
  Star,
  MapPin,
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Doctor } from '../types';

interface DoctorSearchViewProps {
  doctors: Doctor[];
  onSelectDoctorForBooking: (doctor: Doctor) => void;
}

export const DoctorSearchView: React.FC<DoctorSearchViewProps> = ({
  doctors,
  onSelectDoctorForBooking,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  const departments = [
    'All',
    'Heart & Blood Vessels',
    'Brain & Nerves',
    'General Health',
    'Bones & Joints',
    'Hormones & Sugar',
    'Lungs & Breathing',
  ];

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.hospital.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept =
      selectedDepartment === 'All' ||
      doc.specialization.toLowerCase().includes(selectedDepartment.toLowerCase());

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Page Header: What this page is for, what to do, main action button */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Physician Directory
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Find a Doctor
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            <strong>What this page is for:</strong> Find the right certified specialist for your health needs.
            <br />
            <strong>What you should do:</strong> Choose a doctor by department, check visit fees, and book a time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setCurrency('INR')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                currency === 'INR' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              ₹ INR
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                currency === 'USD' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              $ USD
            </button>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 flex items-start gap-3 text-xs sm:text-sm text-sky-950">
        <ShieldCheck className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-sky-900">Certified Healthcare Professionals: </span>
          All doctors in this network are board-certified and provide in-person clinic visits and tele-consultations.
        </div>
      </div>

      {/* 2. Filters & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by doctor name or health concern (e.g. Heart, Knee)..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Department Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                selectedDepartment === dept
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Doctors List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredDoctors.map((doc) => {
          const feeDisplay =
            currency === 'INR'
              ? `₹${(doc.consultationFeeInr || 1500).toLocaleString()}`
              : `$${doc.consultationFee}`;

          return (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div className="space-y-3">
                {/* Doctor Avatar & Name Header */}
                <div className="flex items-start gap-4">
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                  />
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {doc.name}
                    </h2>
                    <div className="text-xs font-semibold text-sky-700 mt-0.5">
                      {doc.specialization}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {doc.rating}
                      </span>
                      <span>({doc.reviewCount} patient reviews)</span>
                      <span>·</span>
                      <span>{doc.experienceYears} yrs experience</span>
                    </div>
                  </div>
                </div>

                {/* Qualification & Hospital */}
                <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-800">{doc.hospital}</span>
                  </div>
                  <div className="text-slate-500 pl-5">
                    {doc.qualification}
                  </div>
                </div>

                {/* Plain Bio */}
                <p className="text-xs text-slate-600 leading-relaxed">
                  {doc.bio}
                </p>

                {/* Available Days */}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Available on: <strong>{doc.availabilityDays.join(', ')}</strong></span>
                </div>
              </div>

              {/* Bottom Card Footer: Fee & Booking Button */}
              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                    Visit Fee
                  </div>
                  <div className="text-lg font-bold text-slate-900 font-mono">
                    {feeDisplay}
                  </div>
                </div>

                <button
                  onClick={() => onSelectDoctorForBooking(doc)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book a Doctor Visit</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
