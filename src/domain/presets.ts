import type { StyleProps } from './schema';

export type PresetKey =
  | 'tokens-colors'
  | 'tokens-fonts'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body'
  | 'lead'
  | 'button-primary'
  | 'button-secondary'
  | 'button-outline'
  | 'button-ghost'
  | 'input-text'
  | 'input-textarea'
  | 'input-select'
  | 'input-checkbox'
  | 'card'
  | 'badge';

export interface PresetItem {
  key: PresetKey;
  label: string;
  description: string;
}

export interface PresetCategory {
  id: string;
  name: string;
  description: string;
  items: PresetItem[];
}

export const PRESET_CATEGORIES: PresetCategory[] = [
  {
    id: 'theme-colors',
    name: '1. Colors & Palette',
    description: 'Brand colors, surfaces, text, and curated theme palettes',
    items: [
      {
        key: 'tokens-colors',
        label: 'Global Color Palette',
        description: 'Primary, secondary, accent, surface, and background tokens',
      },
    ],
  },
  {
    id: 'theme-fonts',
    name: '2. Typography & Fonts',
    description: 'Google Webfonts catalog & custom font file uploader (.woff2, .ttf, .otf)',
    items: [
      {
        key: 'tokens-fonts',
        label: 'Webfonts & Typography',
        description: 'Heading & body font pairings, Google Fonts library, custom font upload',
      },
    ],
  },
  {
    id: 'typography',
    name: '3. Headings & Typography',
    description: 'Display headlines, section titles, and text scales',
    items: [
      { key: 'h1', label: 'Heading 1 (H1)', description: 'Hero display headline (48px)' },
      { key: 'h2', label: 'Heading 2 (H2)', description: 'Section title headline (36px)' },
      { key: 'h3', label: 'Heading 3 (H3)', description: 'Card title headline (24px)' },
      { key: 'h4', label: 'Heading 4 (H4)', description: 'Sub-feature headline (20px)' },
      { key: 'lead', label: 'Lead Subtitle', description: 'Hero intro / subhead (19px)' },
      { key: 'body', label: 'Body Text', description: 'Standard paragraph copy (16px)' },
    ],
  },
  {
    id: 'buttons',
    name: '4. Buttons & CTAs',
    description: 'Primary, secondary, outline and ghost interactive triggers',
    items: [
      { key: 'button-primary', label: 'Primary Button', description: 'Main conversion call-to-action' },
      { key: 'button-secondary', label: 'Secondary Button', description: 'Neutral supporting action' },
      { key: 'button-outline', label: 'Outline Button', description: 'Bordered transparent button' },
      { key: 'button-ghost', label: 'Ghost Button', description: 'Subtle text-only button' },
    ],
  },
  {
    id: 'forms',
    name: '5. Form Elements',
    description: 'Text inputs, textareas, dropdowns, and checkboxes',
    items: [
      { key: 'input-text', label: 'Text Input', description: 'Single-line text field' },
      { key: 'input-textarea', label: 'Textarea', description: 'Multi-line message box' },
      { key: 'input-select', label: 'Dropdown Select', description: 'Selectable option picker' },
      { key: 'input-checkbox', label: 'Checkbox', description: 'Option toggle checkbox' },
    ],
  },
  {
    id: 'surfaces',
    name: '6. Cards & Indicators',
    description: 'Surface containers, cards, and pill badges',
    items: [
      { key: 'card', label: 'Surface Card', description: 'Bordered content card' },
      { key: 'badge', label: 'Pill Badge', description: 'Feature highlight pill' },
    ],
  },
];

export type ElementPresets = Record<PresetKey, StyleProps>;

export interface CustomUploadedFont {
  id: string;
  name: string;
  format: 'woff2' | 'woff' | 'truetype' | 'opentype';
  dataUrl: string;
  createdAt: number;
}

export interface DesignTokens {
  // 1. Colors & Theme
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  textMuted: string;
  borderColor: string;
  baseRadius: string;

  // 2. Typography & Webfonts
  fontHeading: string;
  fontBody: string;
  fontHeadingWeight: string;
  fontBodyWeight: string;
  googleFontsLoaded: string[];
  customFonts: CustomUploadedFont[];
}

export interface ColorPalettePreset {
  id: string;
  name: string;
  description: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
}

export const CURATED_COLOR_PALETTES: ColorPalettePreset[] = [
  {
    id: 'indigo-tech',
    name: 'Electric Indigo',
    description: 'Modern developer & SaaS aesthetic with high contrast indigo and dark zinc',
    primary: '#4f46e5',
    secondary: '#6366f1',
    accent: '#818cf8',
    background: '#09090b',
    surface: '#18181b',
    text: '#fafafa',
    textMuted: '#a1a1aa',
    border: '#27272a',
  },
  {
    id: 'emerald-matrix',
    name: 'Cyber Emerald',
    description: 'Vibrant neon emerald on deep obsidian for fintech and security platforms',
    primary: '#10b981',
    secondary: '#34d399',
    accent: '#059669',
    background: '#022c22',
    surface: '#064e3b',
    text: '#f0fdf4',
    textMuted: '#a7f3d0',
    border: '#047857',
  },
  {
    id: 'blue-ocean',
    name: 'Deep Pacific',
    description: 'Crisp corporate blue and cyan tones for enterprise software',
    primary: '#0284c7',
    secondary: '#38bdf8',
    accent: '#0369a1',
    background: '#030712',
    surface: '#0f172a',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    border: '#1e293b',
  },
  {
    id: 'amber-sunset',
    name: 'Warm Amber & Gold',
    description: 'Rich luxury warmth with gold and stone surfaces',
    primary: '#d97706',
    secondary: '#fbbf24',
    accent: '#b45309',
    background: '#1c1917',
    surface: '#292524',
    text: '#fef3c7',
    textMuted: '#d6d3d1',
    border: '#44403c',
  },
  {
    id: 'violet-nebula',
    name: 'Velvet Purple',
    description: 'Creative and futuristic purple gradient tones for design studios',
    primary: '#9333ea',
    secondary: '#c084fc',
    accent: '#7e22ce',
    background: '#0f0728',
    surface: '#1e1145',
    text: '#faf5ff',
    textMuted: '#d8b4fe',
    border: '#3b0764',
  },
  {
    id: 'rose-crimson',
    name: 'Neon Crimson',
    description: 'Bold high-energy ruby and rose tones for consumer apps',
    primary: '#e11d48',
    secondary: '#fb7185',
    accent: '#be123c',
    background: '#0f0507',
    surface: '#270a11',
    text: '#fff1f2',
    textMuted: '#fda4af',
    border: '#4c0519',
  },
  {
    id: 'minimal-light',
    name: 'Clean Editorial Light',
    description: 'Crisp pure white canvas with deep slate typography and indigo accents',
    primary: '#4f46e5',
    secondary: '#6366f1',
    accent: '#4338ca',
    background: '#ffffff',
    surface: '#f4f4f5',
    text: '#09090b',
    textMuted: '#52525b',
    border: '#e4e4e7',
  },
];

export interface FontOption {
  family: string;
  category: 'sans-serif' | 'serif' | 'display' | 'monospace';
  weights: number[];
  description: string;
}

export const POPULAR_GOOGLE_FONTS: FontOption[] = [
  // Sans-Serif
  {
    family: 'Inter',
    category: 'sans-serif',
    weights: [400, 500, 600, 700, 800],
    description: 'Modern, crisp UI font optimized for digital screens',
  },
  {
    family: 'Plus Jakarta Sans',
    category: 'sans-serif',
    weights: [400, 500, 600, 700, 800],
    description: 'Contemporary geometric sans with warm, polished personality',
  },
  {
    family: 'Outfit',
    category: 'sans-serif',
    weights: [400, 500, 600, 700, 800],
    description: 'Clean, brand-friendly geometric display sans',
  },
  {
    family: 'Poppins',
    category: 'sans-serif',
    weights: [400, 500, 600, 700],
    description: 'Friendly rounded geometric curves, excellent for headings',
  },
  {
    family: 'Roboto',
    category: 'sans-serif',
    weights: [400, 500, 700],
    description: 'Classic neutral neo-grotesque sans-serif',
  },
  {
    family: 'Montserrat',
    category: 'sans-serif',
    weights: [400, 500, 600, 700, 800],
    description: 'Geometric architectural display sans-serif',
  },
  {
    family: 'DM Sans',
    category: 'sans-serif',
    weights: [400, 500, 700],
    description: 'Precise and legible grotesque sans for high density',
  },
  {
    family: 'Manrope',
    category: 'sans-serif',
    weights: [400, 500, 600, 700, 800],
    description: 'Modern open-source semi-condensed sans',
  },
  {
    family: 'Sora',
    category: 'sans-serif',
    weights: [400, 600, 700],
    description: 'Tailored for crypto, AI, and futuristic interfaces',
  },

  // Serif & Display
  {
    family: 'Playfair Display',
    category: 'serif',
    weights: [400, 600, 700, 800],
    description: 'High-contrast transitional serif for luxury & editorial design',
  },
  {
    family: 'Syne',
    category: 'display',
    weights: [500, 700, 800],
    description: 'Striking avant-garde art display font with wide stance',
  },
  {
    family: 'Cinzel',
    category: 'serif',
    weights: [500, 700],
    description: 'Classical roman proportion display serif',
  },
  {
    family: 'Lora',
    category: 'serif',
    weights: [400, 500, 600, 700],
    description: 'Contemporary serif with brushed calligraphy roots',
  },
  {
    family: 'Merriweather',
    category: 'serif',
    weights: [300, 400, 700],
    description: 'Sturdy, highly readable long-form text serif',
  },
  {
    family: 'Cormorant Garamond',
    category: 'serif',
    weights: [400, 600, 700],
    description: 'Ultra-refined traditional serif with delicate curves',
  },

  // Monospace & Tech
  {
    family: 'Space Grotesk',
    category: 'sans-serif',
    weights: [400, 500, 600, 700],
    description: 'Brutalist tech-inspired proportional monospace',
  },
  {
    family: 'JetBrains Mono',
    category: 'monospace',
    weights: [400, 500, 700],
    description: 'Developer code monospace with clear glyph distinction',
  },
  {
    family: 'Fira Code',
    category: 'monospace',
    weights: [400, 500, 700],
    description: 'Popular developer monospace with ligature support',
  },
  {
    family: 'IBM Plex Mono',
    category: 'monospace',
    weights: [400, 600],
    description: 'Industrial precision monospace for data dashboards',
  },
];

export function loadGoogleFont(family: string, targetDocument?: Document): void {
  if (typeof window === 'undefined' && !targetDocument) return;
  const doc = targetDocument ?? (typeof document !== 'undefined' ? document : undefined);
  if (!doc) return;
  const safeId = `google-font-${family.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
  if (doc.getElementById(safeId)) return;

  const link = doc.createElement('link');
  link.id = safeId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family
  )}:wght@300;400;500;600;700;800;900&display=swap`;
  doc.head.appendChild(link);
}

export function registerCustomFont(
  font: CustomUploadedFont,
  targetDocument?: Document
): void {
  if (typeof window === 'undefined' && !targetDocument) return;
  const doc = targetDocument ?? (typeof document !== 'undefined' ? document : undefined);
  if (!doc) return;
  const safeId = `custom-font-${font.id}`;
  if (doc.getElementById(safeId)) return;

  const style = doc.createElement('style');
  style.id = safeId;
  style.textContent = `
    @font-face {
      font-family: '${font.name}';
      src: url('${font.dataUrl}') format('${font.format}');
      font-weight: 100 900;
      font-display: swap;
    }
  `;
  doc.head.appendChild(style);
}

export function createDefaultDesignTokens(): DesignTokens {
  return {
    primaryColor: '#4f46e5',
    secondaryColor: '#6366f1',
    accentColor: '#818cf8',
    backgroundColor: '#09090b',
    surfaceColor: '#18181b',
    textColor: '#fafafa',
    textMuted: '#a1a1aa',
    borderColor: '#27272a',
    baseRadius: '10px',

    fontHeading: 'Inter',
    fontBody: 'Inter',
    fontHeadingWeight: '700',
    fontBodyWeight: '400',
    googleFontsLoaded: [
      'Inter',
      'Plus Jakarta Sans',
      'Outfit',
      'Poppins',
      'Playfair Display',
      'Space Grotesk',
    ],
    customFonts: [],
  };
}

export function createDefaultPresets(): ElementPresets {
  return {
    'tokens-colors': {},
    'tokens-fonts': {},
    h1: {
      fontSize: '48px',
      fontWeight: '800',
      lineHeight: '1.15',
      letterSpacing: '-0.03em',
      color: '#ffffff',
      fontFamily: 'Inter',
      marginTop: '0px',
      marginBottom: '0px',
    },
    h2: {
      fontSize: '36px',
      fontWeight: '700',
      lineHeight: '1.2',
      letterSpacing: '-0.02em',
      color: '#ffffff',
      fontFamily: 'Inter',
      marginTop: '0px',
      marginBottom: '0px',
    },
    h3: {
      fontSize: '24px',
      fontWeight: '600',
      lineHeight: '1.3',
      letterSpacing: '-0.015em',
      color: '#ffffff',
      fontFamily: 'Inter',
      marginTop: '0px',
      marginBottom: '0px',
    },
    h4: {
      fontSize: '20px',
      fontWeight: '600',
      lineHeight: '1.4',
      color: '#ffffff',
      fontFamily: 'Inter',
      marginTop: '0px',
      marginBottom: '0px',
    },
    lead: {
      fontSize: '19px',
      fontWeight: '400',
      lineHeight: '1.6',
      color: '#c7d2fe',
      fontFamily: 'Inter',
      marginTop: '0px',
      marginBottom: '0px',
    },
    body: {
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '1.6',
      color: '#a1a1aa',
      fontFamily: 'Inter',
      marginTop: '0px',
      marginBottom: '0px',
    },
    'button-primary': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: '12px',
      paddingBottom: '12px',
      paddingLeft: '24px',
      paddingRight: '24px',
      fontSize: '15px',
      fontWeight: '600',
      color: '#ffffff',
      backgroundColor: '#4f46e5',
      borderRadius: '10px',
      fontFamily: 'Inter',
    },
    'button-secondary': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: '12px',
      paddingBottom: '12px',
      paddingLeft: '24px',
      paddingRight: '24px',
      fontSize: '15px',
      fontWeight: '600',
      color: '#e4e4e7',
      backgroundColor: '#18181b',
      borderRadius: '10px',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: '#27272a',
      fontFamily: 'Inter',
    },
    'button-outline': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: '12px',
      paddingBottom: '12px',
      paddingLeft: '24px',
      paddingRight: '24px',
      fontSize: '15px',
      fontWeight: '600',
      color: '#818cf8',
      backgroundColor: 'transparent',
      borderRadius: '10px',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: '#6366f1',
      fontFamily: 'Inter',
    },
    'button-ghost': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: '12px',
      paddingBottom: '12px',
      paddingLeft: '20px',
      paddingRight: '20px',
      fontSize: '15px',
      fontWeight: '600',
      color: '#a1a1aa',
      backgroundColor: 'transparent',
      borderRadius: '10px',
      fontFamily: 'Inter',
    },
    'input-text': {
      display: 'block',
      width: '100%',
      paddingTop: '10px',
      paddingBottom: '10px',
      paddingLeft: '14px',
      paddingRight: '14px',
      fontSize: '14px',
      color: '#fafafa',
      backgroundColor: '#18181b',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: '#27272a',
      borderRadius: '8px',
      fontFamily: 'Inter',
    },
    'input-textarea': {
      display: 'block',
      width: '100%',
      minHeight: '100px',
      paddingTop: '10px',
      paddingBottom: '10px',
      paddingLeft: '14px',
      paddingRight: '14px',
      fontSize: '14px',
      color: '#fafafa',
      backgroundColor: '#18181b',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: '#27272a',
      borderRadius: '8px',
      fontFamily: 'Inter',
    },
    'input-select': {
      display: 'block',
      width: '100%',
      paddingTop: '10px',
      paddingBottom: '10px',
      paddingLeft: '14px',
      paddingRight: '14px',
      fontSize: '14px',
      color: '#fafafa',
      backgroundColor: '#18181b',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: '#27272a',
      borderRadius: '8px',
      fontFamily: 'Inter',
    },
    'input-checkbox': {
      width: '18px',
      height: '18px',
      borderRadius: '4px',
      backgroundColor: '#18181b',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: '#3f3f46',
    },
    card: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      paddingTop: '24px',
      paddingBottom: '24px',
      paddingLeft: '24px',
      paddingRight: '24px',
      backgroundColor: '#18181b',
      borderRadius: '16px',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: '#27272a',
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      paddingTop: '4px',
      paddingBottom: '4px',
      paddingLeft: '12px',
      paddingRight: '12px',
      fontSize: '12px',
      fontWeight: '600',
      letterSpacing: '0.04em',
      color: '#a5b4fc',
      backgroundColor: '#1e1b4b',
      borderRadius: '9999px',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: '#3730a3',
      fontFamily: 'Inter',
    },
  };
}

export function syncPresetsWithTokens(
  tokens: DesignTokens,
  currentPresets: ElementPresets
): ElementPresets {
  return {
    ...currentPresets,
    'button-primary': {
      ...currentPresets['button-primary'],
      backgroundColor: tokens.primaryColor,
      color: '#ffffff',
      borderRadius: tokens.baseRadius,
      fontFamily: tokens.fontBody,
    },
    'button-secondary': {
      ...currentPresets['button-secondary'],
      backgroundColor: tokens.surfaceColor,
      borderColor: tokens.borderColor,
      color: tokens.textColor,
      borderRadius: tokens.baseRadius,
      fontFamily: tokens.fontBody,
    },
    'button-outline': {
      ...currentPresets['button-outline'],
      borderColor: tokens.primaryColor,
      color: tokens.primaryColor,
      borderRadius: tokens.baseRadius,
      fontFamily: tokens.fontBody,
    },
    'button-ghost': {
      ...currentPresets['button-ghost'],
      color: tokens.textMuted,
      fontFamily: tokens.fontBody,
    },
    h1: {
      ...currentPresets['h1'],
      fontFamily: tokens.fontHeading,
      color: tokens.textColor,
    },
    h2: {
      ...currentPresets['h2'],
      fontFamily: tokens.fontHeading,
      color: tokens.textColor,
    },
    h3: {
      ...currentPresets['h3'],
      fontFamily: tokens.fontHeading,
      color: tokens.textColor,
    },
    h4: {
      ...currentPresets['h4'],
      fontFamily: tokens.fontHeading,
      color: tokens.textColor,
    },
    lead: {
      ...currentPresets['lead'],
      fontFamily: tokens.fontBody,
      color: tokens.textMuted,
    },
    body: {
      ...currentPresets['body'],
      fontFamily: tokens.fontBody,
      color: tokens.textMuted,
    },
    card: {
      ...currentPresets['card'],
      backgroundColor: tokens.surfaceColor,
      borderColor: tokens.borderColor,
      borderRadius: tokens.baseRadius,
    },
    'input-text': {
      ...currentPresets['input-text'],
      backgroundColor: tokens.surfaceColor,
      borderColor: tokens.borderColor,
      color: tokens.textColor,
      fontFamily: tokens.fontBody,
      borderRadius: tokens.baseRadius,
    },
    'input-textarea': {
      ...currentPresets['input-textarea'],
      backgroundColor: tokens.surfaceColor,
      borderColor: tokens.borderColor,
      color: tokens.textColor,
      fontFamily: tokens.fontBody,
      borderRadius: tokens.baseRadius,
    },
    'input-select': {
      ...currentPresets['input-select'],
      backgroundColor: tokens.surfaceColor,
      borderColor: tokens.borderColor,
      color: tokens.textColor,
      fontFamily: tokens.fontBody,
      borderRadius: tokens.baseRadius,
    },
  };
}
