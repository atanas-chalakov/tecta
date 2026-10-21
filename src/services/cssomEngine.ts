import type {
  Breakpoint,
  DesignTokens,
  NodeId,
  PageDocument,
  StyleProps,
  TectaNode,
} from '../domain/schema';

const camelToKebabCache = new Map<string, string>();

export function camelToKebab(prop: string): string {
  const cached = camelToKebabCache.get(prop);
  if (cached) return cached;
  const kebab = prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
  camelToKebabCache.set(prop, kebab);
  return kebab;
}

export function serializeStyleProps(styles?: Partial<StyleProps>): string {
  if (!styles) return '';
  const parts: string[] = [];
  for (const [key, rawValue] of Object.entries(styles)) {
    if (rawValue === undefined || rawValue === '') continue;
    parts.push(`${camelToKebab(key)}: ${rawValue};`);
  }
  return parts.join(' ');
}

export function compileNodeRule(
  node: TectaNode,
  includeMediaQueries = true
): string {
  const selector = `.tecta-node-${node.id}`;
  const desktopBody = serializeStyleProps(node.styles.desktop);
  const rules: string[] = [];

  if (node.hidden) {
    rules.push(`${selector} { display: none !important; }`);
    return rules.join('\n');
  }

  if (desktopBody) {
    rules.push(`${selector} { ${desktopBody} }`);
  }

  if (includeMediaQueries) {
    const tabletBody = serializeStyleProps(node.styles.tablet);
    if (tabletBody) {
      rules.push(`@media (max-width: 991px) { ${selector} { ${tabletBody} } }`);
    }
    const mobileBody = serializeStyleProps(node.styles.mobile);
    if (mobileBody) {
      rules.push(`@media (max-width: 479px) { ${selector} { ${mobileBody} } }`);
    }
  }

  return rules.join('\n');
}

export function compileDocumentStylesheet(
  doc: PageDocument,
  tokens?: DesignTokens
): string {
  const baseBg = tokens?.backgroundColor ?? '#09090b';
  const baseColor = tokens?.textColor ?? '#fafafa';
  const baseFont = tokens?.fontBody
    ? `"${tokens.fontBody}", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
    : 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  const baseReset = `
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background-color: ${baseBg};
      color: ${baseColor};
      font-family: ${baseFont};
      -webkit-font-smoothing: antialiased;
    }
    a { text-decoration: none; cursor: pointer; }
    img { object-fit: cover; max-width: 100%; }
    [contenteditable="true"]:focus {
      outline: 2px solid ${tokens?.accentColor ?? '#818cf8'};
      outline-offset: 2px;
      border-radius: 4px;
    }
  `;

  const ruleBlocks: string[] = [baseReset.trim()];
  for (const node of Object.values(doc.nodes)) {
    const css = compileNodeRule(node, true);
    if (css) ruleBlocks.push(css);
  }
  return ruleBlocks.join('\n');
}

/**
 * 120fps Direct-CSSOM Engine.
 * Manages two Constructable Stylesheets inside the canvas iframe:
 * 1. `committedSheet`: Synced from the normalized Zustand store.
 * 2. `transientSheet`: Updated via requestAnimationFrame during slider scrubbing/dragging
 *    in < 0.1ms without triggering any React component renders.
 */
export class DirectCssomEngine {
  private committedSheet: CSSStyleSheet | null = null;
  private transientSheet: CSSStyleSheet | null = null;
  private transientOverrides = new Map<
    NodeId,
    { breakpoint: Breakpoint; styles: Partial<StyleProps> }
  >();
  private rafHandle: number | null = null;
  private lastMutationDurationMs = 0.04;
  private currentTokens?: DesignTokens;

  public attachToDocument(
    iframeDoc: Document,
    initialDoc: PageDocument,
    tokens?: DesignTokens
  ): void {
    if (tokens) this.currentTokens = tokens;
    const win = iframeDoc.defaultView as
      | (Window & typeof globalThis & { CSSStyleSheet: typeof CSSStyleSheet })
      | null;

    if (win && 'adoptedStyleSheets' in iframeDoc) {
      this.committedSheet = new win.CSSStyleSheet();
      this.transientSheet = new win.CSSStyleSheet();
      iframeDoc.adoptedStyleSheets = [
        this.committedSheet,
        this.transientSheet,
      ];
      this.syncCommittedDocument(initialDoc, tokens);
    }
  }

  public syncCommittedDocument(
    doc: PageDocument,
    tokens?: DesignTokens
  ): void {
    if (tokens) this.currentTokens = tokens;
    if (!this.committedSheet) return;
    const t0 = performance.now();
    const css = compileDocumentStylesheet(doc, this.currentTokens);
    this.committedSheet.replaceSync(css);
    this.lastMutationDurationMs = Number((performance.now() - t0).toFixed(3));
  }

  /**
   * High-frequency transient style update (called on pointermove during scrubbing).
   * Zero React state updates; writes directly to the transient CSSStyleSheet on rAF.
   */
  public setTransientStyle(
    nodeId: NodeId,
    breakpoint: Breakpoint,
    patch: Partial<StyleProps>
  ): void {
    const existing = this.transientOverrides.get(nodeId);
    const mergedStyles = {
      ...(existing?.breakpoint === breakpoint ? existing.styles : {}),
      ...patch,
    };
    this.transientOverrides.set(nodeId, { breakpoint, styles: mergedStyles });

    if (this.rafHandle === null) {
      this.rafHandle = requestAnimationFrame(() => {
        this.rafHandle = null;
        this.flushTransientSheet();
      });
    }
  }

  public clearTransientStyles(): void {
    this.transientOverrides.clear();
    if (this.rafHandle !== null) {
      cancelAnimationFrame(this.rafHandle);
      this.rafHandle = null;
    }
    if (this.transientSheet) {
      this.transientSheet.replaceSync('');
    }
  }

  public getLastMutationMs(): number {
    return this.lastMutationDurationMs;
  }

  private flushTransientSheet(): void {
    if (!this.transientSheet) return;
    const t0 = performance.now();
    const rules: string[] = [];

    for (const [nodeId, { styles }] of this.transientOverrides.entries()) {
      const body = serializeStyleProps(styles);
      if (!body) continue;
      // Use higher specificity selector so transient preview overrides committed rules across breakpoints
      rules.push(`html body .tecta-node-${nodeId} { ${body} }`);
    }

    this.transientSheet.replaceSync(rules.join('\n'));
    this.lastMutationDurationMs = Number((performance.now() - t0).toFixed(3));
  }
}

export const cssomEngine = new DirectCssomEngine();

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderNodeHtml(
  nodeId: NodeId,
  nodes: Record<NodeId, TectaNode>,
  depth = 2
): string {
  const node = nodes[nodeId];
  if (!node || node.hidden) return '';

  const indent = '  '.repeat(depth);
  const classAttr = `class="tecta-node-${node.id}"`;

  if (node.tag === 'img') {
    const src = escapeHtml(node.attributes?.src ?? '');
    const alt = escapeHtml(node.attributes?.alt ?? '');
    return `${indent}<img ${classAttr} src="${src}" alt="${alt}" />`;
  }

  const extraAttrs: string[] = [classAttr];
  if (node.tag === 'a' && node.attributes?.href) {
    extraAttrs.push(`href="${escapeHtml(node.attributes.href)}"`);
  }

  const openTag = `<${node.tag} ${extraAttrs.join(' ')}>`;
  const closeTag = `</${node.tag}>`;

  if (node.childrenIds.length === 0) {
    const content = node.textContent ? escapeHtml(node.textContent) : '';
    return `${indent}${openTag}${content}${closeTag}`;
  }

  const childrenHtml = node.childrenIds
    .map((childId) => renderNodeHtml(childId, nodes, depth + 1))
    .filter(Boolean)
    .join('\n');

  return `${indent}${openTag}\n${childrenHtml}\n${indent}${closeTag}`;
}

export function exportPageToCode(
  doc: PageDocument,
  tokens?: DesignTokens
): {
  html: string;
  css: string;
  standaloneHtml: string;
} {
  const css = compileDocumentStylesheet(doc, tokens);
  const bodyNodes = doc.rootIds
    .map((rootId) => renderNodeHtml(rootId, doc.nodes, 2))
    .filter(Boolean)
    .join('\n\n');

  const html = `<main class="tecta-page">\n${bodyNodes}\n  </main>`;

  const fontLinks = (tokens?.googleFontsLoaded ?? [])
    .map(
      (f) =>
        `  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(
          f
        )}:wght@300;400;500;600;700;800;900&display=swap" />`
    )
    .join('\n');

  const customFontStyles = (tokens?.customFonts ?? [])
    .map(
      (cf) => `    @font-face {
      font-family: '${cf.name}';
      src: url('${cf.dataUrl}') format('${cf.format}');
      font-weight: 100 900;
      font-display: swap;
    }`
    )
    .join('\n');

  const styleBlock = [customFontStyles, css].filter(Boolean).join('\n');

  const standaloneHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(doc.title)}</title>
${fontLinks ? fontLinks + '\n' : ''}  <style>
${styleBlock}
  </style>
</head>
<body>
  ${html}
</body>
</html>`;

  return { html, css, standaloneHtml };
}
