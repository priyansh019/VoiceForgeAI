import React from 'react';
import {
  Sparkles,
  Sliders,
  Mic,
  History,
  Radio,
  Terminal,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { AgentConfig, ServerStatus } from '../types/agent';

interface BottomDockProps {
  status: ServerStatus | null;
  activeTab: 'forge' | 'editor' | 'test' | 'history';
  onTabChange: (tab: 'forge' | 'editor' | 'test' | 'history') => void;
  onOpenLocalModal: () => void;
  activeAgent: AgentConfig | null;
  isCallActive?: boolean;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  status,
  activeTab,
  onTabChange,
  onOpenLocalModal,
  activeAgent,
  isCallActive = false,
}) => {
  return (
    <div className="fixed bottom-3 sm:bottom-5 inset-x-0 mx-auto w-fit max-w-[95vw] z-50 pointer-events-auto">
      <div className="flex items-center gap-1.5 sm:gap-2.5 p-1.5 sm:p-2 rounded-2xl bg-white/92 backdrop-blur-xl border border-slate-200/90 shadow-xl shadow-slate-300/40 text-slate-800 transition-all">

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
          {/* Tab 1: Prompt Forge */}
          <button
            onClick={() => onTabChange('forge')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'forge'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
            title="AI Prompt Forge"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>Forge</span>
          </button>

          {/* Tab 2: Config Editor */}
          <button
            onClick={() => onTabChange('editor')}
            disabled={!activeAgent}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'editor'
                ? 'bg-white text-slate-900 shadow-xs'
                : activeAgent
                ? 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                : 'text-slate-400 cursor-not-allowed opacity-50'
            }`}
            title="Configure Agent & Voice Settings"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            <span>Editor</span>
            {activeAgent && (
              <span className="hidden xl:inline text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded-md font-normal">
                {activeAgent.name.length > 12 ? `${activeAgent.name.slice(0, 12)}...` : activeAgent.name}
              </span>
            )}
          </button>

          {/* Tab 3: Live Voice Sandbox */}
          <button
            onClick={() => onTabChange('test')}
            disabled={!activeAgent}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'test'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                : activeAgent
                ? 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                : 'text-slate-400 cursor-not-allowed opacity-50'
            }`}
            title="Test real browser audio call"
          >
            <Mic className={`w-3.5 h-3.5 ${activeTab === 'test' ? 'text-white' : 'text-emerald-600'}`} />
            <span>Voice Test</span>
            {isCallActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-0.5" />
            )}
          </button>

          {/* Tab 4: Session History */}
          <button
            onClick={() => onTabChange('history')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
            title="View past test sessions & logs"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">History</span>
          </button>
        </nav>

        {/* Status Indicators */}
        <div className="flex items-center gap-1 sm:gap-1.5 pl-1">
          {/* Gemini Status */}
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border ${
              status?.gemini_configured
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
            title={status?.gemini_configured ? 'Gemini 3.8 Flash Active' : 'GEMINI_API_KEY required'}
          >
            {status?.gemini_configured ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-3 h-3 text-amber-600" />
            )}
            <span className="hidden sm:inline">Gemini</span>
          </div>

          {/* ElevenLabs Status */}
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border ${
              status?.elevenlabs_api_status === 'error'
                ? 'bg-red-50 text-red-800 border-red-200'
                : status?.elevenlabs_configured && status?.elevenlabs_api_status !== 'missing_key'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
            title={status?.elevenlabs_api_error || (status?.elevenlabs_api_status === 'connected' ? 'ElevenLabs API connected' : 'ELEVENLABS_API_KEY missing')}
          >
            {status?.elevenlabs_api_status === 'error' ? (
              <AlertTriangle className="w-3 h-3 text-red-600" />
            ) : status?.elevenlabs_configured && status?.elevenlabs_api_status !== 'missing_key' ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-3 h-3 text-amber-600" />
            )}
            <span className="hidden sm:inline">{status?.elevenlabs_api_status === 'error' ? 'ElevenLabs Error' : 'ElevenLabs'}</span>
          </div>

          {/* Local Run Guide Modal Button */}
          <button
            onClick={onOpenLocalModal}
            className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Architecture details & how to run locally"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-700" />
            <span className="hidden md:inline text-[11px]">Run Guide</span>
          </button>
        </div>
      </div>
    </div>
  );
};
