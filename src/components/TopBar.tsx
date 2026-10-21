import {
  Code2,
  Eye,
  EyeOff,
  Globe,
  Layers,
  LayoutGrid,
  LayoutPanelTop,
  Monitor,
  Palette,
  Redo2,
  RotateCcw,
  Smartphone,
  Tablet,
  Undo2,
  Zap,
} from 'lucide-react';
import type { Breakpoint, StudioStep } from '../domain/schema';
import { cssomEngine } from '../services/cssomEngine';
import { useDocumentStore } from '../store/documentStore';

interface TopBarProps {
  onOpenExport: () => void;
}

export function TopBar({ onOpenExport }: TopBarProps) {
  const title = useDocumentStore((s) => s.doc.title);
  const nodeCount = useDocumentStore((s) => Object.keys(s.doc.nodes).length);
  const breakpoint = useDocumentStore((s) => s.breakpoint);
  const isPreviewMode = useDocumentStore((s) => s.isPreviewMode);
  const canUndo = useDocumentStore((s) => s.past.length > 0);
  const canRedo = useDocumentStore((s) => s.future.length > 0);
  const activeStep = useDocumentStore((s) => s.activeStep);
  const activeProjectId = useDocumentStore((s) => s.activeProjectId);
  const projects = useDocumentStore((s) => s.projects);
  const closeProject = useDocumentStore((s) => s.closeProject);

  const activeProject = activeProjectId ? projects[activeProjectId] : null;

  const setActiveStep = useDocumentStore((s) => s.setActiveStep);
  const setBreakpoint = useDocumentStore((s) => s.setBreakpoint);
  const setPreviewMode = useDocumentStore((s) => s.setPreviewMode);
  const undo = useDocumentStore((s) => s.undo);
  const redo = useDocumentStore((s) => s.redo);
  const resetToStarter = useDocumentStore((s) => s.resetToStarter);

  const studioSteps: {
    step: StudioStep;
    label: string;
    sub: string;
    icon: typeof Palette;
  }[] = [
    { step: 1, label: '1. Presets', sub: 'Design System', icon: Palette },
    { step: 2, label: '2. Sections', sub: 'Component Studio', icon: LayoutPanelTop },
    { step: 3, label: '3. Pages & Posts', sub: 'Page Assembler', icon: Globe },
  ];

  const breakpoints: { id: Breakpoint; label: string; width: string; icon: typeof Monitor }[] = [
    { id: 'desktop', label: 'Desktop', width: '100%', icon: Monitor },
    { id: 'tablet', label: 'Tablet', width: '768px', icon: Tablet },
    { id: 'mobile', label: 'Mobile', width: '375px', icon: Smartphone },
  ];

  return (
    <header className="h-14 bg-zinc-950 border-b border-zinc-800/90 px-3 flex items-center justify-between select-none shrink-0 z-20 gap-3">
      {/* Left: Brand & Project Info */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={closeProject}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
          title="Return to Projects List"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">All Sites</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-500/30">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold tracking-tight text-sm text-zinc-100 hidden sm:inline">
            TECTA
          </span>
        </div>

        <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span
            className="font-semibold text-zinc-100 truncate max-w-[130px] sm:max-w-[180px]"
            title={activeProject?.name ?? title}
          >
            {activeProject?.name ?? title}
          </span>
          {activeProject && (
            <span className="text-[10px] font-mono text-zinc-500 hidden lg:inline">
              ({activeProject.slug}.tecta.site)
            </span>
          )}
          <span className="text-[11px] text-zinc-500 font-mono hidden xl:inline">
            ({nodeCount} nodes)
          </span>
        </div>

        <div
          className="hidden 2xl:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-[11px] text-emerald-300 font-mono"
          title="Direct Constructable CSSStyleSheet Engine latency"
        >
          <Zap className="w-3 h-3 text-emerald-400" />
          <span>CSSOM {cssomEngine.getLastMutationMs()}ms · 120fps</span>
        </div>
      </div>

      {/* Center: 3-Step Progressive Workflow Switcher */}
      <nav aria-label="Workflow Steps" className="flex items-center bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 shadow-inner">
        {studioSteps.map((st) => {
          const Icon = st.icon;
          const isActive = activeStep === st.step;
          return (
            <button
              key={st.step}
              type="button"
              onClick={() => setActiveStep(st.step)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
              title={`Switch to Step ${st.step}: ${st.label}`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  isActive ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                <Icon className="w-3 h-3" />
              </div>
              <div className="flex flex-col items-start text-left leading-none">
                <span className="text-xs">{st.label}</span>
                <span
                  className={`text-[9px] hidden md:inline mt-0.5 ${
                    isActive ? 'text-indigo-200' : 'text-zinc-500'
                  }`}
                >
                  {st.sub}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Right: Breakpoints, History, Preview & Export */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Breakpoint Switcher */}
        <div className="hidden xl:flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
          {breakpoints.map((bp) => {
            const Icon = bp.icon;
            const active = breakpoint === bp.id;
            return (
              <button
                key={bp.id}
                type="button"
                onClick={() => setBreakpoint(bp.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-zinc-800 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title={`${bp.label} (${bp.width})`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{bp.label}</span>
              </button>
            );
          })}
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center bg-zinc-900 rounded-lg border border-zinc-800 p-0.5">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="p-1.5 rounded text-zinc-400 hover:text-zinc-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className="p-1.5 rounded text-zinc-400 hover:text-zinc-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Reset */}
        <button
          type="button"
          onClick={resetToStarter}
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors cursor-pointer"
          title="Reset to starter layout"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Reset</span>
        </button>

        {/* Preview Toggle */}
        <button
          type="button"
          onClick={() => setPreviewMode(!isPreviewMode)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
            isPreviewMode
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
              : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
          }`}
          title="Toggle Canvas Preview"
        >
          {isPreviewMode ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit Preview</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Preview</span>
            </>
          )}
        </button>

        {/* Export Code Modal */}
        <button
          type="button"
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs shadow-indigo-500/20 transition-colors cursor-pointer"
          title="Export Semantic HTML & Responsive CSS"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
}
