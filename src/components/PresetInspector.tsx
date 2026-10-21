import { useState } from 'react';
import {
  Check,
  Layers,
  Palette,
  RotateCcw,
  Search,
  Sliders,
  Trash2,
  Type,
  Upload,
} from 'lucide-react';
import {
  CURATED_COLOR_PALETTES,
  POPULAR_GOOGLE_FONTS,
  PRESET_CATEGORIES,
  createDefaultPresets,
  type PresetKey,
} from '../domain/presets';
import type { StyleProps } from '../domain/schema';
import { useDocumentStore } from '../store/documentStore';

function parsePx(raw: string | undefined, fallback = 0): number {
  if (!raw) return fallback;
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? Math.round(parsed) : fallback;
}

function getLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return 0.5;
  const r = Number.parseInt(clean.substring(0, 2), 16) / 255;
  const g = Number.parseInt(clean.substring(2, 4), 16) / 255;
  const b = Number.parseInt(clean.substring(4, 6), 16) / 255;
  const a = [r, g, b].map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * a[0]! + 0.7152 * a[1]! + 0.0722 * a[2]!;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}

const COLOR_SWATCHES = [
  '#ffffff',
  '#fafafa',
  '#f4f4f5',
  '#e4e4e7',
  '#a1a1aa',
  '#71717a',
  '#3f3f46',
  '#27272a',
  '#18181b',
  '#09090b',
  '#4f46e5',
  '#6366f1',
  '#818cf8',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  'transparent',
];

/**
 * Inspector subview when 'tokens-colors' is selected
 */
function ColorTokensInspector() {
  const tokens = useDocumentStore((s) => s.tokens);
  const updateDesignTokens = useDocumentStore((s) => s.updateDesignTokens);
  const applyColorPalette = useDocumentStore((s) => s.applyColorPalette);
  const selectPreset = useDocumentStore((s) => s.selectPreset);

  const primaryContrast = getContrastRatio(
    tokens.primaryColor,
    tokens.backgroundColor
  );
  const textContrast = getContrastRatio(tokens.textColor, tokens.surfaceColor);

  return (
    <aside className="w-80 bg-zinc-950 border-l border-zinc-800/90 flex flex-col shrink-0 select-none overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            Step 1 · Stage 1
          </span>
          <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            <span>Global Color Palette</span>
          </h2>
          <p className="text-[11px] text-zinc-400">
            Theme palette tokens applied across elements & layouts
          </p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Preset Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400">
            Selected Preset Element
          </label>
          <select
            value="tokens-colors"
            onChange={(e) => selectPreset(e.target.value as PresetKey)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
          >
            {PRESET_CATEGORIES.map((cat) => (
              <optgroup key={cat.id} label={cat.name}>
                {cat.items.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Curated Color Themes Quick Picker */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <span>Curated Themes</span>
          </label>
          <div className="space-y-1.5">
            {CURATED_COLOR_PALETTES.map((p) => {
              const isActive =
                tokens.primaryColor === p.primary &&
                tokens.backgroundColor === p.background;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyColorPalette(p.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/30 text-white'
                      : 'bg-zinc-900/50 hover:bg-zinc-900 border-zinc-800/80 text-zinc-300 hover:text-white'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                      <span>{p.name}</span>
                      {isActive && <Check className="w-3 h-3 text-indigo-400" />}
                    </div>
                  </div>
                  {/* Swatch preview dots */}
                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className="w-3 h-3 rounded-full border border-black/40"
                      style={{ backgroundColor: p.primary }}
                    />
                    <span
                      className="w-3 h-3 rounded-full border border-black/40"
                      style={{ backgroundColor: p.secondary }}
                    />
                    <span
                      className="w-3 h-3 rounded-full border border-black/40"
                      style={{ backgroundColor: p.surface }}
                    />
                    <span
                      className="w-3 h-3 rounded-full border border-black/40"
                      style={{ backgroundColor: p.background }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Tokens Editor */}
        <div className="space-y-3 pt-3 border-t border-zinc-800">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Brand & Surface Tokens
          </label>

          {/* Primary */}
          <div className="space-y-1">
            <label className="text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Primary (Buttons & Links)</span>
              <span className="font-mono text-zinc-500">{tokens.primaryColor}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={tokens.primaryColor}
                onChange={(e) => updateDesignTokens({ primaryColor: e.target.value })}
                className="w-7 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={tokens.primaryColor}
                onChange={(e) => updateDesignTokens({ primaryColor: e.target.value })}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 font-mono"
              />
            </div>
          </div>

          {/* Secondary */}
          <div className="space-y-1">
            <label className="text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Secondary (Accents & Highlights)</span>
              <span className="font-mono text-zinc-500">{tokens.secondaryColor}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={tokens.secondaryColor}
                onChange={(e) => updateDesignTokens({ secondaryColor: e.target.value })}
                className="w-7 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={tokens.secondaryColor}
                onChange={(e) => updateDesignTokens({ secondaryColor: e.target.value })}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 font-mono"
              />
            </div>
          </div>

          {/* Accent */}
          <div className="space-y-1">
            <label className="text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Accent (Hover & Rings)</span>
              <span className="font-mono text-zinc-500">{tokens.accentColor}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={tokens.accentColor}
                onChange={(e) => updateDesignTokens({ accentColor: e.target.value })}
                className="w-7 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={tokens.accentColor}
                onChange={(e) => updateDesignTokens({ accentColor: e.target.value })}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 font-mono"
              />
            </div>
          </div>

          {/* Background */}
          <div className="space-y-1">
            <label className="text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Background Canvas</span>
              <span className="font-mono text-zinc-500">{tokens.backgroundColor}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={tokens.backgroundColor}
                onChange={(e) => updateDesignTokens({ backgroundColor: e.target.value })}
                className="w-7 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={tokens.backgroundColor}
                onChange={(e) => updateDesignTokens({ backgroundColor: e.target.value })}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 font-mono"
              />
            </div>
          </div>

          {/* Surface */}
          <div className="space-y-1">
            <label className="text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Surface (Cards & Panels)</span>
              <span className="font-mono text-zinc-500">{tokens.surfaceColor}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={tokens.surfaceColor}
                onChange={(e) => updateDesignTokens({ surfaceColor: e.target.value })}
                className="w-7 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={tokens.surfaceColor}
                onChange={(e) => updateDesignTokens({ surfaceColor: e.target.value })}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 font-mono"
              />
            </div>
          </div>

          {/* Text Primary */}
          <div className="space-y-1">
            <label className="text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Text Primary</span>
              <span className="font-mono text-zinc-500">{tokens.textColor}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={tokens.textColor}
                onChange={(e) => updateDesignTokens({ textColor: e.target.value })}
                className="w-7 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={tokens.textColor}
                onChange={(e) => updateDesignTokens({ textColor: e.target.value })}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 font-mono"
              />
            </div>
          </div>

          {/* Text Muted */}
          <div className="space-y-1">
            <label className="text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Text Muted</span>
              <span className="font-mono text-zinc-500">{tokens.textMuted}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={tokens.textMuted}
                onChange={(e) => updateDesignTokens({ textMuted: e.target.value })}
                className="w-7 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={tokens.textMuted}
                onChange={(e) => updateDesignTokens({ textMuted: e.target.value })}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 font-mono"
              />
            </div>
          </div>

          {/* Border */}
          <div className="space-y-1">
            <label className="text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Border Color</span>
              <span className="font-mono text-zinc-500">{tokens.borderColor}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={tokens.borderColor}
                onChange={(e) => updateDesignTokens({ borderColor: e.target.value })}
                className="w-7 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={tokens.borderColor}
                onChange={(e) => updateDesignTokens({ borderColor: e.target.value })}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Global Radius */}
        <div className="space-y-2 pt-3 border-t border-zinc-800">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center justify-between">
            <span>Global Corner Radius</span>
            <span className="font-mono text-zinc-400">{tokens.baseRadius}</span>
          </label>
          <input
            type="range"
            min="0"
            max="32"
            value={parsePx(tokens.baseRadius, 10)}
            onChange={(e) => updateDesignTokens({ baseRadius: `${e.target.value}px` })}
            className="w-full accent-indigo-500"
          />
          <div className="flex gap-1.5 pt-1">
            {['0px', '6px', '10px', '16px', '24px'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => updateDesignTokens({ baseRadius: r })}
                className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                  tokens.baseRadius === r
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* WCAG Contrast Verification */}
        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            WCAG Accessibility Contrast
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300">Primary on Bg:</span>
            <span
              className={`font-mono font-bold ${
                primaryContrast >= 4.5
                  ? 'text-emerald-400'
                  : primaryContrast >= 3.0
                    ? 'text-amber-400'
                    : 'text-rose-400'
              }`}
            >
              {primaryContrast}:1 {primaryContrast >= 4.5 ? '(AA Pass)' : '(Low)'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300">Text on Surface:</span>
            <span
              className={`font-mono font-bold ${
                textContrast >= 7.0
                  ? 'text-emerald-400'
                  : textContrast >= 4.5
                    ? 'text-indigo-400'
                    : 'text-rose-400'
              }`}
            >
              {textContrast}:1 {textContrast >= 7.0 ? '(AAA Pass)' : '(AA Pass)'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

/**
 * Inspector subview when 'tokens-fonts' is selected
 */
function FontTokensInspector() {
  const tokens = useDocumentStore((s) => s.tokens);
  const updateDesignTokens = useDocumentStore((s) => s.updateDesignTokens);
  const setGoogleFont = useDocumentStore((s) => s.setGoogleFont);
  const uploadCustomFont = useDocumentStore((s) => s.uploadCustomFont);
  const deleteCustomFont = useDocumentStore((s) => s.deleteCustomFont);
  const selectPreset = useDocumentStore((s) => s.selectPreset);

  const [search, setSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const filteredGoogleFonts = POPULAR_GOOGLE_FONTS.filter((f) =>
    f.family.toLowerCase().includes(search.toLowerCase())
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      await uploadCustomFont(file);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <aside className="w-80 bg-zinc-950 border-l border-zinc-800/90 flex flex-col shrink-0 select-none overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            Step 1 · Stage 2
          </span>
          <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-indigo-400" />
            <span>Webfonts & Typography</span>
          </h2>
          <p className="text-[11px] text-zinc-400">
            Google Webfonts catalog & custom font file uploads
          </p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Preset Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400">
            Selected Preset Element
          </label>
          <select
            value="tokens-fonts"
            onChange={(e) => selectPreset(e.target.value as PresetKey)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
          >
            {PRESET_CATEGORIES.map((cat) => (
              <optgroup key={cat.id} label={cat.name}>
                {cat.items.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Active Font Pairings */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Active Project Fonts
          </label>

          {/* Heading Font */}
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300">Heading Font</span>
              <span className="font-mono text-indigo-400 text-[11px]">
                {tokens.fontHeading}
              </span>
            </div>
            <select
              value={tokens.fontHeading}
              onChange={(e) => setGoogleFont('heading', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200"
            >
              <optgroup label="Popular Google Fonts">
                {POPULAR_GOOGLE_FONTS.map((f) => (
                  <option key={f.family} value={f.family}>
                    {f.family} ({f.category})
                  </option>
                ))}
              </optgroup>
              {tokens.customFonts.length > 0 && (
                <optgroup label="Custom Uploaded Fonts">
                  {tokens.customFonts.map((cf) => (
                    <option key={cf.id} value={cf.name}>
                      {cf.name} (Custom)
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>Heading Weight:</span>
              <select
                value={tokens.fontHeadingWeight}
                onChange={(e) => updateDesignTokens({ fontHeadingWeight: e.target.value })}
                className="bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 text-xs text-zinc-200"
              >
                <option value="600">Semibold (600)</option>
                <option value="700">Bold (700)</option>
                <option value="800">Extrabold (800)</option>
                <option value="900">Black (900)</option>
              </select>
            </div>
          </div>

          {/* Body Font */}
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300">Body Font</span>
              <span className="font-mono text-indigo-400 text-[11px]">
                {tokens.fontBody}
              </span>
            </div>
            <select
              value={tokens.fontBody}
              onChange={(e) => setGoogleFont('body', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200"
            >
              <optgroup label="Popular Google Fonts">
                {POPULAR_GOOGLE_FONTS.map((f) => (
                  <option key={f.family} value={f.family}>
                    {f.family} ({f.category})
                  </option>
                ))}
              </optgroup>
              {tokens.customFonts.length > 0 && (
                <optgroup label="Custom Uploaded Fonts">
                  {tokens.customFonts.map((cf) => (
                    <option key={cf.id} value={cf.name}>
                      {cf.name} (Custom)
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>Body Weight:</span>
              <select
                value={tokens.fontBodyWeight}
                onChange={(e) => updateDesignTokens({ fontBodyWeight: e.target.value })}
                className="bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 text-xs text-zinc-200"
              >
                <option value="400">Regular (400)</option>
                <option value="500">Medium (500)</option>
                <option value="600">Semibold (600)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Custom Font Uploader */}
        <div className="space-y-3 pt-3 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Custom Font Files
            </label>
            <span className="text-[10px] font-mono text-zinc-500">
              .woff2, .woff, .ttf, .otf
            </span>
          </div>

          <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-zinc-700 hover:border-indigo-500 bg-zinc-900/40 hover:bg-zinc-900 transition-colors cursor-pointer text-center space-y-1.5">
            <Upload className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-semibold text-zinc-200">
              {isUploading ? 'Encoding Font...' : 'Upload Font File'}
            </span>
            <span className="text-[10px] text-zinc-400">
              Encoded to data-URI & embedded in project
            </span>
            <input
              type="file"
              accept=".woff2,.woff,.ttf,.otf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {tokens.customFonts.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {tokens.customFonts.map((cf) => (
                <div
                  key={cf.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-zinc-200 truncate">
                      {cf.name}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500 uppercase">
                      {cf.format}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setGoogleFont('heading', cf.name)}
                      className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300"
                      title="Set as Heading Font"
                    >
                      Heading
                    </button>
                    <button
                      type="button"
                      onClick={() => setGoogleFont('body', cf.name)}
                      className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300"
                      title="Set as Body Font"
                    >
                      Body
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCustomFont(cf.id)}
                      className="p-1 rounded text-zinc-500 hover:text-rose-400 cursor-pointer"
                      title="Delete Font"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Google Fonts Quick Search */}
        <div className="space-y-2 pt-3 border-t border-zinc-800">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Google Fonts Library
          </label>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search fonts..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-1.5 max-h-60 overflow-y-auto pt-1">
            {filteredGoogleFonts.map((f) => (
              <div
                key={f.family}
                className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-xs hover:border-zinc-700 transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-zinc-200 truncate flex items-center gap-1.5">
                    <span>{f.family}</span>
                    <span className="text-[9px] px-1 rounded bg-zinc-800 text-zinc-400 font-mono">
                      {f.category}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate">
                    {f.description}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setGoogleFont('heading', f.family)}
                    className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer ${
                      tokens.fontHeading === f.family
                        ? 'bg-indigo-600 text-white'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    Heading
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoogleFont('body', f.family)}
                    className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer ${
                      tokens.fontBody === f.family
                        ? 'bg-indigo-600 text-white'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    Body
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

/**
 * Main Preset Inspector component
 */
export function PresetInspector() {
  const selectedPresetKey =
    useDocumentStore((s) => s.selectedPresetKey) ?? 'tokens-colors';
  const presets = useDocumentStore((s) => s.presets);
  const tokens = useDocumentStore((s) => s.tokens);
  const updatePresetStyle = useDocumentStore((s) => s.updatePresetStyle);
  const selectPreset = useDocumentStore((s) => s.selectPreset);

  if (selectedPresetKey === 'tokens-colors') {
    return <ColorTokensInspector />;
  }

  if (selectedPresetKey === 'tokens-fonts') {
    return <FontTokensInspector />;
  }

  const style = presets[selectedPresetKey] ?? {};

  // Find info about current preset
  let currentItemLabel = selectedPresetKey as string;
  let currentCategoryName = 'General';
  let currentDescription = '';

  for (const cat of PRESET_CATEGORIES) {
    const found = cat.items.find((i) => i.key === selectedPresetKey);
    if (found) {
      currentItemLabel = found.label;
      currentCategoryName = cat.name;
      currentDescription = found.description;
      break;
    }
  }

  const handleUpdate = (patch: Partial<StyleProps>) => {
    updatePresetStyle(selectedPresetKey, patch);
  };

  const handleResetSingle = () => {
    const defaults = createDefaultPresets();
    if (defaults[selectedPresetKey]) {
      updatePresetStyle(selectedPresetKey, defaults[selectedPresetKey]!);
    }
  };

  return (
    <aside className="w-80 bg-zinc-950 border-l border-zinc-800/90 flex flex-col shrink-0 select-none overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              {currentCategoryName}
            </span>
          </div>
          <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>{currentItemLabel}</span>
          </h2>
          <p className="text-[11px] text-zinc-400">{currentDescription}</p>
        </div>

        <button
          type="button"
          onClick={handleResetSingle}
          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors cursor-pointer"
          title="Reset this preset to default"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Quick Preset Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400">
            Selected Preset Element
          </label>
          <select
            value={selectedPresetKey}
            onChange={(e) => selectPreset(e.target.value as PresetKey)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
          >
            {PRESET_CATEGORIES.map((cat) => (
              <optgroup key={cat.id} label={cat.name}>
                {cat.items.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* 1. Typography Section */}
        {style.fontSize !== undefined && (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200 uppercase tracking-wider">
              <Type className="w-3.5 h-3.5 text-indigo-400" />
              <span>Typography</span>
            </div>

            {/* Font Family selection */}
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400 flex justify-between">
                <span>Font Family</span>
                <span className="font-mono text-zinc-500 text-[10px]">
                  {style.fontFamily ?? tokens.fontHeading}
                </span>
              </label>
              <select
                value={style.fontFamily ?? ''}
                onChange={(e) => handleUpdate({ fontFamily: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
              >
                <option value={tokens.fontHeading}>
                  Project Heading: {tokens.fontHeading}
                </option>
                <option value={tokens.fontBody}>
                  Project Body: {tokens.fontBody}
                </option>
                <optgroup label="Popular Google Fonts">
                  {POPULAR_GOOGLE_FONTS.map((f) => (
                    <option key={f.family} value={f.family}>
                      {f.family}
                    </option>
                  ))}
                </optgroup>
                {tokens.customFonts.length > 0 && (
                  <optgroup label="Custom Uploaded Fonts">
                    {tokens.customFonts.map((cf) => (
                      <option key={cf.id} value={cf.name}>
                        {cf.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400 flex justify-between">
                  <span>Font Size</span>
                  <span className="font-mono text-zinc-500">{style.fontSize}</span>
                </label>
                <input
                  type="range"
                  min="11"
                  max="72"
                  value={parsePx(style.fontSize, 16)}
                  onChange={(e) => handleUpdate({ fontSize: `${e.target.value}px` })}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400">Font Weight</label>
                <select
                  value={style.fontWeight ?? '400'}
                  onChange={(e) => handleUpdate({ fontWeight: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="400">Regular (400)</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">Semibold (600)</option>
                  <option value="700">Bold (700)</option>
                  <option value="800">Extrabold (800)</option>
                </select>
              </div>
            </div>

            {/* Line Height & Letter Spacing */}
            {style.lineHeight !== undefined && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Line Height</label>
                  <input
                    type="text"
                    value={style.lineHeight ?? ''}
                    onChange={(e) => handleUpdate({ lineHeight: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 font-mono"
                    placeholder="1.2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Letter Spacing</label>
                  <input
                    type="text"
                    value={style.letterSpacing ?? ''}
                    onChange={(e) => handleUpdate({ letterSpacing: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 font-mono"
                    placeholder="-0.02em"
                  />
                </div>
              </div>
            )}

            {/* Text Color */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-zinc-400 flex items-center justify-between">
                <span>Text Color</span>
                <span className="font-mono text-zinc-500">{style.color ?? '#ffffff'}</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={style.color?.startsWith('#') ? style.color : '#ffffff'}
                  onChange={(e) => handleUpdate({ color: e.target.value })}
                  className="w-7 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={style.color ?? ''}
                  onChange={(e) => handleUpdate({ color: e.target.value })}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 font-mono"
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. Background Color */}
        {style.backgroundColor !== undefined && (
          <div className="space-y-3 pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200 uppercase tracking-wider">
              <Palette className="w-3.5 h-3.5 text-indigo-400" />
              <span>Background</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>Color</span>
                <span className="font-mono text-zinc-500">
                  {style.backgroundColor ?? 'transparent'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={
                    style.backgroundColor?.startsWith('#')
                      ? style.backgroundColor
                      : '#4f46e5'
                  }
                  onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
                  className="w-7 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={style.backgroundColor ?? ''}
                  onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 font-mono"
                  placeholder="#4f46e5 or transparent"
                />
              </div>

              {/* Swatch Quick Row */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {COLOR_SWATCHES.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => handleUpdate({ backgroundColor: hex })}
                    className="w-5 h-5 rounded border border-zinc-700 hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. Spacing & Dimensions */}
        {(style.paddingLeft !== undefined || style.paddingTop !== undefined) && (
          <div className="space-y-3 pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200 uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Padding (Top/Bottom & Left/Right)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400 flex justify-between">
                  <span>Y-Padding</span>
                  <span className="font-mono text-zinc-500">{style.paddingTop}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={parsePx(style.paddingTop, 12)}
                  onChange={(e) => {
                    const val = `${e.target.value}px`;
                    handleUpdate({ paddingTop: val, paddingBottom: val });
                  }}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400 flex justify-between">
                  <span>X-Padding</span>
                  <span className="font-mono text-zinc-500">{style.paddingLeft}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={parsePx(style.paddingLeft, 20)}
                  onChange={(e) => {
                    const val = `${e.target.value}px`;
                    handleUpdate({ paddingLeft: val, paddingRight: val });
                  }}
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. Borders & Corner Radius */}
        {(style.borderRadius !== undefined || style.borderColor !== undefined) && (
          <div className="space-y-3 pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Borders & Radius</span>
            </div>

            {style.borderRadius !== undefined && (
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400 flex justify-between">
                  <span>Corner Radius</span>
                  <span className="font-mono text-zinc-500">{style.borderRadius}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="32"
                  value={
                    style.borderRadius === '9999px'
                      ? 32
                      : parsePx(style.borderRadius, 8)
                  }
                  onChange={(e) =>
                    handleUpdate({ borderRadius: `${e.target.value}px` })
                  }
                  className="w-full accent-indigo-500"
                />
                <div className="flex gap-1.5 pt-1">
                  {['0px', '4px', '8px', '12px', '16px', '9999px'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleUpdate({ borderRadius: r })}
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                        style.borderRadius === r
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      {r === '9999px' ? 'pill' : r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {style.borderWidth !== undefined && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Border Width</label>
                  <select
                    value={style.borderWidth ?? '0px'}
                    onChange={(e) =>
                      handleUpdate({
                        borderWidth: e.target.value,
                        borderStyle: e.target.value === '0px' ? 'none' : 'solid',
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-200"
                  >
                    <option value="0px">None (0px)</option>
                    <option value="1px">1px</option>
                    <option value="2px">2px</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Border Color</label>
                  <input
                    type="text"
                    value={style.borderColor ?? ''}
                    onChange={(e) => handleUpdate({ borderColor: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-200 font-mono"
                    placeholder="#27272a"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
