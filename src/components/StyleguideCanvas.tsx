import { useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckSquare,
  ChevronDown,
  Layers,
  MousePointerClick,
  Palette,
  RotateCcw,
  Search,
  Sliders,
  Sparkles,
  Trash2,
  Type,
  Upload,
} from 'lucide-react';
import {
  CURATED_COLOR_PALETTES,
  POPULAR_GOOGLE_FONTS,
  loadGoogleFont,
  type PresetKey,
} from '../domain/presets';
import { useDocumentStore } from '../store/documentStore';

export function StyleguideCanvas() {
  const tokens = useDocumentStore((s) => s.tokens);
  const updateDesignTokens = useDocumentStore((s) => s.updateDesignTokens);
  const applyColorPalette = useDocumentStore((s) => s.applyColorPalette);
  const setGoogleFont = useDocumentStore((s) => s.setGoogleFont);
  const uploadCustomFont = useDocumentStore((s) => s.uploadCustomFont);
  const deleteCustomFont = useDocumentStore((s) => s.deleteCustomFont);

  const presets = useDocumentStore((s) => s.presets);
  const selectedPresetKey = useDocumentStore((s) => s.selectedPresetKey);
  const selectPreset = useDocumentStore((s) => s.selectPreset);
  const setActiveStep = useDocumentStore((s) => s.setActiveStep);
  const resetPresets = useDocumentStore((s) => s.resetPresets);

  // Filter state for Google Fonts catalog
  const [fontSearch, setFontSearch] = useState('');
  const [selectedFontCategory, setSelectedFontCategory] = useState<
    'all' | 'sans-serif' | 'serif' | 'display' | 'monospace'
  >('all');
  const [isUploadingFont, setIsUploadingFont] = useState(false);

  const isSelected = (key: PresetKey) => selectedPresetKey === key;

  const filteredGoogleFonts = POPULAR_GOOGLE_FONTS.filter((f) => {
    const matchesSearch = f.family
      .toLowerCase()
      .includes(fontSearch.toLowerCase());
    const matchesCategory =
      selectedFontCategory === 'all' || f.category === selectedFontCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCustomFontUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingFont(true);
      await uploadCustomFont(file);
    } finally {
      setIsUploadingFont(false);
      e.target.value = '';
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-zinc-950 p-6 md:p-10 select-none">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Step 1 Introduction Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/60 via-zinc-900/80 to-zinc-950 border border-indigo-900/40 p-6 md:p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                <Palette className="w-3.5 h-3.5" />
                <span>Step 1 of 3: Design System & Presets</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Foundational Presets & Design System
              </h1>
              <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
                Step 1 starts with your global <span className="text-indigo-300 font-semibold">Color Palette</span> and{' '}
                <span className="text-indigo-300 font-semibold">Webfonts / Typography</span>, followed by element presets.
                Any adjustments here automatically propagate to your reusable sections in{' '}
                <span className="text-indigo-300 font-medium">Step 2</span> and whole pages in{' '}
                <span className="text-indigo-300 font-medium">Step 3</span>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => resetPresets()}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 text-xs font-medium transition-colors cursor-pointer"
                title="Reset all presets to default design system"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-indigo-600/30 transition-all cursor-pointer group"
              >
                <span>Continue to Step 2: Sections</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-indigo-900/30 flex items-center gap-2 text-xs text-indigo-200/80">
            <MousePointerClick className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Click any swatch or element card to inspect and customize its styles in the Right Inspector.</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 1: GLOBAL COLOR PALETTES & THEME TOKENS           */}
        {/* ========================================================= */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <span>1. Colors & Theme Palette</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-normal">
                    Global Tokens
                  </span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Curated color palettes and live tokens for backgrounds, surfaces, text, and buttons
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => selectPreset('tokens-colors')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isSelected('tokens-colors')
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              Inspect Color Tokens
            </button>
          </div>

          {/* Curated Theme Palettes Row */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Quick Apply Curated Palettes
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {CURATED_COLOR_PALETTES.map((p) => {
                const isActive =
                  tokens.primaryColor === p.primary &&
                  tokens.backgroundColor === p.background;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyColorPalette(p.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                      isActive
                        ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg'
                        : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-200 truncate">
                        {p.name}
                      </span>
                      {isActive && (
                        <span className="p-0.5 rounded-full bg-indigo-500 text-white shrink-0">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    {/* Swatch Strip */}
                    <div className="flex h-5 w-full rounded-md overflow-hidden border border-black/40">
                      <span className="flex-1" style={{ backgroundColor: p.primary }} title={`Primary: ${p.primary}`} />
                      <span className="flex-1" style={{ backgroundColor: p.secondary }} title={`Secondary: ${p.secondary}`} />
                      <span className="flex-1" style={{ backgroundColor: p.accent }} title={`Accent: ${p.accent}`} />
                      <span className="flex-1" style={{ backgroundColor: p.surface }} title={`Surface: ${p.surface}`} />
                      <span className="flex-1" style={{ backgroundColor: p.background }} title={`Background: ${p.background}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Editable Token Swatches Grid */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Active Palette Tokens (Click swatch to tweak color)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Primary */}
              <div
                onClick={() => selectPreset('tokens-colors')}
                className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 bg-zinc-900/60 ${
                  isSelected('tokens-colors')
                    ? 'border-indigo-500 ring-1 ring-indigo-500/20'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="relative h-14 rounded-lg overflow-hidden border border-black/30 shadow-inner flex items-center justify-center">
                  <span
                    className="absolute inset-0"
                    style={{ backgroundColor: tokens.primaryColor }}
                  />
                  <input
                    type="color"
                    value={tokens.primaryColor}
                    onChange={(e) => updateDesignTokens({ primaryColor: e.target.value })}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    title="Click to pick custom Primary Color"
                  />
                  <span className="relative z-10 px-2 py-0.5 rounded bg-black/50 text-white text-[10px] font-mono backdrop-blur-xs">
                    {tokens.primaryColor}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-200">Primary Color</div>
                  <div className="text-[10px] text-zinc-400 truncate">Buttons & Key Actions</div>
                </div>
              </div>

              {/* Secondary */}
              <div
                onClick={() => selectPreset('tokens-colors')}
                className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 bg-zinc-900/60 ${
                  isSelected('tokens-colors')
                    ? 'border-indigo-500 ring-1 ring-indigo-500/20'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="relative h-14 rounded-lg overflow-hidden border border-black/30 shadow-inner flex items-center justify-center">
                  <span
                    className="absolute inset-0"
                    style={{ backgroundColor: tokens.secondaryColor }}
                  />
                  <input
                    type="color"
                    value={tokens.secondaryColor}
                    onChange={(e) => updateDesignTokens({ secondaryColor: e.target.value })}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    title="Click to pick custom Secondary Color"
                  />
                  <span className="relative z-10 px-2 py-0.5 rounded bg-black/50 text-white text-[10px] font-mono backdrop-blur-xs">
                    {tokens.secondaryColor}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-200">Secondary Color</div>
                  <div className="text-[10px] text-zinc-400 truncate">Highlights & Badges</div>
                </div>
              </div>

              {/* Accent */}
              <div
                onClick={() => selectPreset('tokens-colors')}
                className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 bg-zinc-900/60 ${
                  isSelected('tokens-colors')
                    ? 'border-indigo-500 ring-1 ring-indigo-500/20'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="relative h-14 rounded-lg overflow-hidden border border-black/30 shadow-inner flex items-center justify-center">
                  <span
                    className="absolute inset-0"
                    style={{ backgroundColor: tokens.accentColor }}
                  />
                  <input
                    type="color"
                    value={tokens.accentColor}
                    onChange={(e) => updateDesignTokens({ accentColor: e.target.value })}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    title="Click to pick custom Accent Color"
                  />
                  <span className="relative z-10 px-2 py-0.5 rounded bg-black/50 text-white text-[10px] font-mono backdrop-blur-xs">
                    {tokens.accentColor}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-200">Accent Color</div>
                  <div className="text-[10px] text-zinc-400 truncate">Focus & Hover Rings</div>
                </div>
              </div>

              {/* Background */}
              <div
                onClick={() => selectPreset('tokens-colors')}
                className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 bg-zinc-900/60 ${
                  isSelected('tokens-colors')
                    ? 'border-indigo-500 ring-1 ring-indigo-500/20'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="relative h-14 rounded-lg overflow-hidden border border-black/30 shadow-inner flex items-center justify-center">
                  <span
                    className="absolute inset-0"
                    style={{ backgroundColor: tokens.backgroundColor }}
                  />
                  <input
                    type="color"
                    value={tokens.backgroundColor}
                    onChange={(e) => updateDesignTokens({ backgroundColor: e.target.value })}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    title="Click to pick custom Background Color"
                  />
                  <span className="relative z-10 px-2 py-0.5 rounded bg-black/50 text-white text-[10px] font-mono backdrop-blur-xs">
                    {tokens.backgroundColor}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-200">Canvas Background</div>
                  <div className="text-[10px] text-zinc-400 truncate">Page Body Base</div>
                </div>
              </div>

              {/* Surface */}
              <div
                onClick={() => selectPreset('tokens-colors')}
                className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 bg-zinc-900/60 ${
                  isSelected('tokens-colors')
                    ? 'border-indigo-500 ring-1 ring-indigo-500/20'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="relative h-14 rounded-lg overflow-hidden border border-black/30 shadow-inner flex items-center justify-center">
                  <span
                    className="absolute inset-0"
                    style={{ backgroundColor: tokens.surfaceColor }}
                  />
                  <input
                    type="color"
                    value={tokens.surfaceColor}
                    onChange={(e) => updateDesignTokens({ surfaceColor: e.target.value })}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    title="Click to pick custom Surface Color"
                  />
                  <span className="relative z-10 px-2 py-0.5 rounded bg-black/50 text-white text-[10px] font-mono backdrop-blur-xs">
                    {tokens.surfaceColor}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-200">Surface Card</div>
                  <div className="text-[10px] text-zinc-400 truncate">Cards, Panels & Modals</div>
                </div>
              </div>

              {/* Text Primary */}
              <div
                onClick={() => selectPreset('tokens-colors')}
                className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 bg-zinc-900/60 ${
                  isSelected('tokens-colors')
                    ? 'border-indigo-500 ring-1 ring-indigo-500/20'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="relative h-14 rounded-lg overflow-hidden border border-black/30 shadow-inner flex items-center justify-center">
                  <span
                    className="absolute inset-0"
                    style={{ backgroundColor: tokens.textColor }}
                  />
                  <input
                    type="color"
                    value={tokens.textColor}
                    onChange={(e) => updateDesignTokens({ textColor: e.target.value })}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    title="Click to pick custom Text Color"
                  />
                  <span className="relative z-10 px-2 py-0.5 rounded bg-black/50 text-white text-[10px] font-mono backdrop-blur-xs">
                    {tokens.textColor}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-200">Primary Text</div>
                  <div className="text-[10px] text-zinc-400 truncate">High Contrast Headlines</div>
                </div>
              </div>

              {/* Text Muted */}
              <div
                onClick={() => selectPreset('tokens-colors')}
                className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 bg-zinc-900/60 ${
                  isSelected('tokens-colors')
                    ? 'border-indigo-500 ring-1 ring-indigo-500/20'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="relative h-14 rounded-lg overflow-hidden border border-black/30 shadow-inner flex items-center justify-center">
                  <span
                    className="absolute inset-0"
                    style={{ backgroundColor: tokens.textMuted }}
                  />
                  <input
                    type="color"
                    value={tokens.textMuted}
                    onChange={(e) => updateDesignTokens({ textMuted: e.target.value })}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    title="Click to pick custom Muted Text Color"
                  />
                  <span className="relative z-10 px-2 py-0.5 rounded bg-black/50 text-white text-[10px] font-mono backdrop-blur-xs">
                    {tokens.textMuted}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-200">Muted Text</div>
                  <div className="text-[10px] text-zinc-400 truncate">Subtitles & Labels</div>
                </div>
              </div>

              {/* Border Color */}
              <div
                onClick={() => selectPreset('tokens-colors')}
                className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 bg-zinc-900/60 ${
                  isSelected('tokens-colors')
                    ? 'border-indigo-500 ring-1 ring-indigo-500/20'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="relative h-14 rounded-lg overflow-hidden border border-black/30 shadow-inner flex items-center justify-center">
                  <span
                    className="absolute inset-0"
                    style={{ backgroundColor: tokens.borderColor }}
                  />
                  <input
                    type="color"
                    value={tokens.borderColor}
                    onChange={(e) => updateDesignTokens({ borderColor: e.target.value })}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    title="Click to pick custom Border Color"
                  />
                  <span className="relative z-10 px-2 py-0.5 rounded bg-black/50 text-white text-[10px] font-mono backdrop-blur-xs">
                    {tokens.borderColor}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-200">Border Color</div>
                  <div className="text-[10px] text-zinc-400 truncate">Dividers & Outlines</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: WEBFONTS & TYPOGRAPHY SYSTEM                   */}
        {/* ========================================================= */}
        <section className="space-y-5 pt-4 border-t border-zinc-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400">
                <Type className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <span>2. Typography & Fonts</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-mono font-normal">
                    Google Fonts & Custom Files
                  </span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Select heading & body font pairings, browse Google Webfonts, or upload custom font files (.woff2, .ttf, .otf)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => selectPreset('tokens-fonts')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isSelected('tokens-fonts')
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              Inspect Font Tokens
            </button>
          </div>

          {/* Active Font Pairings Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Heading Font Card */}
            <div
              onClick={() => selectPreset('tokens-fonts')}
              className={`p-6 rounded-2xl bg-zinc-900/60 border transition-all cursor-pointer space-y-3 relative group ${
                isSelected('tokens-fonts')
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-zinc-900'
                  : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                  Heading Font
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  Weight {tokens.fontHeadingWeight}
                </span>
              </div>

              <div>
                <div className="text-xs text-zinc-400">Active Family:</div>
                <div className="text-xl font-extrabold text-white">
                  {tokens.fontHeading}
                </div>
              </div>

              {/* Specimen */}
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
                <h3
                  style={{
                    fontFamily: `"${tokens.fontHeading}", sans-serif`,
                    fontWeight: tokens.fontHeadingWeight,
                  }}
                  className="text-2xl text-white tracking-tight"
                >
                  Modular Design Systems Built For Speed
                </h3>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                <span>Applied to H1, H2, H3, H4 headlines</span>
                <span className="text-indigo-400 font-medium">Click to inspect</span>
              </div>
            </div>

            {/* Body Font Card */}
            <div
              onClick={() => selectPreset('tokens-fonts')}
              className={`p-6 rounded-2xl bg-zinc-900/60 border transition-all cursor-pointer space-y-3 relative group ${
                isSelected('tokens-fonts')
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-zinc-900'
                  : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  Body Font
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  Weight {tokens.fontBodyWeight}
                </span>
              </div>

              <div>
                <div className="text-xs text-zinc-400">Active Family:</div>
                <div className="text-xl font-extrabold text-white">
                  {tokens.fontBody}
                </div>
              </div>

              {/* Specimen */}
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
                <p
                  style={{
                    fontFamily: `"${tokens.fontBody}", sans-serif`,
                    fontWeight: tokens.fontBodyWeight,
                  }}
                  className="text-sm text-zinc-300 leading-relaxed"
                >
                  High-readability typography optimized across desktop, tablet, and mobile breakpoints with crisp anti-aliasing and responsive scaling.
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                <span>Applied to lead, paragraphs, buttons, and inputs</span>
                <span className="text-indigo-400 font-medium">Click to inspect</span>
              </div>
            </div>
          </div>

          {/* Custom Font File Uploader Bar */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-zinc-900/90 to-zinc-900/50 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>Upload Custom Font File</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Upload your own brand font (.woff2, .woff, .ttf, .otf). It is converted to base64 and saved in the project.
              </p>
            </div>

            <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer shrink-0 shadow-md shadow-indigo-600/20">
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploadingFont ? 'Uploading...' : 'Choose Font File'}</span>
              <input
                type="file"
                accept=".woff2,.woff,.ttf,.otf"
                onChange={handleCustomFontUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Uploaded Custom Fonts List (if any) */}
          {tokens.customFonts.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Your Uploaded Brand Fonts ({tokens.customFonts.length})
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tokens.customFonts.map((cf) => (
                  <div
                    key={cf.id}
                    className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-col justify-between space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-zinc-200 text-sm truncate">
                        {cf.name}
                      </div>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        {cf.format}
                      </span>
                    </div>

                    <div
                      style={{ fontFamily: `"${cf.name}", sans-serif` }}
                      className="text-base text-zinc-300 truncate py-1"
                    >
                      Sample Specimen ABCxyz 123
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setGoogleFont('heading', cf.name)}
                          className={`px-2 py-1 rounded-md text-[10px] font-semibold cursor-pointer ${
                            tokens.fontHeading === cf.name
                              ? 'bg-indigo-600 text-white'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                          }`}
                        >
                          Use as Heading
                        </button>
                        <button
                          type="button"
                          onClick={() => setGoogleFont('body', cf.name)}
                          className={`px-2 py-1 rounded-md text-[10px] font-semibold cursor-pointer ${
                            tokens.fontBody === cf.name
                              ? 'bg-indigo-600 text-white'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                          }`}
                        >
                          Use as Body
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteCustomFont(cf.id)}
                        className="p-1 rounded text-zinc-500 hover:text-rose-400 cursor-pointer"
                        title="Delete custom font"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular Google Fonts Catalog */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {(['all', 'sans-serif', 'serif', 'display', 'monospace'] as const).map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedFontCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                        selectedFontCategory === cat
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>

              {/* Search box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={fontSearch}
                  onChange={(e) => setFontSearch(e.target.value)}
                  placeholder="Search Google Fonts..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Google Fonts Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredGoogleFonts.map((f) => {
                // Ensure font link is loaded so live specimen renders
                loadGoogleFont(f.family);

                const isHeading = tokens.fontHeading === f.family;
                const isBody = tokens.fontBody === f.family;

                return (
                  <div
                    key={f.family}
                    className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                      isHeading || isBody
                        ? 'bg-zinc-900/90 border-indigo-500/80 shadow-md'
                        : 'bg-zinc-900/50 hover:bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-100 text-sm">
                          {f.family}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 capitalize">
                          {f.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                        {f.description}
                      </p>
                    </div>

                    {/* Live Font Specimen */}
                    <div
                      style={{ fontFamily: `"${f.family}", sans-serif` }}
                      className="text-lg text-zinc-200 tracking-tight leading-snug truncate py-1"
                    >
                      Sphinx of black quartz, judge my vow.
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                      <span className="text-[10px] font-mono text-zinc-500">
                        {f.weights.join(', ')}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setGoogleFont('heading', f.family)}
                          className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                            isHeading
                              ? 'bg-indigo-600 text-white'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                          }`}
                        >
                          {isHeading ? '✓ Heading' : 'Heading'}
                        </button>

                        <button
                          type="button"
                          onClick={() => setGoogleFont('body', f.family)}
                          className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                            isBody
                              ? 'bg-indigo-600 text-white'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                          }`}
                        >
                          {isBody ? '✓ Body' : 'Body'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: HEADINGS & TYPOGRAPHY PRESETS                  */}
        {/* ========================================================= */}
        <section className="space-y-4 pt-4 border-t border-zinc-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-indigo-400">
                <Type className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-zinc-100">
                3. Headings & Scale Presets
              </h2>
            </div>
            <span className="text-xs text-zinc-500 font-mono">6 scale presets</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* H1 */}
            <div
              onClick={() => selectPreset('h1')}
              className={`p-6 rounded-xl bg-zinc-900/60 border transition-all cursor-pointer relative group ${
                isSelected('h1')
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-zinc-900'
                  : 'border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3 text-xs font-mono text-zinc-500">
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">H1 · Heading 1</span>
                <span>{presets.h1.fontSize} · {presets.h1.fontWeight} · {presets.h1.fontFamily ?? tokens.fontHeading}</span>
              </div>
              <h1
                style={{
                  fontFamily: `"${presets.h1.fontFamily ?? tokens.fontHeading}", sans-serif`,
                  fontSize: presets.h1.fontSize,
                  fontWeight: presets.h1.fontWeight,
                  lineHeight: presets.h1.lineHeight,
                  letterSpacing: presets.h1.letterSpacing,
                  color: presets.h1.color,
                }}
              >
                Display Headline for High-Impact Sections
              </h1>
            </div>

            {/* H2 */}
            <div
              onClick={() => selectPreset('h2')}
              className={`p-6 rounded-xl bg-zinc-900/60 border transition-all cursor-pointer relative group ${
                isSelected('h2')
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-zinc-900'
                  : 'border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3 text-xs font-mono text-zinc-500">
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">H2 · Heading 2</span>
                <span>{presets.h2.fontSize} · {presets.h2.fontWeight} · {presets.h2.fontFamily ?? tokens.fontHeading}</span>
              </div>
              <h2
                style={{
                  fontFamily: `"${presets.h2.fontFamily ?? tokens.fontHeading}", sans-serif`,
                  fontSize: presets.h2.fontSize,
                  fontWeight: presets.h2.fontWeight,
                  lineHeight: presets.h2.lineHeight,
                  letterSpacing: presets.h2.letterSpacing,
                  color: presets.h2.color,
                }}
              >
                Section Titles and Feature Category Headlines
              </h2>
            </div>

            {/* H3 & H4 in 2 cols */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                onClick={() => selectPreset('h3')}
                className={`p-5 rounded-xl bg-zinc-900/60 border transition-all cursor-pointer relative group ${
                  isSelected('h3')
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-zinc-900'
                    : 'border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2 text-xs font-mono text-zinc-500">
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">H3 · Heading 3</span>
                  <span>{presets.h3.fontSize}</span>
                </div>
                <h3
                  style={{
                    fontFamily: `"${presets.h3.fontFamily ?? tokens.fontHeading}", sans-serif`,
                    fontSize: presets.h3.fontSize,
                    fontWeight: presets.h3.fontWeight,
                    lineHeight: presets.h3.lineHeight,
                    color: presets.h3.color,
                  }}
                >
                  Feature Block Card Headline
                </h3>
              </div>

              <div
                onClick={() => selectPreset('h4')}
                className={`p-5 rounded-xl bg-zinc-900/60 border transition-all cursor-pointer relative group ${
                  isSelected('h4')
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-zinc-900'
                    : 'border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2 text-xs font-mono text-zinc-500">
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">H4 · Heading 4</span>
                  <span>{presets.h4.fontSize}</span>
                </div>
                <h4
                  style={{
                    fontFamily: `"${presets.h4.fontFamily ?? tokens.fontHeading}", sans-serif`,
                    fontSize: presets.h4.fontSize,
                    fontWeight: presets.h4.fontWeight,
                    lineHeight: presets.h4.lineHeight,
                    color: presets.h4.color,
                  }}
                >
                  Sub-feature & Metric Label Headline
                </h4>
              </div>
            </div>

            {/* Lead & Body in 2 cols */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                onClick={() => selectPreset('lead')}
                className={`p-5 rounded-xl bg-zinc-900/60 border transition-all cursor-pointer relative group ${
                  isSelected('lead')
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-zinc-900'
                    : 'border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2 text-xs font-mono text-zinc-500">
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">Lead Paragraph</span>
                  <span>{presets.lead.fontSize}</span>
                </div>
                <p
                  style={{
                    fontFamily: `"${presets.lead.fontFamily ?? tokens.fontBody}", sans-serif`,
                    fontSize: presets.lead.fontSize,
                    fontWeight: presets.lead.fontWeight,
                    lineHeight: presets.lead.lineHeight,
                    color: presets.lead.color,
                  }}
                >
                  Lead subtitle text that introduces hero sections with elevated typographic presence and clarity.
                </p>
              </div>

              <div
                onClick={() => selectPreset('body')}
                className={`p-5 rounded-xl bg-zinc-900/60 border transition-all cursor-pointer relative group ${
                  isSelected('body')
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-zinc-900'
                    : 'border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2 text-xs font-mono text-zinc-500">
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">Standard Body</span>
                  <span>{presets.body.fontSize}</span>
                </div>
                <p
                  style={{
                    fontFamily: `"${presets.body.fontFamily ?? tokens.fontBody}", sans-serif`,
                    fontSize: presets.body.fontSize,
                    fontWeight: presets.body.fontWeight,
                    lineHeight: presets.body.lineHeight,
                    color: presets.body.color,
                  }}
                >
                  Standard body paragraph copy used across cards, articles, and descriptions throughout your website.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 4: BUTTONS & ACTION ELEMENTS                      */}
        {/* ========================================================= */}
        <section className="space-y-4 pt-4 border-t border-zinc-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-indigo-400">
                <Sliders className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-zinc-100">
                4. Buttons & Interactive Presets
              </h2>
            </div>
            <span className="text-xs text-zinc-500 font-mono">4 presets</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Primary Button */}
            <div
              onClick={() => selectPreset('button-primary')}
              className={`p-5 rounded-xl bg-zinc-900/60 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                isSelected('button-primary')
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-zinc-900'
                  : 'border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="text-xs font-mono text-zinc-500">
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">Primary CTA</span>
              </div>
              <div className="py-2 flex justify-center">
                <button
                  type="button"
                  style={{
                    fontFamily: `"${presets['button-primary'].fontFamily ?? tokens.fontBody}", sans-serif`,
                    backgroundColor: presets['button-primary'].backgroundColor,
                    color: presets['button-primary'].color,
                    paddingTop: presets['button-primary'].paddingTop,
                    paddingBottom: presets['button-primary'].paddingBottom,
                    paddingLeft: presets['button-primary'].paddingLeft,
                    paddingRight: presets['button-primary'].paddingRight,
                    borderRadius: presets['button-primary'].borderRadius,
                    fontSize: presets['button-primary'].fontSize,
                    fontWeight: presets['button-primary'].fontWeight,
                  }}
                  className="cursor-pointer shadow-lg shadow-indigo-600/20"
                >
                  Get Started Free
                </button>
              </div>
              <div className="text-[11px] text-zinc-500 text-center">
                Main call to action button
              </div>
            </div>

            {/* Secondary Button */}
            <div
              onClick={() => selectPreset('button-secondary')}
              className={`p-5 rounded-xl bg-zinc-900/60 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                isSelected('button-secondary')
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-zinc-900'
                  : 'border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="text-xs font-mono text-zinc-500">
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">Secondary</span>
              </div>
              <div className="py-2 flex justify-center">
                <button
                  type="button"
                  style={{
                    fontFamily: `"${presets['button-secondary'].fontFamily ?? tokens.fontBody}", sans-serif`,
                    backgroundColor: presets['button-secondary'].backgroundColor,
                    color: presets['button-secondary'].color,
                    paddingTop: presets['button-secondary'].paddingTop,
                    paddingBottom: presets['button-secondary'].paddingBottom,
                    paddingLeft: presets['button-secondary'].paddingLeft,
                    paddingRight: presets['button-secondary'].paddingRight,
                    borderRadius: presets['button-secondary'].borderRadius,
                    fontSize: presets['button-secondary'].fontSize,
                    fontWeight: presets['button-secondary'].fontWeight,
                  }}
                  className="cursor-pointer"
                >
                  Book a Demo
                </button>
              </div>
              <div className="text-[11px] text-zinc-500 text-center">
                Secondary supporting action
              </div>
            </div>

            {/* Outline Button */}
            <div
              onClick={() => selectPreset('button-outline')}
              className={`p-5 rounded-xl bg-zinc-900/60 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                isSelected('button-outline')
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-zinc-900'
                  : 'border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="text-xs font-mono text-zinc-500">
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">Outline</span>
              </div>
              <div className="py-2 flex justify-center">
                <button
                  type="button"
                  style={{
                    fontFamily: `"${presets['button-outline'].fontFamily ?? tokens.fontBody}", sans-serif`,
                    backgroundColor: presets['button-outline'].backgroundColor,
                    color: presets['button-outline'].color,
                    borderWidth: presets['button-outline'].borderWidth,
                    borderStyle: presets['button-outline'].borderStyle,
                    borderColor: presets['button-outline'].borderColor,
                    paddingTop: presets['button-outline'].paddingTop,
                    paddingBottom: presets['button-outline'].paddingBottom,
                    paddingLeft: presets['button-outline'].paddingLeft,
                    paddingRight: presets['button-outline'].paddingRight,
                    borderRadius: presets['button-outline'].borderRadius,
                    fontSize: presets['button-outline'].fontSize,
                    fontWeight: presets['button-outline'].fontWeight,
                  }}
                  className="cursor-pointer"
                >
                  View Documentation
                </button>
              </div>
              <div className="text-[11px] text-zinc-500 text-center">
                Subtle framed button
              </div>
            </div>

            {/* Ghost Button */}
            <div
              onClick={() => selectPreset('button-ghost')}
              className={`p-5 rounded-xl bg-zinc-900/60 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                isSelected('button-ghost')
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-zinc-900'
                  : 'border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="text-xs font-mono text-zinc-500">
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">Ghost Link</span>
              </div>
              <div className="py-2 flex justify-center">
                <button
                  type="button"
                  style={{
                    fontFamily: `"${presets['button-ghost'].fontFamily ?? tokens.fontBody}", sans-serif`,
                    backgroundColor: presets['button-ghost'].backgroundColor,
                    color: presets['button-ghost'].color,
                    paddingTop: presets['button-ghost'].paddingTop,
                    paddingBottom: presets['button-ghost'].paddingBottom,
                    paddingLeft: presets['button-ghost'].paddingLeft,
                    paddingRight: presets['button-ghost'].paddingRight,
                    borderRadius: presets['button-ghost'].borderRadius,
                    fontSize: presets['button-ghost'].fontSize,
                    fontWeight: presets['button-ghost'].fontWeight,
                  }}
                  className="cursor-pointer"
                >
                  Learn More →
                </button>
              </div>
              <div className="text-[11px] text-zinc-500 text-center">
                Minimal borderless action
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 5: FORM INPUTS & FIELD CONTROLS                   */}
        {/* ========================================================= */}
        <section className="space-y-4 pt-4 border-t border-zinc-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-indigo-400">
                <CheckSquare className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-zinc-100">
                5. Form Inputs & Field Presets
              </h2>
            </div>
            <span className="text-xs text-zinc-500 font-mono">3 presets</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Text Input */}
            <div
              onClick={() => selectPreset('input-text')}
              className={`p-5 rounded-xl bg-zinc-900/60 border transition-all cursor-pointer space-y-3 ${
                isSelected('input-text')
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-zinc-900'
                  : 'border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">Text Field</span>
                <span>{presets['input-text'].borderRadius}</span>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Work Email Address</label>
                <input
                  type="text"
                  readOnly
                  placeholder="name@company.com"
                  style={{
                    fontFamily: `"${presets['input-text'].fontFamily ?? tokens.fontBody}", sans-serif`,
                    backgroundColor: presets['input-text'].backgroundColor,
                    color: presets['input-text'].color,
                    borderWidth: presets['input-text'].borderWidth,
                    borderStyle: presets['input-text'].borderStyle,
                    borderColor: presets['input-text'].borderColor,
                    borderRadius: presets['input-text'].borderRadius,
                    paddingTop: presets['input-text'].paddingTop,
                    paddingBottom: presets['input-text'].paddingBottom,
                    paddingLeft: presets['input-text'].paddingLeft,
                    paddingRight: presets['input-text'].paddingRight,
                    fontSize: presets['input-text'].fontSize,
                  }}
                  className="w-full pointer-events-none"
                />
              </div>
            </div>

            {/* Select Dropdown */}
            <div
              onClick={() => selectPreset('input-select')}
              className={`p-5 rounded-xl bg-zinc-900/60 border transition-all cursor-pointer space-y-3 ${
                isSelected('input-select')
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-zinc-900'
                  : 'border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">Dropdown Select</span>
                <span>{presets['input-select'].borderRadius}</span>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Team Size</label>
                <div
                  style={{
                    fontFamily: `"${presets['input-select'].fontFamily ?? tokens.fontBody}", sans-serif`,
                    backgroundColor: presets['input-select'].backgroundColor,
                    color: presets['input-select'].color,
                    borderWidth: presets['input-select'].borderWidth,
                    borderStyle: presets['input-select'].borderStyle,
                    borderColor: presets['input-select'].borderColor,
                    borderRadius: presets['input-select'].borderRadius,
                    paddingTop: presets['input-select'].paddingTop,
                    paddingBottom: presets['input-select'].paddingBottom,
                    paddingLeft: presets['input-select'].paddingLeft,
                    paddingRight: presets['input-select'].paddingRight,
                    fontSize: presets['input-select'].fontSize,
                  }}
                  className="w-full flex items-center justify-between text-zinc-300 pointer-events-none"
                >
                  <span>10 - 50 employees</span>
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                </div>
              </div>
            </div>

            {/* Textarea */}
            <div
              onClick={() => selectPreset('input-textarea')}
              className={`p-5 rounded-xl bg-zinc-900/60 border transition-all cursor-pointer space-y-3 ${
                isSelected('input-textarea')
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-zinc-900'
                  : 'border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">Text Area</span>
                <span>{presets['input-textarea'].borderRadius}</span>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Project Requirements</label>
                <div
                  style={{
                    fontFamily: `"${presets['input-textarea'].fontFamily ?? tokens.fontBody}", sans-serif`,
                    backgroundColor: presets['input-textarea'].backgroundColor,
                    color: presets['input-textarea'].color,
                    borderWidth: presets['input-textarea'].borderWidth,
                    borderStyle: presets['input-textarea'].borderStyle,
                    borderColor: presets['input-textarea'].borderColor,
                    borderRadius: presets['input-textarea'].borderRadius,
                    paddingTop: presets['input-textarea'].paddingTop,
                    paddingBottom: presets['input-textarea'].paddingBottom,
                    paddingLeft: presets['input-textarea'].paddingLeft,
                    paddingRight: presets['input-textarea'].paddingRight,
                    fontSize: presets['input-textarea'].fontSize,
                  }}
                  className="w-full h-18 text-zinc-500 text-xs pointer-events-none"
                >
                  Briefly outline your team's design and engineering goals...
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 6: SURFACES, CARDS & CONTAINERS                   */}
        {/* ========================================================= */}
        <section className="space-y-4 pt-4 border-t border-zinc-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-indigo-400">
                <Layers className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-zinc-100">
                6. Surface & Container Presets
              </h2>
            </div>
            <span className="text-xs text-zinc-500 font-mono">3 presets</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Standard Surface Card */}
            <div
              onClick={() => selectPreset('card')}
              className={`p-6 transition-all cursor-pointer space-y-3 ${
                isSelected('card')
                  ? 'ring-2 ring-indigo-500/40'
                  : 'hover:brightness-110'
              }`}
              style={{
                backgroundColor: presets.card.backgroundColor,
                borderWidth: presets.card.borderWidth,
                borderStyle: presets.card.borderStyle,
                borderColor: presets.card.borderColor,
                borderRadius: presets.card.borderRadius,
              }}
            >
              <div className="text-xs font-mono text-zinc-500">
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">Standard Card</span>
              </div>
              <div
                style={{
                  fontFamily: `"${tokens.fontHeading}", sans-serif`,
                }}
                className="text-base font-bold text-white"
              >
                Scalable Surface Token
              </div>
              <p
                style={{
                  fontFamily: `"${tokens.fontBody}", sans-serif`,
                }}
                className="text-xs text-zinc-400 leading-relaxed"
              >
                Standard container token used for feature grids, pricing tiers, and testimonials.
              </p>
            </div>

            {/* Toggle Checkbox */}
            <div
              onClick={() => selectPreset('input-checkbox')}
              className={`p-6 rounded-2xl bg-zinc-900/60 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                isSelected('input-checkbox')
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-zinc-900'
                  : 'border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="text-xs font-mono text-zinc-500">
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">Checkbox Toggle</span>
              </div>

              <div className="flex items-center gap-3 py-2">
                <div
                  style={{
                    backgroundColor: presets['input-checkbox'].backgroundColor,
                    borderColor: presets['input-checkbox'].borderColor,
                    borderWidth: presets['input-checkbox'].borderWidth,
                    borderStyle: presets['input-checkbox'].borderStyle,
                    borderRadius: presets['input-checkbox'].borderRadius,
                  }}
                  className="w-5 h-5 flex items-center justify-center text-white"
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-medium text-zinc-200">
                  Enable high-contrast mode
                </span>
              </div>

              <div className="text-[11px] text-zinc-500">
                Custom form boolean toggle
              </div>
            </div>

            {/* Pill Badge Eyebrow */}
            <div
              onClick={() => selectPreset('badge')}
              className={`p-6 rounded-2xl bg-zinc-900/60 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                isSelected('badge')
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-zinc-900'
                  : 'border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="text-xs font-mono text-zinc-500">
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">Eyebrow Badge</span>
              </div>

              <div className="flex items-center justify-center py-2">
                <span
                  style={{
                    fontFamily: `"${presets.badge.fontFamily ?? tokens.fontBody}", sans-serif`,
                    backgroundColor: presets.badge.backgroundColor,
                    color: presets.badge.color,
                    borderWidth: presets.badge.borderWidth,
                    borderStyle: presets.badge.borderStyle,
                    borderColor: presets.badge.borderColor,
                    borderRadius: presets.badge.borderRadius,
                    paddingTop: presets.badge.paddingTop,
                    paddingBottom: presets.badge.paddingBottom,
                    paddingLeft: presets.badge.paddingLeft,
                    paddingRight: presets.badge.paddingRight,
                    fontSize: presets.badge.fontSize,
                    fontWeight: presets.badge.fontWeight,
                  }}
                  className="inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>NEW RELEASE · V2.4</span>
                </span>
              </div>

              <div className="text-[11px] text-zinc-500 text-center">
                Eyebrow tag used above hero headlines
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
