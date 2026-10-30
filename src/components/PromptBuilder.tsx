import React, { useState } from 'react';
import { PromptBondScene } from './ui/prompt-bond';
import { AgentConfig, GenerateAgentRequest } from '../types/agent';
import { generateAgentConfig } from '../services/api';
import { Sparkles, Wand2, Loader2, ArrowRight } from 'lucide-react';

interface PromptBuilderProps {
  onAgentGenerated: (agent: AgentConfig) => void;
  isConfiguring: boolean;
  setIsConfiguring: (val: boolean) => void;
  geminiConfigured: boolean;
}

const VOICE_PRESETS = [
  {
    title: 'Dental Clinic Receptionist',
    role: 'Medical Office Receptionist',
    prompt: 'A warm, friendly dental office assistant for Dr. Miller Smile Clinic that books cleaning checkups, answers dental insurance questions, and handles patient reschedule requests with empathy.',
    voice: 'Rachel (Calm female)',
  },
  {
    title: 'B2B SaaS Inbound SDR',
    role: 'Sales Development Representative',
    prompt: 'An upbeat, consultative inbound sales rep for CloudFlow devops platform. Qualifies leads based on company size and cloud spend, answers pricing questions, and books a 15-minute demo with an account executive.',
    voice: 'Jessica (Expressive female)',
  },
  {
    title: 'Airline Disruption Concierge',
    role: 'Passenger Care Specialist',
    prompt: 'A calm, ultra-competent flight assistance agent for SkyWings Airlines. Handles cancelled flights, offers rebooking alternatives, baggage claim information, and hotel meal vouchers during delays.',
    voice: 'George (Reassuring male)',
  },
  {
    title: 'Hotel Concierge',
    role: 'Luxury Hospitality Concierge',
    prompt: 'A charming, knowledgeable concierge for The Grand Palm Hotel in Miami. Recommends top dining, reserves private pool cabanas, and assists with checkout requests.',
    voice: 'Daniel (Authoritative male)',
  },
];

export const PromptBuilder: React.FC<PromptBuilderProps> = ({
  onAgentGenerated,
  isConfiguring,
  setIsConfiguring,
  geminiConfigured,
}) => {
  const [quickInput, setQuickInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleQuickForge = async (text: string) => {
    if (!text.trim()) return;
    try {
      setIsConfiguring(true);
      setError(null);

      const payload: GenerateAgentRequest = {
        description: text.trim(),
        language: 'en',
        voice_preference: 'female',
      };

      const agent = await generateAgentConfig(payload);
      onAgentGenerated(agent);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate agent.');
    } finally {
      setIsConfiguring(false);
    }
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Full Live Prompt Bond Scene with Interactive Shaders & Membrane */}
      <div className="w-full h-[620px] sm:h-[660px] rounded-3xl overflow-hidden border border-slate-200/90 bg-white/95 backdrop-blur-xl shadow-xl shadow-slate-200/50 relative">
        <PromptBondScene />
      </div>

      {/* VoiceForge Instant Forge Bar */}
      <div className="w-full max-w-4xl mx-auto px-2 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-2 px-3 text-cyan-700 font-bold text-xs shrink-0">
            <Sparkles className="w-4 h-4 text-cyan-600" />
            <span>Forge Real Agent:</span>
          </div>
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleQuickForge(quickInput);
              }
            }}
            placeholder="Type any voice agent role or instruction and hit Enter..."
            className="flex-1 bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-cyan-500 shadow-2xs"
          />
          <button
            onClick={() => handleQuickForge(quickInput)}
            disabled={isConfiguring || !quickInput.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 via-indigo-600 to-fuchsia-600 hover:from-cyan-500 hover:to-fuchsia-500 text-white shadow-xs disabled:opacity-40 transition"
          >
            {isConfiguring ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
            <span>Synthesize</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        {/* Quick Launch Pre-built Agents */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Quick Personas:
          </span>
          {VOICE_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickForge(p.prompt)}
              disabled={isConfiguring}
              className="text-xs px-3 py-1 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-cyan-800 border border-slate-200 shadow-2xs transition flex items-center gap-1"
            >
              <span>{p.title}</span>
              <ArrowRight className="w-2.5 h-2.5 opacity-40" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
