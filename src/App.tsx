/**
 * VoiceForge AI - No-Code Conversational Voice Agent Builder
 * Clean, Minimal & Interactive Light Theme with Bottom Dock Navigation & Status
 */

import React, { useState, useEffect } from 'react';
import { PromptBuilder } from './components/PromptBuilder';
import { ConfigEditor } from './components/ConfigEditor';
import { VoiceTester } from './components/VoiceTester';
import { SessionHistory } from './components/SessionHistory';
import { LocalRunModal } from './components/LocalRunModal';
import { BottomDock } from './components/BottomDock';
import { InteractiveShaderBackground } from './components/ui/prompt-bond';
import { AgentConfig, ServerStatus, SessionRecord, VoiceOption } from './types/agent';
import { checkServerStatus, fetchVoices, getSavedAgents, getSessions } from './services/api';
import { Loader2, Radio } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'forge' | 'editor' | 'test' | 'history'>('forge');
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [activeAgent, setActiveAgent] = useState<AgentConfig | null>(null);
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [isConfiguring, setIsConfiguring] = useState<boolean>(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);
  const [isLocalModalOpen, setIsLocalModalOpen] = useState<boolean>(false);
  const [isCallActive, setIsCallActive] = useState<boolean>(false);

  // Initial data loading
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [statusRes, voicesRes, agentsRes, sessionsRes] = await Promise.allSettled([
          checkServerStatus(),
          fetchVoices(),
          getSavedAgents(),
          getSessions(),
        ]);

        if (statusRes.status === 'fulfilled') {
          setServerStatus(statusRes.value);
        }
        if (voicesRes.status === 'fulfilled') {
          setVoices(voicesRes.value);
        }
        if (agentsRes.status === 'fulfilled') {
          setAgents(agentsRes.value);
          if (agentsRes.value.length > 0) {
            setActiveAgent(agentsRes.value[0]);
          }
        }
        if (sessionsRes.status === 'fulfilled') {
          setSessions(sessionsRes.value);
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        setIsLoadingInitial(false);
      }
    }

    loadInitialData();
  }, []);

  const refreshAgentsAndSessions = async () => {
    try {
      const [agentsData, sessionsData] = await Promise.all([getSavedAgents(), getSessions()]);
      setAgents(agentsData);
      setSessions(sessionsData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAgentGenerated = (agent: AgentConfig) => {
    setActiveAgent(agent);
    setAgents((prev) => [agent, ...prev]);
    setActiveTab('editor');
  };

  const handleUpdateAgent = (updatedAgent: AgentConfig) => {
    setActiveAgent(updatedAgent);
    setAgents((prev) => prev.map((a) => (a.id === updatedAgent.id ? updatedAgent : a)));
  };

  const handleStartTesting = (agent: AgentConfig) => {
    setActiveAgent(agent);
    setActiveTab('test');
  };

  const handleSelectAgentFromHistory = (agent: AgentConfig) => {
    setActiveAgent(agent);
    setActiveTab('editor');
  };

  const handleSessionSaved = (newSession: SessionRecord) => {
    setSessions((prev) => [newSession, ...prev]);
  };

  if (isLoadingInitial) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-700 relative">
        <InteractiveShaderBackground mode="light" />
        <div className="relative z-10 flex flex-col items-center bg-white/95 p-8 rounded-3xl border border-slate-200/80 shadow-2xl backdrop-blur-md">
          <Loader2 className="w-8 h-8 text-cyan-600 animate-spin mb-3" />
          <p className="text-sm font-bold text-slate-800">Initializing VoiceForge Studio...</p>
          <p className="text-xs text-slate-500 mt-1">Connecting Gemini 3.8 Flash & ElevenLabs Engine</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/90 text-slate-900 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-900 relative">
      {/* Background Interactive Shader Effect */}
      <InteractiveShaderBackground mode="light" />

      {/* Minimal Top Brand Bar */}
      <header className="relative z-30 pt-4 sm:pt-6 px-4 sm:px-8 max-w-7xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 p-0.5 shadow-md shadow-indigo-500/20">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <Radio className="w-4 h-4 text-cyan-600 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base text-slate-900 tracking-tight">VoiceForge</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-2xs">
              ElevenLabs AI
            </span>
          </div>
        </div>

        {/* Minimal indicator for active agent if exists */}
        {activeAgent && (
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-2xs text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Active: {activeAgent.name}</span>
          </div>
        )}
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-28 sm:pb-32 relative z-10">
        {activeTab === 'forge' && (
          <PromptBuilder
            onAgentGenerated={handleAgentGenerated}
            isConfiguring={isConfiguring}
            setIsConfiguring={setIsConfiguring}
            geminiConfigured={Boolean(serverStatus?.gemini_configured)}
          />
        )}

        {activeTab === 'editor' && activeAgent && (
          <ConfigEditor
            agent={activeAgent}
            onUpdateAgent={handleUpdateAgent}
            onStartTesting={handleStartTesting}
            voices={voices}
            elevenlabsConfigured={Boolean(serverStatus?.elevenlabs_configured)}
          />
        )}

        {activeTab === 'test' && activeAgent && (
          <VoiceTester
            agent={activeAgent}
            onUpdateAgent={handleUpdateAgent}
            onBackToEditor={() => setActiveTab('editor')}
            elevenlabsConfigured={Boolean(serverStatus?.elevenlabs_configured)}
            onSessionSaved={handleSessionSaved}
          />
        )}

        {activeTab === 'history' && (
          <SessionHistory
            sessions={sessions}
            agents={agents}
            onSelectAgent={handleSelectAgentFromHistory}
            onRefreshData={refreshAgentsAndSessions}
          />
        )}
      </main>

      {/* All Navigation Tabs & Status Tabs Docked at Bottom of Screen */}
      <BottomDock
        status={serverStatus}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenLocalModal={() => setIsLocalModalOpen(true)}
        activeAgent={activeAgent}
        isCallActive={isCallActive}
      />

      {/* Architecture & Local Run Modal */}
      <LocalRunModal isOpen={isLocalModalOpen} onClose={() => setIsLocalModalOpen(false)} />
    </div>
  );
}
