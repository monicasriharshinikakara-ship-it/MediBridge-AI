import React, { useState } from 'react';
import { X, FolderPlus, ShieldCheck } from 'lucide-react';
import { HealthcareCase, Doctor, Patient } from '../types';

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  doctors: Doctor[];
  onCreateCase: (newCase: HealthcareCase) => void;
}

export const NewCaseModal: React.FC<NewCaseModalProps> = ({
  isOpen,
  onClose,
  patient,
  doctors,
  onCreateCase,
}) => {
  const [title, setTitle] = useState('New Health Check & Care Journey');
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || '');
  const [symptomsInput, setSymptomsInput] = useState(patient.currentSymptoms.join(', '));
  const [selectedTests, setSelectedTests] = useState<string[]>([
    'Cholesterol Blood Test (Lipid Panel)',
    'Heart Rhythm Test (ECG)',
  ]);
  const [triageNotes, setTriageNotes] = useState(
    'Initial symptoms logged for doctor review and appointment planning.'
  );

  if (!isOpen) return null;

  const testOptions = [
    'Cholesterol Blood Test (Lipid Panel)',
    'Fasting Blood Sugar Test (Glucose)',
    '3-Month Average Blood Sugar (HbA1c)',
    'General Blood Count (CBC)',
    'Heart Rhythm Test (ECG)',
    'Chest or Joint X-Ray',
    'Heart Ultrasound (Echocardiogram)',
    'Thyroid Test (TSH)',
  ];

  const handleToggleTest = (test: string) => {
    if (selectedTests.includes(test)) {
      setSelectedTests(selectedTests.filter((t) => t !== test));
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = doctors.find((d) => d.id === doctorId) || doctors[0];
    const caseId = `CASE-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newCase: HealthcareCase = {
      id: caseId,
      title,
      patientId: patient.id,
      patientName: patient.name,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      symptoms: symptomsInput.split(',').map((s) => s.trim()).filter(Boolean),
      doctorId: doc.id,
      doctorName: doc.name,
      doctorSpecialty: doc.specialization,
      testsRecommended: selectedTests,
      testResults: selectedTests.map((t, idx) => ({
        id: `TR-NEW-${idx}`,
        testName: t,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
        summary: 'Scheduled for your clinic visit.',
      })),
      treatmentStatus: 'Pending Clinician Consultation',
      prescriptions: [],
      estimatedCost: {
        consultation: doc.consultationFee,
        laboratory: selectedTests.length * 80,
        imaging: selectedTests.some((t) => t.includes('Echo') || t.includes('X-Ray')) ? 200 : 0,
        medicines: 25,
        procedures: 0,
        packages: 0,
        roomCharges: 0,
        otherCharges: 25,
        total: doc.consultationFee + selectedTests.length * 80 + 50,
        insuranceEstimatedCoverage: Math.round((doc.consultationFee + selectedTests.length * 80 + 50) * 0.8),
        patientEstimatedResponsibility: Math.round((doc.consultationFee + selectedTests.length * 80 + 50) * 0.2),
      },
      caseStatus: 'Active Triage',
      aiTriageNotes: triageNotes,
    };

    onCreateCase(newCase);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Start a New Health Case</h2>
              <p className="text-xs text-slate-500">
                Track your care journey for {patient.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Health Case Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Heart checkup and chest tightness"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Choose Doctor
            </label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
            >
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} — {doc.specialization}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              What are you feeling? (Separated by commas)
            </label>
            <input
              type="text"
              value={symptomsInput}
              onChange={(e) => setSymptomsInput(e.target.value)}
              placeholder="e.g., Chest tightness when climbing stairs, tiredness"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Medical Tests (Optional)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {testOptions.map((test) => {
                const isSelected = selectedTests.includes(test);
                return (
                  <div
                    key={test}
                    onClick={() => handleToggleTest(test)}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors flex items-center gap-2 select-none ${
                      isSelected
                        ? 'bg-sky-50 border-sky-400 text-sky-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span className="truncate">{test}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Helpful Notes
            </label>
            <textarea
              value={triageNotes}
              onChange={(e) => setTriageNotes(e.target.value)}
              rows={2}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
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
              Create Health Case
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
