import React, { useState } from 'react';
import {
  History,
  Star,
  Clock,
  MessageSquare,
  Bot,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { AgentConfig, SessionRecord } from '../types/agent';
import { deleteAgentLocal } from '../services/api';

interface SessionHistoryProps {
  sessions: SessionRecord[];
  agents: AgentConfig[];
  onSelectAgent: (agent: AgentConfig) => void;
  onRefreshData: () => void;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({
  sessions,
  agents,
  onSelectAgent,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'sessions' | 'agents'>('sessions');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins}m ${remainder}s`;
  };

  const handleDeleteAgent = async (id: string) => {
    try {
      await deleteAgentLocal(id);
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-cyan-600" />
            <span>Agent Library & Session Logs</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View completed voice test runs, evaluate transcription quality, and reload configurations for prompt refinement.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'sessions'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Voice Calls ({sessions.length})
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'agents'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Saved Agents ({agents.length})
          </button>
        </div>
      </div>

      {/* Tab: Session Logs */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="bg-white/80 border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-3 shadow-xs">
              <History className="w-10 h-10 mx-auto text-slate-400" />
              <h3 className="text-sm font-bold text-slate-800">No Test Calls Recorded Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Head over to Step 3 (Live Voice Test), start a conversation with an ElevenLabs agent, and save your call session.
              </p>
            </div>
          ) : (
            sessions.map((sess) => {
              const isExpanded = expandedSessionId === sess.id;
              const matchingAgent = agents.find((a) => a.id === sess.agent_id);

              return (
                <div
                  key={sess.id}
                  className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md space-y-3 transition"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{sess.agent_name}</h3>
                        {sess.elevenlabs_agent_id && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-medium">
                            ElevenLabs
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {formatDuration(sess.duration_seconds || 0)}
                        </span>
                        <span>{new Date(sess.start_time).toLocaleString()}</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                          {sess.messages?.length || 0} messages
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {sess.rating && (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                (sess.rating || 0) >= s ? 'text-amber-400 fill-current' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      )}

                      {matchingAgent && (
                        <button
                          onClick={() => onSelectAgent(matchingAgent)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition"
                        >
                          <Sliders className="w-3 h-3 text-cyan-600" />
                          <span>Refine Config</span>
                        </button>
                      )}

                      <button
                        onClick={() => setExpandedSessionId(isExpanded ? null : sess.id)}
                        className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 transition"
                        title={isExpanded ? 'Collapse transcript' : 'Expand transcript'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {sess.notes && (
                    <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <strong className="text-slate-900 font-semibold">Notes: </strong> {sess.notes}
                    </div>
                  )}

                  {/* Expanded Transcript */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-slate-200 space-y-2">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                        Full Audio Call Transcript
                      </span>
                      <div className="bg-slate-50 rounded-xl p-3 max-h-72 overflow-y-auto space-y-2.5 border border-slate-200">
                        {sess.messages && sess.messages.length > 0 ? (
                          sess.messages.map((m, idx) => (
                            <div
                              key={idx}
                              className={`flex flex-col text-xs ${
                                m.role === 'user' ? 'items-end' : 'items-start'
                              }`}
                            >
                              <span className="text-[10px] text-slate-500 mb-0.5">
                                {m.role === 'user' ? 'You' : sess.agent_name} ({m.timestamp})
                              </span>
                              <div
                                className={`rounded-xl px-3 py-1.5 max-w-[85%] leading-relaxed shadow-2xs ${
                                  m.role === 'user'
                                    ? 'bg-cyan-600 text-white'
                                    : 'bg-white text-slate-800 border border-slate-200'
                                }`}
                              >
                                {m.text}
                              </div>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">No message contents recorded.</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab: Saved Agents */}
      {activeTab === 'agents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.length === 0 ? (
            <div className="col-span-2 bg-white/80 border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-3 shadow-xs">
              <Bot className="w-10 h-10 mx-auto text-slate-400" />
              <h3 className="text-sm font-bold text-slate-800">No Agents Saved</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Generate an agent in Step 1 (Prompt Forge) to get started!
              </p>
            </div>
          ) : (
            agents.map((ag) => (
              <div
                key={ag.id}
                className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 hover:shadow-md transition shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-cyan-700">{ag.role}</span>
                    {ag.elevenlabs_agent_id ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-mono font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Synced
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        Draft
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{ag.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{ag.description}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Voice: <strong className="text-slate-700">{ag.voice_name}</strong></span>
                    <span>Lang: <strong className="text-slate-700">{ag.language}</strong></span>
                    <span>Turn: <strong className="text-slate-700">{ag.turn_timeout}s</strong></span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => onSelectAgent(ag)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-2xs transition"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Edit & Test</span>
                    </button>

                    <button
                      onClick={() => handleDeleteAgent(ag.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 transition"
                      title="Delete saved agent"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
