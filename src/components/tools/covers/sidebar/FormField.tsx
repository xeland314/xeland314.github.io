import React, { useState, lazy, Suspense } from "react";
import { BlogCodeBlock } from "../BlogCodeBlock";

const ReactMarkdown = lazy(() => import("react-markdown"));

const CodeBlock = ({ children, className }: { children?: React.ReactNode; className?: string; node?: unknown }) => {
  const isInline = !className;
  if (isInline) {
    return (
      <code className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 font-mono text-[0.9em] text-blue-400">
        {children}
      </code>
    );
  }
  const lang = (className || "").replace("language-", "");
  const codeString = Array.isArray(children) ? String(children.join("")) : String(children || "");
  return (
    <div className="my-4">
      <BlogCodeBlock code={codeString} language={lang || "text"} />
    </div>
  );
};

export interface EditorProps<T> {
  slide: T;
  updateSlide: (id: string, data: Partial<T>) => void;
}

export const Input = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div>
    {label && (
      <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
        {label}
      </label>
    )}
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 outline-none focus:border-blue-500 text-sm"
    />
  </div>
);

export const Textarea = ({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) => (
  <div>
    {label && (
      <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
        {label}
      </label>
    )}
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 outline-none focus:border-blue-500 resize-none text-sm"
    />
  </div>
);

export const Select = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}) => (
  <div>
    {label && (
      <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
        {label}
      </label>
    )}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 outline-none focus:border-blue-500 text-sm"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export const ImageUpload = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div>
    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
      {label}
    </label>
    <div className="flex gap-2">
      <div className="flex-1">
        <Input
          label=""
          value={value}
          onChange={(v) => onChange(v)}
        />
      </div>
      <label className="cursor-pointer">
        <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-600 h-full flex items-center">
          SUBIR
        </div>
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (ev) => onChange(ev.target?.result as string);
              reader.readAsDataURL(file);
            }
          }}
        />
      </label>
    </div>
  </div>
);

export const ListEditor = ({
  items,
  onChange,
  onAdd,
  renderItem,
}: {
  items: number[];
  onChange: (idx: number, value: any) => void;
  onAdd: () => void;
  renderItem: (idx: number) => React.ReactNode;
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-gray-500">
        Items ({items.length})
      </label>
      <button
        type="button"
        onClick={onAdd}
        className="px-3 py-1 text-xs font-bold rounded bg-blue-500 text-white hover:bg-blue-600"
      >
        Añadir
      </button>
    </div>
    {items.map((_, idx) => renderItem(idx))}
  </div>
);

export const MarkdownTextarea = ({
  label,
  value,
  onChange,
  rows = 5,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) => {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        {label && (
          <label className="text-xs font-bold text-gray-500 uppercase block">
            {label}
          </label>
        )}
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border transition-colors ${
            showPreview
              ? "bg-blue-500 text-white border-blue-500"
              : "text-gray-400 border-gray-300 dark:border-gray-600 hover:border-blue-500"
          }`}
        >
          {showPreview ? "Editar" : "Preview"}
        </button>
      </div>
      {showPreview ? (
        <div className="w-full min-h-[100px] bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm max-w-none">
          <Suspense fallback={<div className="text-xs text-gray-400 italic">Cargando preview...</div>}>
            <ReactMarkdown components={{ code: CodeBlock }}>
              {value || "*Sin contenido*"}
            </ReactMarkdown>
          </Suspense>
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 outline-none focus:border-blue-500 resize-y text-sm font-mono"
        />
      )}
    </div>
  );
};

export const DeleteButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
  >
    ✕
  </button>
);
