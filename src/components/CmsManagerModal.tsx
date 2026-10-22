import { useState } from 'react';
import {
  CheckCircle2,
  Database,
  FileText,
  FolderPlus,
  LayoutGrid,
  Package,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import type { CmsItem } from '../domain/schema';
import { useDocumentStore } from '../store/documentStore';

interface CmsManagerModalProps {
  onClose: () => void;
}

export function CmsManagerModal({ onClose }: CmsManagerModalProps) {
  const cmsCollections = useDocumentStore((s) => s.cmsCollections);
  const activeCmsCollectionId = useDocumentStore((s) => s.activeCmsCollectionId);
  const setActiveCmsCollection = useDocumentStore((s) => s.setActiveCmsCollection);
  const createCmsCollection = useDocumentStore((s) => s.createCmsCollection);
  const upsertCmsItem = useDocumentStore((s) => s.upsertCmsItem);
  const deleteCmsItem = useDocumentStore((s) => s.deleteCmsItem);
  const insertCmsCollectionSection = useDocumentStore(
    (s) => s.insertCmsCollectionSection
  );

  const activeCollection =
    cmsCollections.find((c) => c.id === activeCmsCollectionId) ??
    cmsCollections[0];

  const [editingItem, setEditingItem] = useState<CmsItem | null>(null);
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formStatus, setFormStatus] = useState<'published' | 'draft'>('published');

  const [isCreatingCol, setIsCreatingCol] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColSingular, setNewColSingular] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2600);
  };

  const startNewItem = () => {
    if (!activeCollection) return;
    const defaults: Record<string, string> = {};
    for (const f of activeCollection.fields) {
      if (f.key === 'category') defaults[f.key] = 'NEW';
      else if (f.key === 'price') defaults[f.key] = '$39';
      else if (f.key === 'date') defaults[f.key] = 'Oct 21, 2026';
      else if (f.key === 'ctaLabel')
        defaults[f.key] =
          activeCollection.icon === 'products'
            ? 'Buy Now'
            : `Read ${activeCollection.singularName} →`;
      else if (f.key === 'image')
        defaults[f.key] =
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80';
      else defaults[f.key] = '';
    }
    setEditingItem(null);
    setFormValues(defaults);
    setFormStatus('published');
    setIsCreatingItem(true);
  };

  const startEditItem = (item: CmsItem) => {
    setEditingItem(item);
    setFormValues({ ...item.values });
    setFormStatus(item.status);
    setIsCreatingItem(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCollection) return;

    const title = formValues.title?.trim() || `Untitled ${activeCollection.singularName}`;
    const slug =
      formValues.slug?.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    upsertCmsItem(activeCollection.id, {
      id: editingItem?.id,
      status: formStatus,
      values: {
        ...formValues,
        title,
        slug,
      },
    });

    setIsCreatingItem(false);
    setEditingItem(null);
    showToast(
      editingItem
        ? `Updated "${title}" in ${activeCollection.name}`
        : `Added "${title}" to ${activeCollection.name}`
    );
  };

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    createCmsCollection(newColName, newColSingular || 'Item', newColDesc);
    setNewColName('');
    setNewColSingular('');
    setNewColDesc('');
    setIsCreatingCol(false);
    showToast(`Created "${newColName}" CMS Collection`);
  };

  const handleInsertOnCanvas = (columns: 2 | 3) => {
    if (!activeCollection) return;
    insertCmsCollectionSection(activeCollection.id, columns);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-6 select-none">
      <div className="w-full max-w-6xl h-[85vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>Tecta Visual CMS Collections</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Posts · Products · Custom
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Manage dynamic items and drop data-bound collection grids directly onto any page.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {toastMsg && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{toastMsg}</span>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Body: Left Collections List + Right Collection Items / Editor */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left Collections Sidebar */}
          <div className="w-64 border-r border-zinc-800 bg-zinc-900/30 p-3 flex flex-col justify-between shrink-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  Collections ({cmsCollections.length})
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingCol(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </div>

              <div className="space-y-1">
                {cmsCollections.map((col) => {
                  const isActive = col.id === activeCollection?.id;
                  const Icon =
                    col.icon === 'products'
                      ? Package
                      : col.icon === 'posts'
                        ? FileText
                        : Database;
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => {
                        setActiveCmsCollection(col.id);
                        setIsCreatingItem(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/40'
                          : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-4 h-4 shrink-0 text-indigo-400" />
                        <div className="truncate">
                          <div className="text-xs font-semibold">{col.name}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">
                            /{col.slug}
                          </div>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono text-[10px]">
                        {col.items.length}
                      </span>
                    </button>
                  );
                })}
              </div>

              {isCreatingCol && (
                <form
                  onSubmit={handleCreateCollection}
                  className="p-3 rounded-xl bg-zinc-900 border border-zinc-700 space-y-2.5"
                >
                  <div className="text-xs font-semibold text-zinc-200">
                    New Collection
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Portfolio Projects"
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100"
                  />
                  <input
                    type="text"
                    placeholder="Singular (e.g. Project)"
                    value={newColSingular}
                    onChange={(e) => setNewColSingular(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100"
                  />
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium cursor-pointer"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreatingCol(false)}
                      className="px-2.5 py-1.5 rounded-md bg-zinc-800 text-zinc-400 text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>How CMS Binding Works</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Click <strong>Insert Grid on Page</strong> to generate a live responsive section populated with your published items.
              </p>
            </div>
          </div>

          {/* Right Area: Collection Items Table & Form */}
          {activeCollection && (
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              {/* Collection Toolbar */}
              <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between gap-3 bg-zinc-950">
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">
                    {activeCollection.name}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {activeCollection.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleInsertOnCanvas(3)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Insert 3-Col Grid on Page</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInsertOnCanvas(2)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>2-Col Grid</span>
                  </button>

                  <button
                    type="button"
                    onClick={startNewItem}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New {activeCollection.singularName}</span>
                  </button>
                </div>
              </div>

              {/* Items List or Editor Drawer */}
              <div className="flex-1 overflow-y-auto p-5">
                {isCreatingItem ? (
                  <form
                    onSubmit={handleSaveItem}
                    className="max-w-2xl mx-auto bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                      <h4 className="text-sm font-bold text-zinc-100">
                        {editingItem
                          ? `Edit ${activeCollection.singularName}`
                          : `Create New ${activeCollection.singularName}`}
                      </h4>
                      <select
                        value={formStatus}
                        onChange={(e) =>
                          setFormStatus(e.target.value as 'published' | 'draft')
                        }
                        className="px-2.5 py-1 rounded-md text-xs bg-zinc-950 border border-zinc-700 text-zinc-200"
                      >
                        <option value="published">Published (Live)</option>
                        <option value="draft">Draft (Hidden)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {activeCollection.fields.map((field) => {
                        const isFullWidth =
                          field.type === 'richtext' || field.type === 'image';
                        return (
                          <div
                            key={field.id}
                            className={isFullWidth ? 'col-span-2' : 'col-span-1'}
                          >
                            <label className="text-xs font-medium text-zinc-300 block mb-1">
                              {field.label}
                            </label>
                            {field.type === 'richtext' ? (
                              <textarea
                                rows={3}
                                value={formValues[field.key] ?? ''}
                                onChange={(e) =>
                                  setFormValues({
                                    ...formValues,
                                    [field.key]: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500"
                              />
                            ) : (
                              <input
                                type="text"
                                required={field.required}
                                value={formValues[field.key] ?? ''}
                                onChange={(e) =>
                                  setFormValues({
                                    ...formValues,
                                    [field.key]: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setIsCreatingItem(false)}
                        className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                      >
                        Save {activeCollection.singularName}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {activeCollection.items.map((item) => (
                      <div
                        key={item.id}
                        className="group rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-indigo-500/50 overflow-hidden flex flex-col justify-between transition-all"
                      >
                        <div>
                          {item.values.image && (
                            <div className="h-36 w-full bg-zinc-950 overflow-hidden relative">
                              <img
                                src={item.values.image}
                                alt={item.values.title ?? ''}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <span
                                className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase ${
                                  item.status === 'published'
                                    ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-amber-950/90 text-amber-300 border border-amber-500/40'
                                }`}
                              >
                                {item.status}
                              </span>
                            </div>
                          )}

                          <div className="p-4 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              {item.values.category && (
                                <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 font-mono text-[10px] uppercase">
                                  {item.values.category}
                                </span>
                              )}
                              {(item.values.price || item.values.date) && (
                                <span className="text-xs font-mono font-semibold text-zinc-300">
                                  {item.values.price ?? item.values.date}
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm font-bold text-zinc-100 line-clamp-1">
                              {item.values.title}
                            </h4>
                            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                              {item.values.excerpt}
                            </p>
                          </div>
                        </div>

                        <div className="px-4 py-2.5 border-t border-zinc-800/80 bg-zinc-950/50 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-zinc-500 truncate">
                            /{activeCollection.slug}/{item.values.slug}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => startEditItem(item)}
                              className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-medium cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                deleteCmsItem(activeCollection.id, item.id)
                              }
                              className="p-1 rounded hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
