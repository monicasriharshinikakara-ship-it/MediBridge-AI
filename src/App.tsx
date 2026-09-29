import React, { useState } from 'react';
import {
  Patient,
  Doctor,
  Appointment,
  HealthcareCase,
  TestResultItem,
  ChatMessage,
  N8nConfig,
  ActiveTab,
} from './types';
import {
  INITIAL_PATIENTS,
  INITIAL_DOCTORS,
  INITIAL_APPOINTMENTS,
  INITIAL_CASES,
  INITIAL_TEST_RESULTS,
} from './data/mockData';
import { ClinicalDisclaimerBanner } from './components/ClinicalDisclaimerBanner';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { AiAssistantView } from './components/AiAssistantView';
import { DoctorSearchView } from './components/DoctorSearchView';
import { AppointmentsView } from './components/AppointmentsView';
import { MedicalTestsView } from './components/MedicalTestsView';
import { MedicinesView } from './components/MedicinesView';
import { HealthcareCasesView } from './components/HealthcareCasesView';
import { TestResultsView } from './components/TestResultsView';
import { CostEstimatorView } from './components/CostEstimatorView';
import { PatientProfileView } from './components/PatientProfileView';
import { BookingModal } from './components/BookingModal';
import { NewCaseModal } from './components/NewCaseModal';
import { NewTestResultModal } from './components/NewTestResultModal';
import { N8nModal } from './components/N8nModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [activePatient, setActivePatient] = useState<Patient>(INITIAL_PATIENTS[0]);
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [cases, setCases] = useState<HealthcareCase[]>(INITIAL_CASES);
  const [testResults, setTestResults] = useState<TestResultItem[]>(INITIAL_TEST_RESULTS);

  // n8n configuration
  const [n8nConfig, setN8nConfig] = useState<N8nConfig>({
    webhookUrl: '',
    isEnabled: false,
    lastPingStatus: 'untested',
  });

  // Modals state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);
  const [newCaseModalOpen, setNewCaseModalOpen] = useState(false);
  const [newTestResultModalOpen, setNewTestResultModalOpen] = useState(false);
  const [n8nModalOpen, setN8nModalOpen] = useState(false);

  // Chat Assistant State in Simple Everyday Language
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome-01',
      sender: 'assistant',
      timestamp: 'Just now',
      text: `Hello ${activePatient.name}, welcome to MediBridge AI!

I am your personal Health Assistant. I am here to help you in simple everyday words:
• Tell me what you are feeling, and I can suggest what type of doctor can help.
• Find certified doctors and book visits.
• Learn about medical tests and how to prepare for them.
• Check your medicines and understand affordable generic options.
• See expected costs before your visit.

Important Safety Note: I provide helpful information to guide you, but AI does not diagnose health problems or prescribe medicines. A doctor should always check your health in person.`,
      suggestedActions: [
        { label: 'I am not feeling well', action: 'start_triage_step' },
        { label: 'Find a doctor', action: 'book_doctor' },
        { label: 'Book a doctor visit', action: 'view_appointment' },
        { label: 'Check my test results', action: 'view_test' },
        { label: 'How much might it cost?', action: 'view_cost' },
        { label: 'I need help with medicines', action: 'view_medicines' },
      ],
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Switch demo patient
  const handleSelectPatient = (p: Patient) => {
    setActivePatient(p);
    // Add friendly switch message in chat
    const switchMsg: ChatMessage = {
      id: `sys-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Switched profile to ${p.name} (Age: ${p.age}). How can I help you today, ${p.name.split(' ')[0]}?`,
      suggestedActions: [
        { label: 'I am not feeling well', action: 'start_triage_step' },
        { label: 'Find a doctor', action: 'book_doctor' },
        { label: 'Book a doctor visit', action: 'view_appointment' },
        { label: 'How much might it cost?', action: 'view_cost' },
      ],
    };
    setChatMessages((prev) => [...prev, switchMsg]);
  };

  // Send message to server or n8n
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversation: chatMessages.slice(-6).map((m) => ({
            role: m.sender,
            text: m.text,
          })),
          patientContext: {
            id: activePatient.id,
            name: activePatient.name,
            age: activePatient.age,
            gender: activePatient.gender,
            medicalHistory: activePatient.medicalHistory,
            currentSymptoms: activePatient.currentSymptoms,
            insuranceProvider: activePatient.insuranceProvider,
          },
          n8nConfig,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: data.text || 'I have noted your question.',
        isEmergencyAlert: data.isEmergencyAlert,
        suggestedActions: data.suggestedActions,
      };

      setChatMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.warn('API chat call error, using local friendly fallback:', err);
      const fallbackBotMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Thank you for asking about "${text}".\n\nI recommend scheduling a visit with a doctor who can examine your symptoms in person.\n\n• For heart or chest tightness: Consult with Dr. Sarah Chen (Cardiology)\n• For general health: Consult with Dr. Elena Rodriguez (Internal Medicine)\n• For joint pain: Consult with Dr. David Kim (Orthopedics)\n\nRemember: AI does not diagnose illnesses. A doctor should always check you in person.`,
        suggestedActions: [
          { label: 'Find a doctor', action: 'book_doctor' },
          { label: 'Book a doctor visit', action: 'view_appointment' },
          { label: 'Check Expected Cost', action: 'view_cost' },
        ],
      };
      setChatMessages((prev) => [...prev, fallbackBotMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Open booking modal
  const handleOpenBookingModal = (doctor?: Doctor) => {
    setSelectedDoctorForBooking(doctor || null);
    setBookingModalOpen(true);
  };

  // Confirm booking
  const handleConfirmBooking = (appointmentData: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: `APT-${Math.floor(100 + Math.random() * 900)}`,
    };
    setAppointments((prev) => [newAppointment, ...prev]);

    // Also update active case if applicable
    const activeCase = cases.find((c) => c.caseStatus !== 'Case Closed');
    if (activeCase) {
      setCases((prev) =>
        prev.map((c) =>
          c.id === activeCase.id
            ? {
                ...c,
                appointmentId: newAppointment.id,
                appointmentDate: `${newAppointment.date} at ${newAppointment.timeSlot}`,
                caseStatus: 'Appointment Scheduled',
              }
            : c
        )
      );
    }
  };

  // Create new case
  const handleCreateCase = (newCase: HealthcareCase) => {
    setCases((prev) => [newCase, ...prev]);
    setActiveTab('cases');
  };

  // Add new test result
  const handleAddTestResult = (result: TestResultItem) => {
    setTestResults((prev) => [result, ...prev]);
    setActiveTab('tests');
  };

  // Update AI summary on test result
  const handleUpdateAiSummary = (testId: string, newSummary: string) => {
    setTestResults((prev) =>
      prev.map((t) => (t.id === testId ? { ...t, aiSummary: newSummary } : t))
    );
  };

  // Update patient details
  const handleUpdatePatient = (updated: Patient) => {
    setActivePatient(updated);
    setPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      {/* 1. Clinical Disclaimer Top Ribbon */}
      <ClinicalDisclaimerBanner />

      {/* 2. Simplified Clean Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activePatient={activePatient}
        patients={patients}
        onSelectPatient={handleSelectPatient}
        n8nConfig={n8nConfig}
        onOpenN8nModal={() => setN8nModalOpen(true)}
      />

      {/* 3. Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            patient={activePatient}
            doctors={doctors}
            appointments={appointments}
            cases={cases}
            testResults={testResults}
            setActiveTab={setActiveTab}
            onOpenBookingModal={handleOpenBookingModal}
            onOpenNewCaseModal={() => setNewCaseModalOpen(true)}
            onOpenTestResultModal={() => setNewTestResultModalOpen(true)}
            onSelectPrompt={(text) => handleSendMessage(text)}
          />
        )}

        {activeTab === 'assistant' && (
          <AiAssistantView
            patient={activePatient}
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={isChatLoading}
            setActiveTab={setActiveTab}
            onOpenBookingModal={handleOpenBookingModal}
            doctors={doctors}
            n8nConfig={n8nConfig}
            onOpenN8nModal={() => setN8nModalOpen(true)}
          />
        )}

        {activeTab === 'doctors' && (
          <DoctorSearchView
            doctors={doctors}
            onSelectDoctorForBooking={(doc) => handleOpenBookingModal(doc)}
          />
        )}

        {activeTab === 'appointments' && (
          <AppointmentsView
            appointments={appointments}
            doctors={doctors}
            onOpenBookingModal={handleOpenBookingModal}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'medical_tests' && (
          <MedicalTestsView
            patient={activePatient}
            cases={cases}
            setActiveTab={setActiveTab}
            onOpenTestResultModal={() => setNewTestResultModalOpen(true)}
          />
        )}

        {activeTab === 'medicines' && (
          <MedicinesView
            patient={activePatient}
            cases={cases}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'cases' && (
          <HealthcareCasesView
            cases={cases}
            patient={activePatient}
            onOpenNewCaseModal={() => setNewCaseModalOpen(true)}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'tests' && (
          <TestResultsView
            testResults={testResults}
            patient={activePatient}
            onOpenNewTestResultModal={() => setNewTestResultModalOpen(true)}
            onUpdateAiSummary={handleUpdateAiSummary}
          />
        )}

        {activeTab === 'costs' && (
          <CostEstimatorView patient={activePatient} />
        )}

        {activeTab === 'profile' && (
          <PatientProfileView
            patient={activePatient}
            onUpdatePatient={handleUpdatePatient}
            patients={patients}
            onSelectPatient={handleSelectPatient}
          />
        )}
      </main>

      {/* 4. Modals */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        selectedDoctor={selectedDoctorForBooking}
        doctors={doctors}
        patient={activePatient}
        onConfirmBooking={handleConfirmBooking}
      />

      <NewCaseModal
        isOpen={newCaseModalOpen}
        onClose={() => setNewCaseModalOpen(false)}
        patient={activePatient}
        doctors={doctors}
        onCreateCase={handleCreateCase}
      />

      <NewTestResultModal
        isOpen={newTestResultModalOpen}
        onClose={() => setNewTestResultModalOpen(false)}
        patient={activePatient}
        onAddTestResult={handleAddTestResult}
      />

      <N8nModal
        isOpen={n8nModalOpen}
        onClose={() => setN8nModalOpen(false)}
        config={n8nConfig}
        onSaveConfig={(cfg) => setN8nConfig(cfg)}
        activePatient={activePatient}
      />
    </div>
  );
}
