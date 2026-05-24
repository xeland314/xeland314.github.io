import React, { useState } from "react";
import { type SlideData, type ThemeMode, type AccentColor } from "./types";

export interface Project {
  id: string;
  name: string;
  lastModified: number;
  data: {
    mode: ThemeMode;
    accent: AccentColor;
    showLogo: boolean;
    logoImage: string;
    username: string;
    slides: SlideData[];
    selectedSlideId: string;
  };
}

interface ProjectManagerProps {
  projects: Project[];
  currentProjectId: string;
  onSave: (name: string) => void;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  onExport: (id: string) => void;
  onImport: (file: File) => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  projects,
  currentProjectId,
  onSave,
  onLoad,
  onDelete,
  onNew,
  onExport,
  onImport,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const currentProject = projects.find((p) => p.id === currentProjectId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative mb-6">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex-1 flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:border-blue-500 transition-colors"
        >
          <div className="flex flex-col items-start">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Proyecto Actual</span>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate">
              {currentProject?.name || "Sin nombre"}
            </span>
          </div>
          <span className="text-gray-400">▾</span>
        </button>
        
        <button
          onClick={onNew}
          className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          title="Nuevo Proyecto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>

      {isMenuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
            
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Guardar como..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="flex-1 bg-gray-50 dark:bg-gray-800 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    if (newProjectName.trim()) {
                      onSave(newProjectName.trim());
                      setNewProjectName("");
                    }
                  }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Guardar
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  Importar JSON
                </button>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto p-2 space-y-1">
              {projects.length === 0 && (
                <div className="py-8 text-center text-gray-400 text-xs italic">
                  No hay proyectos guardados
                </div>
              )}
              {projects.sort((a, b) => b.lastModified - a.lastModified).map((project) => (
                <div
                  key={project.id}
                  className={`group flex items-center gap-2 p-2 rounded-lg transition-colors ${
                    project.id === currentProjectId ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <button
                    onClick={() => {
                      onLoad(project.id);
                      setIsMenuOpen(false);
                    }}
                    className="flex-1 text-left"
                  >
                    <div className="text-sm font-bold text-gray-700 dark:text-gray-200">
                      {project.name}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {new Date(project.lastModified).toLocaleDateString()}
                    </div>
                  </button>
                  
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => onExport(project.id)}
                      className="p-2 text-gray-400 hover:text-blue-500 transition-all"
                      title="Exportar JSON"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </button>
                    <button
                      onClick={() => onDelete(project.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-all"
                      title="Eliminar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
