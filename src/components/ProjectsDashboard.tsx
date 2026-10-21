import { useState } from 'react';
import {
  ArrowRight,
  Boxes,
  Clock,
  Copy,
  Edit3,
  FileText,
  FolderPlus,
  Globe,
  Layers,
  LayoutPanelTop,
  MoreVertical,
  Palette,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import type { Project, StudioStep } from '../domain/schema';
import { useDocumentStore } from '../store/documentStore';

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface StepConfig {
  title: string;
  badge: string;
  desc: string;
  icon: typeof Palette;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

const STEP_CONFIGS: Record<StudioStep, StepConfig> = {
  1: {
    title: 'Step 1: Element Presets',
    badge: 'Step 1',
    desc: 'Designing typography, buttons, and form tokens',
    icon: Palette,
    colorClass: 'text-indigo-400',
    bgClass: 'bg-indigo-500/15',
    borderClass: 'border-indigo-500/30',
  },
  2: {
    title: 'Step 2: Sections Studio',
    badge: 'Step 2',
    desc: 'Composing reusable section blocks & library',
    icon: LayoutPanelTop,
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-500/15',
    borderClass: 'border-amber-500/30',
  },
  3: {
    title: 'Step 3: Pages & Posts',
    badge: 'Step 3',
    desc: 'Assembling multi-page site & ready to export',
    icon: Globe,
    colorClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/15',
    borderClass: 'border-emerald-500/30',
  },
};

export function ProjectsDashboard() {
  const projects = useDocumentStore((s) => s.projects);
  const openProject = useDocumentStore((s) => s.openProject);
  const createProject = useDocumentStore((s) => s.createProject);
  const duplicateProject = useDocumentStore((s) => s.duplicateProject);
  const deleteProject = useDocumentStore((s) => s.deleteProject);
  const updateProjectMetadata = useDocumentStore((s) => s.updateProjectMetadata);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStep, setFilterStep] = useState<StudioStep | 'all'>('all');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectTemplate, setNewProjectTemplate] = useState<'saas' | 'portfolio' | 'blank'>('saas');
  const [newProjectStep, setNewProjectStep] = useState<StudioStep>(1);

  // Rename Dialog State
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Dropdown menu state
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const projectList = Object.values(projects).sort((a, b) => b.updatedAt - a.updatedAt);

  const filteredProjects = projectList.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStep = filterStep === 'all' || p.activeStep === filterStep;
    return matchesSearch && matchesStep;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    createProject(newProjectName.trim(), newProjectDesc.trim(), newProjectTemplate, newProjectStep);
    setIsCreateModalOpen(false);
    setNewProjectName('');
    setNewProjectDesc('');
  };

  const handleStartRename = (project: Project) => {
    setRenamingProjectId(project.id);
    setRenameValue(project.name);
    setMenuOpenId(null);
  };

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (renamingProjectId && renameValue.trim()) {
      updateProjectMetadata(renamingProjectId, { name: renameValue.trim() });
      setRenamingProjectId(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col select-none">
      {/* Top Header */}
      <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur px-6 md:px-12 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-base text-zinc-100">TECTA</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Websites
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Progressive 3-Step Visual Website Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Website Project</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12 space-y-8">
        {/* Hero Section Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/60 via-zinc-900/60 to-zinc-950 border border-indigo-900/40 p-6 md:p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Multi-Website Architecture</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Your Website Projects
              </h1>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Every project is an independent website structured into 3 progressive design
                stages. Select a website to enter the studio, or jump directly into any stage.
              </p>
            </div>

            {/* Quick 3-Step Architecture Legend */}
            <div className="grid grid-cols-3 gap-2 bg-zinc-900/80 p-2 rounded-xl border border-zinc-800 shrink-0">
              <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800 text-center space-y-1">
                <div className="w-6 h-6 mx-auto rounded-md bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                  <Palette className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] font-bold text-zinc-200">1. Presets</div>
                <div className="text-[9px] text-zinc-500">Element Tokens</div>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800 text-center space-y-1">
                <div className="w-6 h-6 mx-auto rounded-md bg-amber-500/20 text-amber-300 flex items-center justify-center">
                  <LayoutPanelTop className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] font-bold text-zinc-200">2. Sections</div>
                <div className="text-[9px] text-zinc-500">Reusable Blocks</div>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800 text-center space-y-1">
                <div className="w-6 h-6 mx-auto rounded-md bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] font-bold text-zinc-200">3. Pages</div>
                <div className="text-[9px] text-zinc-500">Site Assembly</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Step Filter Tabs */}
          <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 overflow-x-auto">
            <button
              type="button"
              onClick={() => setFilterStep('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filterStep === 'all'
                  ? 'bg-zinc-800 text-white shadow-xs font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All Websites ({projectList.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStep(1)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filterStep === 1
                  ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-xs font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-indigo-400" />
              <span>Step 1: Presets</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterStep(2)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filterStep === 2
                  ? 'bg-amber-600/30 text-amber-200 border border-amber-500/40 shadow-xs font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LayoutPanelTop className="w-3.5 h-3.5 text-amber-400" />
              <span>Step 2: Sections</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterStep(3)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filterStep === 3
                  ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/40 shadow-xs font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Step 3: Pages</span>
            </button>
          </div>

          {/* Search Field */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search website projects..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const stepConfig = STEP_CONFIGS[project.activeStep] ?? STEP_CONFIGS[1];
            const StepIcon = stepConfig.icon;
            const pageCount = Object.keys(project.pages).length;
            const componentCount = project.customComponents.length;
            const isMenuOpen = menuOpenId === project.id;

            return (
              <div
                key={project.id}
                className="group relative rounded-2xl bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700/80 p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl space-y-4"
              >
                {/* Card Top: Slug badge & Options Menu */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700/60 text-[10px] font-mono text-zinc-300">
                    <Globe className="w-3 h-3 text-indigo-400" />
                    <span>{project.slug}.tecta.site</span>
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(isMenuOpen ? null : project.id);
                      }}
                      className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="Project options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-0 top-7 w-40 rounded-xl bg-zinc-900 border border-zinc-800 p-1 shadow-2xl z-30 space-y-0.5 text-xs">
                        <button
                          type="button"
                          onClick={() => handleStartRename(project)}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 text-left transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Rename</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            duplicateProject(project.id);
                            setMenuOpenId(null);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 text-left transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Duplicate</span>
                        </button>
                        <div className="h-px bg-zinc-800 my-1" />
                        <button
                          type="button"
                          onClick={() => {
                            deleteProject(project.id);
                            setMenuOpenId(null);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-950/60 text-left transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Website</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Project Title & Description */}
                <div className="space-y-1">
                  <h3
                    onClick={() => openProject(project.id)}
                    className="text-base font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors cursor-pointer truncate"
                  >
                    {project.name}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                {/* Visual Identity: Color Swatches & Font Pairing */}
                {project.tokens && (
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                    <div className="flex items-center gap-1.5" title="Palette Swatches">
                      <span
                        className="w-3 h-3 rounded-full border border-black/50 shadow-xs"
                        style={{ backgroundColor: project.tokens.primaryColor }}
                        title={`Primary: ${project.tokens.primaryColor}`}
                      />
                      <span
                        className="w-3 h-3 rounded-full border border-black/50 shadow-xs"
                        style={{ backgroundColor: project.tokens.secondaryColor }}
                        title={`Secondary: ${project.tokens.secondaryColor}`}
                      />
                      <span
                        className="w-3 h-3 rounded-full border border-black/50 shadow-xs"
                        style={{ backgroundColor: project.tokens.accentColor }}
                        title={`Accent: ${project.tokens.accentColor}`}
                      />
                      <span
                        className="w-3 h-3 rounded-full border border-black/50 shadow-xs"
                        style={{ backgroundColor: project.tokens.surfaceColor }}
                        title={`Surface: ${project.tokens.surfaceColor}`}
                      />
                      <span
                        className="w-3 h-3 rounded-full border border-black/50 shadow-xs"
                        style={{ backgroundColor: project.tokens.backgroundColor }}
                        title={`Background: ${project.tokens.backgroundColor}`}
                      />
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
                      <span className="text-indigo-400 font-semibold">Aa</span>
                      <span className="text-zinc-300 truncate max-w-[130px]">
                        {project.tokens.fontHeading} + {project.tokens.fontBody}
                      </span>
                    </div>
                  </div>
                )}

                {/* Current Stage Highlight Box */}
                <div
                  className={`p-3 rounded-xl border ${stepConfig.bgClass} ${stepConfig.borderClass} space-y-2`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center ${stepConfig.bgClass} ${stepConfig.colorClass}`}
                      >
                        <StepIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-xs font-bold ${stepConfig.colorClass}`}>
                        {stepConfig.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Step {project.activeStep} of 3
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-300 leading-snug">{stepConfig.desc}</p>

                  {/* 3-Segment Progress Bar */}
                  <div className="grid grid-cols-3 gap-1 pt-1">
                    <div
                      className={`h-1.5 rounded-full ${
                        project.activeStep >= 1 ? 'bg-indigo-500' : 'bg-zinc-800'
                      }`}
                    />
                    <div
                      className={`h-1.5 rounded-full ${
                        project.activeStep >= 2 ? 'bg-amber-500' : 'bg-zinc-800'
                      }`}
                    />
                    <div
                      className={`h-1.5 rounded-full ${
                        project.activeStep >= 3 ? 'bg-emerald-500' : 'bg-zinc-800'
                      }`}
                    />
                  </div>
                </div>

                {/* Project Stats Footer */}
                <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>{pageCount} {pageCount === 1 ? 'page' : 'pages'}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Boxes className="w-3 h-3" />
                      <span>{componentCount} {componentCount === 1 ? 'section' : 'sections'}</span>
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatRelativeTime(project.updatedAt)}</span>
                  </span>
                </div>

                {/* Action CTA & Direct Step Switcher */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => openProject(project.id)}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    <span>Open Studio ({stepConfig.badge})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Quick Stage Jump Links */}
                  <div className="flex items-center justify-between gap-1 text-[10px] text-zinc-400">
                    <span className="text-zinc-500 text-[9px] uppercase font-mono">Jump to:</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openProject(project.id, 1)}
                        className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                          project.activeStep === 1
                            ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40'
                            : 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                        title="Open directly in Step 1: Element Presets"
                      >
                        1. Presets
                      </button>
                      <button
                        type="button"
                        onClick={() => openProject(project.id, 2)}
                        className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                          project.activeStep === 2
                            ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                            : 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                        title="Open directly in Step 2: Sections Studio"
                      >
                        2. Sections
                      </button>
                      <button
                        type="button"
                        onClick={() => openProject(project.id, 3)}
                        className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                          project.activeStep === 3
                            ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                            : 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                        title="Open directly in Step 3: Page Assembler"
                      >
                        3. Pages
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* New Website Quick Card */}
          <div
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-2xl border-2 border-dashed border-zinc-800 hover:border-indigo-500/60 p-8 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer group transition-all duration-200 min-h-[300px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 group-hover:bg-indigo-600/20 text-zinc-400 group-hover:text-indigo-400 flex items-center justify-center transition-colors shadow-sm">
              <FolderPlus className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-zinc-200 group-hover:text-white">
                Create New Website
              </h4>
              <p className="text-xs text-zinc-500 max-w-[220px]">
                Start a fresh website project with custom design presets and section library.
              </p>
            </div>
            <div className="pt-2 text-xs font-semibold text-indigo-400 flex items-center gap-1 group-hover:underline">
              <span>+ Start Building</span>
            </div>
          </div>
        </div>
      </main>

      {/* CREATE NEW PROJECT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">Create New Website Project</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Website Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Acme Cloud or Personal Portfolio"
                  required
                  autoFocus
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Description (Optional)</label>
                <input
                  type="text"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="e.g. Modern high-conversion marketing website"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Starter Kit Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300">Starter Kit</label>
                <div className="grid grid-cols-3 gap-2">
                  <div
                    onClick={() => setNewProjectTemplate('saas')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      newProjectTemplate === 'saas'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="text-xs font-bold text-zinc-200">Modern SaaS</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">Hero, Bento Grid & CTA</div>
                  </div>

                  <div
                    onClick={() => setNewProjectTemplate('portfolio')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      newProjectTemplate === 'portfolio'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="text-xs font-bold text-zinc-200">Creative Agency</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">Showcase & Hero</div>
                  </div>

                  <div
                    onClick={() => setNewProjectTemplate('blank')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      newProjectTemplate === 'blank'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="text-xs font-bold text-zinc-200">Blank Slate</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">Start with Presets</div>
                  </div>
                </div>
              </div>

              {/* Initial Stage Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300">Start At Workflow Stage</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewProjectStep(1)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      newProjectStep === 1
                        ? 'bg-indigo-600 text-white border-indigo-500 font-semibold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="text-xs">1. Presets</div>
                    <div className="text-[9px] opacity-80">Design Tokens</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewProjectStep(2)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      newProjectStep === 2
                        ? 'bg-amber-600 text-white border-amber-500 font-semibold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="text-xs">2. Sections</div>
                    <div className="text-[9px] opacity-80">Block Studio</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewProjectStep(3)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      newProjectStep === 3
                        ? 'bg-emerald-600 text-white border-emerald-500 font-semibold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="text-xs">3. Pages</div>
                    <div className="text-[9px] opacity-80">Full Assembly</div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Create & Enter Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENAME PROJECT MODAL */}
      {renamingProjectId && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-800 p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">Rename Website</h3>
            <form onSubmit={handleSaveRename} className="space-y-3">
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                required
                autoFocus
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenamingProjectId(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
