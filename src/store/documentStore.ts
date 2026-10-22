import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  buildCmsCollectionSection,
  canAcceptChildren,
  createDefaultCmsCollections,
  createDefaultDesignTokens,
  createDefaultPresets,
  createNodeId,
  createPrimitiveNode,
  createStarterDocument,
  CURATED_COLOR_PALETTES,
  loadGoogleFont,
  registerCustomFont,
  SECTION_TEMPLATES,
  syncPresetsWithTokens,
  type Breakpoint,
  type CmsCollection,
  type CmsField,
  type CmsItem,
  type CustomUploadedFont,
  type DesignTokens,
  type ElementKind,
  type ElementPresets,
  type NodeId,
  type PageDocument,
  type PresetKey,
  type Project,
  type SavedComponent,
  type StudioStep,
  type StyleProps,
  type TectaNode,
} from '../domain/schema';
import { cssomEngine } from '../services/cssomEngine';

const PROJECTS_STORAGE_KEY = 'tecta_studio_projects_v2';
const MAX_HISTORY = 50;

function cloneSubtree(
  nodeId: NodeId,
  nodes: Record<NodeId, TectaNode>,
  newParentId: NodeId | null,
  acc: Record<NodeId, TectaNode>
): NodeId | null {
  const original = nodes[nodeId];
  if (!original) return null;

  const newId = createNodeId(original.kind);
  const newChildrenIds: NodeId[] = [];

  for (const childId of original.childrenIds) {
    const clonedChildId = cloneSubtree(childId, nodes, newId, acc);
    if (clonedChildId) {
      newChildrenIds.push(clonedChildId);
    }
  }

  acc[newId] = {
    ...original,
    id: newId,
    name: original.name,
    parentId: newParentId,
    childrenIds: newChildrenIds,
    attributes: original.attributes ? { ...original.attributes } : undefined,
    styles: {
      desktop: { ...original.styles.desktop },
      tablet: original.styles.tablet ? { ...original.styles.tablet } : undefined,
      mobile: original.styles.mobile ? { ...original.styles.mobile } : undefined,
    },
  };

  return newId;
}

function createDefaultStarterProjects(): Record<string, Project> {
  const saasDoc = createStarterDocument();
  const saasTokens = createDefaultDesignTokens();
  const saasPresets = createDefaultPresets();

  const rootNode = saasDoc.nodes[saasDoc.rootIds[0]!];
  const sampleComponents: SavedComponent[] = [];
  if (rootNode) {
    const subTree: Record<NodeId, TectaNode> = {};
    const clonedId = cloneSubtree(rootNode.id, saasDoc.nodes, null, subTree);
    if (clonedId && subTree[clonedId]) {
      const clonedRoot = subTree[clonedId]!;
      clonedRoot.name = 'Apex Hero Section';
      sampleComponents.push({
        id: 'comp_sample_hero',
        name: 'Apex Hero Section',
        category: 'Hero',
        description: 'High-contrast hero section with CTA buttons',
        rootNode: clonedRoot,
        descendants: Object.values(subTree).filter((n) => n.id !== clonedId),
        createdAt: Date.now() - 3600000,
      });
    }
  }

  const proj1: Project = {
    id: 'proj_apex_saas',
    name: 'Apex Cloud Platform',
    description: 'High-conversion marketing site with hero, bento features, and newsletter CTA.',
    slug: 'apex-cloud',
    activeStep: 2, // In Step 2: Sections Studio
    tokens: saasTokens,
    presets: saasPresets,
    customComponents: sampleComponents,
    pages: { [saasDoc.id]: saasDoc },
    activePageId: saasDoc.id,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 3600000,
  };

  const portfolioDoc: PageDocument = {
    id: 'page_portfolio_home',
    title: 'Portfolio Home',
    rootIds: [],
    nodes: {},
  };
  const portfolioTokens: DesignTokens = {
    ...createDefaultDesignTokens(),
    primaryColor: '#d97706',
    secondaryColor: '#fbbf24',
    accentColor: '#b45309',
    backgroundColor: '#1c1917',
    surfaceColor: '#292524',
    textColor: '#fef3c7',
    textMuted: '#d6d3d1',
    borderColor: '#44403c',
    fontHeading: 'Playfair Display',
    fontBody: 'Plus Jakarta Sans',
  };
  const portfolioPresets = syncPresetsWithTokens(portfolioTokens, createDefaultPresets());

  const proj2: Project = {
    id: 'proj_minimal_portfolio',
    name: 'Creative Studio Portfolio',
    description: 'Minimalist agency showcase focusing on typography tokens and custom element presets.',
    slug: 'creative-studio',
    activeStep: 1, // In Step 1: Element Presets
    tokens: portfolioTokens,
    presets: portfolioPresets,
    customComponents: [],
    pages: { [portfolioDoc.id]: portfolioDoc },
    activePageId: portfolioDoc.id,
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 7200000,
  };

  return {
    [proj1.id]: proj1,
    [proj2.id]: proj2,
  };
}

function loadInitialProjects(): Record<string, Project> {
  if (typeof window === 'undefined') return createDefaultStarterProjects();
  try {
    const raw = window.localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fallback
  }
  return createDefaultStarterProjects();
}

function persistProjectsAsync(projects: Record<string, Project>): void {
  if (typeof window === 'undefined') return;
  queueMicrotask(() => {
    try {
      window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    } catch {
      // Ignore quota errors in private browsing
    }
  });
}

function collectSubtreeIds(
  nodeId: NodeId,
  nodes: Record<NodeId, TectaNode>,
  out: Set<NodeId>
): void {
  out.add(nodeId);
  const node = nodes[nodeId];
  if (!node) return;
  for (const childId of node.childrenIds) {
    collectSubtreeIds(childId, nodes, out);
  }
}

export interface DocumentStoreState {
  // Higher-Level Website Projects State
  projects: Record<string, Project>;
  activeProjectId: string | null;

  // Active Project Data
  activeStep: StudioStep;
  tokens: DesignTokens;
  presets: ElementPresets;
  selectedPresetKey: PresetKey | null;
  customComponents: SavedComponent[];
  activeComponentId: string | null;
  cmsCollections: CmsCollection[];
  activeCmsCollectionId: string;

  pages: Record<string, PageDocument>;
  activePageId: string;
  doc: PageDocument;

  past: PageDocument[];
  future: PageDocument[];
  selectedNodeId: NodeId | null;
  hoveredNodeId: NodeId | null;
  breakpoint: Breakpoint;
  isPreviewMode: boolean;

  // Project Management Actions
  createProject: (
    name: string,
    description?: string,
    template?: 'saas' | 'portfolio' | 'blank',
    initialStep?: StudioStep
  ) => string;
  openProject: (projectId: string, step?: StudioStep) => void;
  closeProject: () => void;
  deleteProject: (projectId: string) => void;
  duplicateProject: (projectId: string) => string;
  updateProjectMetadata: (
    projectId: string,
    patch: { name?: string; description?: string }
  ) => void;

  // Step 1: Design Tokens (Colors & Webfonts) & Presets Actions
  setActiveStep: (step: StudioStep) => void;
  selectPreset: (key: PresetKey | null) => void;
  updatePresetStyle: (key: PresetKey, patch: Partial<StyleProps>) => void;
  resetPresets: () => void;
  updateDesignTokens: (patch: Partial<DesignTokens>) => void;
  applyColorPalette: (paletteId: string) => void;
  setGoogleFont: (target: 'heading' | 'body', fontFamily: string) => void;
  uploadCustomFont: (file: File) => Promise<string>;
  deleteCustomFont: (fontId: string) => void;

  // Step 2: Sections & Components Actions
  saveCurrentSectionAsComponent: (
    name: string,
    category: SavedComponent['category'],
    rootNodeId: NodeId
  ) => SavedComponent | null;
  deleteCustomComponent: (id: string) => void;
  insertCustomComponent: (id: string) => NodeId | null;

  // Step 3: Pages & Posts + CMS Collections Actions
  createPage: (title: string) => string;
  switchPage: (pageId: string) => void;
  deletePage: (pageId: string) => void;
  setActiveCmsCollection: (collectionId: string) => void;
  createCmsCollection: (
    name: string,
    singularName: string,
    description: string,
    fields?: CmsField[]
  ) => string;
  upsertCmsItem: (
    collectionId: string,
    item: { id?: string; status: 'published' | 'draft'; values: Record<string, string> }
  ) => string;
  deleteCmsItem: (collectionId: string, itemId: string) => void;
  insertCmsCollectionSection: (collectionId: string, columns?: 2 | 3) => NodeId | null;
  insertGeneratedSection: (section: {
    rootNode: TectaNode;
    descendants: TectaNode[];
  }) => NodeId;

  // Studio Node & Canvas Actions
  selectNode: (id: NodeId | null) => void;
  hoverNode: (id: NodeId | null) => void;
  setBreakpoint: (bp: Breakpoint) => void;
  setPreviewMode: (preview: boolean) => void;

  addPrimitiveElement: (kind: ElementKind, targetParentId?: NodeId | null) => NodeId;
  insertSectionTemplate: (templateId: string) => NodeId | null;
  updateNodeStyle: (
    nodeId: NodeId,
    breakpoint: Breakpoint,
    patch: Partial<StyleProps>
  ) => void;
  updateNodeText: (nodeId: NodeId, textContent: string) => void;
  updateNodeName: (nodeId: NodeId, name: string) => void;
  updateNodeAttributes: (
    nodeId: NodeId,
    attrs: Partial<NonNullable<TectaNode['attributes']>>
  ) => void;
  toggleNodeVisibility: (nodeId: NodeId) => void;
  moveNodeStep: (nodeId: NodeId, direction: 'up' | 'down') => void;
  duplicateNode: (nodeId: NodeId) => NodeId | null;
  deleteNode: (nodeId: NodeId) => void;

  undo: () => void;
  redo: () => void;
  resetToStarter: () => void;
}

export const useDocumentStore = create<DocumentStoreState>()(
  subscribeWithSelector((set, get) => {
    const initialProjects = loadInitialProjects();
    const fallbackDoc = createStarterDocument();
    const fallbackTokens = createDefaultDesignTokens();
    const fallbackCms = createDefaultCmsCollections();

    const commitDoc = (nextDoc: PageDocument, nextSelected?: NodeId | null) => {
      const current = get();
      const nextPast = [...current.past, current.doc].slice(-MAX_HISTORY);
      const nextPages = { ...current.pages, [nextDoc.id]: nextDoc };

      const patch: Partial<DocumentStoreState> = {
        doc: nextDoc,
        pages: nextPages,
        past: nextPast,
        future: [],
        ...(nextSelected !== undefined ? { selectedNodeId: nextSelected } : {}),
      };

      const activeId = current.activeProjectId;
      if (activeId && current.projects[activeId]) {
        const updatedProject: Project = {
          ...current.projects[activeId]!,
          pages: nextPages,
          activePageId: nextDoc.id,
          updatedAt: Date.now(),
        };
        const nextProjects = { ...current.projects, [activeId]: updatedProject };
        set({
          ...patch,
          projects: nextProjects,
        });
        persistProjectsAsync(nextProjects);
      } else {
        set(patch);
      }
    };

    return {
      // Start in Dashboard view on app start (activeProjectId: null)
      projects: initialProjects,
      activeProjectId: null,

      activeStep: 1,
      tokens: fallbackTokens,
      presets: createDefaultPresets(),
      selectedPresetKey: 'tokens-colors',
      customComponents: [],
      activeComponentId: null,
      cmsCollections: fallbackCms,
      activeCmsCollectionId: fallbackCms[0]?.id ?? 'cms_posts',

      pages: { [fallbackDoc.id]: fallbackDoc },
      activePageId: fallbackDoc.id,
      doc: fallbackDoc,

      past: [],
      future: [],
      selectedNodeId: fallbackDoc.rootIds[0] ?? null,
      hoveredNodeId: null,
      breakpoint: 'desktop',
      isPreviewMode: false,

      createProject: (name, description, template = 'blank', initialStep = 1) => {
        const { projects } = get();
        const id = `proj_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const cleanName = name.trim() || 'Untitled Website';
        const slug =
          cleanName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '') || 'my-site';

        let initialPages: Record<string, PageDocument> = {};
        const tokens = createDefaultDesignTokens();

        if (template === 'portfolio') {
          tokens.primaryColor = '#d97706';
          tokens.secondaryColor = '#fbbf24';
          tokens.accentColor = '#b45309';
          tokens.backgroundColor = '#1c1917';
          tokens.surfaceColor = '#292524';
          tokens.textColor = '#fef3c7';
          tokens.textMuted = '#d6d3d1';
          tokens.borderColor = '#44403c';
          tokens.fontHeading = 'Playfair Display';
          tokens.fontBody = 'Plus Jakarta Sans';
        }

        const presets = syncPresetsWithTokens(tokens, createDefaultPresets());
        const initialComponents: SavedComponent[] = [];
        const initialCms = createDefaultCmsCollections();

        if (template === 'saas') {
          const starterDoc = createStarterDocument();
          initialPages = { [starterDoc.id]: starterDoc };
        } else if (template === 'portfolio') {
          const pDoc: PageDocument = {
            id: `page_${Date.now()}`,
            title: 'Portfolio Home',
            rootIds: [],
            nodes: {},
          };
          const heroTpl = SECTION_TEMPLATES.find((t) => t.id === 'tpl-hero-tectonic');
          if (heroTpl) {
            const { rootNode, descendants } = heroTpl.build();
            pDoc.rootIds = [rootNode.id];
            pDoc.nodes = {
              [rootNode.id]: rootNode,
              ...Object.fromEntries(descendants.map((d) => [d.id, d])),
            };
          }
          initialPages = { [pDoc.id]: pDoc };
        } else {
          // Blank slate
          const blankDoc: PageDocument = {
            id: `page_${Date.now()}`,
            title: 'Home',
            rootIds: [],
            nodes: {},
          };
          initialPages = { [blankDoc.id]: blankDoc };
        }

        const activePageId = Object.keys(initialPages)[0]!;

        const newProject: Project = {
          id,
          name: cleanName,
          description: description?.trim() || 'A new responsive website built with TECTA.',
          slug,
          activeStep: initialStep,
          tokens,
          presets,
          customComponents: initialComponents,
          cmsCollections: initialCms,
          pages: initialPages,
          activePageId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        const updatedProjects = { ...projects, [id]: newProject };
        set({ projects: updatedProjects });
        persistProjectsAsync(updatedProjects);

        // Open newly created project
        get().openProject(id, initialStep);
        return id;
      },

      openProject: (projectId, step) => {
        const { projects } = get();
        const proj = projects[projectId];
        if (!proj) return;

        const targetStep = step ?? proj.activeStep ?? 1;
        const targetTokens = proj.tokens ?? createDefaultDesignTokens();
        const targetCms =
          proj.cmsCollections && proj.cmsCollections.length > 0
            ? proj.cmsCollections
            : createDefaultCmsCollections();

        // Load configured Google webfonts & custom fonts
        targetTokens.googleFontsLoaded?.forEach((f) => loadGoogleFont(f));
        targetTokens.customFonts?.forEach((f) => registerCustomFont(f));

        const targetPageId = proj.activePageId || Object.keys(proj.pages)[0] || '';
        let activePageDoc = proj.pages[targetPageId];
        if (!activePageDoc) {
          activePageDoc = createStarterDocument();
          proj.pages[activePageDoc.id] = activePageDoc;
          proj.activePageId = activePageDoc.id;
        }

        set({
          activeProjectId: projectId,
          activeStep: targetStep,
          tokens: targetTokens,
          presets: proj.presets ?? createDefaultPresets(),
          customComponents: proj.customComponents ?? [],
          cmsCollections: targetCms,
          activeCmsCollectionId: targetCms[0]?.id ?? 'cms_posts',
          pages: proj.pages,
          activePageId: activePageDoc.id,
          doc: activePageDoc,
          past: [],
          future: [],
          selectedNodeId: activePageDoc.rootIds[0] ?? null,
          hoveredNodeId: null,
          breakpoint: 'desktop',
          isPreviewMode: false,
        });

        cssomEngine.syncCommittedDocument(activePageDoc);
      },

      closeProject: () => {
        set({
          activeProjectId: null,
          selectedNodeId: null,
          hoveredNodeId: null,
          isPreviewMode: false,
        });
      },

      deleteProject: (projectId) => {
        const { projects, activeProjectId } = get();
        const nextProjects = { ...projects };
        delete nextProjects[projectId];
        set({
          projects: nextProjects,
          ...(activeProjectId === projectId ? { activeProjectId: null } : {}),
        });
        persistProjectsAsync(nextProjects);
      },

      duplicateProject: (projectId) => {
        const { projects } = get();
        const orig = projects[projectId];
        if (!orig) return '';

        const id = `proj_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const copyName = `${orig.name} (Copy)`;
        const slug = `${orig.slug}-copy`;

        const clonedTokens: DesignTokens = JSON.parse(
          JSON.stringify(orig.tokens ?? createDefaultDesignTokens())
        );
        const clonedPages: Record<string, PageDocument> = JSON.parse(
          JSON.stringify(orig.pages)
        );
        const clonedComps: SavedComponent[] = JSON.parse(
          JSON.stringify(orig.customComponents)
        );
        const clonedPresets: ElementPresets = JSON.parse(
          JSON.stringify(orig.presets)
        );

        const newProject: Project = {
          ...orig,
          id,
          name: copyName,
          slug,
          tokens: clonedTokens,
          presets: clonedPresets,
          customComponents: clonedComps,
          pages: clonedPages,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        const updated = { ...projects, [id]: newProject };
        set({ projects: updated });
        persistProjectsAsync(updated);
        return id;
      },

      updateProjectMetadata: (projectId, patch) => {
        const { projects } = get();
        const orig = projects[projectId];
        if (!orig) return;

        const updated: Project = {
          ...orig,
          ...(patch.name
            ? {
                name: patch.name.trim(),
                slug:
                  patch.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)+/g, '') || orig.slug,
              }
            : {}),
          ...(patch.description !== undefined
            ? { description: patch.description.trim() }
            : {}),
          updatedAt: Date.now(),
        };

        const updatedProjects = { ...projects, [projectId]: updated };
        set({ projects: updatedProjects });
        persistProjectsAsync(updatedProjects);
      },

      setActiveStep: (step) => {
        const current = get();
        const activeId = current.activeProjectId;
        if (activeId && current.projects[activeId]) {
          const updatedProject: Project = {
            ...current.projects[activeId]!,
            activeStep: step,
            updatedAt: Date.now(),
          };
          const nextProjects = { ...current.projects, [activeId]: updatedProject };
          set({ activeStep: step, projects: nextProjects });
          persistProjectsAsync(nextProjects);
        } else {
          set({ activeStep: step });
        }
      },

      selectPreset: (key) => set({ selectedPresetKey: key }),

      updatePresetStyle: (key, patch) => {
        const current = get();
        const updatedPresets = {
          ...current.presets,
          [key]: {
            ...current.presets[key],
            ...patch,
          },
        };

        const activeId = current.activeProjectId;
        if (activeId && current.projects[activeId]) {
          const updatedProject: Project = {
            ...current.projects[activeId]!,
            presets: updatedPresets,
            updatedAt: Date.now(),
          };
          const nextProjects = { ...current.projects, [activeId]: updatedProject };
          set({ presets: updatedPresets, projects: nextProjects });
          persistProjectsAsync(nextProjects);
        } else {
          set({ presets: updatedPresets });
        }
      },

      resetPresets: () => {
        const current = get();
        const defaults = createDefaultPresets();
        const activeId = current.activeProjectId;
        if (activeId && current.projects[activeId]) {
          const updatedProject: Project = {
            ...current.projects[activeId]!,
            presets: defaults,
            updatedAt: Date.now(),
          };
          const nextProjects = { ...current.projects, [activeId]: updatedProject };
          set({ presets: defaults, projects: nextProjects });
          persistProjectsAsync(nextProjects);
        } else {
          set({ presets: defaults });
        }
      },

      updateDesignTokens: (patch) => {
        const current = get();
        const updatedTokens: DesignTokens = {
          ...current.tokens,
          ...patch,
        };
        const updatedPresets = syncPresetsWithTokens(updatedTokens, current.presets);

        const activeId = current.activeProjectId;
        if (activeId && current.projects[activeId]) {
          const updatedProject: Project = {
            ...current.projects[activeId]!,
            tokens: updatedTokens,
            presets: updatedPresets,
            updatedAt: Date.now(),
          };
          const nextProjects = { ...current.projects, [activeId]: updatedProject };
          set({
            tokens: updatedTokens,
            presets: updatedPresets,
            projects: nextProjects,
          });
          persistProjectsAsync(nextProjects);
        } else {
          set({
            tokens: updatedTokens,
            presets: updatedPresets,
          });
        }
      },

      applyColorPalette: (paletteId) => {
        const palette = CURATED_COLOR_PALETTES.find((p) => p.id === paletteId);
        if (!palette) return;

        const current = get();
        const updatedTokens: DesignTokens = {
          ...current.tokens,
          primaryColor: palette.primary,
          secondaryColor: palette.secondary,
          accentColor: palette.accent,
          backgroundColor: palette.background,
          surfaceColor: palette.surface,
          textColor: palette.text,
          textMuted: palette.textMuted,
          borderColor: palette.border,
        };

        const updatedPresets = syncPresetsWithTokens(updatedTokens, current.presets);

        const activeId = current.activeProjectId;
        if (activeId && current.projects[activeId]) {
          const updatedProject: Project = {
            ...current.projects[activeId]!,
            tokens: updatedTokens,
            presets: updatedPresets,
            updatedAt: Date.now(),
          };
          const nextProjects = { ...current.projects, [activeId]: updatedProject };
          set({
            tokens: updatedTokens,
            presets: updatedPresets,
            projects: nextProjects,
          });
          persistProjectsAsync(nextProjects);
        } else {
          set({
            tokens: updatedTokens,
            presets: updatedPresets,
          });
        }
      },

      setGoogleFont: (target, fontFamily) => {
        loadGoogleFont(fontFamily);

        const current = get();
        const loadedList = current.tokens.googleFontsLoaded.includes(fontFamily)
          ? current.tokens.googleFontsLoaded
          : [...current.tokens.googleFontsLoaded, fontFamily];

        const updatedTokens: DesignTokens = {
          ...current.tokens,
          [target === 'heading' ? 'fontHeading' : 'fontBody']: fontFamily,
          googleFontsLoaded: loadedList,
        };

        const updatedPresets = syncPresetsWithTokens(updatedTokens, current.presets);

        const activeId = current.activeProjectId;
        if (activeId && current.projects[activeId]) {
          const updatedProject: Project = {
            ...current.projects[activeId]!,
            tokens: updatedTokens,
            presets: updatedPresets,
            updatedAt: Date.now(),
          };
          const nextProjects = { ...current.projects, [activeId]: updatedProject };
          set({
            tokens: updatedTokens,
            presets: updatedPresets,
            projects: nextProjects,
          });
          persistProjectsAsync(nextProjects);
        } else {
          set({
            tokens: updatedTokens,
            presets: updatedPresets,
          });
        }
      },

      uploadCustomFont: async (file) => {
        const fontName =
          file.name
            .replace(/\.[^/.]+$/, '')
            .replace(/[^a-zA-Z0-9_-]/g, ' ')
            .trim() || 'CustomFont';
        const ext = file.name.split('.').pop()?.toLowerCase();
        let format: CustomUploadedFont['format'] = 'woff2';
        if (ext === 'woff') format = 'woff';
        else if (ext === 'ttf') format = 'truetype';
        else if (ext === 'otf') format = 'opentype';

        let dataUrl = '';
        if (typeof file.arrayBuffer === 'function') {
          const buffer = await file.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          let binary = '';
          const chunkSize = 0x8000;
          for (let i = 0; i < bytes.length; i += chunkSize) {
            binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
          }
          const base64 = btoa(binary);
          const mime =
            format === 'woff2'
              ? 'font/woff2'
              : format === 'woff'
                ? 'font/woff'
                : format === 'opentype'
                  ? 'font/otf'
                  : 'font/ttf';
          dataUrl = `data:${mime};base64,${base64}`;
        } else {
          dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Failed to read font file'));
            reader.readAsDataURL(file);
          });
        }

        const newFont: CustomUploadedFont = {
          id: `font_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name: fontName,
          format,
          dataUrl,
          createdAt: Date.now(),
        };

        registerCustomFont(newFont);

        const current = get();
        const updatedTokens: DesignTokens = {
          ...current.tokens,
          customFonts: [...current.tokens.customFonts, newFont],
        };

        const activeId = current.activeProjectId;
        if (activeId && current.projects[activeId]) {
          const updatedProject: Project = {
            ...current.projects[activeId]!,
            tokens: updatedTokens,
            updatedAt: Date.now(),
          };
          const nextProjects = { ...current.projects, [activeId]: updatedProject };
          set({ tokens: updatedTokens, projects: nextProjects });
          persistProjectsAsync(nextProjects);
        } else {
          set({ tokens: updatedTokens });
        }

        return fontName;
      },

      deleteCustomFont: (fontId) => {
        const current = get();
        const updatedCustom = current.tokens.customFonts.filter((f) => f.id !== fontId);
        const updatedTokens: DesignTokens = {
          ...current.tokens,
          customFonts: updatedCustom,
        };

        const activeId = current.activeProjectId;
        if (activeId && current.projects[activeId]) {
          const updatedProject: Project = {
            ...current.projects[activeId]!,
            tokens: updatedTokens,
            updatedAt: Date.now(),
          };
          const nextProjects = { ...current.projects, [activeId]: updatedProject };
          set({ tokens: updatedTokens, projects: nextProjects });
          persistProjectsAsync(nextProjects);
        } else {
          set({ tokens: updatedTokens });
        }
      },

      saveCurrentSectionAsComponent: (name, category, rootNodeId) => {
        const current = get();
        const root = current.doc.nodes[rootNodeId];
        if (!root) return null;

        const compName = name.trim() || root.name || 'Custom Section';
        const subTreeNodes: Record<NodeId, TectaNode> = {};
        const clonedRootId = cloneSubtree(rootNodeId, current.doc.nodes, null, subTreeNodes);
        if (!clonedRootId) return null;

        const clonedRoot = subTreeNodes[clonedRootId]!;
        clonedRoot.name = compName;
        const descendants = Object.values(subTreeNodes).filter((n) => n.id !== clonedRootId);

        const newComp: SavedComponent = {
          id: `comp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name: compName,
          category: category || 'General',
          rootNode: clonedRoot,
          descendants,
          createdAt: Date.now(),
        };

        const updatedComps = [newComp, ...current.customComponents];
        const activeId = current.activeProjectId;
        if (activeId && current.projects[activeId]) {
          const updatedProject: Project = {
            ...current.projects[activeId]!,
            customComponents: updatedComps,
            updatedAt: Date.now(),
          };
          const nextProjects = { ...current.projects, [activeId]: updatedProject };
          set({ customComponents: updatedComps, projects: nextProjects });
          persistProjectsAsync(nextProjects);
        } else {
          set({ customComponents: updatedComps });
        }
        return newComp;
      },

      deleteCustomComponent: (id) => {
        const current = get();
        const updatedComps = current.customComponents.filter((c) => c.id !== id);
        const activeId = current.activeProjectId;
        if (activeId && current.projects[activeId]) {
          const updatedProject: Project = {
            ...current.projects[activeId]!,
            customComponents: updatedComps,
            updatedAt: Date.now(),
          };
          const nextProjects = { ...current.projects, [activeId]: updatedProject };
          set({ customComponents: updatedComps, projects: nextProjects });
          persistProjectsAsync(nextProjects);
        } else {
          set({ customComponents: updatedComps });
        }
      },

      insertCustomComponent: (id) => {
        const { customComponents, doc, selectedNodeId } = get();
        const comp = customComponents.find((c) => c.id === id);
        if (!comp) return null;

        const subTreeNodes: Record<NodeId, TectaNode> = {};
        const freshRootId = cloneSubtree(
          comp.rootNode.id,
          {
            [comp.rootNode.id]: comp.rootNode,
            ...Object.fromEntries(comp.descendants.map((d) => [d.id, d])),
          },
          null,
          subTreeNodes
        );

        if (!freshRootId) return null;

        const freshRoot = subTreeNodes[freshRootId]!;
        freshRoot.name = comp.name;
        const nextNodes: Record<NodeId, TectaNode> = {
          ...doc.nodes,
          ...subTreeNodes,
        };

        let insertIndex = doc.rootIds.length;
        if (selectedNodeId) {
          let cursor = doc.nodes[selectedNodeId];
          while (cursor && cursor.parentId) {
            cursor = doc.nodes[cursor.parentId];
          }
          if (cursor) {
            const idx = doc.rootIds.indexOf(cursor.id);
            if (idx !== -1) insertIndex = idx + 1;
          }
        }

        const nextRootIds = [...doc.rootIds];
        nextRootIds.splice(insertIndex, 0, freshRoot.id);

        commitDoc(
          {
            ...doc,
            rootIds: nextRootIds,
            nodes: nextNodes,
          },
          freshRoot.id
        );

        return freshRoot.id;
      },

      createPage: (title) => {
        const current = get();
        const cleanTitle = title.trim() || 'New Page';
        const pageId = `page_${Date.now()}`;
        const newDoc: PageDocument = {
          id: pageId,
          title: cleanTitle,
          rootIds: [],
          nodes: {},
        };
        const updatedPages = { ...current.pages, [pageId]: newDoc };
        const activeId = current.activeProjectId;
        if (activeId && current.projects[activeId]) {
          const updatedProject: Project = {
            ...current.projects[activeId]!,
            pages: updatedPages,
            activePageId: pageId,
            updatedAt: Date.now(),
          };
          const nextProjects = { ...current.projects, [activeId]: updatedProject };
          set({
            pages: updatedPages,
            activePageId: pageId,
            doc: newDoc,
            past: [],
            future: [],
            selectedNodeId: null,
            projects: nextProjects,
          });
          persistProjectsAsync(nextProjects);
        } else {
          set({
            pages: updatedPages,
            activePageId: pageId,
            doc: newDoc,
            past: [],
            future: [],
            selectedNodeId: null,
          });
        }
        return pageId;
      },

      switchPage: (pageId) => {
        const current = get();
        const targetPage = current.pages[pageId];
        if (!targetPage) return;

        const updatedPages = { ...current.pages, [current.doc.id]: current.doc };
        const activeId = current.activeProjectId;
        if (activeId && current.projects[activeId]) {
          const updatedProject: Project = {
            ...current.projects[activeId]!,
            pages: updatedPages,
            activePageId: pageId,
            updatedAt: Date.now(),
          };
          const nextProjects = { ...current.projects, [activeId]: updatedProject };
          set({
            pages: updatedPages,
            activePageId: pageId,
            doc: targetPage,
            past: [],
            future: [],
            selectedNodeId: targetPage.rootIds[0] ?? null,
            projects: nextProjects,
          });
          persistProjectsAsync(nextProjects);
        } else {
          set({
            pages: updatedPages,
            activePageId: pageId,
            doc: targetPage,
            past: [],
            future: [],
            selectedNodeId: targetPage.rootIds[0] ?? null,
          });
        }
      },

      deletePage: (pageId) => {
        const current = get();
        const keys = Object.keys(current.pages);
        if (keys.length <= 1) return;

        const nextPages = { ...current.pages };
        delete nextPages[pageId];

        let nextActiveId = current.activePageId;
        let nextDoc = current.doc;
        if (current.activePageId === pageId) {
          nextActiveId = Object.keys(nextPages)[0]!;
          nextDoc = nextPages[nextActiveId]!;
        }

        const activeId = current.activeProjectId;
        if (activeId && current.projects[activeId]) {
          const updatedProject: Project = {
            ...current.projects[activeId]!,
            pages: nextPages,
            activePageId: nextActiveId,
            updatedAt: Date.now(),
          };
          const nextProjects = { ...current.projects, [activeId]: updatedProject };
          set({
            pages: nextPages,
            activePageId: nextActiveId,
            doc: nextDoc,
            past: [],
            future: [],
            selectedNodeId: nextDoc.rootIds[0] ?? null,
            projects: nextProjects,
          });
          persistProjectsAsync(nextProjects);
        } else {
          set({
            pages: nextPages,
            activePageId: nextActiveId,
            doc: nextDoc,
            past: [],
            future: [],
            selectedNodeId: nextDoc.rootIds[0] ?? null,
          });
        }
      },

      setActiveCmsCollection: (collectionId) =>
        set({ activeCmsCollectionId: collectionId }),

      createCmsCollection: (name, singularName, description, customFields) => {
        const current = get();
        const cleanName = name.trim() || 'Custom Collection';
        const cleanSingular = singularName.trim() || 'Item';
        const slug =
          cleanName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '') || 'items';

        const newCol: CmsCollection = {
          id: `cms_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
          name: cleanName,
          singularName: cleanSingular,
          slug,
          icon: 'custom',
          description: description.trim() || `Dynamic ${cleanName} collection.`,
          fields:
            customFields && customFields.length > 0
              ? customFields
              : [
                  { id: 'f_title', key: 'title', label: `${cleanSingular} Title`, type: 'text', required: true },
                  { id: 'f_slug', key: 'slug', label: 'Slug', type: 'slug', required: true },
                  { id: 'f_cat', key: 'category', label: 'Tag / Badge', type: 'badge' },
                  { id: 'f_price', key: 'price', label: 'Price / Meta', type: 'price' },
                  { id: 'f_excerpt', key: 'excerpt', label: 'Description', type: 'richtext' },
                  { id: 'f_image', key: 'image', label: 'Image URL', type: 'image' },
                  { id: 'f_cta', key: 'ctaLabel', label: 'Button Label', type: 'text' },
                ],
          items: [
            {
              id: `item_${Date.now()}`,
              status: 'published',
              createdAt: Date.now(),
              updatedAt: Date.now(),
              values: {
                title: `Sample ${cleanSingular}`,
                slug: `sample-${slug}-1`,
                category: 'FEATURED',
                price: '',
                excerpt: `First entry in the ${cleanName} CMS collection.`,
                image:
                  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80',
                ctaLabel: `View ${cleanSingular} →`,
              },
            },
          ],
        };

        const nextCols = [...current.cmsCollections, newCol];
        const activeId = current.activeProjectId;
        if (activeId && current.projects[activeId]) {
          const updatedProject: Project = {
            ...current.projects[activeId]!,
            cmsCollections: nextCols,
            updatedAt: Date.now(),
          };
          const nextProjects = { ...current.projects, [activeId]: updatedProject };
          set({
            cmsCollections: nextCols,
            activeCmsCollectionId: newCol.id,
            projects: nextProjects,
          });
          persistProjectsAsync(nextProjects);
        } else {
          set({
            cmsCollections: nextCols,
            activeCmsCollectionId: newCol.id,
          });
        }
        return newCol.id;
      },

      upsertCmsItem: (collectionId, itemInput) => {
        const current = get();
        const itemId =
          itemInput.id ?? `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const now = Date.now();

        const nextCols = current.cmsCollections.map((col) => {
          if (col.id !== collectionId) return col;
          const exists = col.items.some((i) => i.id === itemId);
          const nextItems: CmsItem[] = exists
            ? col.items.map((i) =>
                i.id === itemId
                  ? {
                      ...i,
                      status: itemInput.status,
                      values: { ...i.values, ...itemInput.values },
                      updatedAt: now,
                    }
                  : i
              )
            : [
                {
                  id: itemId,
                  status: itemInput.status,
                  values: itemInput.values,
                  createdAt: now,
                  updatedAt: now,
                },
                ...col.items,
              ];
          return { ...col, items: nextItems };
        });

        const activeId = current.activeProjectId;
        if (activeId && current.projects[activeId]) {
          const updatedProject: Project = {
            ...current.projects[activeId]!,
            cmsCollections: nextCols,
            updatedAt: now,
          };
          const nextProjects = { ...current.projects, [activeId]: updatedProject };
          set({ cmsCollections: nextCols, projects: nextProjects });
          persistProjectsAsync(nextProjects);
        } else {
          set({ cmsCollections: nextCols });
        }
        return itemId;
      },

      deleteCmsItem: (collectionId, itemId) => {
        const current = get();
        const nextCols = current.cmsCollections.map((col) =>
          col.id === collectionId
            ? { ...col, items: col.items.filter((i) => i.id !== itemId) }
            : col
        );

        const activeId = current.activeProjectId;
        if (activeId && current.projects[activeId]) {
          const updatedProject: Project = {
            ...current.projects[activeId]!,
            cmsCollections: nextCols,
            updatedAt: Date.now(),
          };
          const nextProjects = { ...current.projects, [activeId]: updatedProject };
          set({ cmsCollections: nextCols, projects: nextProjects });
          persistProjectsAsync(nextProjects);
        } else {
          set({ cmsCollections: nextCols });
        }
      },

      insertCmsCollectionSection: (collectionId, columns = 3) => {
        const current = get();
        const col = current.cmsCollections.find((c) => c.id === collectionId);
        if (!col) return null;

        const built = buildCmsCollectionSection(col, {
          columns,
          accentColor: current.tokens.primaryColor,
          surfaceColor: current.tokens.surfaceColor,
          borderColor: current.tokens.borderColor,
        });

        return get().insertGeneratedSection(built);
      },

      insertGeneratedSection: ({ rootNode, descendants }) => {
        const { doc, selectedNodeId } = get();
        const nextNodes: Record<NodeId, TectaNode> = {
          ...doc.nodes,
          [rootNode.id]: rootNode,
        };
        for (const d of descendants) {
          nextNodes[d.id] = d;
        }

        let insertIndex = doc.rootIds.length;
        if (selectedNodeId) {
          let cursor = doc.nodes[selectedNodeId];
          while (cursor && cursor.parentId) {
            cursor = doc.nodes[cursor.parentId];
          }
          if (cursor) {
            const idx = doc.rootIds.indexOf(cursor.id);
            if (idx !== -1) insertIndex = idx + 1;
          }
        }

        const nextRootIds = [...doc.rootIds];
        nextRootIds.splice(insertIndex, 0, rootNode.id);

        commitDoc(
          {
            ...doc,
            rootIds: nextRootIds,
            nodes: nextNodes,
          },
          rootNode.id
        );

        return rootNode.id;
      },

      selectNode: (id) => set({ selectedNodeId: id }),
      hoverNode: (id) => set({ hoveredNodeId: id }),
      setBreakpoint: (bp) => set({ breakpoint: bp }),
      setPreviewMode: (preview) =>
        set({ isPreviewMode: preview, selectedNodeId: null, hoveredNodeId: null }),

      addPrimitiveElement: (kind, targetParentId) => {
        const { doc, selectedNodeId } = get();
        let parentId = targetParentId ?? selectedNodeId;

        if (parentId) {
          const candidate = doc.nodes[parentId];
          if (candidate && !canAcceptChildren(candidate.kind)) {
            parentId = candidate.parentId;
          }
        } else {
          parentId = doc.rootIds[doc.rootIds.length - 1] ?? null;
        }

        const newNode = createPrimitiveNode(kind, parentId);
        const nextNodes: Record<NodeId, TectaNode> = {
          ...doc.nodes,
          [newNode.id]: newNode,
        };
        let nextRootIds = doc.rootIds;

        if (parentId && nextNodes[parentId]) {
          const parent = nextNodes[parentId]!;
          nextNodes[parentId] = {
            ...parent,
            childrenIds: [...parent.childrenIds, newNode.id],
          };
        } else {
          newNode.parentId = null;
          nextRootIds = [...doc.rootIds, newNode.id];
        }

        commitDoc(
          {
            ...doc,
            rootIds: nextRootIds,
            nodes: nextNodes,
          },
          newNode.id
        );

        return newNode.id;
      },

      insertSectionTemplate: (templateId) => {
        const tpl = SECTION_TEMPLATES.find((t) => t.id === templateId);
        if (!tpl) return null;

        const { doc, selectedNodeId } = get();
        const { rootNode, descendants } = tpl.build();
        const nextNodes: Record<NodeId, TectaNode> = {
          ...doc.nodes,
          [rootNode.id]: rootNode,
        };
        for (const d of descendants) {
          nextNodes[d.id] = d;
        }

        let insertIndex = doc.rootIds.length;
        if (selectedNodeId) {
          let cursor = doc.nodes[selectedNodeId];
          while (cursor && cursor.parentId) {
            cursor = doc.nodes[cursor.parentId];
          }
          if (cursor) {
            const idx = doc.rootIds.indexOf(cursor.id);
            if (idx !== -1) insertIndex = idx + 1;
          }
        }

        const nextRootIds = [...doc.rootIds];
        nextRootIds.splice(insertIndex, 0, rootNode.id);

        commitDoc(
          {
            ...doc,
            rootIds: nextRootIds,
            nodes: nextNodes,
          },
          rootNode.id
        );

        return rootNode.id;
      },

      updateNodeStyle: (nodeId, breakpoint, patch) => {
        const { doc } = get();
        const node = doc.nodes[nodeId];
        if (!node) return;

        const targetStyles = { ...node.styles[breakpoint], ...patch };
        const updatedNode: TectaNode = {
          ...node,
          styles: {
            ...node.styles,
            [breakpoint]: targetStyles,
          },
        };

        commitDoc({
          ...doc,
          nodes: {
            ...doc.nodes,
            [nodeId]: updatedNode,
          },
        });
      },

      updateNodeText: (nodeId, textContent) => {
        const { doc } = get();
        const node = doc.nodes[nodeId];
        if (!node) return;

        commitDoc({
          ...doc,
          nodes: {
            ...doc.nodes,
            [nodeId]: { ...node, textContent },
          },
        });
      },

      updateNodeName: (nodeId, name) => {
        const { doc } = get();
        const node = doc.nodes[nodeId];
        if (!node) return;

        commitDoc({
          ...doc,
          nodes: {
            ...doc.nodes,
            [nodeId]: { ...node, name },
          },
        });
      },

      updateNodeAttributes: (nodeId, attrs) => {
        const { doc } = get();
        const node = doc.nodes[nodeId];
        if (!node) return;

        commitDoc({
          ...doc,
          nodes: {
            ...doc.nodes,
            [nodeId]: {
              ...node,
              attributes: { ...(node.attributes ?? {}), ...attrs },
            },
          },
        });
      },

      toggleNodeVisibility: (nodeId) => {
        const { doc } = get();
        const node = doc.nodes[nodeId];
        if (!node) return;

        commitDoc({
          ...doc,
          nodes: {
            ...doc.nodes,
            [nodeId]: { ...node, hidden: !node.hidden },
          },
        });
      },

      moveNodeStep: (nodeId, direction) => {
        const { doc } = get();
        const node = doc.nodes[nodeId];
        if (!node) return;

        if (node.parentId) {
          const parent = doc.nodes[node.parentId];
          if (!parent) return;
          const idx = parent.childrenIds.indexOf(nodeId);
          if (idx === -1) return;
          const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
          if (targetIdx < 0 || targetIdx >= parent.childrenIds.length) return;

          const nextChildren = [...parent.childrenIds];
          const [moved] = nextChildren.splice(idx, 1);
          nextChildren.splice(targetIdx, 0, moved!);

          commitDoc({
            ...doc,
            nodes: {
              ...doc.nodes,
              [parent.id]: { ...parent, childrenIds: nextChildren },
            },
          });
        } else {
          const idx = doc.rootIds.indexOf(nodeId);
          if (idx === -1) return;
          const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
          if (targetIdx < 0 || targetIdx >= doc.rootIds.length) return;

          const nextRootIds = [...doc.rootIds];
          const [moved] = nextRootIds.splice(idx, 1);
          nextRootIds.splice(targetIdx, 0, moved!);

          commitDoc({
            ...doc,
            rootIds: nextRootIds,
          });
        }
      },

      duplicateNode: (nodeId) => {
        const { doc } = get();
        const node = doc.nodes[nodeId];
        if (!node) return null;

        const clonedSubTree: Record<NodeId, TectaNode> = {};
        const clonedRootId = cloneSubtree(
          nodeId,
          doc.nodes,
          node.parentId,
          clonedSubTree
        );
        if (!clonedRootId) return null;

        const nextNodes = { ...doc.nodes, ...clonedSubTree };

        if (node.parentId && nextNodes[node.parentId]) {
          const parent = nextNodes[node.parentId]!;
          const idx = parent.childrenIds.indexOf(nodeId);
          const nextChildren = [...parent.childrenIds];
          nextChildren.splice(idx + 1, 0, clonedRootId);
          nextNodes[parent.id] = { ...parent, childrenIds: nextChildren };

          commitDoc(
            {
              ...doc,
              nodes: nextNodes,
            },
            clonedRootId
          );
        } else {
          const idx = doc.rootIds.indexOf(nodeId);
          const nextRootIds = [...doc.rootIds];
          nextRootIds.splice(idx + 1, 0, clonedRootId);

          commitDoc(
            {
              ...doc,
              rootIds: nextRootIds,
              nodes: nextNodes,
            },
            clonedRootId
          );
        }

        return clonedRootId;
      },

      deleteNode: (nodeId) => {
        const { doc, selectedNodeId } = get();
        const node = doc.nodes[nodeId];
        if (!node) return;

        const idsToDelete = new Set<NodeId>();
        collectSubtreeIds(nodeId, doc.nodes, idsToDelete);

        const nextNodes: Record<NodeId, TectaNode> = {};
        for (const [id, n] of Object.entries(doc.nodes)) {
          if (!idsToDelete.has(id)) {
            nextNodes[id] = n;
          }
        }

        let nextRootIds = doc.rootIds;
        if (node.parentId && nextNodes[node.parentId]) {
          const parent = nextNodes[node.parentId]!;
          nextNodes[parent.id] = {
            ...parent,
            childrenIds: parent.childrenIds.filter((cid) => cid !== nodeId),
          };
        } else {
          nextRootIds = doc.rootIds.filter((rid) => rid !== nodeId);
        }

        const nextSelected =
          selectedNodeId && idsToDelete.has(selectedNodeId)
            ? (node.parentId ?? nextRootIds[0] ?? null)
            : selectedNodeId;

        commitDoc(
          {
            ...doc,
            rootIds: nextRootIds,
            nodes: nextNodes,
          },
          nextSelected
        );
      },

      undo: () => {
        const { past, doc, future, pages, activeProjectId, projects } = get();
        if (past.length === 0) return;

        const previous = past[past.length - 1]!;
        const nextPast = past.slice(0, past.length - 1);
        const nextFuture = [doc, ...future];
        const nextPages = { ...pages, [previous.id]: previous };

        let nextProjects = projects;
        if (activeProjectId && projects[activeProjectId]) {
          const updated = {
            ...projects[activeProjectId]!,
            pages: nextPages,
            activePageId: previous.id,
            updatedAt: Date.now(),
          };
          nextProjects = { ...projects, [activeProjectId]: updated };
          persistProjectsAsync(nextProjects);
        }

        set({
          doc: previous,
          pages: nextPages,
          activePageId: previous.id,
          past: nextPast,
          future: nextFuture,
          selectedNodeId: previous.rootIds[0] ?? null,
          projects: nextProjects,
        });
      },

      redo: () => {
        const { future, doc, past, pages, activeProjectId, projects } = get();
        if (future.length === 0) return;

        const next = future[0]!;
        const nextFuture = future.slice(1);
        const nextPast = [...past, doc];
        const nextPages = { ...pages, [next.id]: next };

        let nextProjects = projects;
        if (activeProjectId && projects[activeProjectId]) {
          const updated = {
            ...projects[activeProjectId]!,
            pages: nextPages,
            activePageId: next.id,
            updatedAt: Date.now(),
          };
          nextProjects = { ...projects, [activeProjectId]: updated };
          persistProjectsAsync(nextProjects);
        }

        set({
          doc: next,
          pages: nextPages,
          activePageId: next.id,
          past: nextPast,
          future: nextFuture,
          selectedNodeId: next.rootIds[0] ?? null,
          projects: nextProjects,
        });
      },

      resetToStarter: () => {
        const starter = createStarterDocument();
        const { pages, activeProjectId, projects } = get();
        const nextPages = { ...pages, [starter.id]: starter };

        let nextProjects = projects;
        if (activeProjectId && projects[activeProjectId]) {
          const updated = {
            ...projects[activeProjectId]!,
            pages: nextPages,
            activePageId: starter.id,
            updatedAt: Date.now(),
          };
          nextProjects = { ...projects, [activeProjectId]: updated };
          persistProjectsAsync(nextProjects);
        }

        set({
          doc: starter,
          pages: nextPages,
          activePageId: starter.id,
          past: [],
          future: [],
          selectedNodeId: starter.rootIds[0] ?? null,
          projects: nextProjects,
        });
      },
    };
  })
);
