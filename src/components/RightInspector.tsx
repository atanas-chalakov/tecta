import { useEffect, useRef, useState } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  BookmarkCheck,
  BookmarkPlus,
  Copy,
  MoveHorizontal,
  Sliders,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type { Breakpoint, NodeId, StyleProps } from '../domain/schema';
import { runBuiltinDesignAssistant } from '../services/aiDesignCopilot';
import { cssomEngine } from '../services/cssomEngine';
import { useDocumentStore } from '../store/documentStore';

function parsePx(raw: string | undefined, fallback = 0): number {
  if (!raw) return fallback;
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? Math.round(parsed) : fallback;
}

/**
 * 120fps Scrubbing Numeric Input.
 * Dragging horizontally mutates the Constructable CSSStyleSheet directly via `cssomEngine`
 * without triggering React state updates until pointer release.
 */
function ScrubInput({
  label,
  nodeId,
  breakpoint,
  propKey,
  value,
  min = 0,
  max = 400,
  unit = 'px',
}: {
  label: string;
  nodeId: NodeId;
  breakpoint: Breakpoint;
  propKey: keyof StyleProps;
  value: string | undefined;
  min?: number;
  max?: number;
  unit?: string;
}) {
  const updateNodeStyle = useDocumentStore((s) => s.updateNodeStyle);
  const [localDisplay, setLocalDisplay] = useState(value ?? '');
  const isScrubbingRef = useRef(false);

  useEffect(() => {
    if (!isScrubbingRef.current) {
      setLocalDisplay(value ?? '');
    }
  }, [value, nodeId, breakpoint]);

  const handleScrubStart = (e: React.PointerEvent) => {
    e.preventDefault();
    isScrubbingRef.current = true;
    const startX = e.clientX;
    const startNumeric = parsePx(value, 0);
    let latestValue = `${startNumeric}${unit}`;

    const onMove = (moveEvent: PointerEvent) => {
      const delta = Math.round((moveEvent.clientX - startX) * 0.75);
      const clamped = Math.max(min, Math.min(max, startNumeric + delta));
      latestValue = `${clamped}${unit}`;
      setLocalDisplay(latestValue);
      cssomEngine.setTransientStyle(nodeId, breakpoint, {
        [propKey]: latestValue,
      });
    };

    const onUp = () => {
      isScrubbingRef.current = false;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      cssomEngine.clearTransientStyles();
      updateNodeStyle(nodeId, breakpoint, { [propKey]: latestValue });
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden focus-within:border-indigo-500/60">
      <div
        onPointerDown={handleScrubStart}
        className="px-2 py-1 text-[10px] font-mono text-zinc-400 hover:text-indigo-300 bg-zinc-900/90 border-r border-zinc-800 cursor-ew-resize flex items-center gap-1 select-none shrink-0"
        title="Drag horizontally to scrub at 120fps"
      >
        <span>{label}</span>
      </div>
      <input
        type="text"
        value={localDisplay}
        placeholder="auto"
        onChange={(e) => {
          const next = e.target.value;
          setLocalDisplay(next);
          cssomEngine.setTransientStyle(nodeId, breakpoint, {
            [propKey]: next,
          });
        }}
        onBlur={() => {
          cssomEngine.clearTransientStyles();
          updateNodeStyle(nodeId, breakpoint, {
            [propKey]: localDisplay,
          });
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
          }
        }}
        className="w-full px-2 py-1 text-xs font-mono text-zinc-100 bg-transparent focus:outline-none"
      />
    </div>
  );
}

export function RightInspector() {
  const selectedNodeId = useDocumentStore((s) => s.selectedNodeId);
  const breakpoint = useDocumentStore((s) => s.breakpoint);
  const node = useDocumentStore((s) =>
    s.selectedNodeId ? s.doc.nodes[s.selectedNodeId] : null
  );

  const activeStep = useDocumentStore((s) => s.activeStep);
  const updateNodeStyle = useDocumentStore((s) => s.updateNodeStyle);
  const updateNodeText = useDocumentStore((s) => s.updateNodeText);
  const updateNodeName = useDocumentStore((s) => s.updateNodeName);
  const updateNodeAttributes = useDocumentStore((s) => s.updateNodeAttributes);
  const duplicateNode = useDocumentStore((s) => s.duplicateNode);
  const deleteNode = useDocumentStore((s) => s.deleteNode);
  const saveCurrentSectionAsComponent = useDocumentStore(
    (s) => s.saveCurrentSectionAsComponent
  );
  const [justSaved, setJustSaved] = useState(false);

  const handleSaveSection = () => {
    if (!node) return;
    saveCurrentSectionAsComponent(node.name || 'Custom Section', 'General', node.id);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  if (!node || !selectedNodeId) {
    return (
      <aside className="w-80 bg-zinc-950 border-l border-zinc-800/90 p-6 flex flex-col items-center justify-center text-center select-none shrink-0">
        <Sliders className="w-8 h-8 text-zinc-700 mb-3" />
        <p className="text-xs font-medium text-zinc-400">
          Select any element on the canvas or Layer Tree to inspect and scrub its styles.
        </p>
      </aside>
    );
  }

  // Resolve effective style at current breakpoint (inheriting from desktop)
  const effectiveStyles: StyleProps = {
    ...node.styles.desktop,
    ...(breakpoint === 'tablet' ? node.styles.tablet : {}),
    ...(breakpoint === 'mobile'
      ? { ...node.styles.tablet, ...node.styles.mobile }
      : {}),
  };

  const setStyle = (patch: Partial<StyleProps>) => {
    updateNodeStyle(node.id, breakpoint, patch);
  };

  const isLeafText =
    node.childrenIds.length === 0 &&
    (node.kind === 'heading' ||
      node.kind === 'text' ||
      node.kind === 'badge' ||
      node.kind === 'button');

  return (
    <aside className="w-80 bg-zinc-950 border-l border-zinc-800/90 flex flex-col shrink-0 select-none">
      {/* Header: Selected Node Identity */}
      <div className="p-3 border-b border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-mono text-[10px] uppercase shrink-0">
            {node.tag}
          </span>
          <input
            type="text"
            value={node.name}
            onChange={(e) => updateNodeName(node.id, e.target.value)}
            className="bg-transparent text-xs font-semibold text-zinc-100 focus:outline-none focus:bg-zinc-900 px-1.5 py-0.5 rounded border border-transparent focus:border-zinc-700 min-w-0 w-full"
          />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {activeStep === 2 && (node.kind === 'section' || !node.parentId) && (
            <button
              type="button"
              onClick={handleSaveSection}
              className="p-1.5 rounded bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 cursor-pointer"
              title="Save this Section as Reusable Component in Library"
            >
              {justSaved ? (
                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <BookmarkPlus className="w-3.5 h-3.5" />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => duplicateNode(node.id)}
            className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 cursor-pointer"
            title="Duplicate Element"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => deleteNode(node.id)}
            className="p-1.5 rounded bg-zinc-900 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 border border-zinc-800 cursor-pointer"
            title="Delete Element"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Breakpoint Indicator Banner */}
      <div className="px-3 py-1.5 bg-zinc-900/90 border-b border-zinc-800/80 flex items-center justify-between text-[11px]">
        <span className="text-zinc-400">Editing Breakpoint:</span>
        <span className="font-mono uppercase text-indigo-300 font-semibold">
          {breakpoint}
        </span>
      </div>

      {/* Scrollable Inspector Sections */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {/* AI Style & Font Assistant (Scoped to Selected Element) */}
        <section className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-indigo-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Style &amp; Font Assist</span>
            </span>
            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
              CSS · Fonts
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {(
              [
                {
                  label: 'Glow Border',
                  prompt: 'Add a 1px glowing indigo border with 16px rounded radius',
                },
                {
                  label: 'Glass Surface',
                  prompt: 'Apply frosted glassmorphism background and border',
                },
                {
                  label: 'Mesh Bg',
                  prompt: 'Set a radial indigo mesh gradient background',
                },
                {
                  label: 'Editorial Font',
                  prompt: 'Suggest an editorial luxury serif font pairing',
                },
              ] as const
            ).map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  const res = runBuiltinDesignAssistant(
                    preset.prompt,
                    node,
                    breakpoint
                  );
                  if (res.stylePatch) {
                    setStyle(res.stylePatch);
                  }
                  if (res.fontPairing) {
                    useDocumentStore
                      .getState()
                      .setGoogleFont('heading', res.fontPairing.heading);
                    useDocumentStore
                      .getState()
                      .setGoogleFont('body', res.fontPairing.body);
                  }
                }}
                className="px-2 py-1 rounded-md bg-zinc-900/90 hover:bg-indigo-600/30 text-zinc-300 hover:text-white border border-zinc-800 hover:border-indigo-500/40 text-[10px] font-medium text-left transition-colors cursor-pointer"
              >
                ✦ {preset.label}
              </button>
            ))}
          </div>
        </section>

        {/* Content & Attributes */}
        {(isLeafText || node.tag === 'a' || node.tag === 'img') && (
          <section className="space-y-2.5 pb-4 border-b border-zinc-800/80">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Content & Traits
            </h4>

            {isLeafText && (
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400 block">
                  Text Content
                </label>
                <textarea
                  rows={2}
                  value={node.textContent ?? ''}
                  onChange={(e) => updateNodeText(node.id, e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 focus:outline-none focus:border-indigo-500/60 resize-none"
                />
              </div>
            )}

            {node.tag === 'a' && (
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400 block">
                  Link URL (href)
                </label>
                <input
                  type="text"
                  value={node.attributes?.href ?? ''}
                  onChange={(e) =>
                    updateNodeAttributes(node.id, { href: e.target.value })
                  }
                  className="w-full px-2.5 py-1 text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 focus:outline-none focus:border-indigo-500/60"
                />
              </div>
            )}

            {node.tag === 'img' && (
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400 block">
                    Image Source URL
                  </label>
                  <input
                    type="text"
                    value={node.attributes?.src ?? ''}
                    onChange={(e) =>
                      updateNodeAttributes(node.id, { src: e.target.value })
                    }
                    className="w-full px-2.5 py-1 text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 focus:outline-none focus:border-indigo-500/60"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400 block">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={node.attributes?.alt ?? ''}
                    onChange={(e) =>
                      updateNodeAttributes(node.id, { alt: e.target.value })
                    }
                    className="w-full px-2.5 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 focus:outline-none focus:border-indigo-500/60"
                  />
                </div>
              </div>
            )}
          </section>
        )}

        {/* Layout & Flex/Grid Engine */}
        <section className="space-y-2.5 pb-4 border-b border-zinc-800/80">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Layout
            </h4>
            <span className="text-[10px] text-zinc-500 flex items-center gap-1">
              <MoveHorizontal className="w-3 h-3" /> Drag labels to scrub
            </span>
          </div>

          {/* Display Switcher */}
          <div className="grid grid-cols-4 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
            {(['block', 'flex', 'grid', 'inline-flex'] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setStyle({ display: d })}
                className={`py-1 rounded text-[11px] font-medium capitalize transition-colors cursor-pointer ${
                  effectiveStyles.display === d
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {d === 'inline-flex' ? 'Inline' : d}
              </button>
            ))}
          </div>

          {effectiveStyles.display === 'flex' && (
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-500 block mb-1">
                    Direction
                  </label>
                  <select
                    value={effectiveStyles.flexDirection ?? 'row'}
                    onChange={(e) =>
                      setStyle({
                        flexDirection: e.target
                          .value as StyleProps['flexDirection'],
                      })
                    }
                    className="w-full px-2 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded-md text-zinc-200"
                  >
                    <option value="row">Row →</option>
                    <option value="column">Column ↓</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 block mb-1">
                    Align
                  </label>
                  <select
                    value={effectiveStyles.alignItems ?? 'stretch'}
                    onChange={(e) =>
                      setStyle({
                        alignItems: e.target.value as StyleProps['alignItems'],
                      })
                    }
                    className="w-full px-2 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded-md text-zinc-200"
                  >
                    <option value="flex-start">Start</option>
                    <option value="center">Center</option>
                    <option value="flex-end">End</option>
                    <option value="stretch">Stretch</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">
                  Justify
                </label>
                <select
                  value={effectiveStyles.justifyContent ?? 'flex-start'}
                  onChange={(e) =>
                    setStyle({
                      justifyContent: e.target
                        .value as StyleProps['justifyContent'],
                    })
                  }
                  className="w-full px-2 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded-md text-zinc-200"
                >
                  <option value="flex-start">Start</option>
                  <option value="center">Center</option>
                  <option value="flex-end">End</option>
                  <option value="space-between">Space Between</option>
                </select>
              </div>
            </div>
          )}

          {effectiveStyles.display === 'grid' && (
            <div className="space-y-1 pt-1">
              <label className="text-[10px] text-zinc-500 block">
                Grid Columns Template
              </label>
              <input
                type="text"
                value={effectiveStyles.gridTemplateColumns ?? ''}
                onChange={(e) =>
                  setStyle({ gridTemplateColumns: e.target.value })
                }
                placeholder="repeat(3, minmax(0, 1fr))"
                className="w-full px-2 py-1 text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-md text-zinc-200"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <ScrubInput
              label="Gap"
              nodeId={node.id}
              breakpoint={breakpoint}
              propKey="gap"
              value={effectiveStyles.gap}
              min={0}
              max={160}
            />
            <ScrubInput
              label="Radius"
              nodeId={node.id}
              breakpoint={breakpoint}
              propKey="borderRadius"
              value={effectiveStyles.borderRadius}
              min={0}
              max={100}
            />
          </div>
        </section>

        {/* Interactive CSS Box-Model Scrubber (Padding & Margin) */}
        <section className="space-y-2.5 pb-4 border-b border-zinc-800/80">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Spacing (120fps Box Model)
          </h4>

          <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
            <div className="text-[10px] font-mono uppercase text-zinc-500">
              Padding (Inner)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ScrubInput
                label="PT"
                nodeId={node.id}
                breakpoint={breakpoint}
                propKey="paddingTop"
                value={effectiveStyles.paddingTop}
              />
              <ScrubInput
                label="PB"
                nodeId={node.id}
                breakpoint={breakpoint}
                propKey="paddingBottom"
                value={effectiveStyles.paddingBottom}
              />
              <ScrubInput
                label="PL"
                nodeId={node.id}
                breakpoint={breakpoint}
                propKey="paddingLeft"
                value={effectiveStyles.paddingLeft}
              />
              <ScrubInput
                label="PR"
                nodeId={node.id}
                breakpoint={breakpoint}
                propKey="paddingRight"
                value={effectiveStyles.paddingRight}
              />
            </div>

            <div className="text-[10px] font-mono uppercase text-zinc-500 pt-1">
              Margin (Outer)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ScrubInput
                label="MT"
                nodeId={node.id}
                breakpoint={breakpoint}
                propKey="marginTop"
                value={effectiveStyles.marginTop}
                min={-200}
              />
              <ScrubInput
                label="MB"
                nodeId={node.id}
                breakpoint={breakpoint}
                propKey="marginBottom"
                value={effectiveStyles.marginBottom}
                min={-200}
              />
            </div>
          </div>
        </section>

        {/* Size & Dimensions */}
        <section className="space-y-2.5 pb-4 border-b border-zinc-800/80">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Dimensions
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <ScrubInput
              label="W"
              nodeId={node.id}
              breakpoint={breakpoint}
              propKey="width"
              value={effectiveStyles.width}
              max={1600}
            />
            <ScrubInput
              label="MaxW"
              nodeId={node.id}
              breakpoint={breakpoint}
              propKey="maxWidth"
              value={effectiveStyles.maxWidth}
              max={1600}
            />
            <ScrubInput
              label="H"
              nodeId={node.id}
              breakpoint={breakpoint}
              propKey="height"
              value={effectiveStyles.height}
              max={1200}
            />
            <ScrubInput
              label="MinH"
              nodeId={node.id}
              breakpoint={breakpoint}
              propKey="minHeight"
              value={effectiveStyles.minHeight}
              max={1200}
            />
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-2.5 pb-4 border-b border-zinc-800/80">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Typography
          </h4>

          <div className="grid grid-cols-2 gap-2">
            <ScrubInput
              label="Size"
              nodeId={node.id}
              breakpoint={breakpoint}
              propKey="fontSize"
              value={effectiveStyles.fontSize}
              min={10}
              max={120}
            />

            <select
              value={effectiveStyles.fontWeight ?? '400'}
              onChange={(e) => setStyle({ fontWeight: e.target.value })}
              className="px-2 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded-md text-zinc-200"
            >
              <option value="400">Regular (400)</option>
              <option value="500">Medium (500)</option>
              <option value="600">Semibold (600)</option>
              <option value="700">Bold (700)</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-md px-2 py-1 flex-1">
              <input
                type="color"
                value={
                  effectiveStyles.color?.startsWith('#')
                    ? effectiveStyles.color
                    : '#ffffff'
                }
                onInput={(e) => {
                  cssomEngine.setTransientStyle(node.id, breakpoint, {
                    color: (e.target as HTMLInputElement).value,
                  });
                }}
                onChange={(e) => {
                  cssomEngine.clearTransientStyles();
                  setStyle({ color: e.target.value });
                }}
                className="w-4 h-4 rounded cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={effectiveStyles.color ?? ''}
                onChange={(e) => setStyle({ color: e.target.value })}
                placeholder="#ffffff"
                className="w-full text-xs font-mono bg-transparent text-zinc-200 focus:outline-none"
              />
            </div>

            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-md p-0.5">
              {(
                [
                  { align: 'left', icon: AlignLeft },
                  { align: 'center', icon: AlignCenter },
                  { align: 'right', icon: AlignRight },
                ] as const
              ).map(({ align, icon: Icon }) => (
                <button
                  key={align}
                  type="button"
                  onClick={() => setStyle({ textAlign: align })}
                  className={`p-1 rounded cursor-pointer ${
                    effectiveStyles.textAlign === align
                      ? 'bg-indigo-600 text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Surface & Borders */}
        <section className="space-y-2.5">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Surface & Borders
          </h4>

          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 block">
              Background Color
            </label>
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-md px-2 py-1">
              <input
                type="color"
                value={
                  effectiveStyles.backgroundColor?.startsWith('#')
                    ? effectiveStyles.backgroundColor
                    : '#09090b'
                }
                onInput={(e) => {
                  cssomEngine.setTransientStyle(node.id, breakpoint, {
                    backgroundColor: (e.target as HTMLInputElement).value,
                  });
                }}
                onChange={(e) => {
                  cssomEngine.clearTransientStyles();
                  setStyle({ backgroundColor: e.target.value });
                }}
                className="w-4 h-4 rounded cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={effectiveStyles.backgroundColor ?? ''}
                onChange={(e) => setStyle({ backgroundColor: e.target.value })}
                placeholder="transparent"
                className="w-full text-xs font-mono bg-transparent text-zinc-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <ScrubInput
              label="Border"
              nodeId={node.id}
              breakpoint={breakpoint}
              propKey="borderWidth"
              value={effectiveStyles.borderWidth}
              min={0}
              max={20}
            />
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-md px-2 py-1">
              <input
                type="color"
                value={
                  effectiveStyles.borderColor?.startsWith('#')
                    ? effectiveStyles.borderColor
                    : '#27272a'
                }
                onChange={(e) =>
                  setStyle({
                    borderColor: e.target.value,
                    borderStyle: 'solid',
                  })
                }
                className="w-4 h-4 rounded cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={effectiveStyles.borderColor ?? ''}
                onChange={(e) =>
                  setStyle({
                    borderColor: e.target.value,
                    borderStyle: 'solid',
                  })
                }
                placeholder="#27272a"
                className="w-full text-xs font-mono bg-transparent text-zinc-200 focus:outline-none"
              />
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
}
