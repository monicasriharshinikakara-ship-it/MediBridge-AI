import React, { useState } from 'react';
import {
  Home,
  MessageSquareHeart,
  Stethoscope,
  Calendar,
  TestTube2,
  Pill,
  FolderHeart,
  FileText,
  Calculator,
  User,
  Workflow,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { ActiveTab, Patient, N8nConfig } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activePatient: Patient;
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  n8nConfig: N8nConfig;
  onOpenN8nModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activePatient,
  patients,
  onSelectPatient,
  n8nConfig,
  onOpenN8nModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [patientDropdownOpen, setPatientDropdownOpen] = useState(false);

  const navLinks: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'assistant', label: 'Health Assistant', icon: <MessageSquareHeart className="w-4 h-4" /> },
    { id: 'doctors', label: 'Find a Doctor', icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'appointments', label: 'Book Visit', icon: <Calendar className="w-4 h-4" /> },
    { id: 'medical_tests', label: 'Medical Tests', icon: <TestTube2 className="w-4 h-4" /> },
    { id: 'medicines', label: 'Medicines', icon: <Pill className="w-4 h-4" /> },
    { id: 'cases', label: 'My Health Case', icon: <FolderHeart className="w-4 h-4" /> },
    { id: 'tests', label: 'Test Results', icon: <FileText className="w-4 h-4" /> },
    { id: 'costs', label: 'Cost Estimate', icon: <Calculator className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold shadow-xs transition-transform group-hover:scale-105">
                <span className="text-lg">🩺</span>
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-sky-700 transition-colors">
                  MediBridge AI
                </span>
                <span className="hidden sm:inline-block ml-2 text-[11px] font-medium text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  Easy Care
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-sky-50 text-sky-800 font-semibold border border-sky-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className={isActive ? 'text-sky-600' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Medium screen Navigation summary button */}
          <div className="hidden lg:flex xl:hidden items-center gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-2.5 py-1 text-xs font-medium rounded ${
                activeTab === 'dashboard' ? 'bg-sky-100 text-sky-800 font-semibold' : 'text-slate-600'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('assistant')}
              className={`px-2.5 py-1 text-xs font-medium rounded ${
                activeTab === 'assistant' ? 'bg-sky-100 text-sky-800 font-semibold' : 'text-slate-600'
              }`}
            >
              Assistant
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`px-2.5 py-1 text-xs font-medium rounded ${
                activeTab === 'doctors' ? 'bg-sky-100 text-sky-800 font-semibold' : 'text-slate-600'
              }`}
            >
              Doctors
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-2.5 py-1 text-xs font-medium rounded ${
                activeTab === 'appointments' ? 'bg-sky-100 text-sky-800 font-semibold' : 'text-slate-600'
              }`}
            >
              Book Visit
            </button>
            <button
              onClick={() => setActiveTab('cases')}
              className={`px-2.5 py-1 text-xs font-medium rounded ${
                activeTab === 'cases' ? 'bg-sky-100 text-sky-800 font-semibold' : 'text-slate-600'
              }`}
            >
              My Health Case
            </button>
          </div>

          {/* Right Actions: n8n, Patient details, Mobile menu */}
          <div className="flex items-center gap-2">
            {/* n8n Webhook Connector indicator */}
            <button
              onClick={onOpenN8nModal}
              title="Configure n8n Chat Trigger Webhook"
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                n8nConfig.isEnabled && n8nConfig.lastPingStatus === 'connected'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : n8nConfig.isEnabled
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>{n8nConfig.isEnabled ? 'n8n Active' : 'n8n Webhook'}</span>
            </button>

            {/* Patient Details & Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setPatientDropdownOpen(!patientDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors"
                title="Your Details and Demo Patient Switcher"
              >
                <div className="w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                  {activePatient.name.charAt(0)}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-semibold text-slate-900 leading-tight">
                    {activePatient.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Age {activePatient.age} · {activePatient.gender}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {patientDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                  <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{activePatient.name}</div>
                      <div className="text-[11px] text-slate-500">{activePatient.phone}</div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setPatientDropdownOpen(false);
                      }}
                      className="text-xs font-semibold text-sky-700 hover:text-sky-800 bg-sky-50 px-2.5 py-1 rounded"
                    >
                      Your Details
                    </button>
                  </div>

                  <div className="px-3.5 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Switch Demo Person
                  </div>
                  {patients.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectPatient(p);
                        setPatientDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                        p.id === activePatient.id
                          ? 'bg-sky-50 text-sky-900 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div>{p.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {p.age} yrs · {p.gender}
                        </div>
                      </div>
                      {p.id === activePatient.id && (
                        <span className="text-[10px] bg-sky-600 text-white px-2 py-0.5 rounded font-bold">
                          Active
                        </span>
                      )}
                    </button>
                  ))}

                  <div className="px-3.5 pt-2 border-t border-slate-100 mt-1">
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setPatientDropdownOpen(false);
                      }}
                      className="w-full text-center text-xs text-sky-700 font-medium py-1 hover:underline"
                    >
                      View & Edit Your Details →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              aria-label="Open Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navLinks.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-sky-50 text-sky-800 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className={isActive ? 'text-sky-600' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                setActiveTab('profile');
                setMobileMenuOpen(false);
              }}
              className="text-xs font-semibold text-sky-700 py-1"
            >
              Your Details (Profile)
            </button>
            <button
              onClick={() => {
                onOpenN8nModal();
                setMobileMenuOpen(false);
              }}
              className="text-xs text-slate-600 py-1"
            >
              n8n Webhook Settings
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
