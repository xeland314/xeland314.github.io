import React from "react";
import { ACCENT_COLORS, type ThemeMode, type AccentColor, type SlideData, type SlideType } from "./types";

interface SidebarProps {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  accent: AccentColor;
  setAccent: (accent: AccentColor) => void;
  showLogo: boolean;
  setShowLogo: (show: boolean) => void;
  logoImage: string;
  setLogoImage: (logo: string) => void;
  username: string;
  setUsername: (name: string) => void;
  slides: SlideData[];
  selectedSlideId: string;
  setSelectedSlideId: (id: string) => void;
  updateSlide: (id: string, data: Partial<SlideData>) => void;
  addSlide: (type: SlideType) => void;
  removeSlide: (id: string) => void;
  moveSlide: (id: string, direction: "up" | "down") => void;
  onExportAll: () => void;
  onExportCurrent: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mode,
  setMode,
  accent,
  setAccent,
  showLogo,
  setShowLogo,
  logoImage,
  setLogoImage,
  username,
  setUsername,
  slides,
  selectedSlideId,
  setSelectedSlideId,
  updateSlide,
  addSlide,
  removeSlide,
  moveSlide,
  onExportAll,
  onExportCurrent,
}) => {
  const selectedSlide = slides.find((s) => s.id === selectedSlideId);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full lg:w-96 flex flex-col gap-6 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-y-auto max-h-[90vh]">
      <section>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          Configuración Global
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500 block mb-2">Tema</label>
            <div className="flex flex-wrap justify-evenly gap-4">
              <button
                onClick={() => setMode("light")}
                className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center bg-white ${
                  mode === "light" ? "border-blue-500 scale-110 shadow-lg" : "border-gray-200 opacity-60 hover:opacity-100"
                }`}
                title="Modo Claro"
              >
                <div className="w-6 h-6 rounded-full bg-gray-50 border border-gray-200" />
              </button>
              <button
                onClick={() => setMode("dark")}
                className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center bg-gray-900 ${
                  mode === "dark" ? "border-blue-500 scale-110 shadow-lg" : "border-gray-200 opacity-60 hover:opacity-100"
                }`}
                title="Modo Oscuro"
              >
                <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700" />
              </button>
              <button
                onClick={() => setMode("midnight")}
                className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center bg-[#020617] ${
                  mode === "midnight" ? "border-blue-500 scale-110 shadow-lg" : "border-gray-200 opacity-60 hover:opacity-100"
                }`}
                title="Modo Midnight"
              >
                <div className="w-6 h-6 rounded-full bg-blue-950 border border-blue-900" />
              </button>
              <button
                onClick={() => setMode("soft")}
                className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center bg-[#f8fafc] ${
                  mode === "soft" ? "border-blue-500 scale-110 shadow-lg" : "border-gray-200 opacity-60 hover:opacity-100"
                }`}
                title="Modo Soft"
              >
                <div className="w-6 h-6 rounded-full bg-[#f1f5f9] border border-slate-200" />
              </button>
              <button
                onClick={() => setMode("catppuccin")}
                className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center bg-[#1e1e2e] ${
                  mode === "catppuccin" ? "border-blue-500 scale-110 shadow-lg" : "border-gray-200 opacity-60 hover:opacity-100"
                }`}
                title="Modo Catppuccin"
              >
                <div className="w-6 h-6 rounded-full bg-[#302d41] border border-[#f5e0dc]" />
              </button>
              <button
                onClick={() => setMode("ambercat")}
                className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center bg-[#1e1e1e] ${
                  mode === "ambercat" ? "border-blue-500 scale-110 shadow-lg" : "border-gray-200 opacity-60 hover:opacity-100"
                }`}
                title="Modo Ambercat"
              >
                <div className="w-6 h-6 rounded-full bg-[#3c3836] border border-[#fabd2f]" />
              </button>
              <button
                onClick={() => setMode("rose")}
                className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center bg-[#1f1f1f] ${
                  mode === "rose" ? "border-blue-500 scale-110 shadow-lg" : "border-gray-200 opacity-60 hover:opacity-100"
                }`}
                title="Modo Rose"
              >
                <div className="w-6 h-6 rounded-full bg-[#3e3e3e] border border-[#f38ba8]" />
              </button>
              <button
                onClick={() => setMode("blue")}
                className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center bg-[#0c0c2b] ${
                  mode === "blue" ? "border-blue-500 scale-110 shadow-lg" : "border-gray-200 opacity-60 hover:opacity-100"
                }`}
                title="Modo Blue"
              >
                <div className="w-6 h-6 rounded-full bg-[#1e1e7e] border border-[#89b4fa]" />
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 block mb-2">Color de Acento</label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(ACCENT_COLORS).map((color) => (
                <button
                  key={color}
                  onClick={() => setAccent(color as AccentColor)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    accent === color ? "border-gray-900 dark:border-white scale-110" : "border-transparent opacity-60 hover:opacity-100"
                  } ${ACCENT_COLORS[color as AccentColor].bg}`}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-700 my-2" />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-500">Logo del Sitio</label>
              <button 
                onClick={() => setShowLogo(!showLogo)}
                className={`text-[10px] px-2 py-1 rounded transition-colors ${showLogo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}
              >
                {showLogo ? "VISIBLE" : "OCULTO"}
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl border-2 border-gray-100 dark:border-gray-700 overflow-hidden flex-shrink-0 bg-gray-50 dark:bg-gray-900">
                <img src={logoImage} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <label className="flex-1 cursor-pointer">
                <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-xs font-bold text-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  CAMBIAR LOGO
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </label>
            </div>
          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-700 my-2" />

          <div>
            <label className="text-sm font-medium text-gray-500 block mb-2">Nombre de Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 outline-none focus:border-blue-500 text-sm font-bold"
              placeholder="Ej. xeland314"
            />
          </div>
        </div>
      </section>

      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Diapositivas
          </h3>
          <div className="flex gap-2">
             <select 
               className="bg-gray-100 dark:bg-gray-700 text-sm px-2 py-1 rounded-lg outline-none"
               onChange={(e) => {
                 if (e.target.value) {
                   addSlide(e.target.value as SlideType);
                   e.target.value = "";
                 }
               }}
             >
               <option value="">+ Añadir</option>
               <option value="cover">Portada</option>
               <option value="step">Paso</option>
               <option value="comparison">Comparación</option>
               <option value="code">Código</option>
               <option value="end">Final</option>
             </select>
          </div>
        </div>

        <div className="space-y-2">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              onClick={() => setSelectedSlideId(slide.id)}
              className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all ${
                selectedSlideId === slide.id 
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                  : "border-transparent bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <span className="text-xs font-mono text-gray-400 w-4">{index + 1}</span>
              <span className="flex-1 font-medium capitalize truncate">{slide.type}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); moveSlide(slide.id, "up"); }} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">↑</button>
                <button onClick={(e) => { e.stopPropagation(); moveSlide(slide.id, "down"); }} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">↓</button>
                <button onClick={(e) => { e.stopPropagation(); removeSlide(slide.id); }} className="p-1 hover:bg-red-100 text-red-500 rounded">✕</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedSlide && (
        <>
          <div className="h-px bg-gray-200 dark:bg-gray-700" />
          <section className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              Editar Diapositiva
            </h3>
            
            {selectedSlide.type === "cover" && (
              <div className="space-y-4">
                <Input label="Título" value={selectedSlide.title} onChange={(v) => updateSlide(selectedSlide.id, { title: v })} />
                <Input label="Subtítulo" value={selectedSlide.subtitle} onChange={(v) => updateSlide(selectedSlide.id, { subtitle: v })} />
                <Input label="Categoría" value={selectedSlide.category} onChange={(v) => updateSlide(selectedSlide.id, { category: v })} />
                <Input label="Icono (Emoji)" value={selectedSlide.iconChar} onChange={(v) => updateSlide(selectedSlide.id, { iconChar: v })} />
              </div>
            )}

            {selectedSlide.type === "step" && (
              <div className="space-y-4">
                <Input label="Número" value={selectedSlide.stepNumber} onChange={(v) => updateSlide(selectedSlide.id, { stepNumber: v })} />
                <Input label="Título" value={selectedSlide.title} onChange={(v) => updateSlide(selectedSlide.id, { title: v })} />
                <Textarea label="Descripción" value={selectedSlide.description} onChange={(v) => updateSlide(selectedSlide.id, { description: v })} />
              </div>
            )}

            {selectedSlide.type === "comparison" && (
              <div className="space-y-4">
                <Input label="Título Principal" value={selectedSlide.title} onChange={(v) => updateSlide(selectedSlide.id, { title: v })} />
                <div className="grid grid-cols-2 gap-4">
                   <Input label="Título Izq." value={selectedSlide.leftTitle} onChange={(v) => updateSlide(selectedSlide.id, { leftTitle: v })} />
                   <Input label="Título Der." value={selectedSlide.rightTitle} onChange={(v) => updateSlide(selectedSlide.id, { rightTitle: v })} />
                </div>
                <Textarea label="Items Izq (uno por línea)" value={selectedSlide.leftItems.join("\n")} onChange={(v) => updateSlide(selectedSlide.id, { leftItems: v.split("\n") })} />
                <Textarea label="Items Der (uno por línea)" value={selectedSlide.rightItems.join("\n")} onChange={(v) => updateSlide(selectedSlide.id, { rightItems: v.split("\n") })} />
              </div>
            )}

            {selectedSlide.type === "code" && (
              <div className="space-y-4">
                <Input label="Título" value={selectedSlide.title} onChange={(v) => updateSlide(selectedSlide.id, { title: v })} />
                <Input label="Lenguaje" value={selectedSlide.language} onChange={(v) => updateSlide(selectedSlide.id, { language: v })} />
                <Textarea label="Código" value={selectedSlide.code} onChange={(v) => updateSlide(selectedSlide.id, { code: v })} rows={8} />
              </div>
            )}

            {selectedSlide.type === "end" && (
              <div className="space-y-4">
                <Input label="Texto 1" value={selectedSlide.firstText} onChange={(v) => updateSlide(selectedSlide.id, { firstText: v })} />
                <Input label="Texto 2 (Color)" value={selectedSlide.secondText} onChange={(v) => updateSlide(selectedSlide.id, { secondText: v })} />
                <Textarea label="Descripción" value={selectedSlide.description} onChange={(v) => updateSlide(selectedSlide.id, { description: v })} />
                
                <div className="h-px bg-gray-100 dark:bg-gray-700 my-2" />
                
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">CTAs & Footer</label>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => updateSlide(selectedSlide.id, { likeText: "Like", commentText: "Comment", saveText: "Save", firstText: "Thanks for", secondText: "Reading!" })}
                      className="text-[10px] px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 font-bold"
                    >
                      EN
                    </button>
                    <button 
                      onClick={() => updateSlide(selectedSlide.id, { likeText: "Like", commentText: "Comenta", saveText: "Guarda", firstText: "¡Gracias por", secondText: "Leer!" })}
                      className="text-[10px] px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 font-bold"
                    >
                      ES
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Input label="Like" value={selectedSlide.likeText} onChange={(v) => updateSlide(selectedSlide.id, { likeText: v })} />
                  <Input label="Comment" value={selectedSlide.commentText} onChange={(v) => updateSlide(selectedSlide.id, { commentText: v })} />
                  <Input label="Save" value={selectedSlide.saveText} onChange={(v) => updateSlide(selectedSlide.id, { saveText: v })} />
                </div>
                <Input label="Footer (Texto final)" value={selectedSlide.finalText} onChange={(v) => updateSlide(selectedSlide.id, { finalText: v })} />
              </div>
            )}
          </section>
        </>
      )}

      <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 gap-2">
        <button
          onClick={onExportCurrent}
          className="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 py-3 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Exportar Diapositiva
        </button>
        <button
          onClick={onExportAll}
          className="w-full bg-blue-600 text-white py-3 rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
        >
          Descargar Todo (.zip)
        </button>
      </div>
    </div>
  );
};

const Input = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 outline-none focus:border-blue-500"
    />
  </div>
);

const Textarea = ({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) => (
  <div>
    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 outline-none focus:border-blue-500 resize-none"
    />
  </div>
);
