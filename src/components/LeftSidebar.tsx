import { useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BookmarkCheck,
  BookmarkPlus,
  Box,
  ChevronDown,
  ChevronRight,
  Columns3,
  Eye,
  EyeOff,
  FileCode2,
  FileText,
  FormInput,
  Globe,
  Grid,
  Heading,
  Image,
  LayoutPanelTop,
  Layers,
  ListOrdered,
  MessageSquare,
  MousePointerClick,
  Palette,
  Plus,
  Rows3,
  Sparkles,
  Square,
  Tag,
  Trash2,
  Type,
} from 'lucide-react';
import {
  PRESET_CATEGORIES,
  type PresetKey,
} from '../domain/presets';
import {
  SECTION_TEMPLATES,
  type ElementKind,
  type NodeId,
  type SavedComponent,
  type TectaNode,
} from '../domain/schema';
import { useDocumentStore } from '../store/documentStore';

const ELEMENT_GROUPS: {
  group: string;
  items: {
    kind: ElementKind;
    label: string;
    hint: string;
    icon: typeof Box;
  }[];
}[] = [
  {
    group: 'Structure & Box Model',
    items: [
      {
        kind: 'section',
        label: 'Section',
        hint: 'Full-width page band',
        icon: LayoutPanelTop,
      },
      {
        kind: 'container',
        label: 'Container',
        hint: 'Centered 1120px wrapper',
        icon: Box,
      },
      {
        kind: 'flex-row',
        label: 'Flex Row',
        hint: 'Horizontal flex box',
        icon: Columns3,
      },
      {
        kind: 'flex-col',
        label: 'Flex Stack',
        hint: 'Vertical flex stack',
        icon: Rows3,
      },
      {
        kind: 'grid',
        label: 'Bento Grid',
        hint: 'Responsive CSS Grid',
        icon: Grid,
      },
      {
        kind: 'card',
        label: 'Surface Card',
        hint: 'Bordered container box',
        icon: Square,
      },
    ],
  },
  {
    group: 'Typography & Media',
    items: [
      {
        kind: 'heading',
        label: 'Heading',
        hint: 'H1 / H2 / H3 display text',
        icon: Heading,
      },
      {
        kind: 'text',
        label: 'Paragraph',
        hint: 'Body copy block',
        icon: Type,
      },
      {
        kind: 'badge',
        label: 'Pill Badge',
        hint: 'Accent eyebrow tag',
        icon: Tag,
      },
      {
        kind: 'button',
        label: 'CTA Button',
        hint: 'Interactive action link',
        icon: MousePointerClick,
      },
      {
        kind: 'image',
        label: 'Visual Image',
        hint: 'Responsive cover media',
        icon: Image,
      },
    ],
  },
  {
    group: 'Form Elements',
    items: [
      {
        kind: 'input',
        label: 'Text Input',
        hint: 'Single-line field',
        icon: FormInput,
      },
      {
        kind: 'textarea',
        label: 'Text Area',
        hint: 'Multi-line message',
        icon: MessageSquare,
      },
      {
        kind: 'select',
        label: 'Select Dropdown',
        hint: 'Options dropdown',
        icon: ListOrdered,
      },
    ],
  },
];

function findEnclosingSection(
  selectedNodeId: NodeId | null,
  nodes: Record<NodeId, TectaNode>
): TectaNode | null {
  if (!selectedNodeId) return null;
  let curr: TectaNode | undefined = nodes[selectedNodeId];
  while (curr) {
    if (curr.kind === 'section' || !curr.parentId) {
      return curr;
    }
    curr = curr.parentId ? nodes[curr.parentId] : undefined;
  }
  return null;
}

function LayerRow({
  nodeId,
  depth,
}: {
  nodeId: NodeId;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const node = useDocumentStore((s) => s.doc.nodes[nodeId]);
  const selectedNodeId = useDocumentStore((s) => s.selectedNodeId);
  const hoveredNodeId = useDocumentStore((s) => s.hoveredNodeId);
  const selectNode = useDocumentStore((s) => s.selectNode);
  const hoverNode = useDocumentStore((s) => s.hoverNode);
  const toggleVisibility = useDocumentStore((s) => s.toggleNodeVisibility);
  const moveNodeStep = useDocumentStore((s) => s.moveNodeStep);
  const deleteNode = useDocumentStore((s) => s.deleteNode);

  if (!node) return null;

  const hasChildren = node.childrenIds.length > 0;
  const isSelected = selectedNodeId === nodeId;
  const isHovered = hoveredNodeId === nodeId;

  return (
    <div>
      <div
        onClick={() => selectNode(nodeId)}
        onMouseEnter={() => hoverNode(nodeId)}
        onMouseLeave={() => hoverNode(null)}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        className={`group flex items-center justify-between pr-2 py-1.5 text-xs rounded-md cursor-pointer transition-colors ${
          isSelected
            ? 'bg-indigo-600/25 text-indigo-200 border border-indigo-500/40'
            : isHovered
              ? 'bg-zinc-800/80 text-zinc-200 border border-transparent'
              : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 border border-transparent'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="p-0.5 rounded hover:bg-zinc-700/60 text-zinc-400"
            >
              {expanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          ) : (
            <span className="w-4" />
          )}

          <span className="text-[10px] font-mono uppercase px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 shrink-0">
            {node.tag}
          </span>
          <span
            className={`truncate font-medium ${
              node.hidden ? 'line-through opacity-50' : ''
            }`}
          >
            {node.name}
          </span>
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              moveNodeStep(nodeId, 'up');
            }}
            className="p-1 rounded hover:bg-zinc-700/60 text-zinc-400 hover:text-zinc-100"
            title="Move Up"
          >
            <ArrowUp className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              moveNodeStep(nodeId, 'down');
            }}
            className="p-1 rounded hover:bg-zinc-700/60 text-zinc-400 hover:text-zinc-100"
            title="Move Down"
          >
            <ArrowDown className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleVisibility(nodeId);
            }}
            className="p-1 rounded hover:bg-zinc-700/60 text-zinc-400 hover:text-zinc-100"
            title={node.hidden ? 'Show Element' : 'Hide Element'}
          >
            {node.hidden ? (
              <EyeOff className="w-3 h-3 text-amber-400" />
            ) : (
              <Eye className="w-3 h-3" />
            )}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              deleteNode(nodeId);
            }}
            className="p-1 rounded hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400"
            title="Delete Element"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="space-y-0.5 mt-0.5">
          {node.childrenIds.map((childId) => (
            <LayerRow key={childId} nodeId={childId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function LeftSidebar() {
  const activeStep = useDocumentStore((s) => s.activeStep);
  const setActiveStep = useDocumentStore((s) => s.setActiveStep);

  // Step 1 State
  const selectedPresetKey = useDocumentStore((s) => s.selectedPresetKey);
  const selectPreset = useDocumentStore((s) => s.selectPreset);
  const tokens = useDocumentStore((s) => s.tokens);

  // Step 2 & 3 State
  const rootIds = useDocumentStore((s) => s.doc.rootIds);
  const docNodes = useDocumentStore((s) => s.doc.nodes);
  const selectedNodeId = useDocumentStore((s) => s.selectedNodeId);
  const customComponents = useDocumentStore((s) => s.customComponents);
  const pages = useDocumentStore((s) => s.pages);
  const activePageId = useDocumentStore((s) => s.activePageId);

  const addPrimitiveElement = useDocumentStore((s) => s.addPrimitiveElement);
  const insertSectionTemplate = useDocumentStore((s) => s.insertSectionTemplate);
  const saveCurrentSectionAsComponent = useDocumentStore((s) => s.saveCurrentSectionAsComponent);
  const deleteCustomComponent = useDocumentStore((s) => s.deleteCustomComponent);
  const insertCustomComponent = useDocumentStore((s) => s.insertCustomComponent);
  const createPage = useDocumentStore((s) => s.createPage);
  const switchPage = useDocumentStore((s) => s.switchPage);
  const deletePage = useDocumentStore((s) => s.deletePage);

  // Internal tab navigation
  const [step2Tab, setStep2Tab] = useState<'library' | 'templates' | 'elements' | 'layers'>('library');
  const [step3Tab, setStep3Tab] = useState<'pages' | 'sections' | 'layers'>('pages');

  // Form states
  const [componentName, setComponentName] = useState('');
  const [componentCategory, setComponentCategory] = useState<SavedComponent['category']>('General');
  const [justSavedMessage, setJustSavedMessage] = useState<string | null>(null);
  const [newPageTitle, setNewPageTitle] = useState('');

  const targetSectionNode = findEnclosingSection(selectedNodeId, docNodes);

  const handleSaveSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSectionNode) return;
    const finalName = componentName.trim() || targetSectionNode.name || 'Custom Section';
    const saved = saveCurrentSectionAsComponent(finalName, componentCategory, targetSectionNode.id);
    if (saved) {
      setJustSavedMessage(`Saved "${saved.name}" to library!`);
      setComponentName('');
      setTimeout(() => setJustSavedMessage(null), 3000);
    }
  };

  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim()) return;
    createPage(newPageTitle.trim());
    setNewPageTitle('');
  };

  // -------------------------------------------------------------
  // STEP 1 SIDEBAR: Element Presets Directory
  // -------------------------------------------------------------
  if (activeStep === 1) {
    return (
      <aside className="w-72 bg-zinc-950 border-r border-zinc-800/90 flex flex-col shrink-0 select-none">
        <div className="p-3 border-b border-zinc-800 bg-zinc-900/40 space-y-1">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-bold text-zinc-100">Step 1: Preset Elements</h2>
          </div>
          <p className="text-[11px] text-zinc-400 leading-snug">
            Click any element below to inspect and customize its design tokens.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {PRESET_CATEGORIES.map((cat) => (
            <div key={cat.id} className="space-y-1.5">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 px-1">
                {cat.name}
              </h3>
              <div className="space-y-1">
                {cat.items.map((item) => {
                  const isSelected = selectedPresetKey === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => selectPreset(item.key as PresetKey)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600/25 border border-indigo-500/50 text-white shadow-xs'
                          : 'bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/80 text-zinc-300 hover:text-white'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-medium truncate">{item.label}</div>
                        <div className="text-[10px] text-zinc-500 truncate">{item.description}</div>
                      </div>
                      {item.key === 'tokens-colors' ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/40"
                            style={{ backgroundColor: tokens.primaryColor }}
                            title={`Primary: ${tokens.primaryColor}`}
                          />
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/40"
                            style={{ backgroundColor: tokens.secondaryColor }}
                            title={`Secondary: ${tokens.secondaryColor}`}
                          />
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/40"
                            style={{ backgroundColor: tokens.surfaceColor }}
                            title={`Surface: ${tokens.surfaceColor}`}
                          />
                        </div>
                      ) : item.key === 'tokens-fonts' ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/30 shrink-0">
                          Aa
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 shrink-0">
                          {item.key}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Step 1 Completion Callout */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-900/60 space-y-2">
          <div className="text-[11px] text-zinc-300 leading-tight">
            Finished setting your presets?
          </div>
          <button
            type="button"
            onClick={() => setActiveStep(2)}
            className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <span>Continue to Step 2: Sections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    );
  }

  // -------------------------------------------------------------
  // STEP 2 SIDEBAR: Sections & Components Studio
  // -------------------------------------------------------------
  if (activeStep === 2) {
    return (
      <aside className="w-72 bg-zinc-950 border-r border-zinc-800/90 flex flex-col shrink-0 select-none">
        {/* Step 2 Subheader Tabs */}
        <div className="grid grid-cols-4 gap-1 p-2 border-b border-zinc-800 bg-zinc-900/40">
          <button
            type="button"
            onClick={() => setStep2Tab('library')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              step2Tab === 'library'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Saved Components Library"
          >
            <BookmarkPlus className="w-3.5 h-3.5 mb-0.5 text-indigo-400" />
            <span>Library</span>
          </button>

          <button
            type="button"
            onClick={() => setStep2Tab('templates')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              step2Tab === 'templates'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Section Templates"
          >
            <Sparkles className="w-3.5 h-3.5 mb-0.5 text-amber-400" />
            <span>Templates</span>
          </button>

          <button
            type="button"
            onClick={() => setStep2Tab('elements')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              step2Tab === 'elements'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Add Primitives"
          >
            <Plus className="w-3.5 h-3.5 mb-0.5" />
            <span>Add</span>
          </button>

          <button
            type="button"
            onClick={() => setStep2Tab('layers')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              step2Tab === 'layers'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Canvas DOM Tree"
          >
            <Layers className="w-3.5 h-3.5 mb-0.5" />
            <span>Layers</span>
          </button>
        </div>

        {/* Step 2 Tab Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* TAB 1: LIBRARY & SAVED REUSABLE SECTIONS */}
          {step2Tab === 'library' && (
            <div className="space-y-4">
              {/* Save Section Box */}
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-100">
                  <BookmarkPlus className="w-4 h-4 text-indigo-400" />
                  <span>Save Section to Library</span>
                </div>

                {targetSectionNode ? (
                  <form onSubmit={handleSaveSection} className="space-y-2.5">
                    <div className="text-[11px] text-zinc-400">
                      Target:{' '}
                      <span className="font-mono text-indigo-300 font-semibold">
                        {targetSectionNode.name}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                        Component Name
                      </label>
                      <input
                        type="text"
                        value={componentName}
                        onChange={(e) => setComponentName(e.target.value)}
                        placeholder={targetSectionNode.name || 'e.g. Hero Section'}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                        Category
                      </label>
                      <select
                        value={componentCategory}
                        onChange={(e) =>
                          setComponentCategory(e.target.value as SavedComponent['category'])
                        }
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Hero">Hero</option>
                        <option value="Features">Features</option>
                        <option value="Pricing">Pricing</option>
                        <option value="Forms">Forms</option>
                        <option value="CTA">CTA</option>
                        <option value="Footer">Footer</option>
                        <option value="General">General</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/30 cursor-pointer"
                    >
                      <BookmarkCheck className="w-3.5 h-3.5" />
                      <span>Save as Reusable Component</span>
                    </button>

                    {justSavedMessage && (
                      <div className="p-2 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[11px] font-medium text-center">
                        {justSavedMessage}
                      </div>
                    )}
                  </form>
                ) : (
                  <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-[11px] text-zinc-400 leading-relaxed">
                    Select any Section or container on canvas to save it as a reusable component
                    for Step 3.
                  </div>
                )}
              </div>

              {/* Saved Components List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Saved Sections ({customComponents.length})
                  </h3>
                </div>

                {customComponents.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-zinc-800 text-center space-y-1">
                    <p className="text-xs text-zinc-400 font-medium">No saved sections yet</p>
                    <p className="text-[11px] text-zinc-500 leading-normal">
                      Compose a section on the canvas using your presets, then save it above.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customComponents.map((comp) => (
                      <div
                        key={comp.id}
                        className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2 hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-100">{comp.name}</span>
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {comp.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => insertCustomComponent(comp.id)}
                            className="flex-1 py-1 px-2 rounded-md bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-[11px] font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Insert</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCustomComponent(comp.id)}
                            className="p-1 rounded-md hover:bg-rose-950/60 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete Component"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TEMPLATES */}
          {step2Tab === 'templates' && (
            <div className="space-y-3">
              <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-indigo-200/80 leading-relaxed">
                Pre-built responsive section patterns. Insert one and tune it to save to your
                library.
              </div>

              {SECTION_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-indigo-500/50 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-100">{tpl.name}</span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-indigo-300">
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">{tpl.description}</p>
                  <button
                    type="button"
                    onClick={() => insertSectionTemplate(tpl.id)}
                    className="w-full py-1.5 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Insert Section</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: PRIMITIVE ELEMENTS */}
          {step2Tab === 'elements' && (
            <div className="space-y-4">
              {ELEMENT_GROUPS.map((group) => (
                <div key={group.group} className="space-y-2">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 px-1">
                    {group.group}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.kind}
                          type="button"
                          onClick={() => addPrimitiveElement(item.kind)}
                          className="flex flex-col items-start gap-1.5 p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800/90 hover:border-indigo-500/40 text-left transition-all group cursor-pointer"
                        >
                          <div className="w-6 h-6 rounded-md bg-zinc-800 group-hover:bg-indigo-500/20 flex items-center justify-center text-zinc-300 group-hover:text-indigo-300 transition-colors">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-xs font-medium text-zinc-200">{item.label}</div>
                            <div className="text-[10px] text-zinc-500 line-clamp-1">{item.hint}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: LAYERS */}
          {step2Tab === 'layers' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1 pb-2 border-b border-zinc-800/80">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  DOM Hierarchy
                </span>
                <FileCode2 className="w-3.5 h-3.5 text-zinc-500" />
              </div>
              <div className="pt-1 space-y-0.5">
                {rootIds.map((rootId) => (
                  <LayerRow key={rootId} nodeId={rootId} depth={0} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Step 2 Completion Callout */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-900/60 space-y-2">
          <button
            type="button"
            onClick={() => setActiveStep(3)}
            className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <span>Continue to Step 3: Pages</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    );
  }

  // -------------------------------------------------------------
  // STEP 3 SIDEBAR: Page & Post Creation & Assembler
  // -------------------------------------------------------------
  return (
    <aside className="w-72 bg-zinc-950 border-r border-zinc-800/90 flex flex-col shrink-0 select-none">
      {/* Step 3 Subheader Tabs */}
      <div className="grid grid-cols-3 gap-1 p-2 border-b border-zinc-800 bg-zinc-900/40">
        <button
          type="button"
          onClick={() => setStep3Tab('pages')}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            step3Tab === 'pages'
              ? 'bg-zinc-800 text-white shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <span>Pages</span>
        </button>

        <button
          type="button"
          onClick={() => setStep3Tab('sections')}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            step3Tab === 'sections'
              ? 'bg-zinc-800 text-white shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <LayoutPanelTop className="w-3.5 h-3.5 text-amber-400" />
          <span>Sections</span>
        </button>

        <button
          type="button"
          onClick={() => setStep3Tab('layers')}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            step3Tab === 'layers'
              ? 'bg-zinc-800 text-white shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Layers</span>
        </button>
      </div>

      {/* Step 3 Tab Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* TAB 1: PAGES & POSTS MANAGER */}
        {step3Tab === 'pages' && (
          <div className="space-y-4">
            {/* Create New Page / Post */}
            <form onSubmit={handleCreatePage} className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-100">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Create New Page or Post</span>
              </div>
              <input
                type="text"
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                placeholder="e.g. About Us or Blog Post"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/30 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Page / Post</span>
              </button>
            </form>

            {/* List of Pages */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 px-1">
                Your Pages ({Object.keys(pages).length})
              </div>

              {Object.values(pages).map((page) => {
                const isActive = page.id === activePageId;
                const nodeCount = Object.keys(page.nodes).length;
                return (
                  <div
                    key={page.id}
                    onClick={() => switchPage(page.id)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isActive
                        ? 'bg-indigo-600/25 border-indigo-500/50 text-white shadow-xs'
                        : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800/80 text-zinc-300 hover:text-white'
                    }`}
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <Globe className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate">{page.title}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          {nodeCount} nodes · {page.rootIds.length} sections
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isActive && (
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 font-bold">
                          Active
                        </span>
                      )}
                      {Object.keys(pages).length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePage(page.id);
                          }}
                          className="p-1 rounded hover:bg-rose-950/60 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete Page"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: SECTIONS INSERTER FOR ACTIVE PAGE */}
        {step3Tab === 'sections' && (
          <div className="space-y-4">
            <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-300 leading-relaxed">
              Assemble sections onto your active page with one click.
            </div>

            {/* Step 2 Saved Components */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 px-1 flex items-center justify-between">
                <span>From Step 2 Library</span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {customComponents.length} saved
                </span>
              </h3>

              {customComponents.length === 0 ? (
                <div className="p-3 rounded-lg border border-dashed border-zinc-800 text-[11px] text-zinc-500 text-center">
                  No saved components yet.{' '}
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="text-indigo-400 hover:underline cursor-pointer"
                  >
                    Go to Step 2 to save sections.
                  </button>
                </div>
              ) : (
                customComponents.map((comp) => (
                  <div
                    key={comp.id}
                    className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-zinc-100 truncate">
                        {comp.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">{comp.category}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => insertCustomComponent(comp.id)}
                      className="py-1 px-2.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Standard Templates */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 px-1">
                Standard Section Templates
              </h3>
              {SECTION_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-200 truncate">{tpl.name}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">{tpl.category}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => insertSectionTemplate(tpl.id)}
                    className="py-1 px-2.5 rounded bg-zinc-800 hover:bg-indigo-600 text-zinc-300 hover:text-white border border-zinc-700/60 hover:border-transparent text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: LAYERS */}
        {step3Tab === 'layers' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between px-1 pb-2 border-b border-zinc-800/80">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Page DOM Hierarchy
              </span>
              <FileCode2 className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            <div className="pt-1 space-y-0.5">
              {rootIds.map((rootId) => (
                <LayerRow key={rootId} nodeId={rootId} depth={0} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Step 3 Footer / Back to Step 2 */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-900/60 space-y-2">
        <button
          type="button"
          onClick={() => setActiveStep(2)}
          className="w-full py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>← Back to Step 2: Sections</span>
        </button>
      </div>
    </aside>
  );
}
