/**
 * VoiceForge AI - No-Code Conversational Voice Agent Builder
 * Clean, Minimal & Interactive Light Theme with Bottom Dock Navigation & Status
 */

import React, { useState, useEffect, useRef } from 'react';
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
import { AnimatePresence, motion } from 'motion/react';

const TAB_ORDER: Array<'forge' | 'editor' | 'test' | 'history'> = ['forge', 'editor', 'test', 'history'];

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
  const slideDir = useRef<1 | -1>(1); // 1 = slide left (forward), -1 = slide right (backward)

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
        } else {
          setServerStatus({
            gemini_configured: false,
            elevenlabs_configured: false,
            elevenlabs_api_status: 'error',
            elevenlabs_api_error: `Could not check ElevenLabs API: ${statusRes.reason?.message || 'VoiceForge server unavailable'}`,
            server_time: new Date().toISOString(),
            node_env: 'unknown',
          });
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

  // Recheck the ElevenLabs key and API availability while the app is open.
  useEffect(() => {
    const intervalId = window.setInterval(async () => {
      try {
        setServerStatus(await checkServerStatus());
      } catch (error: any) {
        setServerStatus((current) => current ? {
          ...current,
          elevenlabs_api_status: 'error',
          elevenlabs_api_error: `VoiceForge status check failed: ${error.message || 'server unavailable'}`,
        } : current);
      }
    }, 30000);

    return () => window.clearInterval(intervalId);
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

  const changeTab = (nextTab: 'forge' | 'editor' | 'test' | 'history') => {
    const currentIdx = TAB_ORDER.indexOf(activeTab);
    const nextIdx = TAB_ORDER.indexOf(nextTab);
    slideDir.current = nextIdx >= currentIdx ? 1 : -1;
    setActiveTab(nextTab);
  };

  const handleAgentGenerated = (agent: AgentConfig) => {
    slideDir.current = 1; // forge → editor is always forward
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
    slideDir.current = -1; // history ? editor is backward
    setActiveAgent(agent);
    setActiveTab('editor');
  };

  const handleSessionSaved = (newSession: SessionRecord) => {
    setSessions((prev) => [newSession, ...prev]);
  };

  // Direction-aware slide values
  const D = slideDir.current * 24;

  return (
    <div className="min-h-screen bg-slate-50/90 text-slate-900 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-900 relative">
      {/* Background Interactive Shader Effect */}
      <InteractiveShaderBackground mode="light" />

      <AnimatePresence mode="wait">
        {isLoadingInitial ? (
          <motion.div
            key="initial-loader"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative z-10 flex flex-col items-center bg-white/95 p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-2xl backdrop-blur-md max-w-sm text-center">
              <div className="w-10 h-10 rounded-2xl bg-cyan-50 flex items-center justify-center mb-3 border border-cyan-100">
                <Loader2 className="w-6 h-6 text-cyan-600 animate-spin" />
              </div>
              <p className="text-sm font-bold text-slate-800">Initializing VoiceForge Studio...</p>
              <p className="text-xs text-slate-500 mt-1">Connecting Gemini 3.8 Flash &amp; ElevenLabs Engine</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="main-app"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col w-full origin-center"
          >
            {/* Minimal Top Brand Bar */}
            <header className="relative z-30 pt-4 sm:pt-6 px-4 sm:px-8 max-w-7xl w-full mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 p-0.5 shadow-md shadow-indigo-500/20">
                  <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                    <Radio className="w-4 h-4 text-cyan-600 animate-pulse" />
                  </div>
                </div>
                <span className="font-extrabold text-base text-slate-900 tracking-tight">VoiceForge</span>
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
              <AnimatePresence mode="sync" initial={false}>
                {activeTab === 'forge' && (
                  <motion.div
                    key="forge"
                    initial={{ opacity: 0, x: -D }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: D }}
                    transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
                    className="w-full"
                  >
                    <PromptBuilder
                      onAgentGenerated={handleAgentGenerated}
                      isConfiguring={isConfiguring}
                      setIsConfiguring={setIsConfiguring}
                      geminiConfigured={Boolean(serverStatus?.gemini_configured)}
                    />
                  </motion.div>
                )}

                {activeTab === 'editor' && activeAgent && (
                  <motion.div
                    key="editor"
                    initial={{ opacity: 0, x: D }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -D }}
                    transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
                    className="w-full"
                  >
                    <ConfigEditor
                      agent={activeAgent}
                      onUpdateAgent={handleUpdateAgent}
                      onStartTesting={handleStartTesting}
                      voices={voices}
                      elevenlabsConfigured={Boolean(serverStatus?.elevenlabs_configured)}
                      elevenlabsApiError={serverStatus?.elevenlabs_api_error}
                      elevenlabsApiStatus={serverStatus?.elevenlabs_api_status}
                    />
                  </motion.div>
                )}

                {activeTab === 'test' && activeAgent && (
                  <motion.div
                    key="test"
                    initial={{ opacity: 0, x: D }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -D }}
                    transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
                    className="w-full"
                  >
                    <VoiceTester
                      agent={activeAgent}
                      onUpdateAgent={handleUpdateAgent}
                      onBackToEditor={() => changeTab('editor')}
                      elevenlabsConfigured={Boolean(serverStatus?.elevenlabs_configured)}
                      elevenlabsApiError={serverStatus?.elevenlabs_api_error}
                      onSessionSaved={handleSessionSaved}
                    />
                  </motion.div>
                )}

                {activeTab === 'history' && (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0, x: D }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -D }}
                    transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
                    className="w-full"
                  >
                    <SessionHistory
                      sessions={sessions}
                      agents={agents}
                      onSelectAgent={handleSelectAgentFromHistory}
                      onRefreshData={refreshAgentsAndSessions}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            {/* All Navigation Tabs & Status Tabs Docked at Bottom of Screen */}
            <BottomDock
              status={serverStatus}
              activeTab={activeTab}
              onTabChange={changeTab}
              onOpenLocalModal={() => setIsLocalModalOpen(true)}
              activeAgent={activeAgent}
              isCallActive={isCallActive}
            />

            {/* Architecture & Local Run Modal */}
            <LocalRunModal isOpen={isLocalModalOpen} onClose={() => setIsLocalModalOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

