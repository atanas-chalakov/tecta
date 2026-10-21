import { describe, expect, it, beforeEach } from 'vitest';
import {
  camelToKebab,
  compileNodeRule,
  exportPageToCode,
  serializeStyleProps,
} from '../cssomEngine';
import { createPrimitiveNode } from '../../domain/schema';
import { useDocumentStore } from '../../store/documentStore';

describe('Direct-CSSOM Engine & Compiler', () => {
  it('converts camelCase CSS properties to kebab-case', () => {
    expect(camelToKebab('backgroundColor')).toBe('background-color');
    expect(camelToKebab('paddingTop')).toBe('padding-top');
    expect(camelToKebab('gridTemplateColumns')).toBe('grid-template-columns');
  });

  it('serializes style objects and compiles responsive breakpoint rules', () => {
    const node = createPrimitiveNode('heading', null);
    node.styles.desktop = { fontSize: '48px', color: '#ffffff' };
    node.styles.mobile = { fontSize: '28px' };

    const css = compileNodeRule(node, true);
    expect(css).toContain(`.tecta-node-${node.id} { font-size: 48px; color: #ffffff; }`);
    expect(css).toContain(
      `@media (max-width: 479px) { .tecta-node-${node.id} { font-size: 28px; } }`
    );
  });

  it('exports semantic standalone HTML and CSS with fonts and design tokens', () => {
    const doc = useDocumentStore.getState().doc;
    const tokens = useDocumentStore.getState().tokens;
    const exported = exportPageToCode(doc, {
      ...tokens,
      googleFontsLoaded: ['Inter', 'Space Grotesk'],
    });
    expect(exported.html).toContain('<main class="tecta-page">');
    expect(exported.standaloneHtml).toContain('<!DOCTYPE html>');
    expect(exported.standaloneHtml).toContain('fonts.googleapis.com/css2?family=Space%20Grotesk');
    expect(exported.css).toContain('box-sizing: border-box;');
    expect(serializeStyleProps({ gap: '16px' })).toBe('gap: 16px;');
  });
});

describe('O(1) Normalized Document Store', () => {
  beforeEach(() => {
    useDocumentStore.getState().resetToStarter();
  });

  it('updates single node style in O(1) and supports undo/redo', () => {
    const store = useDocumentStore.getState();
    const firstRootId = store.doc.rootIds[0]!;

    store.updateNodeStyle(firstRootId, 'desktop', { paddingTop: '120px' });
    expect(
      useDocumentStore.getState().doc.nodes[firstRootId]?.styles.desktop.paddingTop
    ).toBe('120px');

    useDocumentStore.getState().undo();
    expect(
      useDocumentStore.getState().doc.nodes[firstRootId]?.styles.desktop.paddingTop
    ).toBe('96px');

    useDocumentStore.getState().redo();
    expect(
      useDocumentStore.getState().doc.nodes[firstRootId]?.styles.desktop.paddingTop
    ).toBe('120px');
  });

  it('adds primitive elements, duplicates subtrees, and deletes cleanly', () => {
    const store = useDocumentStore.getState();
    const initialCount = Object.keys(store.doc.nodes).length;

    const newBtnId = store.addPrimitiveElement('button');
    expect(useDocumentStore.getState().doc.nodes[newBtnId]?.kind).toBe('button');

    const dupId = useDocumentStore.getState().duplicateNode(newBtnId);
    expect(dupId).toBeTruthy();
    expect(Object.keys(useDocumentStore.getState().doc.nodes).length).toBe(
      initialCount + 2
    );

    useDocumentStore.getState().deleteNode(newBtnId);
    useDocumentStore.getState().deleteNode(dupId!);
    expect(Object.keys(useDocumentStore.getState().doc.nodes).length).toBe(
      initialCount
    );
  });
});

describe('3-Step Progressive Workflow System', () => {
  beforeEach(() => {
    useDocumentStore.getState().resetToStarter();
    useDocumentStore.getState().resetPresets();
    useDocumentStore.getState().setActiveStep(1);
  });

  it('Step 1: updates element preset design tokens and persists them', () => {
    const store = useDocumentStore.getState();
    expect(store.activeStep).toBe(1);

    // Update primary button preset
    store.updatePresetStyle('button-primary', {
      backgroundColor: '#10b981',
      borderRadius: '24px',
    });

    const updated = useDocumentStore.getState().presets['button-primary'];
    expect(updated.backgroundColor).toBe('#10b981');
    expect(updated.borderRadius).toBe('24px');

    // Reset presets to default
    store.resetPresets();
    const reset = useDocumentStore.getState().presets['button-primary'];
    expect(reset.backgroundColor).toBe('#4f46e5');
  });

  it('Step 1: applies curated color palettes and syncs tokens with element presets', () => {
    const store = useDocumentStore.getState();

    // Apply Cyber Emerald palette
    store.applyColorPalette('emerald-matrix');
    let state = useDocumentStore.getState();
    expect(state.tokens.primaryColor).toBe('#10b981');
    expect(state.tokens.backgroundColor).toBe('#022c22');
    expect(state.presets['button-primary'].backgroundColor).toBe('#10b981');
    expect(state.presets.card.backgroundColor).toBe('#064e3b');

    // Apply Warm Amber palette
    store.applyColorPalette('amber-sunset');
    state = useDocumentStore.getState();
    expect(state.tokens.primaryColor).toBe('#d97706');
    expect(state.tokens.backgroundColor).toBe('#1c1917');
    expect(state.presets['button-primary'].backgroundColor).toBe('#d97706');

    // Manual token update
    store.updateDesignTokens({ primaryColor: '#ec4899', baseRadius: '16px' });
    state = useDocumentStore.getState();
    expect(state.tokens.primaryColor).toBe('#ec4899');
    expect(state.tokens.baseRadius).toBe('16px');
    expect(state.presets['button-primary'].backgroundColor).toBe('#ec4899');
    expect(state.presets['button-primary'].borderRadius).toBe('16px');
  });

  it('Step 1: manages Google Webfonts and syncs typography across headings and body', () => {
    const store = useDocumentStore.getState();

    // Set heading font to Space Grotesk
    store.setGoogleFont('heading', 'Space Grotesk');
    let state = useDocumentStore.getState();
    expect(state.tokens.fontHeading).toBe('Space Grotesk');
    expect(state.tokens.googleFontsLoaded).toContain('Space Grotesk');
    expect(state.presets.h1.fontFamily).toBe('Space Grotesk');
    expect(state.presets.h2.fontFamily).toBe('Space Grotesk');

    // Set body font to Outfit
    store.setGoogleFont('body', 'Outfit');
    state = useDocumentStore.getState();
    expect(state.tokens.fontBody).toBe('Outfit');
    expect(state.tokens.googleFontsLoaded).toContain('Outfit');
    expect(state.presets.body.fontFamily).toBe('Outfit');
    expect(state.presets['button-primary'].fontFamily).toBe('Outfit');
  });

  it('Step 1: uploads, registers, and deletes custom font files', async () => {
    const store = useDocumentStore.getState();

    // Create a mock custom font file
    const mockFile = new File(['mock-woff2-binary-data'], 'BrandAesthetic.woff2', {
      type: 'font/woff2',
    });

    const fontName = await store.uploadCustomFont(mockFile);
    expect(fontName).toBe('BrandAesthetic');

    let state = useDocumentStore.getState();
    const uploaded = state.tokens.customFonts.find((f) => f.name === 'BrandAesthetic');
    expect(uploaded).toBeDefined();
    expect(uploaded?.format).toBe('woff2');
    expect(uploaded?.dataUrl).toContain('data:font/woff2;base64,');

    // Set custom font as heading
    store.setGoogleFont('heading', 'BrandAesthetic');
    state = useDocumentStore.getState();
    expect(state.tokens.fontHeading).toBe('BrandAesthetic');

    // Delete custom font
    store.deleteCustomFont(uploaded!.id);
    state = useDocumentStore.getState();
    expect(state.tokens.customFonts.some((f) => f.name === 'BrandAesthetic')).toBe(false);
  });

  it('Step 2: saves sections into library and inserts them into canvas', () => {
    const store = useDocumentStore.getState();
    store.setActiveStep(2);
    expect(useDocumentStore.getState().activeStep).toBe(2);

    const firstRootId = store.doc.rootIds[0]!;

    // Save current section as reusable component
    const saved = store.saveCurrentSectionAsComponent(
      'Custom Test Hero',
      'Hero',
      firstRootId
    );

    expect(saved).not.toBeNull();
    expect(saved?.name).toBe('Custom Test Hero');
    expect(saved?.category).toBe('Hero');
    expect(saved?.rootNode.kind).toBe('section');
    expect(useDocumentStore.getState().customComponents.length).toBeGreaterThan(0);

    // Insert saved component
    const initialRootCount = useDocumentStore.getState().doc.rootIds.length;
    const insertedId = store.insertCustomComponent(saved!.id);

    expect(insertedId).toBeTruthy();
    expect(useDocumentStore.getState().doc.rootIds.length).toBe(initialRootCount + 1);
    expect(useDocumentStore.getState().doc.nodes[insertedId!]?.name).toBe('Custom Test Hero');

    // Delete custom component from library
    store.deleteCustomComponent(saved!.id);
    expect(
      useDocumentStore.getState().customComponents.some((c) => c.id === saved!.id)
    ).toBe(false);
  });

  it('Step 3: manages multi-page/post structures and isolates page state', () => {
    const store = useDocumentStore.getState();
    store.setActiveStep(3);
    expect(useDocumentStore.getState().activeStep).toBe(3);

    const initialPageId = store.activePageId;

    // Create a new page
    const blogPageId = store.createPage('Blog Post: Launch Day');
    expect(blogPageId).toBeTruthy();
    expect(useDocumentStore.getState().activePageId).toBe(blogPageId);
    expect(useDocumentStore.getState().doc.title).toBe('Blog Post: Launch Day');
    expect(useDocumentStore.getState().doc.rootIds.length).toBe(0);

    // Add a section to the new page
    const addedSectionId = store.insertSectionTemplate('tpl-cta-banner');
    expect(addedSectionId).toBeTruthy();
    expect(useDocumentStore.getState().doc.rootIds.length).toBe(1);

    // Switch back to initial page
    store.switchPage(initialPageId);
    expect(useDocumentStore.getState().activePageId).toBe(initialPageId);
    expect(useDocumentStore.getState().doc.rootIds.length).toBeGreaterThan(1);

    // Switch back to blog page
    store.switchPage(blogPageId);
    expect(useDocumentStore.getState().doc.rootIds.length).toBe(1);

    // Delete the created page
    store.deletePage(blogPageId);
    expect(useDocumentStore.getState().pages[blogPageId]).toBeUndefined();
    expect(useDocumentStore.getState().activePageId).toBe(initialPageId);
  });
});

describe('Higher-Level Multi-Website Projects Manager', () => {
  beforeEach(() => {
    useDocumentStore.getState().closeProject();
  });

  it('starts on projects dashboard and lists starter websites', () => {
    const store = useDocumentStore.getState();
    expect(store.activeProjectId).toBeNull();
    const projectKeys = Object.keys(store.projects);
    expect(projectKeys.length).toBeGreaterThan(0);

    const firstProj = store.projects[projectKeys[0]!]!;
    expect(firstProj.name).toBeTruthy();
    expect(firstProj.activeStep).toBeGreaterThanOrEqual(1);
    expect(firstProj.activeStep).toBeLessThanOrEqual(3);
  });

  it('creates new website project and enters studio at chosen stage', () => {
    const store = useDocumentStore.getState();
    const newId = store.createProject(
      'Fintech Cloud Site',
      'Banking infrastructure platform',
      'saas',
      2
    );

    expect(newId).toBeTruthy();
    const current = useDocumentStore.getState();
    expect(current.activeProjectId).toBe(newId);
    expect(current.activeStep).toBe(2);
    expect(current.projects[newId]?.name).toBe('Fintech Cloud Site');
    expect(current.projects[newId]?.slug).toBe('fintech-cloud-site');
    expect(Object.keys(current.pages).length).toBeGreaterThan(0);
  });

  it('switches between projects and isolates design tokens and pages', () => {
    const store = useDocumentStore.getState();

    // Create Project Alpha
    const idA = store.createProject('Project Alpha', '', 'blank', 1);
    store.updatePresetStyle('button-primary', { backgroundColor: '#ef4444' });
    expect(useDocumentStore.getState().presets['button-primary'].backgroundColor).toBe(
      '#ef4444'
    );

    // Create Project Beta
    const idB = store.createProject('Project Beta', '', 'blank', 1);
    expect(useDocumentStore.getState().presets['button-primary'].backgroundColor).toBe(
      '#4f46e5' // default, not overridden by Alpha
    );

    // Close to dashboard
    store.closeProject();
    expect(useDocumentStore.getState().activeProjectId).toBeNull();

    // Re-open Project Alpha
    store.openProject(idA);
    expect(useDocumentStore.getState().activeProjectId).toBe(idA);
    expect(useDocumentStore.getState().presets['button-primary'].backgroundColor).toBe(
      '#ef4444' // Alpha's customized preset preserved
    );

    // Clean up
    store.deleteProject(idA);
    store.deleteProject(idB);
  });

  it('duplicates and deletes projects cleanly', () => {
    const store = useDocumentStore.getState();
    const id = store.createProject('Template Site', 'Base website', 'saas', 2);

    const dupId = store.duplicateProject(id);
    expect(dupId).toBeTruthy();
    expect(useDocumentStore.getState().projects[dupId]?.name).toBe('Template Site (Copy)');
    expect(useDocumentStore.getState().projects[dupId]?.activeStep).toBe(2);

    store.deleteProject(dupId);
    expect(useDocumentStore.getState().projects[dupId]).toBeUndefined();

    store.deleteProject(id);
    expect(useDocumentStore.getState().projects[id]).toBeUndefined();
  });
});

