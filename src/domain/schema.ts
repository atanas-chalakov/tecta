export type NodeId = string;

export type Breakpoint = 'desktop' | 'tablet' | 'mobile';

import type { DesignTokens, ElementPresets } from './presets';
export * from './presets';

export type StudioStep = 1 | 2 | 3;

export interface Project {
  id: string;
  name: string;
  description?: string;
  slug: string;
  activeStep: StudioStep;
  tokens: DesignTokens;
  presets: ElementPresets;
  customComponents: SavedComponent[];
  pages: Record<string, PageDocument>;
  activePageId: string;
  createdAt: number;
  updatedAt: number;
}

export interface SavedComponent {
  id: string;
  name: string;
  category: 'Hero' | 'Features' | 'Pricing' | 'Forms' | 'CTA' | 'Footer' | 'General';
  description?: string;
  rootNode: TectaNode;
  descendants: TectaNode[];
  createdAt: number;
}

export type ElementKind =
  | 'section'
  | 'container'
  | 'flex-row'
  | 'flex-col'
  | 'grid'
  | 'card'
  | 'heading'
  | 'text'
  | 'badge'
  | 'button'
  | 'image'
  | 'input'
  | 'textarea'
  | 'select';

export type HtmlTag =
  | 'section'
  | 'div'
  | 'header'
  | 'footer'
  | 'nav'
  | 'article'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'p'
  | 'span'
  | 'button'
  | 'a'
  | 'img'
  | 'input'
  | 'textarea'
  | 'select';

export interface StyleProps {
  display?: 'block' | 'flex' | 'grid' | 'inline-flex' | 'none';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  alignItems?: 'stretch' | 'flex-start' | 'center' | 'flex-end' | 'baseline';
  flexWrap?: 'nowrap' | 'wrap';
  gridTemplateColumns?: string;
  gap?: string;
  width?: string;
  maxWidth?: string;
  minHeight?: string;
  height?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  color?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: 'left' | 'center' | 'right';
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  borderStyle?: 'none' | 'solid' | 'dashed';
  boxShadow?: string;
  opacity?: string;
}

export type ResponsiveStyles = {
  desktop: StyleProps;
  tablet?: Partial<StyleProps>;
  mobile?: Partial<StyleProps>;
};

export interface TectaNode {
  id: NodeId;
  name: string;
  kind: ElementKind;
  tag: HtmlTag;
  parentId: NodeId | null;
  childrenIds: NodeId[];
  textContent?: string;
  attributes?: {
    href?: string;
    src?: string;
    alt?: string;
    placeholder?: string;
  };
  styles: ResponsiveStyles;
  hidden?: boolean;
  locked?: boolean;
}

export interface PageDocument {
  id: string;
  title: string;
  rootIds: NodeId[];
  nodes: Record<NodeId, TectaNode>;
}

export interface SectionTemplate {
  id: string;
  name: string;
  category: 'Hero' | 'Features' | 'Pricing' | 'CTA' | 'Footer';
  description: string;
  build: () => { rootNode: TectaNode; descendants: TectaNode[] };
}

let idCounter = 1000;
export function createNodeId(prefix = 'node'): NodeId {
  idCounter += 1;
  const randomPart = Math.random().toString(36).slice(2, 7);
  return `${prefix}_${idCounter}_${randomPart}`;
}

export function canAcceptChildren(kind: ElementKind): boolean {
  return (
    kind === 'section' ||
    kind === 'container' ||
    kind === 'flex-row' ||
    kind === 'flex-col' ||
    kind === 'grid' ||
    kind === 'card'
  );
}

export function createPrimitiveNode(
  kind: ElementKind,
  parentId: NodeId | null = null
): TectaNode {
  const id = createNodeId(kind);

  switch (kind) {
    case 'section':
      return {
        id,
        name: 'Section',
        kind,
        tag: 'section',
        parentId,
        childrenIds: [],
        styles: {
          desktop: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            paddingTop: '80px',
            paddingBottom: '80px',
            paddingLeft: '24px',
            paddingRight: '24px',
            backgroundColor: '#09090b',
            color: '#fafafa',
          },
          mobile: {
            paddingTop: '48px',
            paddingBottom: '48px',
            paddingLeft: '16px',
            paddingRight: '16px',
          },
        },
      };

    case 'container':
      return {
        id,
        name: 'Container',
        kind,
        tag: 'div',
        parentId,
        childrenIds: [],
        styles: {
          desktop: {
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            width: '100%',
            maxWidth: '1120px',
            marginLeft: 'auto',
            marginRight: 'auto',
          },
        },
      };

    case 'flex-row':
      return {
        id,
        name: 'Flex Row',
        kind,
        tag: 'div',
        parentId,
        childrenIds: [],
        styles: {
          desktop: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '16px',
            flexWrap: 'wrap',
            width: '100%',
          },
          mobile: {
            flexDirection: 'column',
            alignItems: 'stretch',
          },
        },
      };

    case 'flex-col':
      return {
        id,
        name: 'Flex Stack',
        kind,
        tag: 'div',
        parentId,
        childrenIds: [],
        styles: {
          desktop: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '16px',
            width: '100%',
          },
        },
      };

    case 'grid':
      return {
        id,
        name: 'Bento Grid',
        kind,
        tag: 'div',
        parentId,
        childrenIds: [],
        styles: {
          desktop: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '24px',
            width: '100%',
          },
          tablet: {
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          },
          mobile: {
            gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
          },
        },
      };

    case 'card':
      return {
        id,
        name: 'Surface Card',
        kind,
        tag: 'div',
        parentId,
        childrenIds: [],
        styles: {
          desktop: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            paddingTop: '28px',
            paddingBottom: '28px',
            paddingLeft: '28px',
            paddingRight: '28px',
            backgroundColor: '#18181b',
            borderRadius: '16px',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: '#27272a',
          },
        },
      };

    case 'heading':
      return {
        id,
        name: 'Heading',
        kind,
        tag: 'h2',
        parentId,
        childrenIds: [],
        textContent: 'Engineered for structural speed.',
        styles: {
          desktop: {
            fontSize: '40px',
            fontWeight: '700',
            lineHeight: '1.15',
            letterSpacing: '-0.03em',
            color: '#ffffff',
            marginTop: '0px',
            marginBottom: '0px',
          },
          mobile: {
            fontSize: '28px',
          },
        },
      };

    case 'text':
      return {
        id,
        name: 'Paragraph',
        kind,
        tag: 'p',
        parentId,
        childrenIds: [],
        textContent:
          'Weave responsive layouts with native CSS box-model precision and zero virtual-DOM lag.',
        styles: {
          desktop: {
            fontSize: '17px',
            lineHeight: '1.6',
            color: '#a1a1aa',
            maxWidth: '640px',
            marginTop: '0px',
            marginBottom: '0px',
          },
        },
      };

    case 'badge':
      return {
        id,
        name: 'Pill Badge',
        kind,
        tag: 'span',
        parentId,
        childrenIds: [],
        textContent: 'TECTA STUDIO 1.0',
        styles: {
          desktop: {
            display: 'inline-flex',
            alignItems: 'center',
            paddingTop: '6px',
            paddingBottom: '6px',
            paddingLeft: '14px',
            paddingRight: '14px',
            fontSize: '12px',
            fontWeight: '600',
            letterSpacing: '0.06em',
            color: '#a5b4fc',
            backgroundColor: '#1e1b4b',
            borderRadius: '9999px',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: '#3730a3',
          },
        },
      };

    case 'button':
      return {
        id,
        name: 'CTA Button',
        kind,
        tag: 'a',
        parentId,
        childrenIds: [],
        textContent: 'Start Weaving Free',
        attributes: {
          href: '#get-started',
        },
        styles: {
          desktop: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: '14px',
            paddingBottom: '14px',
            paddingLeft: '24px',
            paddingRight: '24px',
            fontSize: '15px',
            fontWeight: '600',
            color: '#ffffff',
            backgroundColor: '#4f46e5',
            borderRadius: '10px',
          },
        },
      };

    case 'image':
      return {
        id,
        name: 'Visual Image',
        kind,
        tag: 'img',
        parentId,
        childrenIds: [],
        attributes: {
          src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          alt: 'Abstract structural architecture',
        },
        styles: {
          desktop: {
            display: 'block',
            width: '100%',
            height: '320px',
            borderRadius: '16px',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: '#27272a',
          },
        },
      };

    case 'input':
      return {
        id,
        name: 'Text Input',
        kind,
        tag: 'input',
        parentId,
        childrenIds: [],
        attributes: {
          placeholder: 'Enter text here...',
        },
        styles: {
          desktop: {
            display: 'block',
            width: '100%',
            paddingTop: '10px',
            paddingBottom: '10px',
            paddingLeft: '14px',
            paddingRight: '14px',
            fontSize: '14px',
            color: '#fafafa',
            backgroundColor: '#18181b',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: '#27272a',
            borderRadius: '8px',
          },
        },
      };

    case 'textarea':
      return {
        id,
        name: 'Textarea',
        kind,
        tag: 'textarea',
        parentId,
        childrenIds: [],
        textContent: 'Write your message...',
        styles: {
          desktop: {
            display: 'block',
            width: '100%',
            minHeight: '96px',
            paddingTop: '10px',
            paddingBottom: '10px',
            paddingLeft: '14px',
            paddingRight: '14px',
            fontSize: '14px',
            color: '#fafafa',
            backgroundColor: '#18181b',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: '#27272a',
            borderRadius: '8px',
          },
        },
      };

    case 'select':
      return {
        id,
        name: 'Dropdown Select',
        kind,
        tag: 'select',
        parentId,
        childrenIds: [],
        textContent: 'Option 1',
        styles: {
          desktop: {
            display: 'block',
            width: '100%',
            paddingTop: '10px',
            paddingBottom: '10px',
            paddingLeft: '14px',
            paddingRight: '14px',
            fontSize: '14px',
            color: '#fafafa',
            backgroundColor: '#18181b',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: '#27272a',
            borderRadius: '8px',
          },
        },
      };
  }
}

export const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    id: 'tpl-hero-tectonic',
    name: 'Tectonic Hero Section',
    category: 'Hero',
    description: 'High-contrast centered hero with pill badge, display headline, subtitle, and dual CTA buttons.',
    build: () => {
      const section = createPrimitiveNode('section', null);
      section.name = 'Hero Section';
      section.styles.desktop = {
        ...section.styles.desktop,
        paddingTop: '96px',
        paddingBottom: '96px',
        backgroundColor: '#09090b',
        backgroundImage: 'radial-gradient(circle at 50% 0%, #1e1b4b 0%, #09090b 65%)',
      };

      const container = createPrimitiveNode('container', section.id);
      container.name = 'Hero Container';
      container.styles.desktop = {
        ...container.styles.desktop,
        alignItems: 'center',
        textAlign: 'center',
        gap: '24px',
      };

      const badge = createPrimitiveNode('badge', container.id);
      badge.textContent = '120FPS DIRECT-CSSOM ENGINE';

      const heading = createPrimitiveNode('heading', container.id);
      heading.tag = 'h1';
      heading.name = 'Hero Headline';
      heading.textContent = 'Weave structural websites at the speed of thought.';
      heading.styles.desktop = {
        ...heading.styles.desktop,
        fontSize: '56px',
        maxWidth: '840px',
        textAlign: 'center',
      };
      heading.styles.mobile = {
        fontSize: '36px',
      };

      const subtext = createPrimitiveNode('text', container.id);
      subtext.name = 'Hero Subheadline';
      subtext.textContent =
        'Tecta blends Webflow-grade CSS box-model control with instant pre-built sections—powered by a zero-lag Constructable Stylesheet canvas.';
      subtext.styles.desktop = {
        ...subtext.styles.desktop,
        fontSize: '19px',
        textAlign: 'center',
        maxWidth: '660px',
      };

      const actions = createPrimitiveNode('flex-row', container.id);
      actions.name = 'Hero Actions';
      actions.styles.desktop = {
        ...actions.styles.desktop,
        justifyContent: 'center',
        gap: '14px',
        marginTop: '8px',
      };

      const primaryBtn = createPrimitiveNode('button', actions.id);
      primaryBtn.name = 'Primary CTA';
      primaryBtn.textContent = 'Launch Studio';

      const secondaryBtn = createPrimitiveNode('button', actions.id);
      secondaryBtn.name = 'Secondary CTA';
      secondaryBtn.textContent = 'Explore Architecture';
      secondaryBtn.styles.desktop = {
        ...secondaryBtn.styles.desktop,
        backgroundColor: '#18181b',
        color: '#e4e4e7',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '#3f3f46',
      };

      actions.childrenIds = [primaryBtn.id, secondaryBtn.id];
      container.childrenIds = [badge.id, heading.id, subtext.id, actions.id];
      section.childrenIds = [container.id];

      return {
        rootNode: section,
        descendants: [container, badge, heading, subtext, actions, primaryBtn, secondaryBtn],
      };
    },
  },
  {
    id: 'tpl-bento-features',
    name: '3-Column Bento Grid',
    category: 'Features',
    description: 'Responsive 3-card feature grid with dark zinc surfaces and crisp borders.',
    build: () => {
      const section = createPrimitiveNode('section', null);
      section.name = 'Features Section';
      section.styles.desktop = {
        ...section.styles.desktop,
        paddingTop: '72px',
        paddingBottom: '72px',
        backgroundColor: '#09090b',
      };

      const container = createPrimitiveNode('container', section.id);
      container.name = 'Features Container';
      container.styles.desktop = {
        ...container.styles.desktop,
        gap: '40px',
      };

      const headerStack = createPrimitiveNode('flex-col', container.id);
      headerStack.name = 'Section Header';
      headerStack.styles.desktop = {
        ...headerStack.styles.desktop,
        alignItems: 'flex-start',
        gap: '12px',
      };

      const heading = createPrimitiveNode('heading', headerStack.id);
      heading.textContent = 'Built for zero-latency design.';
      heading.styles.desktop = {
        ...heading.styles.desktop,
        fontSize: '36px',
      };

      const subtitle = createPrimitiveNode('text', headerStack.id);
      subtitle.textContent =
        'Every element compiles directly to native CSS rules without wrapper div bloat.';

      headerStack.childrenIds = [heading.id, subtitle.id];

      const grid = createPrimitiveNode('grid', container.id);
      grid.name = 'Features Grid';

      const cardsData = [
        {
          title: 'Direct CSSOM Scrubbing',
          body: 'Drag spacing and typography sliders at 120fps. Styles mutate live CSSStyleSheet rules before React ever re-renders.',
        },
        {
          title: 'O(1) Flat Node Graph',
          body: 'Pages are indexed in a normalized hash map so updating a deeply nested button never reconciles the rest of your page.',
        },
        {
          title: 'Pure Semantic Export',
          body: 'Compile your visual tree into clean, hand-crafted HTML5 and responsive media-query CSS with zero runtime lock-in.',
        },
      ];

      const descendants: TectaNode[] = [container, headerStack, heading, subtitle, grid];

      for (const item of cardsData) {
        const card = createPrimitiveNode('card', grid.id);
        card.name = item.title;

        const cardTitle = createPrimitiveNode('heading', card.id);
        cardTitle.tag = 'h3';
        cardTitle.name = 'Card Title';
        cardTitle.textContent = item.title;
        cardTitle.styles.desktop = {
          ...cardTitle.styles.desktop,
          fontSize: '20px',
        };

        const cardBody = createPrimitiveNode('text', card.id);
        cardBody.name = 'Card Body';
        cardBody.textContent = item.body;
        cardBody.styles.desktop = {
          ...cardBody.styles.desktop,
          fontSize: '15px',
        };

        card.childrenIds = [cardTitle.id, cardBody.id];
        grid.childrenIds.push(card.id);
        descendants.push(card, cardTitle, cardBody);
      }

      container.childrenIds = [headerStack.id, grid.id];
      section.childrenIds = [container.id];

      return { rootNode: section, descendants };
    },
  },
  {
    id: 'tpl-cta-banner',
    name: 'Gradient CTA Banner',
    category: 'CTA',
    description: 'High-converting call-to-action card with indigo gradient accent and action button.',
    build: () => {
      const section = createPrimitiveNode('section', null);
      section.name = 'CTA Section';
      section.styles.desktop = {
        ...section.styles.desktop,
        paddingTop: '64px',
        paddingBottom: '80px',
        backgroundColor: '#09090b',
      };

      const container = createPrimitiveNode('container', section.id);
      const card = createPrimitiveNode('card', container.id);
      card.name = 'CTA Banner Box';
      card.styles.desktop = {
        ...card.styles.desktop,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '48px',
        paddingBottom: '48px',
        paddingLeft: '48px',
        paddingRight: '48px',
        backgroundColor: '#1e1b4b',
        borderColor: '#4338ca',
        borderRadius: '24px',
      };
      card.styles.mobile = {
        flexDirection: 'column',
        alignItems: 'flex-start',
        paddingTop: '32px',
        paddingBottom: '32px',
        paddingLeft: '24px',
        paddingRight: '24px',
      };

      const textStack = createPrimitiveNode('flex-col', card.id);
      textStack.name = 'CTA Copy';
      textStack.styles.desktop = {
        ...textStack.styles.desktop,
        gap: '8px',
        width: 'auto',
      };

      const heading = createPrimitiveNode('heading', textStack.id);
      heading.textContent = 'Ready to ship your next site?';
      heading.styles.desktop = {
        ...heading.styles.desktop,
        fontSize: '30px',
      };

      const sub = createPrimitiveNode('text', textStack.id);
      sub.textContent = 'Export production-ready HTML & CSS in one click.';
      sub.styles.desktop = {
        ...sub.styles.desktop,
        color: '#c7d2fe',
      };

      const btn = createPrimitiveNode('button', card.id);
      btn.textContent = 'Export Website Code';
      btn.styles.desktop = {
        ...btn.styles.desktop,
        backgroundColor: '#ffffff',
        color: '#1e1b4b',
      };

      textStack.childrenIds = [heading.id, sub.id];
      card.childrenIds = [textStack.id, btn.id];
      container.childrenIds = [card.id];
      section.childrenIds = [container.id];

      return {
        rootNode: section,
        descendants: [container, card, textStack, heading, sub, btn],
      };
    },
  },
];

export function createStarterDocument(): PageDocument {
  const nodes: Record<NodeId, TectaNode> = {};
  const rootIds: NodeId[] = [];

  for (const tpl of SECTION_TEMPLATES) {
    const { rootNode, descendants } = tpl.build();
    rootIds.push(rootNode.id);
    nodes[rootNode.id] = rootNode;
    for (const d of descendants) {
      nodes[d.id] = d;
    }
  }

  return {
    id: 'page_home',
    title: 'Home — Tecta Landing',
    rootIds,
    nodes,
  };
}
