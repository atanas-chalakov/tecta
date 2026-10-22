import {
  createNodeId,
  createPrimitiveNode,
  type NodeId,
  type TectaNode,
} from './schema';

export type CmsFieldType =
  | 'text'
  | 'slug'
  | 'price'
  | 'badge'
  | 'image'
  | 'date'
  | 'richtext'
  | 'url';

export interface CmsField {
  id: string;
  key: string;
  label: string;
  type: CmsFieldType;
  required?: boolean;
}

export interface CmsItem {
  id: string;
  status: 'published' | 'draft';
  values: Record<string, string>;
  createdAt: number;
  updatedAt: number;
}

export interface CmsCollection {
  id: string;
  name: string;
  singularName: string;
  slug: string;
  icon: 'posts' | 'products' | 'portfolio' | 'custom';
  description: string;
  fields: CmsField[];
  items: CmsItem[];
}

export function createDefaultCmsCollections(): CmsCollection[] {
  const now = Date.now();

  const postsCollection: CmsCollection = {
    id: 'cms_posts',
    name: 'Blog Posts',
    singularName: 'Post',
    slug: 'posts',
    icon: 'posts',
    description: 'Articles, release notes, and editorial updates.',
    fields: [
      { id: 'f_title', key: 'title', label: 'Post Title', type: 'text', required: true },
      { id: 'f_slug', key: 'slug', label: 'URL Slug', type: 'slug', required: true },
      { id: 'f_category', key: 'category', label: 'Category Tag', type: 'badge' },
      { id: 'f_date', key: 'date', label: 'Publish Date', type: 'date' },
      { id: 'f_excerpt', key: 'excerpt', label: 'Summary Excerpt', type: 'richtext' },
      { id: 'f_image', key: 'image', label: 'Cover Image URL', type: 'image' },
      { id: 'f_cta', key: 'ctaLabel', label: 'Link Label', type: 'text' },
    ],
    items: [
      {
        id: 'post_1',
        status: 'published',
        createdAt: now - 86400000 * 5,
        updatedAt: now - 86400000 * 5,
        values: {
          title: 'Designing at 120fps with Constructable Stylesheets',
          slug: 'designing-at-120fps-cssom',
          category: 'ARCHITECTURE',
          date: 'Oct 18, 2026',
          excerpt:
            'How bypassing Virtual DOM reconciliation during style scrubbing eliminates layout lag in modern web studios.',
          image:
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80',
          ctaLabel: 'Read Article →',
        },
      },
      {
        id: 'post_2',
        status: 'published',
        createdAt: now - 86400000 * 3,
        updatedAt: now - 86400000 * 3,
        values: {
          title: 'The Art of Typographic Hierarchy on the Web',
          slug: 'typographic-hierarchy-guide',
          category: 'DESIGN SYSTEMS',
          date: 'Oct 20, 2026',
          excerpt:
            'Pairing high-contrast display serifs with geometric sans-serif body text for effortless readability.',
          image:
            'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=900&q=80',
          ctaLabel: 'Read Article →',
        },
      },
      {
        id: 'post_3',
        status: 'published',
        createdAt: now - 86400000,
        updatedAt: now - 86400000,
        values: {
          title: 'Zero-Runtime Static HTML Export for High SEO Scores',
          slug: 'zero-runtime-static-export',
          category: 'PERFORMANCE',
          date: 'Oct 21, 2026',
          excerpt:
            'Why compiling visual node trees into pure semantic HTML5 and CSS media queries beats heavy client bundles.',
          image:
            'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=80',
          ctaLabel: 'Read Article →',
        },
      },
    ],
  };

  const productsCollection: CmsCollection = {
    id: 'cms_products',
    name: 'Products & Store',
    singularName: 'Product',
    slug: 'products',
    icon: 'products',
    description: 'Digital goods, SaaS plans, or physical merchandise.',
    fields: [
      { id: 'p_title', key: 'title', label: 'Product Name', type: 'text', required: true },
      { id: 'p_slug', key: 'slug', label: 'Product Slug', type: 'slug', required: true },
      { id: 'p_price', key: 'price', label: 'Price', type: 'price', required: true },
      { id: 'p_badge', key: 'category', label: 'Badge / Tier', type: 'badge' },
      { id: 'p_excerpt', key: 'excerpt', label: 'Short Description', type: 'richtext' },
      { id: 'p_image', key: 'image', label: 'Product Image URL', type: 'image' },
      { id: 'p_cta', key: 'ctaLabel', label: 'Button Text', type: 'text' },
    ],
    items: [
      {
        id: 'prod_1',
        status: 'published',
        createdAt: now - 86400000 * 4,
        updatedAt: now - 86400000 * 4,
        values: {
          title: 'Tectonic UI Kit Pro',
          slug: 'tectonic-ui-kit-pro',
          price: '$49',
          category: 'BESTSELLER',
          excerpt:
            'Over 120 responsive dark-mode sections, bento grids, and glassmorphic surface tokens.',
          image:
            'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=900&q=80',
          ctaLabel: 'Buy Now — $49',
        },
      },
      {
        id: 'prod_2',
        status: 'published',
        createdAt: now - 86400000 * 2,
        updatedAt: now - 86400000 * 2,
        values: {
          title: 'kinetic.css Micro-Interactions',
          slug: 'kinetic-css-pack',
          price: '$29',
          category: 'NEW RELEASE',
          excerpt:
            'Hardware-accelerated hover states, glowing borders, and smooth reveal transitions in pure CSS.',
          image:
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80',
          ctaLabel: 'Buy Now — $29',
        },
      },
      {
        id: 'prod_3',
        status: 'published',
        createdAt: now - 3600000 * 12,
        updatedAt: now - 3600000 * 12,
        values: {
          title: 'Studio Agency License',
          slug: 'studio-agency-license',
          price: '$149',
          category: 'UNLIMITED',
          excerpt:
            'Unlimited client projects, custom webfont hosting, and priority AI design copilot presets.',
          image:
            'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=80',
          ctaLabel: 'Get Agency License',
        },
      },
    ],
  };

  return [postsCollection, productsCollection];
}

/**
 * Compiles a CMS Collection into a complete, responsive TectaNode section subtree.
 * Each published item becomes a styled Card inside a responsive CSS Grid so users
 * can visually inspect, restyle borders/backgrounds/fonts, and export static HTML/CSS.
 */
export function buildCmsCollectionSection(
  collection: CmsCollection,
  options?: {
    columns?: 2 | 3;
    accentColor?: string;
    surfaceColor?: string;
    borderColor?: string;
  }
): { rootNode: TectaNode; descendants: TectaNode[] } {
  const cols = options?.columns ?? 3;
  const accent = options?.accentColor ?? '#4f46e5';
  const surface = options?.surfaceColor ?? '#18181b';
  const border = options?.borderColor ?? '#27272a';

  const section = createPrimitiveNode('section', null);
  section.name = `CMS: ${collection.name}`;
  section.attributes = {
    ...section.attributes,
    placeholder: `cms:${collection.id}`,
  };
  section.styles.desktop = {
    ...section.styles.desktop,
    paddingTop: '80px',
    paddingBottom: '80px',
    backgroundColor: '#09090b',
  };

  const container = createPrimitiveNode('container', section.id);
  container.name = `${collection.name} Container`;
  container.styles.desktop = {
    ...container.styles.desktop,
    gap: '36px',
  };

  const headerRow = createPrimitiveNode('flex-col', container.id);
  headerRow.name = `${collection.name} Header`;
  headerRow.styles.desktop = {
    ...headerRow.styles.desktop,
    gap: '10px',
  };

  const badge = createPrimitiveNode('badge', headerRow.id);
  badge.name = 'Collection Tag';
  badge.textContent = `CMS COLLECTION · ${collection.name.toUpperCase()}`;

  const heading = createPrimitiveNode('heading', headerRow.id);
  heading.name = `${collection.name} Heading`;
  heading.textContent = collection.name;
  heading.styles.desktop = {
    ...heading.styles.desktop,
    fontSize: '36px',
  };

  const sub = createPrimitiveNode('text', headerRow.id);
  sub.name = `${collection.name} Description`;
  sub.textContent = collection.description;

  headerRow.childrenIds = [badge.id, heading.id, sub.id];

  const grid = createPrimitiveNode('grid', container.id);
  grid.name = `${collection.name} Grid`;
  grid.styles.desktop = {
    ...grid.styles.desktop,
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    gap: '24px',
  };

  const descendants: TectaNode[] = [
    container,
    headerRow,
    badge,
    heading,
    sub,
    grid,
  ];

  const publishedItems = collection.items.filter((i) => i.status === 'published');

  for (const item of publishedItems) {
    const card = createPrimitiveNode('card', grid.id);
    card.id = createNodeId('cms_card');
    card.name = `${collection.singularName}: ${item.values.title ?? 'Item'}`;
    card.styles.desktop = {
      ...card.styles.desktop,
      paddingTop: '0px',
      paddingBottom: '24px',
      paddingLeft: '0px',
      paddingRight: '0px',
      backgroundColor: surface,
      borderColor: border,
      borderRadius: '16px',
      gap: '0px',
    };

    const cardChildren: NodeId[] = [];

    if (item.values.image) {
      const img = createPrimitiveNode('image', card.id);
      img.name = 'Item Cover';
      img.attributes = {
        src: item.values.image,
        alt: item.values.title ?? collection.singularName,
      };
      img.styles.desktop = {
        ...img.styles.desktop,
        height: '200px',
        width: '100%',
        borderRadius: '15px 15px 0 0',
        borderWidth: '0px',
      };
      cardChildren.push(img.id);
      descendants.push(img);
    }

    const bodyStack = createPrimitiveNode('flex-col', card.id);
    bodyStack.name = 'Card Content';
    bodyStack.styles.desktop = {
      ...bodyStack.styles.desktop,
      paddingTop: '22px',
      paddingLeft: '24px',
      paddingRight: '24px',
      gap: '12px',
    };

    const metaRow = createPrimitiveNode('flex-row', bodyStack.id);
    metaRow.name = 'Item Meta';
    metaRow.styles.desktop = {
      ...metaRow.styles.desktop,
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '8px',
    };

    const metaChildren: NodeId[] = [];

    if (item.values.category) {
      const itemBadge = createPrimitiveNode('badge', metaRow.id);
      itemBadge.name = 'Category Badge';
      itemBadge.textContent = item.values.category;
      metaChildren.push(itemBadge.id);
      descendants.push(itemBadge);
    }

    if (item.values.price || item.values.date) {
      const priceOrDate = createPrimitiveNode('text', metaRow.id);
      priceOrDate.tag = 'span';
      priceOrDate.name = item.values.price ? 'Price Tag' : 'Publish Date';
      priceOrDate.textContent = item.values.price ?? item.values.date ?? '';
      priceOrDate.styles.desktop = {
        ...priceOrDate.styles.desktop,
        fontSize: item.values.price ? '18px' : '12px',
        fontWeight: item.values.price ? '700' : '500',
        color: item.values.price ? '#ffffff' : '#71717a',
      };
      metaChildren.push(priceOrDate.id);
      descendants.push(priceOrDate);
    }

    metaRow.childrenIds = metaChildren;

    const itemTitle = createPrimitiveNode('heading', bodyStack.id);
    itemTitle.tag = 'h3';
    itemTitle.name = 'Item Title';
    itemTitle.textContent = item.values.title ?? 'Untitled';
    itemTitle.styles.desktop = {
      ...itemTitle.styles.desktop,
      fontSize: '20px',
      lineHeight: '1.3',
    };

    const itemExcerpt = createPrimitiveNode('text', bodyStack.id);
    itemExcerpt.name = 'Item Summary';
    itemExcerpt.textContent = item.values.excerpt ?? '';
    itemExcerpt.styles.desktop = {
      ...itemExcerpt.styles.desktop,
      fontSize: '14px',
      lineHeight: '1.55',
      color: '#a1a1aa',
    };

    bodyStack.childrenIds = [metaRow.id, itemTitle.id, itemExcerpt.id];
    descendants.push(bodyStack, metaRow, itemTitle, itemExcerpt);

    if (item.values.ctaLabel) {
      const cta = createPrimitiveNode('button', bodyStack.id);
      cta.name = 'Item Action';
      cta.textContent = item.values.ctaLabel;
      cta.attributes = {
        href: `/${collection.slug}/${item.values.slug ?? item.id}`,
      };
      cta.styles.desktop = {
        ...cta.styles.desktop,
        paddingTop: '10px',
        paddingBottom: '10px',
        paddingLeft: '16px',
        paddingRight: '16px',
        fontSize: '13px',
        backgroundColor: accent,
        borderRadius: '8px',
        marginTop: '6px',
      };
      bodyStack.childrenIds.push(cta.id);
      descendants.push(cta);
    }

    cardChildren.push(bodyStack.id);
    card.childrenIds = cardChildren;
    grid.childrenIds.push(card.id);
    descendants.push(card);
  }

  container.childrenIds = [headerRow.id, grid.id];
  section.childrenIds = [container.id];

  return { rootNode: section, descendants };
}
