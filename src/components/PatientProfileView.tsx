import React, { useState } from 'react';
import {
  User,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  HeartPulse,
  PhoneCall,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { Patient, EmergencyContact } from '../types';

interface PatientProfileViewProps {
  patient: Patient;
  onUpdatePatient: (updated: Patient) => void;
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
}

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({
  patient,
  onUpdatePatient,
  patients,
  onSelectPatient,
}) => {
  const [formData, setFormData] = useState<Patient>(patient);
  const [newProblem, setNewProblem] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedicine, setNewMedicine] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync if active patient switches
  React.useEffect(() => {
    setFormData(patient);
  }, [patient]);

  const handleChange = (field: keyof Patient, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleEmergencyChange = (field: keyof EmergencyContact, value: string) => {
    setFormData({
      ...formData,
      emergencyContact: {
        ...(formData.emergencyContact || { name: '', phone: '' }),
        [field]: value,
      },
    });
  };

  const handleAddProblem = () => {
    if (!newProblem.trim()) return;
    setFormData({
      ...formData,
      medicalHistory: [...formData.medicalHistory, newProblem.trim()],
    });
    setNewProblem('');
  };

  const handleRemoveProblem = (idx: number) => {
    setFormData({
      ...formData,
      medicalHistory: formData.medicalHistory.filter((_, i) => i !== idx),
    });
  };

  const handleAddAllergy = () => {
    if (!newAllergy.trim()) return;
    setFormData({
      ...formData,
      allergies: [...formData.allergies, newAllergy.trim()],
    });
    setNewAllergy('');
  };

  const handleRemoveAllergy = (idx: number) => {
    setFormData({
      ...formData,
      allergies: formData.allergies.filter((_, i) => i !== idx),
    });
  };

  const handleAddMedicine = () => {
    if (!newMedicine.trim()) return;
    const currentList = formData.currentMedicines || [];
    setFormData({
      ...formData,
      currentMedicines: [...currentList, newMedicine.trim()],
    });
    setNewMedicine('');
  };

  const handleRemoveMedicine = (idx: number) => {
    const currentList = formData.currentMedicines || [];
    setFormData({
      ...formData,
      currentMedicines: currentList.filter((_, i) => i !== idx),
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePatient(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* 1. Page Header: What this page is for, what to do, main action button */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Personal Information
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Your Details
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            <strong>What this page is for:</strong> Keep your personal contact and health history up to date.
            <br />
            <strong>What you should do:</strong> Review your details so your doctor has the right information.
          </p>
        </div>

        {/* Demo Persona Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Demo Patient:</span>
          {patients.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectPatient(p)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
                p.id === patient.id
                  ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {p.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Your details have been saved successfully!</span>
        </div>
      )}

      {/* 2. Organized into 3 Clear Sections (Requirement 10) */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: About You */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900">About You</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Age
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => handleChange('age', parseInt(e.target.value, 10) || 0)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Your Health */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-600" />
            <h2 className="text-lg font-bold text-slate-900">Your Health</h2>
          </div>

          {/* Past Health Problems */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Past Health Problems
            </label>
            <div className="flex flex-wrap gap-2">
              {formData.medicalHistory.map((item, idx) => (
                <span
                  key={idx}
                  className="bg-slate-100 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 border border-slate-200"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveProblem(idx)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newProblem}
                onChange={(e) => setNewProblem(e.target.value)}
                placeholder="Add a past health problem (e.g. High blood pressure)"
                className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={handleAddProblem}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Add
              </button>
            </div>
          </div>

          {/* Allergies */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700">
              Allergies (Medicines or food)
            </label>
            <div className="flex flex-wrap gap-2">
              {formData.allergies.map((item, idx) => (
                <span
                  key={idx}
                  className="bg-amber-50 text-amber-900 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 border border-amber-200"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAllergy(idx)}
                    className="text-amber-500 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                placeholder="Add an allergy (e.g. Penicillin)"
                className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={handleAddAllergy}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Add
              </button>
            </div>
          </div>

          {/* Current Medicines */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700">
              Current Medicines
            </label>
            <div className="flex flex-wrap gap-2">
              {(formData.currentMedicines || []).map((item, idx) => (
                <span
                  key={idx}
                  className="bg-violet-50 text-violet-900 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 border border-violet-200"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMedicine(idx)}
                    className="text-violet-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newMedicine}
                onChange={(e) => setNewMedicine(e.target.value)}
                placeholder="Add a current medicine (e.g. Lisinopril 10mg once daily)"
                className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={handleAddMedicine}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Emergency Contact */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Emergency Contact</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Name
              </label>
              <input
                type="text"
                value={formData.emergencyContact?.name || ''}
                onChange={(e) => handleEmergencyChange('name', e.target.value)}
                placeholder="e.g. Robert Vance (Spouse)"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Emergency Phone Number
              </label>
              <input
                type="text"
                value={formData.emergencyContact?.phone || ''}
                onChange={(e) => handleEmergencyChange('phone', e.target.value)}
                placeholder="e.g. +1 (555) 432-9011"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-bold shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Your Details</span>
          </button>
        </div>
      </form>
    </div>
  );
};
