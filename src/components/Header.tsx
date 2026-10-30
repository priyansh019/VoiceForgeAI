import React from 'react';
import { Mic, Radio, Terminal, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ServerStatus } from '../types/agent';

interface HeaderProps {
  status: ServerStatus | null;
  activeTab: 'forge' | 'editor' | 'test' | 'history';
  onTabChange: (tab: 'forge' | 'editor' | 'test' | 'history') => void;
  onOpenLocalModal: () => void;
  hasActiveAgent: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  activeTab,
  onTabChange,
  onOpenLocalModal,
  hasActiveAgent,
}) => {
  return (
    <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur-md sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 p-0.5 shadow-md shadow-indigo-500/20">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Radio className="w-5 h-5 text-cyan-600 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">VoiceForge</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-gradient-to-r from-cyan-50 to-indigo-50 text-cyan-700 border border-cyan-200 shadow-2xs">
                  AI Studio
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">No-Code ElevenLabs Conversational Voice Agent Builder</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200/90 shadow-2xs">
            <button
              onClick={() => onTabChange('forge')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'forge'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-600" />
                <span>1. Prompt Forge</span>
              </span>
            </button>

            <button
              onClick={() => onTabChange('editor')}
              disabled={!hasActiveAgent && activeTab === 'forge'}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'editor'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : hasActiveAgent
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  : 'text-slate-400 cursor-not-allowed opacity-50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span>2. Config Editor</span>
              </span>
            </button>

            <button
              onClick={() => onTabChange('test')}
              disabled={!hasActiveAgent && activeTab === 'forge'}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'test'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs font-semibold'
                  : hasActiveAgent
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  : 'text-slate-400 cursor-not-allowed opacity-50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Mic className={`w-4 h-4 ${activeTab === 'test' ? 'text-white' : 'text-emerald-600'}`} />
                <span>3. Live Voice Test</span>
              </span>
            </button>

            <button
              onClick={() => onTabChange('history')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span>History</span>
            </button>
          </nav>

          {/* Right Status Badges & Local Guide */}
          <div className="flex items-center gap-2">
            {/* Status pills */}
            <div className="hidden md:flex items-center gap-2 text-xs">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium ${
                  status?.gemini_configured
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
                title={status?.gemini_configured ? 'Gemini 3.8 Flash active' : 'GEMINI_API_KEY required for AI agent generation'}
              >
                {status?.gemini_configured ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span>Gemini AI</span>
              </div>

              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium ${
                  status?.elevenlabs_api_status === 'error'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : status?.elevenlabs_configured && status?.elevenlabs_api_status !== 'missing_key'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
                title={
                  status?.elevenlabs_api_error || (status?.elevenlabs_api_status === 'connected'
                    ? 'ElevenLabs API connected'
                    : 'ELEVENLABS_API_KEY missing on server')
                }
              >
                {status?.elevenlabs_api_status === 'error' ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                ) : status?.elevenlabs_configured && status?.elevenlabs_api_status !== 'missing_key' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span>{status?.elevenlabs_api_status === 'error' ? 'ElevenLabs Error' : 'ElevenLabs'}</span>
              </div>
            </div>

            <button
              onClick={onOpenLocalModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition"
              title="How to run locally and architecture details"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-600" />
              <span className="hidden sm:inline">Run Locally</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
