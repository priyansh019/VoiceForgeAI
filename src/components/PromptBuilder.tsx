import React, { useState } from 'react';
import {
  Wand2,
  Loader2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ArrowRight,
  Radio,
  Sparkles,
} from 'lucide-react';
import { AgentConfig, GenerateAgentRequest } from '../types/agent';
import { generateAgentConfig } from '../services/api';
import { SimpleLivingHero } from './ui/prompt-bond';

interface PromptBuilderProps {
  onAgentGenerated: (agent: AgentConfig) => void;
  isConfiguring: boolean;
  setIsConfiguring: (val: boolean) => void;
  geminiConfigured: boolean;
}

const TEMPLATES = [
  {
    title: 'Dental Clinic Receptionist',
    role: 'Medical Office Receptionist',
    prompt: 'A warm, friendly dental office assistant for Dr. Miller Smile Clinic that books cleaning checkups, answers dental insurance questions, and handles patient reschedule requests with empathy.',
    style: 'Warm, reassuring, professional',
    voice: 'Rachel (Calm female)',
  },
  {
    title: 'B2B SaaS Inbound SDR',
    role: 'Sales Development Representative',
    prompt: 'An upbeat, consultative inbound sales rep for CloudFlow, an automated devops platform. Qualifies leads based on company size and cloud spend, answers pricing questions, and books a 15-minute demo with an account executive.',
    style: 'Consultative, energetic, concise',
    voice: 'Jessica (Engaging female)',
  },
  {
    title: 'Airline Disruption Concierge',
    role: 'Customer Care Specialist',
    prompt: 'A calm, ultra-competent flight assistance agent for SkyWings Airlines. Handles cancelled flights, offers rebooking alternatives, baggage claim information, and hotel meal vouchers during delays.',
    style: 'Reassuring, clear, patient',
    voice: 'George (Reassuring male)',
  },
  {
    title: 'Boutique Hotel Concierge',
    role: 'Luxury Hospitality Concierge',
    prompt: 'A charming, knowledgeable concierge for The Grand Palm Hotel in Miami. Recommends top local dining, reserves private pool cabanas, and assists with late checkout requests.',
    style: 'Sophisticated, welcoming, courteous',
    voice: 'Daniel (Authoritative male)',
  },
];

export const PromptBuilder: React.FC<PromptBuilderProps> = ({
  onAgentGenerated,
  isConfiguring,
  setIsConfiguring,
  geminiConfigured,
}) => {
  const [description, setDescription] = useState('');
  const [role, setRole] = useState('');
  const [style, setStyle] = useState('Friendly, professional, concise');
  const [language, setLanguage] = useState('en');
  const [voicePreference, setVoicePreference] = useState('female');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeGeneration = async (descText: string) => {
    if (!descText.trim()) return;
    try {
      setIsConfiguring(true);
      setError(null);

      const payload: GenerateAgentRequest = {
        description: descText.trim(),
        role: role.trim() || undefined,
        style: style.trim() || undefined,
        language,
        voice_preference: voicePreference,
      };

      const generatedAgent = await generateAgentConfig(payload);
      onAgentGenerated(generatedAgent);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate agent.');
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleSelectTemplate = (tpl: typeof TEMPLATES[0]) => {
    setDescription(tpl.prompt);
    setRole(tpl.role);
    setStyle(tpl.style);
    setError(null);
    executeGeneration(tpl.prompt);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-20">
      {/* Interactive Living Hero Capsule from attached prompt */}
      <SimpleLivingHero
        onPromptSubmit={(text) => {
          setDescription(text);
          executeGeneration(text);
        }}
        isGenerating={isConfiguring}
        suggestedPrompts={[
          'Dental clinic receptionist assistant',
          'Inbound B2B SaaS sales SDR rep',
          'Airline flight delay concierge',
          '24/7 IT helpdesk troubleshooting assistant',
        ]}
      />

      {/* Loading state indicator */}
      {isConfiguring && (
        <div className="flex flex-col items-center justify-center p-6 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-lg max-w-md mx-auto text-center space-y-2 animate-pulse">
          <Loader2 className="w-7 h-7 text-cyan-600 animate-spin" />
          <h3 className="text-sm font-bold text-slate-800">Synthesizing Spoken Voice Agent...</h3>
          <p className="text-xs text-slate-500">
            Formulating spoken turn boundaries, vocal persona, and ElevenLabs configuration with Gemini 3.8 Flash.
          </p>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs max-w-2xl mx-auto shadow-sm">
          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Curated Pre-built Agents Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-600" />
            <span>Or launch a ready-to-test voice persona</span>
          </span>
          <span className="text-xs text-slate-400">One-click synthesis</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {TEMPLATES.map((t, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectTemplate(t)}
              className="p-4 rounded-2xl bg-white/90 hover:bg-white backdrop-blur-md border border-slate-200/90 hover:border-cyan-300 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-cyan-700 transition">
                    {t.title}
                  </span>
                  <span className="text-[10px] text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200 font-medium">
                    {t.voice}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {t.prompt}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-400">
                <span className="font-medium text-slate-500">{t.role}</span>
                <span className="flex items-center gap-1 text-cyan-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>Forge Agent</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Drawer Toggle for Fine-Tuning */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition py-1 px-3 rounded-full hover:bg-white/60"
        >
          <SlidersHorizontal className="w-3 h-3 text-cyan-600" />
          <span>Customize Voice Gender & Personality</span>
          {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-3 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 text-left shadow-sm max-w-2xl mx-auto">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Role / Function</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Inbound Specialist"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-cyan-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tone & Cadence</label>
              <input
                type="text"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="e.g. Friendly, professional"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-cyan-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Voice Matching</label>
              <select
                value={voicePreference}
                onChange={(e) => setVoicePreference(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-cyan-500 shadow-2xs"
              >
                <option value="female">Female (Rachel / Jessica)</option>
                <option value="male">Male (George / Daniel)</option>
                <option value="any">Auto Best Match</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
