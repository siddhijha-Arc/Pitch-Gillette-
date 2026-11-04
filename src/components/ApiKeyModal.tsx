import React, { useState } from 'react';
import { KeyRound, AlertTriangle, CheckCircle, ExternalLink, X } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKey: (key: string) => void;
  currentKey: string;
  isQuotaExhaustedError?: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSaveKey,
  currentKey,
  isQuotaExhaustedError = false,
}) => {
  const [inputKey, setInputKey] = useState(currentKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    if (!inputKey.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/gemini/status', {
        headers: { 'X-Gemini-Api-Key': inputKey.trim() },
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({ success: true, message: 'Valid key with active Gemini quota!' });
      } else if (data.isQuotaExhausted) {
        setTestResult({
          success: false,
          message: 'This key has also exceeded its daily quota limit. Please use another key.',
        });
      } else {
        setTestResult({ success: false, message: data.error || 'Invalid API key or network error.' });
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Connection test failed.' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (!inputKey.trim()) return;
    onSaveKey(inputKey.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#171a1c]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#eaedf6] max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isQuotaExhaustedError ? 'bg-[#fef2f2] text-[#ef4444]' : 'bg-[#e0e7ff] text-[#4f46e5]'}`}>
              {isQuotaExhaustedError ? <AlertTriangle className="h-6 w-6" /> : <KeyRound className="h-6 w-6" />}
            </div>
            <div>
              <h2 className="text-lg font-medium text-[#1f1f47] tracking-[-0.02em]">
                {isQuotaExhaustedError ? 'AI Quota Limit Reached' : 'Configure Gemini API Key'}
              </h2>
              <p className="text-xs text-[#6c7693]">
                {isQuotaExhaustedError
                  ? 'Daily free tier limit exceeded. Enter a new Gemini key to continue.'
                  : 'Manage the Gemini AI API Key used for all venture evaluations.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#6c7693] hover:text-[#1f1f47] hover:bg-[#f3f4f6]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isQuotaExhaustedError && (
          <div className="p-4 rounded-xl bg-[#fff1f2] border border-[#fecdd3] text-xs text-[#9f1239] space-y-1">
            <span className="font-semibold block">Quota Notice (429 RESOURCE_EXHAUSTED):</span>
            <p>
              Google has reached the free tier requests per day limit for the current key.
              Enter any Google AI Studio key below to resume immediately without mock fallbacks.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#1f1f47] block">Gemini API Key</label>
          <input
            type="text"
            value={inputKey}
            onChange={(e) => {
              setInputKey(e.target.value);
              setTestResult(null);
            }}
            placeholder="e.g. AIzaSy..."
            className="w-full px-4 py-3 rounded-xl bg-[#f9f9fb] border border-[#eaedf6] focus:border-[#576cdb] focus:bg-white text-xs font-mono text-[#171a1c] placeholder-[#9ca3af] outline-none transition-all"
          />
          <div className="flex items-center justify-between text-[11px] text-[#6c7693] pt-1">
            <span>Keys are stored locally in your browser.</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-[#576cdb] hover:underline flex items-center gap-1"
            >
              Get a free key <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {testResult && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              testResult.success
                ? 'bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46]'
                : 'bg-[#fef2f2] border border-[#fecaca] text-[#991b1b]'
            }`}
          >
            {testResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <span>{testResult.message}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleTestKey}
            disabled={testing || !inputKey.trim()}
            className="px-4 py-2 rounded-full border border-[#eaedf6] text-xs font-medium text-[#1f1f47] hover:bg-[#f9f9fb] disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Test Key'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!inputKey.trim()}
            className="px-6 py-2 rounded-full bg-[#576cdb] hover:bg-[#4a5fc7] text-white text-xs font-medium shadow-[0_2px_10px_rgba(87,108,219,0.3)] disabled:opacity-50"
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
