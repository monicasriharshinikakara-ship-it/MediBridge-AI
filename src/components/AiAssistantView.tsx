import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  Workflow,
  Stethoscope,
  Calendar,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { ChatMessage, Patient, Doctor, ActiveTab, N8nConfig } from '../types';
import { ASSISTANT_SUGGESTIONS } from '../data/mockData';

interface AiAssistantViewProps {
  patient: Patient;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenBookingModal: (doctor?: Doctor) => void;
  doctors: Doctor[];
  n8nConfig: N8nConfig;
  onOpenN8nModal: () => void;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  patient,
  messages,
  onSendMessage,
  isLoading,
  setActiveTab,
  onOpenBookingModal,
  doctors,
  n8nConfig,
  onOpenN8nModal,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Step-by-step Triage State
  // Step 0: Inactive, Step 1: "What are you feeling?", Step 2: "How old are you?", Step 3: "How long?", Step 4: "Better, worse, same?"
  const [triageStep, setTriageStep] = useState<number>(0);
  const [triageData, setTriageData] = useState<{
    symptom: string;
    age: string;
    duration: string;
    progression: string;
  }>({
    symptom: '',
    age: `${patient.age}`,
    duration: '',
    progression: '',
  });

  const [emergencyAlertActive, setEmergencyAlertActive] = useState<boolean>(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, triageStep, emergencyAlertActive]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText('');

    // Check emergency keywords in user input
    const lower = text.toLowerCase();
    if (
      lower.includes('chest pain') ||
      lower.includes('heart attack') ||
      lower.includes("can't breathe") ||
      lower.includes('cannot breathe') ||
      lower.includes('severe shortness of breath') ||
      lower.includes('sudden numbness') ||
      lower.includes('slurred speech') ||
      lower.includes('passed out') ||
      lower.includes('heavy bleeding')
    ) {
      setEmergencyAlertActive(true);
    }

    await onSendMessage(text);
  };

  // Handle Quick Suggestion Click
  const handleSuggestionClick = async (label: string, actionType: string) => {
    if (actionType === 'start_triage_step') {
      setTriageStep(1);
      setEmergencyAlertActive(false);
      return;
    }

    if (label === 'Find a doctor') {
      await onSendMessage('Can you help me find the right doctor for my symptoms?');
      return;
    }
    if (label === 'Book a doctor visit') {
      await onSendMessage('I would like to book a doctor visit.');
      return;
    }
    if (label === 'What tests might I need?') {
      await onSendMessage('What medical tests might I need for my current health concerns?');
      return;
    }
    if (label === 'Check my test results') {
      await onSendMessage('Can you explain my recent medical test results in simple words?');
      return;
    }
    if (label === 'How much might it cost?') {
      await onSendMessage('What is the expected cost for my doctor visit and tests?');
      return;
    }
    if (label === 'I need help with medicines') {
      await onSendMessage('I need help understanding my medicines, how to take them, and generic options.');
      return;
    }

    await onSendMessage(label);
  };

  // Triage step handlers
  const handleTriageStep1 = async (symptomChosen: string) => {
    // Check emergency
    const lower = symptomChosen.toLowerCase();
    if (
      lower.includes('chest pain') ||
      lower.includes('crushing') ||
      lower.includes('cannot breathe') ||
      lower.includes('numbness')
    ) {
      setEmergencyAlertActive(true);
      setTriageStep(0);
      await onSendMessage(`I am feeling ${symptomChosen}`);
      return;
    }

    setTriageData((prev) => ({ ...prev, symptom: symptomChosen }));
    setTriageStep(2);
  };

  const handleTriageStep2 = (ageChosen: string) => {
    setTriageData((prev) => ({ ...prev, age: ageChosen }));
    setTriageStep(3);
  };

  const handleTriageStep3 = (durationChosen: string) => {
    setTriageData((prev) => ({ ...prev, duration: durationChosen }));
    setTriageStep(4);
  };

  const handleTriageStep4 = async (progressionChosen: string) => {
    const finalData = {
      ...triageData,
      progression: progressionChosen,
    };
    setTriageData(finalData);
    setTriageStep(0);

    const summaryPrompt = `I am not feeling well.
What I am feeling: ${finalData.symptom}
My age: ${finalData.age}
How long I have felt this way: ${finalData.duration}
How it is changing: ${progressionChosen}

Please tell me in simple everyday words what kind of doctor I should see and what simple tests they might suggest.`;

    await onSendMessage(summaryPrompt);
  };

  const handleActionClick = (action: string, payload?: any) => {
    if (action === 'book_doctor') {
      if (payload?.doctorId) {
        const doc = doctors.find((d) => d.id === payload.doctorId);
        onOpenBookingModal(doc);
      } else {
        setActiveTab('doctors');
      }
    } else if (action === 'view_appointment') {
      setActiveTab('appointments');
    } else if (action === 'view_case') {
      setActiveTab('cases');
    } else if (action === 'view_cost') {
      setActiveTab('costs');
    } else if (action === 'view_test') {
      setActiveTab('tests');
    } else if (action === 'view_medicines') {
      setActiveTab('medicines');
    } else if (action === 'set_symptoms') {
      setInputText(patient.currentSymptoms.join(', '));
    } else if (action === 'start_triage_step') {
      setTriageStep(1);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] min-h-[600px] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* 1. Header Bar: What this page is for */}
      <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900">MediBridge Health Assistant</h1>
              <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Ready to Help
              </span>
            </div>
            <div className="text-xs text-slate-500">
              Assisting {patient.name} · Ask questions in simple everyday language
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {n8nConfig.isEnabled ? (
            <button
              onClick={onOpenN8nModal}
              className="flex items-center gap-1.5 text-xs text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg border border-sky-200 transition-colors"
            >
              <Workflow className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">Connected to n8n Webhook</span>
            </button>
          ) : (
            <button
              onClick={onOpenN8nModal}
              className="flex items-center gap-1.5 text-xs text-slate-600 bg-white hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span className="hidden sm:inline">AI Smart Engine</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Mandatory Clear Safety Label */}
      <div className="px-4 py-2 bg-sky-50 border-b border-sky-100 text-xs text-sky-950 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-sky-700 shrink-0" />
        <span>
          <strong>Doctor Should Check This:</strong> The assistant gives helpful information. It does not replace a doctor’s examination, diagnosis, or prescription.
        </span>
      </div>

      {/* 3. Emergency Warning Alert (Requirement 9) */}
      {emergencyAlertActive && (
        <div className="p-4 bg-red-600 text-white flex items-start gap-3 border-b border-red-700">
          <AlertTriangle className="w-6 h-6 shrink-0 text-amber-200" />
          <div className="space-y-1">
            <div className="font-bold text-base">This may need urgent medical attention.</div>
            <p className="text-xs sm:text-sm text-red-100 leading-relaxed">
              If you or someone around you has severe chest pain, trouble breathing, sudden weakness, numbness, or loss of speech, please call local emergency medical services immediately (such as <strong>911 / 112 / 108</strong>) or go to the nearest emergency department right away.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => setEmergencyAlertActive(false)}
                className="text-xs bg-white text-red-700 px-3 py-1 rounded font-bold hover:bg-red-50"
              >
                Dismiss Emergency Alert
              </button>
              <span className="text-xs text-red-200">Do not wait for an online chat or appointment.</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Chat Message History */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-sky-700 text-white'
                  : msg.isEmergencyAlert
                  ? 'bg-red-600 text-white'
                  : 'bg-sky-100 text-sky-800'
              }`}
            >
              {msg.sender === 'user' ? (
                <User className="w-4 h-4" />
              ) : msg.isEmergencyAlert ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`rounded-2xl p-4 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-sky-600 text-white rounded-tr-none'
                  : msg.isEmergencyAlert
                  ? 'bg-red-50 border-2 border-red-300 text-red-950 rounded-tl-none shadow-xs'
                  : 'bg-slate-100 text-slate-900 rounded-tl-none border border-slate-200 shadow-2xs'
              }`}
            >
              {/* Emergency Banner if emergency message */}
              {msg.isEmergencyAlert && (
                <div className="mb-2 pb-2 border-b border-red-200 font-bold text-red-700 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Urgent Medical Warning</span>
                </div>
              )}

              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Action Buttons */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap gap-2">
                  {msg.suggestedActions.map((act, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleActionClick(act.action, act.payload)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-sky-800 border border-sky-300 hover:bg-sky-50 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                    >
                      {act.action === 'book_doctor' && <Stethoscope className="w-3.5 h-3.5 text-sky-600" />}
                      {act.action === 'view_appointment' && <Calendar className="w-3.5 h-3.5 text-emerald-600" />}
                      <span>{act.label}</span>
                      <ArrowRight className="w-3 h-3 text-sky-500" />
                    </button>
                  ))}
                </div>
              )}

              <div
                className={`text-[10px] mt-2 ${
                  msg.sender === 'user' ? 'text-sky-100 text-right' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-xl mr-auto">
            <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-slate-100 rounded-2xl rounded-tl-none p-4 text-xs text-slate-500 border border-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-600 animate-ping" />
              <span>Health Assistant is typing a simple explanation...</span>
            </div>
          </div>
        )}

        {/* 5. Guided Step-by-Step Triage Box (Requirement 3) */}
        {triageStep > 0 && (
          <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-50 to-indigo-50 border-2 border-sky-300 rounded-2xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-900 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>Step {triageStep} of 4: Guided Health Check</span>
              </div>
              <button
                onClick={() => setTriageStep(0)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>

            {/* Step 1: What are you feeling? */}
            {triageStep === 1 && (
              <div className="space-y-2">
                <h3 className="font-bold text-base text-slate-900">
                  What are you feeling right now?
                </h3>
                <p className="text-xs text-slate-600">
                  Select the closest feeling below or type it in the chat box:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    'Chest tightness when climbing stairs',
                    'Severe headache / Migraine',
                    'Shoulder or joint pain when moving',
                    'Feeling easily tired and dizzy',
                    'Fever, sore throat, or cough',
                    'Stomach pain or indigestion',
                  ].map((symptom, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTriageStep1(symptom)}
                      className="px-3.5 py-2 bg-white text-slate-800 border border-sky-200 hover:border-sky-400 hover:bg-sky-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: How old are you? */}
            {triageStep === 2 && (
              <div className="space-y-2">
                <h3 className="font-bold text-base text-slate-900">
                  How old are you?
                </h3>
                <p className="text-xs text-slate-600">
                  Knowing your age helps suggest the right doctor and preventive tests:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => handleTriageStep2(`${patient.age} years old`)}
                    className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold shadow-2xs"
                  >
                    I am {patient.age} years old
                  </button>
                  {['Under 18', '18 to 40 years old', '41 to 60 years old', 'Over 60 years old'].map(
                    (ageRange, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleTriageStep2(ageRange)}
                        className="px-3.5 py-2 bg-white text-slate-800 border border-sky-200 hover:border-sky-400 rounded-xl text-xs font-semibold shadow-2xs"
                      >
                        {ageRange}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Step 3: How long have you been feeling this way? */}
            {triageStep === 3 && (
              <div className="space-y-2">
                <h3 className="font-bold text-base text-slate-900">
                  How long have you been feeling this way?
                </h3>
                <p className="text-xs text-slate-600">
                  Choose about how long this symptom has been happening:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    'Just started today',
                    '2 to 3 days',
                    'About a week or two',
                    'More than a month',
                  ].map((duration, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTriageStep3(duration)}
                      className="px-3.5 py-2 bg-white text-slate-800 border border-sky-200 hover:border-sky-400 hover:bg-sky-50 rounded-xl text-xs font-semibold shadow-2xs"
                    >
                      {duration}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Is the problem getting better, worse, or staying the same? */}
            {triageStep === 4 && (
              <div className="space-y-2">
                <h3 className="font-bold text-base text-slate-900">
                  Is the problem getting better, worse, or staying the same?
                </h3>
                <p className="text-xs text-slate-600">
                  This helps determine how soon you should see a doctor:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    'Getting worse',
                    'Staying about the same',
                    'Getting better slowly',
                  ].map((prog, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTriageStep4(prog)}
                      className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors"
                    >
                      {prog}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 6. Suggestion Buttons (Requirement 3) */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200">
        <div className="text-[11px] font-semibold text-slate-500 mb-1.5">
          Tap a suggestion or type your own question:
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {ASSISTANT_SUGGESTIONS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(item.label, item.action)}
              className="px-3 py-1.5 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 hover:border-sky-300 rounded-lg text-xs font-medium whitespace-nowrap shadow-2xs transition-colors"
            >
              {item.label === 'I am not feeling well' && '🤒 '}
              {item.label === 'Find a doctor' && '🩺 '}
              {item.label === 'Book a doctor visit' && '📅 '}
              {item.label === 'What tests might I need?' && '🧪 '}
              {item.label === 'Check my test results' && '📋 '}
              {item.label === 'How much might it cost?' && '💰 '}
              {item.label === 'I need help with medicines' && '💊 '}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 7. Input Form */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type what you are feeling or ask a question..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
