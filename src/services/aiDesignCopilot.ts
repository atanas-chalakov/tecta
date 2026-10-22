import {
  createNodeId,
  createPrimitiveNode,
  loadGoogleFont,
  type Breakpoint,
  type DesignTokens,
  type StyleProps,
  type TectaNode,
} from '../domain/schema';

export type AiEngineMode = 'builtin' | 'webgpu' | 'cloud';

export interface AiCloudConfig {
  provider: 'gemini' | 'groq';
  apiKey: string;
  model: string;
}

export interface FontPairingSuggestion {
  id: string;
  name: string;
  vibe: string;
  headingFont: string;
  bodyFont: string;
  reason: string;
}

export const CURATED_FONT_PAIRINGS: FontPairingSuggestion[] = [
  {
    id: 'pair-modern-tech',
    name: 'Tectonic Precision',
    vibe: 'SaaS, AI & Developer Tools',
    headingFont: 'Space Grotesk',
    bodyFont: 'Inter',
    reason: 'Geometric tech display headlines paired with ultra-legible neutral body copy.',
  },
  {
    id: 'pair-editorial-luxury',
    name: 'Editorial Luxury',
    vibe: 'Fashion, Architecture & Studios',
    headingFont: 'Playfair Display',
    bodyFont: 'Plus Jakarta Sans',
    reason: 'High-contrast editorial serifs balanced by a crisp contemporary geometric sans.',
  },
  {
    id: 'pair-bold-creator',
    name: 'Avant-Garde Agency',
    vibe: 'Portfolios & Creative Agencies',
    headingFont: 'Syne',
    bodyFont: 'DM Sans',
    reason: 'Expressive wide-stance headlines with clean, friendly low-contrast paragraphs.',
  },
  {
    id: 'pair-clean-product',
    name: 'Modern Consumer App',
    vibe: 'E-Commerce & Product Launches',
    headingFont: 'Outfit',
    bodyFont: 'Plus Jakarta Sans',
    reason: 'Warm geometric curves that feel approachable on product cards and pricing tables.',
  },
  {
    id: 'pair-warm-story',
    name: 'Artisan Publication',
    vibe: 'Blogs, Magazines & Essays',
    headingFont: 'Fraunces',
    bodyFont: 'Inter',
    reason: 'Soft old-style optical serif headlines that make blog titles feel handcrafted.',
  },
];

export interface AiDesignActionResult {
  summary: string;
  engineUsed: string;
  stylePatch?: Partial<StyleProps>;
  tokenPatch?: Partial<DesignTokens>;
  fontPairing?: { heading: string; body: string };
  generatedSection?: { rootNode: TectaNode; descendants: TectaNode[] };
}

const DESIGN_KEYWORDS = [
  'border',
  'background',
  'bg',
  'gradient',
  'color',
  'font',
  'typography',
  'heading',
  'text',
  'size',
  'padding',
  'margin',
  'spacing',
  'gap',
  'grid',
  'flex',
  'column',
  'row',
  'card',
  'button',
  'hero',
  'section',
  'pricing',
  'faq',
  'testimonial',
  'footer',
  'header',
  'shadow',
  'glow',
  'glass',
  'rounded',
  'radius',
  'dark',
  'light',
  'minimal',
  'modern',
  'center',
  'align',
  'width',
  'height',
  'style',
  'css',
  'html',
  'layout',
  'post',
  'product',
  'cms',
  'emerald',
  'indigo',
  'violet',
  'rose',
  'amber',
  'cyan',
  'zinc',
  'gold',
  'neon',
  'serif',
  'sans',
  'mono',
];

/**
 * Domain Guardrail: Ensures the AI Copilot only answers website creation, CSS, HTML,
 * typography, color, layout, and CMS design requests.
 */
export function isWebDesignPrompt(prompt: string): boolean {
  const clean = prompt.toLowerCase().trim();
  if (clean.length < 2) return false;
  return DESIGN_KEYWORDS.some((kw) => clean.includes(kw));
}

const COLOR_MAP: Record<
  string,
  { accent: string; bg: string; border: string; glow: string; text: string }
> = {
  indigo: {
    accent: '#6366f1',
    bg: '#1e1b4b',
    border: '#4f46e5',
    glow: '0 0 32px -4px rgba(99, 102, 241, 0.45)',
    text: '#e0e7ff',
  },
  emerald: {
    accent: '#10b981',
    bg: '#022c22',
    border: '#059669',
    glow: '0 0 32px -4px rgba(16, 185, 129, 0.45)',
    text: '#d1fae5',
  },
  rose: {
    accent: '#f43f5e',
    bg: '#4c0519',
    border: '#e11d48',
    glow: '0 0 32px -4px rgba(244, 63, 94, 0.45)',
    text: '#ffe4e6',
  },
  amber: {
    accent: '#f59e0b',
    bg: '#451a03',
    border: '#d97706',
    glow: '0 0 32px -4px rgba(245, 158, 11, 0.45)',
    text: '#fef3c7',
  },
  cyan: {
    accent: '#06b6d4',
    bg: '#083344',
    border: '#0891b2',
    glow: '0 0 32px -4px rgba(6, 182, 212, 0.45)',
    text: '#cffafe',
  },
  violet: {
    accent: '#8b5cf6',
    bg: '#2e1065',
    border: '#7c3aed',
    glow: '0 0 32px -4px rgba(139, 92, 246, 0.45)',
    text: '#ede9fe',
  },
};

function detectPaletteFromPrompt(prompt: string) {
  const lower = prompt.toLowerCase();
  for (const [name, colors] of Object.entries(COLOR_MAP)) {
    if (lower.includes(name)) return { name, ...colors };
  }
  return { name: 'indigo', ...COLOR_MAP.indigo! };
}

/**
 * Instant Built-in CSS / HTML / Font Synthesizer (0ms latency, works offline on any PC).
 */
export function runBuiltinDesignAssistant(
  prompt: string,
  selectedNode: TectaNode | null,
  _breakpoint: Breakpoint
): AiDesignActionResult {
  const lower = prompt.toLowerCase();

  if (!isWebDesignPrompt(lower)) {
    return {
      summary:
        'Tecta AI is scoped exclusively to website design (CSS styles, borders, backgrounds, fonts, HTML structure, and sections). Try asking: "Add a glowing emerald border and 24px radius" or "Suggest a modern serif font pairing".',
      engineUsed: 'Domain Guardrail',
    };
  }

  const palette = detectPaletteFromPrompt(lower);

  // 1. Check if the user is asking for a new Section (Hero, Pricing, FAQ, Testimonials)
  if (
    lower.includes('pricing') ||
    lower.includes('faq') ||
    lower.includes('testimonial') ||
    (lower.includes('section') &&
      (lower.includes('create') ||
        lower.includes('add') ||
        lower.includes('generate') ||
        lower.includes('build')))
  ) {
    const generated = buildAiSectionByIntent(lower, palette);
    return {
      summary: `Generated a responsive "${generated.rootNode.name}" section with ${palette.name} accents and clean CSS Grid layout.`,
      engineUsed: 'Instant Design Synthesizer',
      generatedSection: generated,
    };
  }

  // 2. Check if the user is asking for Font Family / Typography pairing suggestions
  if (
    lower.includes('font') ||
    lower.includes('typography') ||
    lower.includes('serif') ||
    lower.includes('sans')
  ) {
    let chosen = CURATED_FONT_PAIRINGS[0]!;
    if (
      lower.includes('luxury') ||
      lower.includes('editorial') ||
      lower.includes('serif') ||
      lower.includes('elegant')
    ) {
      chosen = CURATED_FONT_PAIRINGS[1]!;
    } else if (
      lower.includes('agency') ||
      lower.includes('bold') ||
      lower.includes('creative')
    ) {
      chosen = CURATED_FONT_PAIRINGS[2]!;
    } else if (
      lower.includes('product') ||
      lower.includes('shop') ||
      lower.includes('warm')
    ) {
      chosen = CURATED_FONT_PAIRINGS[3]!;
    } else if (lower.includes('blog') || lower.includes('post')) {
      chosen = CURATED_FONT_PAIRINGS[4]!;
    }

    loadGoogleFont(chosen.headingFont);
    loadGoogleFont(chosen.bodyFont);

    const stylePatch: Partial<StyleProps> = {};
    if (selectedNode) {
      const isHeading =
        selectedNode.kind === 'heading' ||
        selectedNode.tag === 'h1' ||
        selectedNode.tag === 'h2' ||
        selectedNode.tag === 'h3';
      stylePatch.fontFamily = `'${
        isHeading ? chosen.headingFont : chosen.bodyFont
      }', sans-serif`;
      if (isHeading) {
        stylePatch.letterSpacing = '-0.025em';
        stylePatch.lineHeight = '1.15';
      }
    }

    return {
      summary: `Applied font pairing "${chosen.name}": ${chosen.headingFont} (headings) + ${chosen.bodyFont} (body). ${chosen.reason}`,
      engineUsed: 'Instant Typography Advisor',
      fontPairing: { heading: chosen.headingFont, body: chosen.bodyFont },
      stylePatch: Object.keys(stylePatch).length > 0 ? stylePatch : undefined,
    };
  }

  // 3. Otherwise, compute targeted CSS modifications for the selected element
  const stylePatch: Partial<StyleProps> = {};
  const appliedNotes: string[] = [];

  // Borders & Radius
  if (lower.includes('border') || lower.includes('outline') || lower.includes('frame')) {
    stylePatch.borderStyle = lower.includes('dashed') ? 'dashed' : 'solid';
    const pxMatch = lower.match(/(\d+)\s*px(?:\s+\w+){0,3}\s+border/);
    stylePatch.borderWidth = pxMatch ? `${pxMatch[1]}px` : '1px';
    stylePatch.borderColor = palette.border;
    appliedNotes.push(`${stylePatch.borderWidth} ${stylePatch.borderStyle} ${palette.name} border`);
  }

  if (lower.includes('rounded') || lower.includes('radius') || lower.includes('pill')) {
    if (lower.includes('pill') || lower.includes('full')) {
      stylePatch.borderRadius = '9999px';
    } else {
      const radMatch = lower.match(/(\d+)\s*px\s*(?:radius|rounded)/);
      stylePatch.borderRadius = radMatch ? `${radMatch[1]}px` : '24px';
    }
    appliedNotes.push(`border-radius: ${stylePatch.borderRadius}`);
  }

  // Glow & Shadows
  if (lower.includes('glow') || lower.includes('shadow') || lower.includes('elevat')) {
    stylePatch.boxShadow = palette.glow;
    if (!stylePatch.borderColor) {
      stylePatch.borderWidth = '1px';
      stylePatch.borderStyle = 'solid';
      stylePatch.borderColor = palette.border;
    }
    appliedNotes.push(`${palette.name} ambient glow shadow`);
  }

  // Glassmorphism
  if (lower.includes('glass') || lower.includes('frosted') || lower.includes('translucent')) {
    stylePatch.backgroundColor = 'rgba(24, 24, 27, 0.72)';
    stylePatch.backgroundImage = `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)`;
    stylePatch.borderWidth = '1px';
    stylePatch.borderStyle = 'solid';
    stylePatch.borderColor = 'rgba(255, 255, 255, 0.14)';
    stylePatch.borderRadius = stylePatch.borderRadius ?? '20px';
    stylePatch.boxShadow = '0 20px 50px rgba(0, 0, 0, 0.5)';
    appliedNotes.push('glassmorphic surface with translucent border');
  }

  // Backgrounds & Gradients
  if (
    lower.includes('background') ||
    lower.includes('bg') ||
    lower.includes('gradient') ||
    lower.includes('surface')
  ) {
    if (lower.includes('radial') || lower.includes('mesh') || lower.includes('gradient')) {
      stylePatch.backgroundColor = '#09090b';
      stylePatch.backgroundImage = `radial-gradient(circle at 50% 0%, ${palette.bg} 0%, #09090b 70%)`;
      appliedNotes.push(`radial ${palette.name} mesh gradient background`);
    } else if (lower.includes('dark') || lower.includes('obsidian')) {
      stylePatch.backgroundColor = '#09090b';
      stylePatch.backgroundImage = 'none';
      appliedNotes.push('deep obsidian #09090b background');
    } else {
      stylePatch.backgroundColor = palette.bg;
      appliedNotes.push(`${palette.name} surface background (${palette.bg})`);
    }
  }

  // Spacing / Padding
  if (lower.includes('padding') || lower.includes('spacious') || lower.includes('compact')) {
    if (lower.includes('compact') || lower.includes('tight')) {
      stylePatch.paddingTop = '16px';
      stylePatch.paddingBottom = '16px';
      stylePatch.paddingLeft = '20px';
      stylePatch.paddingRight = '20px';
      appliedNotes.push('compact 16px/20px padding');
    } else {
      stylePatch.paddingTop = '48px';
      stylePatch.paddingBottom = '48px';
      stylePatch.paddingLeft = '40px';
      stylePatch.paddingRight = '40px';
      appliedNotes.push('spacious 48px/40px padding');
    }
  }

  // Layout (Grid / Flex / Center)
  if (lower.includes('center')) {
    stylePatch.textAlign = 'center';
    stylePatch.alignItems = 'center';
    stylePatch.justifyContent = 'center';
    appliedNotes.push('centered alignment');
  }

  if (lower.includes('grid')) {
    const colMatch = lower.match(/([234])\s*col/);
    const cols = colMatch ? colMatch[1] : '3';
    stylePatch.display = 'grid';
    stylePatch.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
    stylePatch.gap = '24px';
    appliedNotes.push(`${cols}-column responsive CSS Grid`);
  }

  // If the prompt only mentioned a color name (e.g., "make it emerald"), apply a cohesive style
  if (appliedNotes.length === 0) {
    stylePatch.borderColor = palette.border;
    stylePatch.borderWidth = '1px';
    stylePatch.borderStyle = 'solid';
    stylePatch.backgroundColor = palette.bg;
    stylePatch.color = palette.text;
    stylePatch.borderRadius = '16px';
    stylePatch.boxShadow = palette.glow;
    appliedNotes.push(
      `cohesive ${palette.name} surface theme (border, background, text, and glow)`
    );
  }

  return {
    summary: `Updated CSS styles: ${appliedNotes.join(', ')}.`,
    engineUsed: 'Instant CSS Design Engine',
    stylePatch,
  };
}

function buildAiSectionByIntent(
  lowerPrompt: string,
  palette: { name: string; accent: string; bg: string; border: string; glow: string; text: string }
): { rootNode: TectaNode; descendants: TectaNode[] } {
  const section = createPrimitiveNode('section', null);
  const isPricing = lowerPrompt.includes('pricing');
  const isFaq = lowerPrompt.includes('faq');

  section.name = isPricing
    ? 'AI Pricing Section'
    : isFaq
      ? 'AI FAQ Section'
      : 'AI Feature Showcase';
  section.styles.desktop = {
    ...section.styles.desktop,
    paddingTop: '88px',
    paddingBottom: '88px',
    backgroundColor: '#09090b',
    backgroundImage: `radial-gradient(circle at 50% 0%, ${palette.bg} 0%, #09090b 70%)`,
  };

  const container = createPrimitiveNode('container', section.id);
  container.styles.desktop = {
    ...container.styles.desktop,
    gap: '40px',
    alignItems: 'center',
  };

  const header = createPrimitiveNode('flex-col', container.id);
  header.styles.desktop = {
    ...header.styles.desktop,
    alignItems: 'center',
    textAlign: 'center',
    gap: '12px',
  };

  const badge = createPrimitiveNode('badge', header.id);
  badge.textContent = isPricing
    ? 'TRANSPARENT PRICING'
    : isFaq
      ? 'FREQUENTLY ASKED QUESTIONS'
      : 'AI GENERATED SECTION';
  badge.styles.desktop = {
    ...badge.styles.desktop,
    backgroundColor: palette.bg,
    borderColor: palette.border,
    color: palette.text,
  };

  const heading = createPrimitiveNode('heading', header.id);
  heading.textContent = isPricing
    ? 'Simple plans that scale with your studio.'
    : isFaq
      ? 'Everything you need to know.'
      : 'Crafted with structural precision.';
  heading.styles.desktop = {
    ...heading.styles.desktop,
    textAlign: 'center',
    fontSize: '40px',
  };

  header.childrenIds = [badge.id, heading.id];

  const grid = createPrimitiveNode('grid', container.id);
  grid.styles.desktop = {
    ...grid.styles.desktop,
    gridTemplateColumns: isFaq
      ? 'repeat(2, minmax(0, 1fr))'
      : 'repeat(3, minmax(0, 1fr))',
    gap: '24px',
  };

  const descendants: TectaNode[] = [container, header, badge, heading, grid];

  const items = isPricing
    ? [
        {
          title: 'Starter — $0/mo',
          desc: 'Unlimited local projects, 120fps CSSOM canvas, and clean static HTML/CSS export.',
          cta: 'Start Free',
          featured: false,
        },
        {
          title: 'Pro Studio — $19/mo',
          desc: 'Custom webfonts, unlimited CMS collections, AI Design Copilot, and priority templates.',
          cta: 'Upgrade to Pro',
          featured: true,
        },
        {
          title: 'Agency — $49/mo',
          desc: 'Multi-client workspaces, white-label exports, and shared component libraries.',
          cta: 'Contact Sales',
          featured: false,
        },
      ]
    : isFaq
      ? [
          {
            title: 'How does Tecta achieve 120fps without lag?',
            desc: 'Style scrubbing writes directly to a Constructable CSSStyleSheet in <0.1ms without triggering React tree re-renders.',
            cta: '',
            featured: false,
          },
          {
            title: 'Does the exported HTML/CSS require a runtime?',
            desc: 'No. Tecta compiles your page into semantic HTML5 and standard responsive CSS media queries.',
            cta: '',
            featured: false,
          },
          {
            title: 'Can I use custom fonts and CMS collections?',
            desc: 'Yes—upload .woff2/.ttf fonts in Step 1 and bind Blog Posts or Products in the CMS Studio.',
            cta: '',
            featured: false,
          },
          {
            title: 'Does the AI Design Assistant work on any computer?',
            desc: 'Yes! It runs directly in the browser via the built-in CSS synthesizer, WebGPU, or free cloud keys.',
            cta: '',
            featured: false,
          },
        ]
      : [
          {
            title: 'Precision Borders & Surfaces',
            desc: 'Layered borders, subtle inner highlights, and ambient shadows tailored to your brand palette.',
            cta: 'Explore Tokens →',
            featured: false,
          },
          {
            title: 'Dynamic CMS Collections',
            desc: 'Manage blog posts, products, and custom items that automatically populate responsive grids.',
            cta: 'Open CMS →',
            featured: true,
          },
          {
            title: 'Responsive Breakpoints',
            desc: 'Preview and override styles across Desktop, Tablet, and Mobile inside an isolated iframe.',
            cta: 'Test Viewport →',
            featured: false,
          },
        ];

  for (const item of items) {
    const card = createPrimitiveNode('card', grid.id);
    card.id = createNodeId('ai_card');
    card.name = item.title;
    card.styles.desktop = {
      ...card.styles.desktop,
      backgroundColor: item.featured ? palette.bg : '#18181b',
      borderColor: item.featured ? palette.border : '#27272a',
      boxShadow: item.featured ? palette.glow : undefined,
      gap: '14px',
    };

    const title = createPrimitiveNode('heading', card.id);
    title.tag = 'h3';
    title.textContent = item.title;
    title.styles.desktop = {
      ...title.styles.desktop,
      fontSize: '20px',
    };

    const body = createPrimitiveNode('text', card.id);
    body.textContent = item.desc;
    body.styles.desktop = {
      ...body.styles.desktop,
      fontSize: '14px',
      color: item.featured ? palette.text : '#a1a1aa',
    };

    card.childrenIds = [title.id, body.id];
    descendants.push(card, title, body);

    if (item.cta) {
      const btn = createPrimitiveNode('button', card.id);
      btn.textContent = item.cta;
      btn.styles.desktop = {
        ...btn.styles.desktop,
        backgroundColor: item.featured ? palette.accent : '#27272a',
        marginTop: '8px',
      };
      card.childrenIds.push(btn.id);
      descendants.push(btn);
    }

    grid.childrenIds.push(card.id);
  }

  container.childrenIds = [header.id, grid.id];
  section.childrenIds = [container.id];

  return { rootNode: section, descendants };
}

/**
 * Option 1 (Cloud Free API — Gemini / Groq) & Option 3 (Browser WebGPU via WebLLM)
 * Queries an LLM for a JSON `StyleProps` patch + summary, falling back cleanly
 * to the deterministic Built-in Design Synthesizer if offline or unsupported.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let webLlmEngineInstance: any = null;

export async function runAiDesignCopilot(params: {
  prompt: string;
  mode: AiEngineMode;
  cloudConfig?: AiCloudConfig;
  selectedNode: TectaNode | null;
  breakpoint: Breakpoint;
  onProgress?: (status: string) => void;
}): Promise<AiDesignActionResult> {
  const { prompt, mode, cloudConfig, selectedNode, breakpoint, onProgress } = params;

  if (!isWebDesignPrompt(prompt)) {
    return runBuiltinDesignAssistant(prompt, selectedNode, breakpoint);
  }

  const systemInstruction = `You are Tecta Studio's Web Design & CSS AI Assistant.
You ONLY assist with website design, CSS properties, borders, backgrounds, gradients, font pairings, and HTML layout.
Return ONLY a valid JSON object matching this schema:
{
  "summary": "Brief 1-sentence explanation of the design change",
  "stylePatch": {
    "backgroundColor": "#hex or rgba",
    "backgroundImage": "linear-gradient(...) or radial-gradient(...)",
    "color": "#hex",
    "fontFamily": "Font Name, sans-serif",
    "fontSize": "px",
    "fontWeight": "400|500|600|700",
    "borderRadius": "px",
    "borderWidth": "px",
    "borderStyle": "solid|dashed|none",
    "borderColor": "#hex",
    "boxShadow": "css shadow",
    "paddingTop": "px",
    "paddingBottom": "px",
    "paddingLeft": "px",
    "paddingRight": "px",
    "gap": "px"
  },
  "fontPairing": { "heading": "Google Font Name", "body": "Google Font Name" }
}
Omit any properties that do not need to change.`;

  // Option 3: Browser WebGPU via @mlc-ai/web-llm (loaded dynamically from CDN so zero bundle bloat)
  if (mode === 'webgpu') {
    try {
      if (typeof navigator === 'undefined' || !('gpu' in navigator)) {
        throw new Error('WebGPU is not supported in this browser.');
      }
      if (!webLlmEngineInstance) {
        onProgress?.('Loading in-browser WebGPU model (Qwen2.5-Coder-1.5B)...');
        const webllmUrl = 'https://esm.run/@mlc-ai/web-llm';
        // Dynamic import from CDN so it runs 100% in the user's browser without server setup
        const webllm = await import(/* @vite-ignore */ webllmUrl);
        webLlmEngineInstance = await webllm.CreateMLCEngine(
          'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC',
          {
            initProgressCallback: (report: { text?: string }) => {
              if (report?.text) onProgress?.(report.text);
            },
          }
        );
      }

      onProgress?.('Synthesizing CSS & design tokens via WebGPU...');
      const reply = await webLlmEngineInstance.chat.completions.create({
        messages: [
          { role: 'system', content: systemInstruction },
          {
            role: 'user',
            content: `Target element: ${selectedNode?.tag ?? 'section'} (${selectedNode?.name ?? 'Page'}). Request: ${prompt}`,
          },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      });

      const rawText: string = reply.choices?.[0]?.message?.content ?? '';
      const parsed = JSON.parse(rawText);
      if (parsed && (parsed.stylePatch || parsed.fontPairing)) {
        if (parsed.fontPairing?.heading) loadGoogleFont(parsed.fontPairing.heading);
        if (parsed.fontPairing?.body) loadGoogleFont(parsed.fontPairing.body);
        return {
          summary: parsed.summary || 'Applied WebGPU AI design styles.',
          engineUsed: 'Browser WebGPU (Qwen2.5-Coder)',
          stylePatch: parsed.stylePatch,
          fontPairing: parsed.fontPairing,
        };
      }
    } catch {
      // Fall back gracefully to the instant synthesizer if WebGPU fails or is cancelled
      const fallback = runBuiltinDesignAssistant(prompt, selectedNode, breakpoint);
      return {
        ...fallback,
        engineUsed: `${fallback.engineUsed} (WebGPU Fallback)`,
      };
    }
  }

  // Option 1: Free Cloud API (Gemini AI Studio Free Tier or Groq Free API)
  if (mode === 'cloud' && cloudConfig?.apiKey.trim()) {
    try {
      onProgress?.(`Querying ${cloudConfig.provider === 'gemini' ? 'Gemini Flash' : 'Groq Llama-3.3'}...`);
      const userPrompt = `Target element: ${selectedNode?.tag ?? 'section'} (${selectedNode?.name ?? 'Page'}). User request: ${prompt}`;

      let rawJson = '';
      if (cloudConfig.provider === 'gemini') {
        const model = cloudConfig.model || 'gemini-2.5-flash';
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(cloudConfig.apiKey.trim())}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemInstruction }] },
              contents: [{ parts: [{ text: userPrompt }] }],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: 'application/json',
              },
            }),
          }
        );
        const data = await res.json();
        rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      } else {
        const model = cloudConfig.model || 'llama-3.3-70b-versatile';
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${cloudConfig.apiKey.trim()}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.2,
            response_format: { type: 'json_object' },
          }),
        });
        const data = await res.json();
        rawJson = data?.choices?.[0]?.message?.content ?? '';
      }

      if (rawJson) {
        const parsed = JSON.parse(rawJson);
        if (parsed.fontPairing?.heading) loadGoogleFont(parsed.fontPairing.heading);
        if (parsed.fontPairing?.body) loadGoogleFont(parsed.fontPairing.body);
        return {
          summary: parsed.summary || 'Applied Cloud AI CSS & typography changes.',
          engineUsed:
            cloudConfig.provider === 'gemini'
              ? 'Gemini Flash (Free API)'
              : 'Groq Llama-3.3 (Free API)',
          stylePatch: parsed.stylePatch,
          fontPairing: parsed.fontPairing,
        };
      }
    } catch {
      const fallback = runBuiltinDesignAssistant(prompt, selectedNode, breakpoint);
      return {
        ...fallback,
        engineUsed: `${fallback.engineUsed} (Cloud Fallback)`,
      };
    }
  }

  // Default: Instant Built-in Design Engine (0ms)
  return runBuiltinDesignAssistant(prompt, selectedNode, breakpoint);
}
