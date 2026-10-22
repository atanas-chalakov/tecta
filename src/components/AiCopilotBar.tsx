import { useEffect, useState } from 'react';
import {
  Cpu,
  KeyRound,
  Loader2,
  Palette,
  Send,
  Settings2,
  Sparkles,
  Type,
  Wand2,
  X,
} from 'lucide-react';
import {
  CURATED_FONT_PAIRINGS,
  runAiDesignCopilot,
  type AiCloudConfig,
  type AiEngineMode,
} from '../services/aiDesignCopilot';
import { useDocumentStore } from '../store/documentStore';

const AI_CONFIG_STORAGE_KEY = 'tecta_ai_copilot_config_v1';

interface StoredAiSettings {
  mode: AiEngineMode;
  cloudConfig: AiCloudConfig;
}

function loadAiSettings(): StoredAiSettings {
  try {
    const raw = window.localStorage.getItem(AI_CONFIG_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as StoredAiSettings;
    }
  } catch {
    // ignore
  }
  return {
    mode: 'builtin',
    cloudConfig: {
      provider: 'gemini',
      apiKey: '',
      model: 'gemini-2.5-flash',
    },
  };
}

export function AiCopilotBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFontAdvisor, setShowFontAdvisor] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [settings, setSettings] = useState<StoredAiSettings>(loadAiSettings);

  const selectedNodeId = useDocumentStore((s) => s.selectedNodeId);
  const breakpoint = useDocumentStore((s) => s.breakpoint);
  const selectedNode = useDocumentStore((s) =>
    s.selectedNodeId ? s.doc.nodes[s.selectedNodeId] ?? null : null
  );
  const updateNodeStyle = useDocumentStore((s) => s.updateNodeStyle);
  const setGoogleFont = useDocumentStore((s) => s.setGoogleFont);
  const insertGeneratedSection = useDocumentStore(
    (s) => s.insertGeneratedSection
  );
  const insertCmsCollectionSection = useDocumentStore(
    (s) => s.insertCmsCollectionSection
  );

  // Toggle Copilot with Cmd/Ctrl + K
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const saveSettings = (next: StoredAiSettings) => {
    setSettings(next);
    try {
      window.localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const executePrompt = async (customPrompt?: string) => {
    const finalPrompt = (customPrompt ?? prompt).trim();
    if (!finalPrompt) return;

    setIsRunning(true);
    setStatusMessage('Analyzing design intent...');

    try {
      const result = await runAiDesignCopilot({
        prompt: finalPrompt,
        mode: settings.mode,
        cloudConfig: settings.cloudConfig,
        selectedNode,
        breakpoint,
        onProgress: (msg) => setStatusMessage(msg),
      });

      if (result.generatedSection) {
        insertGeneratedSection(result.generatedSection);
      } else {
        if (result.fontPairing) {
          setGoogleFont('heading', result.fontPairing.heading);
          setGoogleFont('body', result.fontPairing.body);
        }
        if (result.stylePatch && selectedNodeId) {
          updateNodeStyle(selectedNodeId, breakpoint, result.stylePatch);
        }
      }

      setStatusMessage(`${result.summary} (${result.engineUsed})`);
      if (!customPrompt) setPrompt('');
    } finally {
      setIsRunning(false);
    }
  };

  const quickChips = [
    {
      label: 'Glowing Indigo Border',
      prompt: 'Add a 1px glowing indigo border with 20px rounded radius',
    },
    {
      label: 'Glassmorphic Card',
      prompt: 'Apply frosted glassmorphism background and subtle border',
    },
    {
      label: 'Radial Mesh Background',
      prompt: 'Set a dark radial indigo mesh gradient background',
    },
    {
      label: 'Emerald Surface Theme',
      prompt: 'Style with emerald border, dark emerald background and glow',
    },
    {
      label: 'Generate Pricing Section',
      prompt: 'Create a 3-column pricing section with indigo glow',
    },
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 select-none">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/95 hover:bg-zinc-800 text-zinc-100 border border-indigo-500/40 shadow-xl shadow-black/60 transition-all cursor-pointer group"
        >
          <Sparkles className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-semibold">AI Design Assist</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
            Ctrl+K
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 select-none">
      <div className="bg-zinc-950/95 backdrop-blur-md border border-indigo-500/40 rounded-2xl shadow-2xl p-3.5 space-y-3">
        {/* Top Bar: Target Node & Engine Switcher */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Wand2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-zinc-100">
              Tecta AI Design Copilot
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
              Target:{' '}
              <strong className="text-indigo-300">
                {selectedNode
                  ? `${selectedNode.tag} (${selectedNode.name})`
                  : 'Page / New Section'}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setShowFontAdvisor((v) => !v);
                setShowSettings(false);
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border cursor-pointer ${
                showFontAdvisor
                  ? 'bg-indigo-600/20 text-indigo-200 border-indigo-500/40'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
              }`}
            >
              <Type className="w-3 h-3 text-indigo-400" />
              <span>Font Pairings</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowSettings((v) => !v);
                setShowFontAdvisor(false);
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono border cursor-pointer ${
                showSettings
                  ? 'bg-indigo-600/20 text-indigo-200 border-indigo-500/40'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
              }`}
              title="Configure Free AI Engine (Instant / Browser WebGPU / Free Cloud Key)"
            >
              <Settings2 className="w-3 h-3 text-emerald-400" />
              <span>
                {settings.mode === 'builtin'
                  ? 'Engine: Instant (0ms)'
                  : settings.mode === 'webgpu'
                    ? 'Engine: WebGPU (Browser)'
                    : `Engine: ${settings.cloudConfig.provider.toUpperCase()}`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Font Pairing Advisor Drawer */}
        {showFontAdvisor && (
          <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2">
            <div className="text-[11px] font-semibold text-zinc-300 flex items-center justify-between">
              <span>Curated Google Font Pairings (Click to Apply Globally)</span>
              <span className="text-[10px] text-zinc-500">Auto-loads from Google Fonts</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto">
              {CURATED_FONT_PAIRINGS.map((pair) => (
                <button
                  key={pair.id}
                  type="button"
                  onClick={() => {
                    setGoogleFont('heading', pair.headingFont);
                    setGoogleFont('body', pair.bodyFont);
                    if (selectedNodeId) {
                      updateNodeStyle(selectedNodeId, breakpoint, {
                        fontFamily: `'${pair.headingFont}', sans-serif`,
                      });
                    }
                    setStatusMessage(
                      `Applied "${pair.name}": ${pair.headingFont} + ${pair.bodyFont}`
                    );
                  }}
                  className="p-2.5 rounded-lg bg-zinc-950 hover:bg-indigo-950/40 border border-zinc-800 hover:border-indigo-500/40 text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-100">
                      {pair.headingFont} + {pair.bodyFont}
                    </span>
                    <span className="text-[10px] text-indigo-400 font-mono">
                      {pair.name}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">
                    {pair.reason}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Engine Settings Drawer (Option 1 + Option 3) */}
        {showSettings && (
          <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => saveSettings({ ...settings, mode: 'builtin' })}
                className={`p-2 rounded-lg border text-left cursor-pointer ${
                  settings.mode === 'builtin'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <Palette className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Instant Built-in</span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  0ms deterministic CSS, border, background & font engine.
                </p>
              </button>

              <button
                type="button"
                onClick={() => saveSettings({ ...settings, mode: 'webgpu' })}
                className={`p-2 rounded-lg border text-left cursor-pointer ${
                  settings.mode === 'webgpu'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Browser WebGPU</span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Runs Qwen2.5-Coder inside the user&apos;s browser tab via WebLLM.
                </p>
              </button>

              <button
                type="button"
                onClick={() => saveSettings({ ...settings, mode: 'cloud' })}
                className={`p-2 rounded-lg border text-left cursor-pointer ${
                  settings.mode === 'cloud'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Free Cloud API</span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Connect a free Gemini AI Studio or Groq API key.
                </p>
              </button>
            </div>

            {settings.mode === 'cloud' && (
              <div className="grid grid-cols-3 gap-2 pt-1">
                <select
                  value={settings.cloudConfig.provider}
                  onChange={(e) =>
                    saveSettings({
                      ...settings,
                      cloudConfig: {
                        ...settings.cloudConfig,
                        provider: e.target.value as 'gemini' | 'groq',
                        model:
                          e.target.value === 'gemini'
                            ? 'gemini-2.5-flash'
                            : 'llama-3.3-70b-versatile',
                      },
                    })
                  }
                  className="px-2.5 py-1.5 rounded-lg text-xs bg-zinc-950 border border-zinc-800 text-zinc-200"
                >
                  <option value="gemini">Google Gemini (Free Tier)</option>
                  <option value="groq">Groq Cloud (Free API)</option>
                </select>
                <input
                  type="password"
                  placeholder="Paste free API key (saved locally in browser)"
                  value={settings.cloudConfig.apiKey}
                  onChange={(e) =>
                    saveSettings({
                      ...settings,
                      cloudConfig: {
                        ...settings.cloudConfig,
                        apiKey: e.target.value,
                      },
                    })
                  }
                  className="col-span-2 px-3 py-1.5 rounded-lg text-xs font-mono bg-zinc-950 border border-zinc-800 text-zinc-100"
                />
              </div>
            )}
          </div>
        )}

        {/* Quick Design Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {quickChips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => executePrompt(chip.prompt)}
              className="px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-indigo-600/20 text-zinc-300 hover:text-indigo-200 border border-zinc-800 hover:border-indigo-500/40 text-[11px] whitespace-nowrap transition-colors cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              insertCmsCollectionSection('cms_products', 3);
              setStatusMessage('Inserted 3-Column CMS Products Grid onto page.');
            }}
            className="px-2.5 py-1 rounded-full bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 text-[11px] whitespace-nowrap transition-colors cursor-pointer"
          >
            + CMS Products Grid
          </button>
        </div>

        {/* Prompt Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executePrompt();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='Ask AI to style borders, backgrounds, fonts, or generate a section (e.g. "Add a 2px emerald border and dark radial gradient")...'
            className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-xs text-zinc-100 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isRunning || !prompt.trim()}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            {isRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Apply</span>
          </button>
        </form>

        {statusMessage && (
          <div className="px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-[11px] text-indigo-200 flex items-center justify-between">
            <span>{statusMessage}</span>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-zinc-500 hover:text-zinc-300 text-[10px] ml-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
