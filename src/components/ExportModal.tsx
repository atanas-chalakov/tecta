import { useMemo, useState } from 'react';
import { Check, Copy, Download, X } from 'lucide-react';
import { exportPageToCode } from '../services/cssomEngine';
import { useDocumentStore } from '../store/documentStore';

interface ExportModalProps {
  onClose: () => void;
}

type ExportTab = 'standalone' | 'html' | 'css';

export function ExportModal({ onClose }: ExportModalProps) {
  const doc = useDocumentStore((s) => s.doc);
  const tokens = useDocumentStore((s) => s.tokens);
  const [tab, setTab] = useState<ExportTab>('standalone');
  const [copied, setCopied] = useState(false);

  const exported = useMemo(() => exportPageToCode(doc, tokens), [doc, tokens]);

  const activeCode =
    tab === 'standalone'
      ? exported.standaloneHtml
      : tab === 'html'
        ? exported.html
        : exported.css;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = () => {
    const blob = new Blob([exported.standaloneHtml], {
      type: 'text/html;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tecta-site.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Export Production HTML5 & CSS
            </h2>
            <p className="text-xs text-zinc-400">
              Zero runtime dependencies. Clean semantic markup with responsive media queries.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-5 py-2.5 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
            {(
              [
                { id: 'standalone', label: 'Standalone index.html' },
                { id: 'html', label: 'HTML Markup' },
                { id: 'css', label: 'Responsive CSS' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  tab === item.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .html</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <pre className="flex-1 overflow-auto p-5 text-xs font-mono text-zinc-300 bg-zinc-950 leading-relaxed select-all">
          <code>{activeCode}</code>
        </pre>
      </div>
    </div>
  );
}
