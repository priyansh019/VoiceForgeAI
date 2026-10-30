import React, { useState } from 'react';
import {
  Save,
  Radio,
  Play,
  Pause,
  ArrowRight,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Copy,
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react';
import { AgentConfig, VoiceOption } from '../types/agent';
import { deployAgentToElevenLabs, saveAgentLocal } from '../services/api';

interface ConfigEditorProps {
  agent: AgentConfig;
  onUpdateAgent: (agent: AgentConfig) => void;
  onStartTesting: (agent: AgentConfig) => void;
  voices: VoiceOption[];
  elevenlabsConfigured: boolean;
}

export const ConfigEditor: React.FC<ConfigEditorProps> = ({
  agent,
  onUpdateAgent,
  onStartTesting,
  voices,
  elevenlabsConfigured,
}) => {
  const [formData, setFormData] = useState<AgentConfig>(agent);
  const [activePreviewVoice, setActivePreviewVoice] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState<string | null>(null);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Sync if parent agent changes
  React.useEffect(() => {
    setFormData(agent);
  }, [agent.id]);

  const handleChange = (field: keyof AgentConfig, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleVoicePreview = (previewUrl?: string, voiceId?: string) => {
    if (!previewUrl || !voiceId) return;

    if (activePreviewVoice === voiceId && audioElement) {
      audioElement.pause();
      setActivePreviewVoice(null);
      return;
    }

    if (audioElement) {
      audioElement.pause();
    }

    const audio = new Audio(previewUrl);
    setAudioElement(audio);
    setActivePreviewVoice(voiceId);

    audio.play().catch((err) => {
      console.warn('Playback prevented:', err);
      setActivePreviewVoice(null);
    });

    audio.onended = () => {
      setActivePreviewVoice(null);
    };
  };

  const handleAddQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      suggested_questions: [...prev.suggested_questions, ''],
    }));
  };

  const handleQuestionChange = (index: number, val: string) => {
    const updated = [...formData.suggested_questions];
    updated[index] = val;
    setFormData((prev) => ({
      ...prev,
      suggested_questions: updated,
    }));
  };

  const handleRemoveQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      suggested_questions: prev.suggested_questions.filter((_, i) => i !== index),
    }));
  };

  const handleSaveLocal = async () => {
    try {
      setIsSaving(true);
      const saved = await saveAgentLocal(formData);
      onUpdateAgent(saved);
      setDeploySuccess('Agent configuration saved successfully.');
      setTimeout(() => setDeploySuccess(null), 3500);
    } catch (err: any) {
      setDeployError(err.message || 'Failed to save agent locally.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeployToElevenLabs = async () => {
    try {
      setIsDeploying(true);
      setDeployError(null);
      setDeploySuccess(null);

      // Deploy real agent to ElevenLabs
      const res = await deployAgentToElevenLabs(formData);

      const updated = {
        ...formData,
        elevenlabs_agent_id: res.agent_id,
      };

      setFormData(updated);
      onUpdateAgent(updated);

      setDeploySuccess(
        `${res.message} Agent ID: ${res.agent_id}`
      );
    } catch (err: any) {
      setDeployError(err.message || 'ElevenLabs deployment failed.');
    } finally {
      setIsDeploying(false);
    }
  };

  const handleCopyAgentId = () => {
    if (formData.elevenlabs_agent_id) {
      navigator.clipboard.writeText(formData.elevenlabs_agent_id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner / Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Step 2: Configuration & Sync
            </span>
            {formData.elevenlabs_agent_id ? (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Deployed to ElevenLabs
              </span>
            ) : (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Draft (Local)
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">{formData.name}</h1>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleSaveLocal}
            disabled={isSaving}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Draft</span>
          </button>

          <button
            onClick={handleDeployToElevenLabs}
            disabled={isDeploying}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600 via-indigo-600 to-fuchsia-600 hover:from-cyan-500 hover:via-indigo-500 hover:to-fuchsia-500 text-white shadow-md shadow-indigo-500/20 transition disabled:opacity-50"
          >
            {isDeploying ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deploying to ElevenLabs...</span>
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5" />
                <span>{formData.elevenlabs_agent_id ? 'Update ElevenLabs Agent' : 'Deploy to ElevenLabs'}</span>
              </>
            )}
          </button>

          <button
            onClick={() => onStartTesting(formData)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition"
          >
            <span>Live Voice Test</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Deploy Status Banners */}
      {deploySuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{deploySuccess}</span>
          </div>
          {formData.elevenlabs_agent_id && (
            <button
              onClick={() => onStartTesting(formData)}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition text-[11px] shadow-2xs"
            >
              Test Voice Now
            </button>
          )}
        </div>
      )}

      {deployError && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5 shadow-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">ElevenLabs Notice:</span>
              <p>{deployError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Core Identity & Prompt */}
        <div className="lg:col-span-2 space-y-5">
          {/* Basic Details Card */}
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-600" />
                <span>Agent Identity</span>
              </h2>

              {formData.elevenlabs_agent_id && (
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] text-slate-700 font-mono">
                  <span>ID: {formData.elevenlabs_agent_id.slice(0, 14)}...</span>
                  <button
                    onClick={handleCopyAgentId}
                    className="p-1 hover:text-cyan-700 transition"
                    title="Copy full ElevenLabs Agent ID"
                  >
                    {copiedId ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Agent Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role / Function</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-500 shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-cyan-500 shadow-2xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  First Spoken Message (Greeting)
                </label>
                <span className="text-[11px] text-slate-500">Spoken immediately upon connection</span>
              </div>
              <textarea
                rows={2}
                value={formData.first_message}
                onChange={(e) => handleChange('first_message', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-emerald-800 font-medium focus:bg-white focus:outline-none focus:border-cyan-500 shadow-2xs"
              />
            </div>
          </div>

          {/* System Prompt Card */}
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Conversational System Prompt</h2>
                <p className="text-[11px] text-slate-500">
                  Defines agent behavior, vocal turn rules, and boundary guardrails.
                </p>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono border border-slate-200">
                {formData.system_prompt.length} chars
              </span>
            </div>

            <textarea
              rows={11}
              value={formData.system_prompt}
              onChange={(e) => handleChange('system_prompt', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-mono text-slate-800 leading-relaxed focus:bg-white focus:outline-none focus:border-cyan-500 resize-y shadow-2xs"
            />

            <div className="p-3 rounded-xl bg-cyan-50/60 border border-cyan-200/80 text-[11px] text-cyan-900">
              <strong className="text-cyan-950 font-bold">Voice Engineering Tip:</strong> ElevenLabs voice models perform best when instructions explicitly tell the agent to keep utterances under 2 sentences, speak in natural cadence, and avoid formatted lists or special characters.
            </div>
          </div>

          {/* Suggested Test Questions */}
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Suggested Spoken Test Questions</h3>
                <p className="text-[11px] text-slate-500">
                  These quick prompts appear in the live test sandbox for one-click testing.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-600" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-2">
              {formData.suggested_questions.map((q, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-5 text-right font-mono">{idx + 1}.</span>
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => handleQuestionChange(idx, e.target.value)}
                    placeholder="e.g., Can you help me schedule an appointment?"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-cyan-500 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition"
                    title="Remove question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Voice Selection & Conversational Tunings */}
        <div className="space-y-5">
          {/* Voice Picker Card */}
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-600" />
                <span>Voice Persona</span>
              </h2>
              <span className="text-xs font-medium text-slate-500">ElevenLabs TTS</span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {voices.map((v) => {
                const isSelected = formData.voice_id === v.voice_id;
                const isPlaying = activePreviewVoice === v.voice_id;

                return (
                  <div
                    key={v.voice_id}
                    onClick={() => {
                      handleChange('voice_id', v.voice_id);
                      handleChange('voice_name', v.name);
                    }}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-cyan-50 border-cyan-400 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs font-bold ${isSelected ? 'text-cyan-900' : 'text-slate-800'}`}>
                          {v.name}
                        </span>
                        {v.gender && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white text-slate-500 border border-slate-200 capitalize">
                            {v.gender}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{v.description}</p>
                    </div>

                    {v.preview_url && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVoicePreview(v.preview_url, v.voice_id);
                        }}
                        className={`p-2 rounded-lg transition shrink-0 ${
                          isPlaying
                            ? 'bg-cyan-600 text-white shadow-2xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
                        }`}
                        title={isPlaying ? 'Pause audio preview' : 'Play audio preview'}
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Custom Voice ID Input */}
            <div className="pt-2 border-t border-slate-200">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Custom ElevenLabs Voice ID (Optional)
              </label>
              <input
                type="text"
                value={formData.voice_id}
                onChange={(e) => handleChange('voice_id', e.target.value)}
                placeholder="e.g. 21m00Tcm4TlvDq8ikWAM"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-cyan-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Turn Tuning & Latency Settings */}
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-600" />
              <span>Turn Dynamics</span>
            </h2>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-700 font-medium">Turn Timeout</span>
                <span className="font-mono text-cyan-700 font-bold">{formData.turn_timeout}s</span>
              </div>
              <input
                type="range"
                min={3}
                max={15}
                step={1}
                value={formData.turn_timeout}
                onChange={(e) => handleChange('turn_timeout', Number(e.target.value))}
                className="w-full accent-cyan-600"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Seconds of silence before agent considers user finished speaking.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-700 font-medium">Temperature</span>
                <span className="font-mono text-cyan-700 font-bold">{formData.temperature}</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.05}
                value={formData.temperature}
                onChange={(e) => handleChange('temperature', Number(e.target.value))}
                className="w-full accent-cyan-600"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Lower = precise and predictable; Higher = creative and conversational.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Language</label>
              <select
                value={formData.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-cyan-500 shadow-2xs"
              >
                <option value="en">English (en)</option>
                <option value="es">Spanish (es)</option>
                <option value="fr">French (fr)</option>
                <option value="de">German (de)</option>
                <option value="it">Italian (it)</option>
                <option value="ja">Japanese (ja)</option>
                <option value="pt">Portuguese (pt)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
