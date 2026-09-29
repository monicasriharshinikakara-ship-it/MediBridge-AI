import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, RefreshCw, Send, Copy, Check } from 'lucide-react';
import { N8nConfig, Patient } from '../types';

interface N8nModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: N8nConfig;
  onSaveConfig: (config: N8nConfig) => void;
  activePatient: Patient;
}

export const N8nModal: React.FC<N8nModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  activePatient,
}) => {
  const [webhookUrl, setWebhookUrl] = useState(config.webhookUrl);
  const [isEnabled, setIsEnabled] = useState(config.isEnabled);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleTestPing = async () => {
    if (!webhookUrl.trim()) return;
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/n8n/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl,
          testPayload: {
            event: 'patient_triage',
            message: 'Hello, I am testing the n8n webhook connection from MediBridge AI.',
            patient: {
              id: activePatient.id,
              name: activePatient.name,
              age: activePatient.age,
              gender: activePatient.gender,
              currentSymptoms: activePatient.currentSymptoms,
              medicalHistory: activePatient.medicalHistory,
            },
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();
      setTestResult(data);
      if (data.success) {
        onSaveConfig({
          webhookUrl,
          isEnabled: true,
          lastPingStatus: 'connected',
          lastPingResponse: JSON.stringify(data.response),
          lastPingTimestamp: new Date().toLocaleTimeString(),
        });
      } else {
        onSaveConfig({
          webhookUrl,
          isEnabled,
          lastPingStatus: 'error',
          lastPingResponse: data.error || 'Failed to connect',
          lastPingTimestamp: new Date().toLocaleTimeString(),
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message || 'Connection error',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSaveConfig({
      ...config,
      webhookUrl: webhookUrl.trim(),
      isEnabled,
    });
    onClose();
  };

  const samplePayload = {
    event: 'patient_message',
    message: 'What specialist should I see for exertional chest tightness?',
    patient: {
      name: activePatient.name,
      age: activePatient.age,
      medicalHistory: activePatient.medicalHistory,
      currentSymptoms: activePatient.currentSymptoms,
    },
    conversationHistory: [
      { role: 'user', text: 'I have some symptoms' },
      { role: 'assistant', text: 'Please tell me more...' }
    ],
    timestamp: new Date().toISOString(),
  };

  const copyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(samplePayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              n8n Chat Trigger Webhook Configuration
            </h3>
            <p className="text-xs text-slate-500">
              Connect MediBridge AI to your automated n8n workflow for custom triage orchestration
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Toggle enable */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <div className="text-sm font-semibold text-slate-900">Route AI Chat via n8n Webhook</div>
              <div className="text-xs text-slate-500">
                When enabled, chat messages will be posted to your n8n workflow. If unreachable, it falls back seamlessly to server-side Gemini AI.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
          </div>

          {/* Webhook URL Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              n8n Webhook URL (POST Endpoint)
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-n8n-instance.app.n8n.cloud/webhook/medibridge-chat"
              className="w-full text-xs font-mono px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Add a Webhook Trigger node in n8n listening for POST requests on this path.
            </p>
          </div>

          {/* Test connection button & results */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleTestPing}
              disabled={isTesting || !webhookUrl.trim()}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg disabled:opacity-50 transition-colors"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Pinging Webhook...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-sky-600" />
                  <span>Send Test Ping</span>
                </>
              )}
            </button>
            {config.lastPingStatus === 'connected' && (
              <span className="flex items-center gap-1 text-xs text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Verified Connected
              </span>
            )}
            {config.lastPingStatus === 'error' && (
              <span className="flex items-center gap-1 text-xs text-amber-700 font-medium">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Connection Failed
              </span>
            )}
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-lg border text-xs ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              <div className="font-semibold flex items-center gap-1.5 mb-1">
                {testResult.success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Ping Successful (Status {testResult.status} · {testResult.latencyMs}ms)</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>Ping Failed: {testResult.error || testResult.statusText}</span>
                  </>
                )}
              </div>
              {testResult.response && (
                <pre className="text-[11px] font-mono bg-white/70 p-2 rounded mt-1.5 overflow-x-auto">
                  {JSON.stringify(testResult.response, null, 2)}
                </pre>
              )}
            </div>
          )}

          {/* Sample JSON Schema preview for student reference */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700">Sample Webhook POST Payload Schema:</span>
              <button
                onClick={copyPayload}
                className="text-[11px] text-sky-600 hover:text-sky-800 flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono bg-slate-900 text-slate-200 p-3 rounded-lg overflow-x-auto max-h-36">
              {JSON.stringify(samplePayload, null, 2)}
            </pre>
            <p className="text-[11px] text-slate-500 mt-1">
              n8n can return <code className="text-slate-700 font-mono font-medium">{'{"text": "..."}'}</code> or an AI-generated workflow response.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
