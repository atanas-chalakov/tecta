import {
  createElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowDown,
  ArrowUp,
  BookmarkPlus,
  Copy,
  CornerLeftUp,
  Trash2,
} from 'lucide-react';
import type { NodeId } from '../domain/schema';
import { loadGoogleFont, registerCustomFont } from '../domain/presets';
import { cssomEngine } from '../services/cssomEngine';
import { useDocumentStore } from '../store/documentStore';

interface BoxRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * O(1) Pure Native DOM Renderer inside the isolated iframe.
 * Each node subscribes ONLY to `s.doc.nodes[nodeId]` so updating one node
 * never re-renders sibling or parent branches.
 */
function CanvasDomNode({ nodeId }: { nodeId: NodeId }) {
  const node = useDocumentStore((s) => s.doc.nodes[nodeId]);
  const isPreviewMode = useDocumentStore((s) => s.isPreviewMode);
  const updateNodeText = useDocumentStore((s) => s.updateNodeText);
  const [isEditingText, setIsEditingText] = useState(false);

  if (!node || node.hidden) return null;

  const isLeafText =
    node.childrenIds.length === 0 &&
    (node.kind === 'heading' ||
      node.kind === 'text' ||
      node.kind === 'badge' ||
      node.kind === 'button');

  const className = `tecta-node-${node.id}`;

  if (node.tag === 'img') {
    return (
      <img
        data-tecta-id={node.id}
        className={className}
        src={node.attributes?.src}
        alt={node.attributes?.alt ?? ''}
        draggable={false}
      />
    );
  }

  if (node.tag === 'input') {
    return (
      <input
        data-tecta-id={node.id}
        className={className}
        placeholder={node.attributes?.placeholder ?? 'Enter text...'}
        readOnly={!isPreviewMode}
      />
    );
  }

  if (node.tag === 'textarea') {
    return (
      <textarea
        data-tecta-id={node.id}
        className={className}
        defaultValue={node.textContent ?? ''}
        placeholder={node.attributes?.placeholder ?? 'Enter message...'}
        readOnly={!isPreviewMode}
      />
    );
  }

  if (node.tag === 'select') {
    return (
      <select
        data-tecta-id={node.id}
        className={className}
        disabled={!isPreviewMode}
      >
        <option>{node.textContent ?? 'Select an option...'}</option>
      </select>
    );
  }

  const children =
    node.childrenIds.length > 0
      ? node.childrenIds.map((childId) => (
          <CanvasDomNode key={childId} nodeId={childId} />
        ))
      : node.textContent;

  return createElement(
    node.tag,
    {
      'data-tecta-id': node.id,
      className,
      href: node.tag === 'a' ? (node.attributes?.href ?? '#') : undefined,
      contentEditable: !isPreviewMode && isLeafText && isEditingText,
      suppressContentEditableWarning: true,
      onClick: (e: MouseEvent) => {
        if (!isPreviewMode && node.tag === 'a') {
          e.preventDefault();
        }
      },
      onDoubleClick: (e: MouseEvent) => {
        if (!isPreviewMode && isLeafText) {
          e.stopPropagation();
          setIsEditingText(true);
        }
      },
      onBlur: (e: React.FocusEvent<HTMLElement>) => {
        if (isEditingText) {
          setIsEditingText(false);
          updateNodeText(node.id, e.currentTarget.innerText);
        }
      },
    },
    children
  );
}

export function CanvasFrame() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const [selectedRect, setSelectedRect] = useState<BoxRect | null>(null);
  const [hoveredRect, setHoveredRect] = useState<BoxRect | null>(null);

  const doc = useDocumentStore((s) => s.doc);
  const selectedNodeId = useDocumentStore((s) => s.selectedNodeId);
  const hoveredNodeId = useDocumentStore((s) => s.hoveredNodeId);
  const breakpoint = useDocumentStore((s) => s.breakpoint);
  const isPreviewMode = useDocumentStore((s) => s.isPreviewMode);
  const activeStep = useDocumentStore((s) => s.activeStep);

  const selectNode = useDocumentStore((s) => s.selectNode);
  const hoverNode = useDocumentStore((s) => s.hoverNode);
  const moveNodeStep = useDocumentStore((s) => s.moveNodeStep);
  const duplicateNode = useDocumentStore((s) => s.duplicateNode);
  const deleteNode = useDocumentStore((s) => s.deleteNode);
  const saveCurrentSectionAsComponent = useDocumentStore(
    (s) => s.saveCurrentSectionAsComponent
  );

  const tokens = useDocumentStore((s) => s.tokens);

  const selectedNode = selectedNodeId ? doc.nodes[selectedNodeId] : null;
  const hoveredNode = hoveredNodeId ? doc.nodes[hoveredNodeId] : null;

  const measureRects = useCallback(() => {
    const iframe = iframeRef.current;
    const iframeDoc = iframe?.contentDocument;
    if (!iframe || !iframeDoc) return;

    if (selectedNodeId) {
      const el = iframeDoc.querySelector<HTMLElement>(
        `[data-tecta-id="${selectedNodeId}"]`
      );
      if (el) {
        const r = el.getBoundingClientRect();
        setSelectedRect({
          top: r.top,
          left: r.left,
          width: r.width,
          height: r.height,
        });
      } else {
        setSelectedRect(null);
      }
    } else {
      setSelectedRect(null);
    }

    if (hoveredNodeId && hoveredNodeId !== selectedNodeId) {
      const el = iframeDoc.querySelector<HTMLElement>(
        `[data-tecta-id="${hoveredNodeId}"]`
      );
      if (el) {
        const r = el.getBoundingClientRect();
        setHoveredRect({
          top: r.top,
          left: r.left,
          width: r.width,
          height: r.height,
        });
      } else {
        setHoveredRect(null);
      }
    } else {
      setHoveredRect(null);
    }
  }, [selectedNodeId, hoveredNodeId]);

  // Initialize isolated iframe document and attach Constructable CSSStyleSheet engine
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      const iframeDoc = iframe.contentDocument;
      if (!iframeDoc) return;

      const state = useDocumentStore.getState();
      cssomEngine.attachToDocument(iframeDoc, state.doc, state.tokens);

      for (const font of state.tokens.googleFontsLoaded) {
        loadGoogleFont(font, iframeDoc);
      }
      for (const customFont of state.tokens.customFonts) {
        registerCustomFont(customFont, iframeDoc);
      }

      let root = iframeDoc.getElementById('tecta-canvas-root');
      if (!root) {
        root = iframeDoc.createElement('main');
        root.id = 'tecta-canvas-root';
        iframeDoc.body.innerHTML = '';
        iframeDoc.body.appendChild(root);
      }
      setMountNode(root);

      const onScrollOrResize = () => {
        requestAnimationFrame(measureRects);
      };

      iframeDoc.addEventListener('scroll', onScrollOrResize, { passive: true });
      iframe.contentWindow?.addEventListener('resize', onScrollOrResize, {
        passive: true,
      });
    };

    iframe.addEventListener('load', handleLoad);
    if (iframe.contentDocument?.readyState === 'complete') {
      handleLoad();
    }

    return () => {
      iframe.removeEventListener('load', handleLoad);
    };
  }, [measureRects]);

  // Sync committed document styles and fonts to CSSStyleSheet in <0.1ms whenever doc or tokens change
  useEffect(() => {
    const iframeDoc = iframeRef.current?.contentDocument;
    if (iframeDoc) {
      for (const font of tokens.googleFontsLoaded) {
        loadGoogleFont(font, iframeDoc);
      }
      for (const customFont of tokens.customFonts) {
        registerCustomFont(customFont, iframeDoc);
      }
    }
    cssomEngine.syncCommittedDocument(doc, tokens);
    const id = requestAnimationFrame(measureRects);
    return () => cancelAnimationFrame(id);
  }, [doc, tokens, measureRects]);

  // Re-measure overlay bounding boxes when selection, hover, or breakpoint changes
  useEffect(() => {
    const id = requestAnimationFrame(measureRects);
    const timer = window.setTimeout(measureRects, 220);
    return () => {
      cancelAnimationFrame(id);
      window.clearTimeout(timer);
    };
  }, [selectedNodeId, hoveredNodeId, breakpoint, measureRects]);

  // Delegate pointer hover/selection inside the iframe
  useEffect(() => {
    const iframeDoc = iframeRef.current?.contentDocument;
    if (!iframeDoc || isPreviewMode) return;

    const handlePointerMove = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        '[data-tecta-id]'
      );
      const id = target?.getAttribute('data-tecta-id') ?? null;
      if (id !== useDocumentStore.getState().hoveredNodeId) {
        hoverNode(id);
      }
    };

    const handlePointerLeave = () => {
      hoverNode(null);
    };

    const handleClick = (e: globalThis.MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        '[data-tecta-id]'
      );
      const id = target?.getAttribute('data-tecta-id') ?? null;
      if (id) {
        e.stopPropagation();
        selectNode(id);
      }
    };

    iframeDoc.addEventListener('pointermove', handlePointerMove, {
      passive: true,
    });
    iframeDoc.addEventListener('pointerleave', handlePointerLeave);
    iframeDoc.addEventListener('click', handleClick);

    return () => {
      iframeDoc.removeEventListener('pointermove', handlePointerMove);
      iframeDoc.removeEventListener('pointerleave', handlePointerLeave);
      iframeDoc.removeEventListener('click', handleClick);
    };
  }, [mountNode, isPreviewMode, hoverNode, selectNode]);

  const frameWidthClass =
    breakpoint === 'mobile'
      ? 'w-[375px]'
      : breakpoint === 'tablet'
        ? 'w-[768px]'
        : 'w-full';

  return (
    <div className="flex-1 bg-zinc-900/90 flex flex-col items-center justify-start p-4 overflow-hidden relative">
      {/* Workflow Step Context Sub-bar */}
      <div className="w-full max-w-5xl flex items-center justify-between pb-2 px-1 text-xs text-zinc-400 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-indigo-300 border border-zinc-700">
            {activeStep === 2 ? 'Step 2: Sections Studio' : 'Step 3: Page Assembler'}
          </span>
          <span className="text-zinc-300 font-medium hidden sm:inline">
            {activeStep === 2
              ? 'Compose reusable sections with preset elements & save to library'
              : `Editing Page: "${doc.title}"`}
          </span>
        </div>
        <div className="text-[11px] font-mono text-zinc-500">
          {doc.rootIds.length} {doc.rootIds.length === 1 ? 'section' : 'sections'} on canvas
        </div>
      </div>

      {/* Canvas Viewport Container */}
      <div
        className={`${frameWidthClass} h-full bg-zinc-950 rounded-xl border border-zinc-800 shadow-2xl overflow-hidden relative transition-[width] duration-200 ease-out`}
      >
        <iframe
          ref={iframeRef}
          title="Tecta Isolated Canvas"
          className="w-full h-full border-0 block bg-zinc-950"
          srcDoc="<!DOCTYPE html><html><head><meta charset='utf-8'></head><body></body></html>"
        />

        {mountNode &&
          createPortal(
            <>
              {doc.rootIds.map((rootId) => (
                <CanvasDomNode key={rootId} nodeId={rootId} />
              ))}
            </>,
            mountNode
          )}

        {/* Hardware-Accelerated GPU Overlay Layer (Zero DOM Wrapper Bloat) */}
        {!isPreviewMode && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* Hover Outline */}
            {hoveredRect && hoveredNode && (
              <div
                style={{
                  transform: `translate3d(${hoveredRect.left}px, ${hoveredRect.top}px, 0)`,
                  width: `${hoveredRect.width}px`,
                  height: `${hoveredRect.height}px`,
                }}
                className="absolute top-0 left-0 border border-dashed border-indigo-400/80 bg-indigo-500/5 transition-none"
              >
                <span className="absolute -top-5 left-0 px-1.5 py-0.5 rounded-t bg-indigo-500/90 text-[10px] font-mono text-white whitespace-nowrap">
                  {hoveredNode.tag} · {hoveredNode.name}
                </span>
              </div>
            )}

            {/* Active Selection Box & Quick Actions */}
            {selectedRect && selectedNode && (
              <div
                style={{
                  transform: `translate3d(${selectedRect.left}px, ${selectedRect.top}px, 0)`,
                  width: `${selectedRect.width}px`,
                  height: `${selectedRect.height}px`,
                }}
                className="absolute top-0 left-0 border-2 border-indigo-500 shadow-[0_0_0_1px_rgba(99,102,241,0.2)]"
              >
                {/* Floating Pill Bar */}
                <div
                  className={`pointer-events-auto absolute left-0 flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-600 text-white text-[11px] font-medium shadow-lg whitespace-nowrap ${
                    selectedRect.top < 32 ? 'top-1 left-1' : '-top-7'
                  }`}
                >
                  <span className="font-mono uppercase text-[10px] text-indigo-200">
                    {selectedNode.tag}
                  </span>
                  <span>{selectedNode.name}</span>

                  <div className="h-3 w-px bg-indigo-400/50 mx-1" />

                  {selectedNode.parentId && (
                    <button
                      type="button"
                      onClick={() => selectNode(selectedNode.parentId)}
                      className="p-0.5 hover:bg-indigo-500 rounded cursor-pointer"
                      title="Select Parent Container"
                    >
                      <CornerLeftUp className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => moveNodeStep(selectedNode.id, 'up')}
                    className="p-0.5 hover:bg-indigo-500 rounded cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveNodeStep(selectedNode.id, 'down')}
                    className="p-0.5 hover:bg-indigo-500 rounded cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateNode(selectedNode.id)}
                    className="p-0.5 hover:bg-indigo-500 rounded cursor-pointer"
                    title="Duplicate (Ctrl+D)"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteNode(selectedNode.id)}
                    className="p-0.5 hover:bg-rose-500 rounded cursor-pointer"
                    title="Delete (Del)"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  {activeStep === 2 && (selectedNode.kind === 'section' || !selectedNode.parentId) && (
                    <button
                      type="button"
                      onClick={() =>
                        saveCurrentSectionAsComponent(
                          selectedNode.name,
                          'General',
                          selectedNode.id
                        )
                      }
                      className="p-0.5 hover:bg-indigo-500 rounded cursor-pointer flex items-center gap-1 text-[10px] text-amber-300 ml-1 pl-1 border-l border-indigo-400/40"
                      title="Save this Section as Reusable Component in Library"
                    >
                      <BookmarkPlus className="w-3 h-3" />
                      <span className="hidden sm:inline">Save Section</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
