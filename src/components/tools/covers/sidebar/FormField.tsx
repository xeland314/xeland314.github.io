import React from "react";

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

export const DeleteButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
  >
    ✕
  </button>
);
