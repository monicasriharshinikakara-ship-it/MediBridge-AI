import React, { useState } from 'react';
import { X, FilePlus2, Plus, Trash2, Sparkles, ShieldCheck } from 'lucide-react';
import { TestResultItem, TestParameter, Patient } from '../types';

interface NewTestResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onAddTestResult: (result: TestResultItem) => void;
}

export const NewTestResultModal: React.FC<NewTestResultModalProps> = ({
  isOpen,
  onClose,
  patient,
  onAddTestResult,
}) => {
  const [testName, setTestName] = useState('Thyroid Function Test (TSH)');
  const [category, setCategory] = useState<TestResultItem['category']>('Endocrine');
  const [parameters, setParameters] = useState<TestParameter[]>([
    {
      name: 'Thyroid Stimulating Hormone (TSH)',
      value: '3.42',
      unit: 'uIU/mL',
      referenceRange: '0.45 - 4.50 uIU/mL',
      flag: 'normal',
      simpleExplanation: 'Your result is within the provided reference range.',
    },
    {
      name: 'Free T4 (Active Thyroid Hormone)',
      value: '1.28',
      unit: 'ng/dL',
      referenceRange: '0.82 - 1.77 ng/dL',
      flag: 'normal',
      simpleExplanation: 'Your result is within the provided reference range.',
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleTemplateChange = (templateName: string) => {
    if (templateName === 'Thyroid') {
      setTestName('Thyroid Function Test (TSH)');
      setCategory('Endocrine');
      setParameters([
        {
          name: 'Thyroid Stimulating Hormone (TSH)',
          value: '3.42',
          unit: 'uIU/mL',
          referenceRange: '0.45 - 4.50 uIU/mL',
          flag: 'normal',
          simpleExplanation: 'Your result is within the provided reference range.',
        },
        {
          name: 'Free T4 (Active Thyroid Hormone)',
          value: '1.28',
          unit: 'ng/dL',
          referenceRange: '0.82 - 1.77 ng/dL',
          flag: 'normal',
          simpleExplanation: 'Your result is within the provided reference range.',
        },
      ]);
    } else if (templateName === 'CBC') {
      setTestName('Complete Blood Count (CBC)');
      setCategory('Blood Work');
      setParameters([
        {
          name: 'White Blood Cell (Infection fighters)',
          value: '6.8',
          unit: 'K/uL',
          referenceRange: '4.5 - 11.0 K/uL',
          flag: 'normal',
          simpleExplanation: 'Your result is within the provided reference range.',
        },
        {
          name: 'Hemoglobin (Oxygen carry)',
          value: '11.8',
          unit: 'g/dL',
          referenceRange: '12.0 - 15.5 g/dL',
          flag: 'low',
          simpleExplanation: 'Your result is outside the provided reference range. Slightly below normal.',
        },
        {
          name: 'Platelets (Blood clotting)',
          value: '240',
          unit: 'K/uL',
          referenceRange: '150 - 450 K/uL',
          flag: 'normal',
          simpleExplanation: 'Your result is within the provided reference range.',
        },
      ]);
    } else if (templateName === 'Lipid') {
      setTestName('Cholesterol Blood Test (Lipid Panel)');
      setCategory('Cardiology');
      setParameters([
        {
          name: 'Total Cholesterol',
          value: '215',
          unit: 'mg/dL',
          referenceRange: '< 200 mg/dL',
          flag: 'high',
          simpleExplanation: 'Your result is outside the provided reference range.',
        },
        {
          name: 'Bad Cholesterol (LDL)',
          value: '138',
          unit: 'mg/dL',
          referenceRange: '< 100 mg/dL',
          flag: 'high',
          simpleExplanation: 'Your result is outside the provided reference range. Please discuss this with your doctor.',
        },
        {
          name: 'Good Cholesterol (HDL)',
          value: '55',
          unit: 'mg/dL',
          referenceRange: '> 50 mg/dL',
          flag: 'normal',
          simpleExplanation: 'Your result is within the provided reference range.',
        },
      ]);
    }
  };

  const handleAddParam = () => {
    setParameters([
      ...parameters,
      {
        name: 'New Test Name',
        value: '0',
        unit: 'mg/dL',
        referenceRange: '',
        flag: 'normal',
        simpleExplanation: 'Your result is within the provided reference range.',
      },
    ]);
  };

  const handleRemoveParam = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const handleUpdateParam = (index: number, field: keyof TestParameter, val: any) => {
    const updated = [...parameters];
    updated[index] = { ...updated[index], [field]: val };
    setParameters(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    let aiSummary = `Your ${testName} numbers have been entered. Some values are within the normal reference range. Please discuss these numbers with your doctor during your next visit.`;
    const disclaimer =
      'Doctor Should Check This: This is an informational summary in simple words. It does not replace a doctor examination.';

    try {
      const res = await fetch('/api/summarize-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testName,
          parameters,
          patientContext: {
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.aiSummary) {
          aiSummary = data.aiSummary;
        }
      }
    } catch (err) {
      console.warn('Could not call /api/summarize-lab:', err);
    }

    const newResult: TestResultItem = {
      id: `TR-${Math.floor(200 + Math.random() * 800)}`,
      patientId: patient.id,
      patientName: patient.name,
      testName,
      category,
      uploadedAt: new Date().toISOString().split('T')[0],
      status: 'AI Summarized',
      parameters,
      aiSummary,
      clinicalDisclaimer: disclaimer,
      questionsForDoctor: [
        `Are my ${testName} results where you want them to be?`,
        'Do I need to make any changes to my diet or medicines?',
        'When should we repeat this test?',
      ],
    };

    setIsProcessing(false);
    onAddTestResult(newResult);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <FilePlus2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Add Medical Test Result</h2>
              <p className="text-xs text-slate-500">
                Enter your test numbers to see a plain English explanation for {patient.name}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Quick Template Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Quick Test Templates
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleTemplateChange('CBC')}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-sky-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200"
              >
                Complete Blood Count (CBC)
              </button>
              <button
                type="button"
                onClick={() => handleTemplateChange('Lipid')}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-sky-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200"
              >
                Cholesterol Blood Test
              </button>
              <button
                type="button"
                onClick={() => handleTemplateChange('Thyroid')}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-sky-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200"
              >
                Thyroid Test (TSH)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Medical Test Name
            </label>
            <input
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          {/* Test Parameters */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                Test Numbers & Reference Ranges
              </label>
              <button
                type="button"
                onClick={handleAddParam}
                className="text-xs font-bold text-sky-700 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Line</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto p-1">
              {parameters.map((param, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={param.name}
                      onChange={(e) => handleUpdateParam(idx, 'name', e.target.value)}
                      placeholder="Test parameter (e.g. Glucose)"
                      className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveParam(idx)}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Your Result:</span>
                      <input
                        type="text"
                        value={param.value}
                        onChange={(e) => handleUpdateParam(idx, 'value', e.target.value)}
                        placeholder="105"
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                        required
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block">Unit:</span>
                      <input
                        type="text"
                        value={param.unit}
                        onChange={(e) => handleUpdateParam(idx, 'unit', e.target.value)}
                        placeholder="mg/dL"
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block">Reference Range:</span>
                      <input
                        type="text"
                        value={param.referenceRange}
                        onChange={(e) => handleUpdateParam(idx, 'referenceRange', e.target.value)}
                        placeholder="70 - 99 mg/dL"
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Notice in Modal */}
          <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-700 shrink-0" />
            <span>
              <strong>Doctor Should Check This:</strong> An AI summary will be generated in simple words to help you prepare questions for your doctor.
            </span>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Explaining in simple words...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Explain & Save Result</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
