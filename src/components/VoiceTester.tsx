import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  PhoneOff,
  Radio,
  Volume2,
  AlertCircle,
  CheckCircle2,
  Star,
  FileText,
  Save,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Conversation } from '@elevenlabs/client';
import { AgentConfig, ConversationMessage, SessionRecord } from '../types/agent';
import { getConversationSignedUrl, deployAgentToElevenLabs, saveSession } from '../services/api';

interface VoiceTesterProps {
  agent: AgentConfig;
  onUpdateAgent: (agent: AgentConfig) => void;
  onBackToEditor: () => void;
  elevenlabsConfigured: boolean;
  onSessionSaved: (session: SessionRecord) => void;
}

export const VoiceTester: React.FC<VoiceTesterProps> = ({
  agent,
  onUpdateAgent,
  onBackToEditor,
  elevenlabsConfigured,
  onSessionSaved,
}) => {
  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'deploying' | 'connecting' | 'connected' | 'disconnecting' | 'ended' | 'error'
  >('idle');
  const [activeMode, setActiveMode] = useState<'listening' | 'speaking' | 'idle'>('idle');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [callDuration, setCallDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Post-call review state
  const [rating, setRating] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // References for live session
  const conversationRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<Date | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat log
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (conversationRef.current) {
        try {
          conversationRef.current.endSession();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const startCall = async () => {
    setErrorMessage(null);
    setSavedSuccess(false);

    let targetAgentId = agent.elevenlabs_agent_id;

    // Check if agent needs to be deployed first
    if (!targetAgentId) {
      if (!elevenlabsConfigured) {
        setErrorMessage(
          'ELEVENLABS_API_KEY is not configured on the server. Live browser voice calls require a real ElevenLabs agent. Please configure ELEVENLABS_API_KEY on the server or in Secrets.'
        );
        setConnectionStatus('error');
        return;
      }

      try {
        setConnectionStatus('deploying');
        const deployRes = await deployAgentToElevenLabs(agent);
        targetAgentId = deployRes.agent_id;
        onUpdateAgent({ ...agent, elevenlabs_agent_id: targetAgentId });
      } catch (err: any) {
        setErrorMessage(`Failed to deploy agent to ElevenLabs: ${err.message}`);
        setConnectionStatus('error');
        return;
      }
    }

    try {
      setConnectionStatus('connecting');

      // 1. Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // 2. Fetch real signed session URL from server (keeping API key secure on server)
      const signedUrl = await getConversationSignedUrl(targetAgentId);

      // 3. Initiate real ElevenLabs Conversational AI session
      setMessages([
        {
          id: `msg_sys_${Date.now()}`,
          role: 'system',
          text: `Starting session with ${agent.name} (${agent.voice_name} voice)...`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        },
      ]);

      const conv = await Conversation.startSession({
        signedUrl: signedUrl,
        onConnect: () => {
          setConnectionStatus('connected');
          startTimeRef.current = new Date();
          setCallDuration(0);
          timerRef.current = setInterval(() => {
            setCallDuration((prev) => prev + 1);
          }, 1000);
        },
        onDisconnect: () => {
          setConnectionStatus('ended');
          if (timerRef.current) clearInterval(timerRef.current);
          setActiveMode('idle');
        },
        onError: (err: any) => {
          console.error('ElevenLabs session error:', err);
          setErrorMessage(typeof err === 'string' ? err : err?.message || 'Voice session error encountered.');
          setConnectionStatus('error');
          if (timerRef.current) clearInterval(timerRef.current);
        },
        onModeChange: (mode: any) => {
          setActiveMode(mode?.mode || 'idle');
        },
        onMessage: (payload: any) => {
          if (!payload?.message) return;
          const role = payload.source === 'ai' ? 'agent' : 'user';
          setMessages((prev) => [
            ...prev,
            {
              id: `msg_${Date.now()}_${Math.random()}`,
              role: role,
              text: payload.message,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            },
          ]);
        },
      });

      conversationRef.current = conv;
    } catch (err: any) {
      console.error('Failed to start conversation:', err);
      setErrorMessage(
        err.message?.includes('Permission')
          ? 'Microphone permission was denied. Please grant microphone access to test voice conversation.'
          : err.message || 'Failed to start conversation session.'
      );
      setConnectionStatus('error');
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const endCall = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setConnectionStatus('disconnecting');
    try {
      if (conversationRef.current) {
        await conversationRef.current.endSession();
      }
    } catch (e) {
      console.warn('Error during disconnect:', e);
    } finally {
      setConnectionStatus('ended');
      setActiveMode('idle');
    }
  };

  const handleSaveSession = async () => {
    try {
      setIsSavingSession(true);
      setSaveError(null);
      const saved = await saveSession({
        agent_id: agent.id,
        agent_name: agent.name,
        elevenlabs_agent_id: agent.elevenlabs_agent_id,
        start_time: startTimeRef.current?.toISOString() || new Date().toISOString(),
        end_time: new Date().toISOString(),
        duration_seconds: callDuration,
        messages: messages,
        rating: rating,
        notes: notes,
      });

      setSavedSuccess(true);
      onSessionSaved(saved);
    } catch (err: any) {
      console.error('Failed to save session:', err);
      setSaveError(err.message || 'Failed to save session. Please try again.');
    } finally {
      setIsSavingSession(false);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToEditor}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-2xs"
            title="Back to Config Editor"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Step 3: Live Sandbox
              </span>
              <span className="text-xs text-slate-500 font-medium">Voice: {agent.voice_name}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5">{agent.name}</h1>
          </div>
        </div>

        {/* Live Call Status Badge */}
        <div className="flex items-center gap-3">
          {connectionStatus === 'connected' && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 px-3.5 py-1.5 rounded-xl text-emerald-800 text-xs font-mono font-bold shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>LIVE {formatTimer(callDuration)}</span>
            </div>
          )}

          {agent.elevenlabs_agent_id ? (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-600 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono shadow-2xs">
              <Radio className="w-3.5 h-3.5 text-cyan-600" />
              <span>{agent.elevenlabs_agent_id.slice(0, 16)}...</span>
            </div>
          ) : (
            <div className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200 font-medium">
              Not yet deployed to ElevenLabs
            </div>
          )}
        </div>
      </div>

      {/* Main Testing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Interactive Voice Stage (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Visualizer & Call Stage Card */}
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[380px] shadow-xl shadow-slate-200/60">
            {/* Background Ambience Wave */}
            <div
              className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
                activeMode === 'speaking'
                  ? 'bg-gradient-to-b from-cyan-400/15 via-indigo-400/10 to-transparent opacity-100'
                  : activeMode === 'listening'
                  ? 'bg-gradient-to-b from-emerald-400/15 via-teal-400/10 to-transparent opacity-100'
                  : 'opacity-0'
              }`}
            />

            {/* Central Animated Orb */}
            <div className="relative mb-6">
              {/* Outer wave rings */}
              {connectionStatus === 'connected' && activeMode === 'speaking' && (
                <>
                  <div className="absolute inset-0 rounded-full bg-cyan-400/25 animate-ping scale-150" />
                  <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-pulse scale-125" />
                </>
              )}
              {connectionStatus === 'connected' && activeMode === 'listening' && (
                <>
                  <div className="absolute inset-0 rounded-full bg-emerald-400/25 animate-ping scale-125" />
                </>
              )}

              {/* Core Orb */}
              <div
                className={`w-36 h-36 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl relative z-10 ${
                  connectionStatus === 'connected'
                    ? activeMode === 'speaking'
                      ? 'bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 shadow-cyan-500/40 scale-105'
                      : activeMode === 'listening'
                      ? 'bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 shadow-emerald-500/40'
                      : 'bg-white border-2 border-slate-200 shadow-md'
                    : connectionStatus === 'connecting' || connectionStatus === 'deploying'
                    ? 'bg-slate-50 border-2 border-cyan-400 animate-pulse'
                    : 'bg-slate-100 border-2 border-slate-200'
                }`}
              >
                {connectionStatus === 'connecting' || connectionStatus === 'deploying' ? (
                  <Loader2 className="w-12 h-12 text-cyan-600 animate-spin" />
                ) : connectionStatus === 'connected' ? (
                  activeMode === 'speaking' ? (
                    <Volume2 className="w-12 h-12 text-white animate-bounce" />
                  ) : (
                    <Mic className="w-12 h-12 text-white" />
                  )
                ) : (
                  <Radio className="w-12 h-12 text-slate-400" />
                )}
              </div>
            </div>

            {/* Status Text & Mode */}
            <div className="space-y-1 relative z-10 mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                {connectionStatus === 'idle' && 'Ready for Live Voice Call'}
                {connectionStatus === 'deploying' && 'Creating Real ElevenLabs Agent...'}
                {connectionStatus === 'connecting' && 'Securing WebSocket Audio Stream...'}
                {connectionStatus === 'connected' && (
                  activeMode === 'speaking' ? `${agent.name} is speaking...` : 'Listening to your microphone...'
                )}
                {connectionStatus === 'disconnecting' && 'Ending conversation...'}
                {connectionStatus === 'ended' && 'Call Concluded'}
                {connectionStatus === 'error' && 'Session Interrupted'}
              </h2>
              <p className="text-xs text-slate-500 max-w-sm">
                {connectionStatus === 'connected'
                  ? 'Speak naturally into your microphone. ElevenLabs processes speech turn-taking in real time.'
                  : connectionStatus === 'idle'
                  ? 'Click "Start Live Conversation" to connect your browser audio to ElevenLabs.'
                  : connectionStatus === 'ended'
                  ? 'Review the conversation transcript and save session data.'
                  : ''}
              </p>
            </div>

            {/* Error Message Notice */}
            {errorMessage && (
              <div className="w-full max-w-md p-3.5 mb-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left flex items-start gap-2.5 shadow-2xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <span className="font-bold block">ElevenLabs Notice:</span>
                  <p className="leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Action Controls */}
            <div className="flex items-center gap-3 relative z-10">
              {connectionStatus === 'idle' || connectionStatus === 'ended' || connectionStatus === 'error' ? (
                <button
                  onClick={startCall}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25 transition transform active:scale-95"
                >
                  <Mic className="w-4 h-4" />
                  <span>Start Live Conversation</span>
                </button>
              ) : connectionStatus === 'connected' ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={endCall}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/25 transition transform active:scale-95"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>End Call</span>
                  </button>
                </div>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-slate-600 bg-slate-100 opacity-80 cursor-wait border border-slate-200"
                >
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
                  <span>Connecting Audio...</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Voice Prompt Chips */}
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Suggested Prompts to Speak Out Loud:
            </span>
            <div className="flex flex-wrap gap-2">
              {agent.suggested_questions && agent.suggested_questions.length > 0 ? (
                agent.suggested_questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="text-xs px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-1.5 shadow-2xs"
                  >
                    <Mic className="w-3 h-3 text-cyan-600" />
                    <span>"{q}"</span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-400">No suggested questions configured.</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Live Transcript & Session Summary (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 flex-1 flex flex-col min-h-[460px] shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-600" />
                <h3 className="text-sm font-bold text-slate-900">Live Conversation Transcript</h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono font-medium">{messages.length} utterances</span>
            </div>

            {/* Transcript Log Stream */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 max-h-[380px]">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                  <Radio className="w-8 h-8 opacity-40 text-slate-400" />
                  <p className="text-xs font-medium text-slate-500">No audio transcribed yet.</p>
                  <p className="text-[11px] text-slate-400">
                    Transcripts stream live as you speak and the agent answers.
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  if (m.role === 'system') {
                    return (
                      <div key={m.id} className="text-center my-1">
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                          {m.text}
                        </span>
                      </div>
                    );
                  }

                  const isUser = m.role === 'user';
                  return (
                    <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[10px] font-bold text-slate-600">
                          {isUser ? 'You' : agent.name}
                        </span>
                        <span className="text-[9px] text-slate-400">{m.timestamp}</span>
                      </div>
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-2xs ${
                          isUser
                            ? 'bg-cyan-600 text-white rounded-br-none'
                            : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Post-Call Review / Session Saver */}
            {connectionStatus === 'ended' && (
              <div className="mt-3 pt-3 border-t border-slate-200 space-y-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Save Call to Session History
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className={`p-0.5 transition ${rating >= s ? 'text-amber-500' : 'text-slate-300'}`}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes (e.g., Latency was fast, natural tone)"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 shadow-2xs"
                />

                {saveError && (
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                    <span>{saveError}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  {savedSuccess ? (
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Session recorded!
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-medium">Duration: {formatTimer(callDuration)}</span>
                  )}

                  <button
                    onClick={handleSaveSession}
                    disabled={isSavingSession || savedSuccess}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white shadow-2xs transition"
                  >
                    {isSavingSession ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    <span>{savedSuccess ? 'Saved' : 'Save Session'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
