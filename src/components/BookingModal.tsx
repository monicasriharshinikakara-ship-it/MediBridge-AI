import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Doctor, Patient, Appointment } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDoctor: Doctor | null;
  doctors: Doctor[];
  patient: Patient;
  onConfirmBooking: (appointmentData: Omit<Appointment, 'id'>) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  selectedDoctor,
  doctors,
  patient,
  onConfirmBooking,
}) => {
  const [doctorId, setDoctorId] = useState(selectedDoctor?.id || doctors[0]?.id || '');
  const [date, setDate] = useState('2026-10-07');
  const [timeSlot, setTimeSlot] = useState('10:30 AM');
  const [mode, setMode] = useState<'In-Clinic' | 'Tele-Consultation'>('In-Clinic');
  const [chiefComplaint, setChiefComplaint] = useState(
    patient.currentSymptoms.length > 0 ? patient.currentSymptoms.join(', ') : 'Routine health checkup'
  );
  const [bookingSuccess, setBookingSuccess] = useState(false);

  if (!isOpen) return null;

  const currentDoctor = doctors.find((d) => d.id === doctorId) || doctors[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDoctor) return;

    onConfirmBooking({
      patientId: patient.id,
      patientName: patient.name,
      doctorId: currentDoctor.id,
      doctorName: currentDoctor.name,
      specialization: currentDoctor.specialization,
      date,
      timeSlot,
      status: 'Confirmed',
      mode,
      chiefComplaint,
      fee: currentDoctor.consultationFee,
      feeInr: currentDoctor.consultationFeeInr || 1500,
    });

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Book a Doctor Visit</h2>
            <p className="text-xs text-slate-500">
              For {patient.name} (Age {patient.age})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {bookingSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Visit Confirmed!</h3>
            <p className="text-sm text-slate-600">
              Your visit with {currentDoctor?.name} on <strong>{date}</strong> at <strong>{timeSlot}</strong> has been booked.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Choose Doctor */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Choose Doctor
              </label>
              <select
                value={doctorId}
                onChange={(e) => {
                  setDoctorId(e.target.value);
                  const doc = doctors.find((d) => d.id === e.target.value);
                  if (doc && doc.timeSlots.length > 0) {
                    setTimeSlot(doc.timeSlots[0]);
                  }
                }}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white"
              >
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} — {doc.specialization} (Fee: ₹{(doc.consultationFeeInr || 1500).toLocaleString()} / ${doc.consultationFee})
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor preview */}
            {currentDoctor && (
              <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-200 text-xs flex items-center gap-3">
                <img
                  src={currentDoctor.avatar}
                  alt={currentDoctor.name}
                  className="w-12 h-12 rounded-xl object-cover border border-sky-300 shrink-0"
                />
                <div>
                  <div className="font-bold text-sky-950 text-sm">{currentDoctor.name}</div>
                  <div className="text-slate-600">{currentDoctor.hospital}</div>
                  <div className="text-slate-500 mt-0.5">
                    Available Days: {currentDoctor.availabilityDays.join(', ')}
                  </div>
                </div>
              </div>
            )}

            {/* In-Person or Phone / Video */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                How would you like to meet?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('In-Clinic')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    mode === 'In-Clinic'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  🏥 In-Person at Clinic
                </button>
                <button
                  type="button"
                  onClick={() => setMode('Tele-Consultation')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    mode === 'Tele-Consultation'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  📞 Phone / Video Call
                </button>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Visit Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Available Time Slot
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50"
                >
                  {currentDoctor?.timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* What would you like to discuss? */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                What would you like to discuss with the doctor?
              </label>
              <textarea
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                rows={2}
                placeholder="Describe what you are feeling in simple words..."
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            {/* Visit Fee & Submit Button */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block">Expected Visit Fee</span>
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  ₹{(currentDoctor?.consultationFeeInr || 1500).toLocaleString()} (or ${currentDoctor?.consultationFee})
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  Confirm Doctor Visit
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
