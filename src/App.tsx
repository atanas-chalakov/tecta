import { useEffect, useState } from 'react';
import { AiCopilotBar } from './components/AiCopilotBar';
import { CanvasFrame } from './components/CanvasFrame';
import { CmsManagerModal } from './components/CmsManagerModal';
import { ExportModal } from './components/ExportModal';
import { LeftSidebar } from './components/LeftSidebar';
import { PresetInspector } from './components/PresetInspector';
import { ProjectsDashboard } from './components/ProjectsDashboard';
import { RightInspector } from './components/RightInspector';
import { StyleguideCanvas } from './components/StyleguideCanvas';
import { TopBar } from './components/TopBar';
import { useDocumentStore } from './store/documentStore';

export function App() {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCmsOpen, setIsCmsOpen] = useState(false);
  const activeProjectId = useDocumentStore((s) => s.activeProjectId);
  const isPreviewMode = useDocumentStore((s) => s.isPreviewMode);
  const activeStep = useDocumentStore((s) => s.activeStep);

  // Studio keyboard shortcuts (active only when inside a project studio)
  useEffect(() => {
    if (!activeProjectId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      const isMod = e.metaKey || e.ctrlKey;
      const state = useDocumentStore.getState();

      if (isMod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          state.redo();
        } else {
          state.undo();
        }
        return;
      }

      if (isMod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        state.redo();
        return;
      }

      if (isMod && e.key.toLowerCase() === 'd' && state.selectedNodeId) {
        e.preventDefault();
        state.duplicateNode(state.selectedNodeId);
        return;
      }

      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        state.selectedNodeId &&
        !state.isPreviewMode
      ) {
        e.preventDefault();
        state.deleteNode(state.selectedNodeId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProjectId]);

  // When no project is active, display the Projects Dashboard
  if (!activeProjectId) {
    return <ProjectsDashboard />;
  }

  // When a project is active, display the 3-step Studio editor
  return (
    <div className="h-screen w-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden">
      <TopBar
        onOpenExport={() => setIsExportOpen(true)}
        onOpenCms={() => setIsCmsOpen(true)}
      />

      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {!isPreviewMode && <LeftSidebar />}
        {activeStep === 1 ? <StyleguideCanvas /> : <CanvasFrame />}
        {!isPreviewMode && (activeStep === 1 ? <PresetInspector /> : <RightInspector />)}
        {!isPreviewMode && <AiCopilotBar />}
      </div>

      {isCmsOpen && <CmsManagerModal onClose={() => setIsCmsOpen(false)} />}
      {isExportOpen && <ExportModal onClose={() => setIsExportOpen(false)} />}
    </div>
  );
}
