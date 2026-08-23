import { useState, useRef, useEffect } from "react";
import { toJpeg, toPng } from "html-to-image";
import JSZip from "jszip";
import { Sidebar } from "./Sidebar";
import type { ExportFormat } from "./sidebar/ExportActions";
import { BlogCover } from "./BlogCover";
import { BlogMarkdownSlide } from "./BlogMarkdownSlide";
import { BlogImage } from "./BlogImage";
import { BlogEnd } from "./BlogEnd";
import { ProjectManager, type Project } from "./ProjectManager";
import { type ThemeMode, type AccentColor, type SlideData, type SlideType, getThemeBgColor } from "./types";
import { db } from "./db";
import { migrateSlides } from "./migrate";

const STORAGE_KEY = "cover-creator-state";
const PROJECTS_KEY = "cover-creator-projects";

type SocialPreviewMode = "threads" | "facebook" | "tiktok";

const SOCIAL_PREVIEW_MODES: Record<SocialPreviewMode, { label: string; width: number; height: number; info: string }> = {
  threads: { label: "Threads", width: 1080, height: 1350, info: "4:5 — Imagen única/carrusel" },
  facebook: { label: "Facebook", width: 1080, height: 1080, info: "1:1 — Carrusel/mosaico" },
  tiktok: { label: "TikTok", width: 1080, height: 1920, info: "9:16 — Formato móvil" },
};

const INITIAL_SLIDES: SlideData[] = [
  {
    id: "1",
    type: "cover",
    title: "Anatomía de una Imagen SVG",
    subtitle: "Entendiendo el XML detrás de los gráficos vectoriales",
    category: "DEEP DIVE",
    iconChar: "📐",
  },
  {
    id: "2",
    type: "markdown",
    content: "## El elemento raíz\n\nTodo gráfico SVG vive dentro de un elemento `<svg>` que define el **sistema de coordenadas** y el espacio de dibujo.\n\n```svg\n<svg viewBox=\"0 0 100 100\">\n  <circle cx=\"50\" cy=\"50\" r=\"40\" />\n</svg>\n```\n\n- El `viewBox` mapea unidades internas al tamaño renderizado\n- Sin `width/height`, el SVG llena su contenedor",
  },
  {
    id: "3",
    type: "end",
    firstText: "Thanks for",
    secondText: "Reading!",
    description: "Si te ha gustado este contenido, sígueme para más anatomías técnicas.",
    likeText: "Like",
    commentText: "Comment",
    saveText: "Save",
    finalText: "Desarrollo • Localización • Código",
  },
];

export const CoverCreator = () => {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [accent, setAccent] = useState<AccentColor>("blue");
  const [showLogo, setShowLogo] = useState(true);
  const [logoImage, setLogoImage] = useState("/assets/images/logo_v3.png");
  const [username, setUsername] = useState("xeland314");
  const [slides, setSlides] = useState<SlideData[]>(INITIAL_SLIDES);
  const [selectedSlideId, setSelectedSlideId] = useState<string>(INITIAL_SLIDES[0].id);
  const [previewMode, setPreviewMode] = useState<SocialPreviewMode>("threads");
  const [isLoaded, setIsLoaded] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string>("default");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("jpeg");
  const [exportQuality, setExportQuality] = useState<number>(0.92);

  const exportRef = useRef<HTMLDivElement>(null);

  // Load projects and current state on mount
  useEffect(() => {
    const init = async () => {
      // Try to load from IndexedDB first
      let savedProjects = await db.getItem<Project[]>(PROJECTS_KEY);
      let savedState = await db.getItem<any>(STORAGE_KEY);

      // If not in IndexedDB, try localStorage and migrate
      if (!savedProjects) {
        const localProjects = localStorage.getItem(PROJECTS_KEY);
        if (localProjects) {
          try {
            savedProjects = JSON.parse(localProjects);
            await db.setItem(PROJECTS_KEY, savedProjects);
          } catch (e) {
            console.error("Error migrating projects from localStorage:", e);
          }
        }
      }

      if (!savedState) {
        const localState = localStorage.getItem(STORAGE_KEY);
        if (localState) {
          try {
            savedState = JSON.parse(localState);
            await db.setItem(STORAGE_KEY, savedState);
          } catch (e) {
            console.error("Error migrating state from localStorage:", e);
          }
        }
      }

      if (savedProjects) {
        setProjects(
          savedProjects.map((p) => ({
            ...p,
            data: { ...p.data, slides: migrateSlides(p.data?.slides) },
          }))
        );
      }

      if (savedState) {
        try {
          const { mode, accent, showLogo, logoImage, username, slides, selectedSlideId, currentProjectId: savedId } = savedState;
          setMode(mode);
          setAccent(accent);
          setShowLogo(showLogo);
          setLogoImage(logoImage);
          setUsername(username);
          setSlides(migrateSlides(slides));
          setSelectedSlideId(selectedSlideId);
          setCurrentProjectId(savedId || "default");
        } catch (e) {
          console.error("Error loading saved state:", e);
        }
      }
      setIsLoaded(true);
    };

    init();
  }, []);

  // Auto-save current project state
  useEffect(() => {
    if (!isLoaded) return;
    const state = { mode, accent, showLogo, logoImage, username, slides, selectedSlideId, currentProjectId };
    db.setItem(STORAGE_KEY, state).catch(e => console.error("Error saving state:", e));

    // Also update the project in the projects list if it exists
    setProjects(prev => prev.map(p => p.id === currentProjectId ? {
      ...p,
      lastModified: Date.now(),
      data: { mode, accent, showLogo, logoImage, username, slides, selectedSlideId }
    } : p));
  }, [mode, accent, showLogo, logoImage, username, slides, selectedSlideId, currentProjectId, isLoaded]);

  // Save projects list to IndexedDB
  useEffect(() => {
    if (!isLoaded) return;
    db.setItem(PROJECTS_KEY, projects).catch(e => console.error("Error saving projects:", e));
  }, [projects, isLoaded]);

  const theme = { mode, accent, showLogo, logoImage, username };

  const addSlide = (type: SlideType) => {
    const newId = Math.random().toString(36).substr(2, 9);
    let newSlide: SlideData;

    switch (type) {
      case "cover":
        newSlide = { id: newId, type: "cover", title: "Nuevo Título", subtitle: "Nuevo Subtítulo", category: "TECH", iconChar: "🚀" };
        break;
      case "markdown":
        newSlide = { id: newId, type: "markdown", content: "## Nuevo contenido\n\nEscribe aquí tu **markdown**..." };
        break;
      case "image":
        newSlide = { id: newId, type: "image", title: "Imagen", imageUrl: "", caption: "Pie de foto...", imageFit: "contain" };
        break;
      case "end":
        newSlide = {
          id: newId,
          type: "end",
          firstText: "Thanks for",
          secondText: "Reading!",
          description: "Gracias por leer...",
          likeText: "Like",
          commentText: "Comment",
          saveText: "Save",
          finalText: "Desarrollo • Localización • Código"
        };
        break;
    }
    setSlides([...slides, newSlide]);
    setSelectedSlideId(newId);
  };

  const removeSlide = (id: string) => {
    if (slides.length <= 1) return;
    const newSlides = slides.filter((s) => s.id !== id);
    setSlides(newSlides);
    if (selectedSlideId === id) setSelectedSlideId(newSlides[0].id);
  };

  const duplicateSlide = (id: string) => {
    const slide = slides.find((s) => s.id === id);
    if (!slide) return;
    const newId = Math.random().toString(36).substr(2, 9);
    const duplicate = { ...slide, id: newId } as SlideData;
    const index = slides.findIndex((s) => s.id === id);
    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, duplicate);
    setSlides(newSlides);
    setSelectedSlideId(newId);
  };

  const updateSlide = (id: string, data: Partial<SlideData>) => {
    setSlides(slides.map((s) => (s.id === id ? { ...s, ...data } as SlideData : s)));
  };

  const moveSlide = (id: string, direction: "up" | "down") => {
    const index = slides.findIndex((s) => s.id === id);
    if ((direction === "up" && index === 0) || (direction === "down" && index === slides.length - 1)) return;
    const newSlides = [...slides];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
    setSlides(newSlides);
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!isLoaded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") {
        return;
      }

      // Ctrl+D: Duplicate slide
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        duplicateSlide(selectedSlideId);
        return;
      }

      // Delete/Backspace: Remove slide
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        removeSlide(selectedSlideId);
        return;
      }

      // ArrowUp: Select previous slide
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const currentIndex = slides.findIndex(s => s.id === selectedSlideId);
        if (currentIndex > 0) {
          setSelectedSlideId(slides[currentIndex - 1].id);
        }
        return;
      }

      // ArrowDown: Select next slide
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const currentIndex = slides.findIndex(s => s.id === selectedSlideId);
        if (currentIndex < slides.length - 1) {
          setSelectedSlideId(slides[currentIndex + 1].id);
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoaded, selectedSlideId, slides, duplicateSlide, removeSlide, setSelectedSlideId]);

  const handleSaveProject = (name: string) => {
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      lastModified: Date.now(),
      data: { mode, accent, showLogo, logoImage, username, slides, selectedSlideId }
    };
    setProjects([...projects, newProject]);
    setCurrentProjectId(newProject.id);
  };

  const handleLoadProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      const { mode, accent, showLogo, logoImage, username, slides, selectedSlideId } = project.data;
      setMode(mode);
      setAccent(accent);
      setShowLogo(showLogo);
      setLogoImage(logoImage);
      setUsername(username);
      setSlides(slides);
      setSelectedSlideId(selectedSlideId);
      setCurrentProjectId(id);
    }
  };

  const handleDeleteProject = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este proyecto?")) {
      setProjects(projects.filter(p => p.id !== id));
      if (currentProjectId === id) {
        setCurrentProjectId("default");
      }
    }
  };

  const handleDuplicateProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${project.name} (Copia)`,
      lastModified: Date.now(),
      data: { ...project.data },
    };
    setProjects([...projects, newProject]);
    setCurrentProjectId(newProject.id);
  };

  const handleNewProject = () => {
    if (confirm("¿Crear un nuevo proyecto? Los cambios actuales se mantendrán en el proyecto actual.")) {
      setMode("dark");
      setAccent("blue");
      setShowLogo(true);
      setLogoImage("/assets/images/logo_v3.png");
      setUsername("xeland314");
      setSlides(INITIAL_SLIDES);
      setSelectedSlideId(INITIAL_SLIDES[0].id);
      setCurrentProjectId("default");
    }
  };

  const handleReset = () => {
    if (confirm("¿Estás seguro de que quieres restablecer el proyecto actual? Se perderán los cambios no guardados en este proyecto.")) {
      setMode("dark");
      setAccent("blue");
      setShowLogo(true);
      setLogoImage("/assets/images/logo_v3.png");
      setUsername("xeland314");
      setSlides(INITIAL_SLIDES);
      setSelectedSlideId(INITIAL_SLIDES[0].id);
    }
  };

  const handleExportProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `project-${project.name.replace(/\s+/g, "-").toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportProject = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const project: Project = JSON.parse(e.target?.result as string);
        // Clean up project ID to avoid collisions
        project.id = Math.random().toString(36).substr(2, 9);
        project.name = `${project.name} (Importado)`;
        setProjects([...projects, project]);
        alert("Proyecto importado con éxito");
      } catch (err) {
        console.error("Error importing project:", err);
        alert("Error al importar el archivo JSON. Asegúrate de que es un formato válido.");
      }
    };
    reader.readAsText(file);
  };

  const previewSettings = SOCIAL_PREVIEW_MODES[previewMode];

  const handleExportCurrent = async () => {
    if (!exportRef.current) return;
    try {
      const canvas = exportRef.current.querySelector('[data-export-canvas="true"]') as HTMLElement;
      if (!canvas) return;

      // Store original transform to restore it later
      const originalTransform = canvas.style.transform;
      
      // Temporarily set scale to 1 for clean capture
      canvas.style.transform = "scale(1)";

      const toImage = exportFormat === "png" ? toPng : toJpeg;
      const ext = exportFormat === "png" ? "png" : "jpg";
      const dataUrl = await toImage(canvas, { 
        pixelRatio: 1, 
        width: previewSettings.width,
        height: previewSettings.height,
        quality: exportFormat === "jpeg" ? exportQuality : undefined,
        cacheBust: true,
        backgroundColor: getThemeBgColor(mode),
      });

      // Restore original transform
      canvas.style.transform = originalTransform;

      const link = document.createElement("a");
      link.download = `${previewSettings.label.toLowerCase()}-slide-${selectedSlideId}.${ext}`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  const handleExportAll = async () => {
    const zip = new JSZip();
    const folder = zip.folder("slides");
    if (!folder) return;

    const toImage = exportFormat === "png" ? toPng : toJpeg;
    const ext = exportFormat === "png" ? "png" : "jpg";

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      setSelectedSlideId(slide.id);
      
      // Wait for DOM update
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (exportRef.current) {
        const canvas = exportRef.current.querySelector('[data-export-canvas="true"]') as HTMLElement;
        if (canvas) {
          const originalTransform = canvas.style.transform;
          canvas.style.transform = "scale(1)";

          const dataUrl = await toImage(canvas, { 
            pixelRatio: 1, 
            width: previewSettings.width,
            height: previewSettings.height,
            quality: exportFormat === "jpeg" ? exportQuality : undefined,
            cacheBust: true,
            backgroundColor: getThemeBgColor(mode),
          });

          canvas.style.transform = originalTransform;

          const base64Data = dataUrl.split(",")[1];
          folder.file(`${previewSettings.label.toLowerCase()}-slide-${i + 1}-${slide.type}.${ext}`, base64Data, { base64: true });
        }
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "carrusel-completo.zip";
    link.click();
  };

  const renderSlide = (slide: SlideData) => {
    const slideProps = {
      ...slide,
      theme,
      previewWidth: previewSettings.width,
      previewHeight: previewSettings.height,
    };

    switch (slide.type) {
      case "cover": return <BlogCover {...slideProps as any} />;
      case "markdown": return <BlogMarkdownSlide {...slideProps as any} />;
      case "image": return <BlogImage {...slideProps as any} />;
      case "end": return <BlogEnd {...slideProps as any} />;
      default: return <div className="w-full h-full flex items-center justify-center text-gray-400">Tipo no soportado: {(slide as any).type}</div>;
    }
  };

  const selectedSlide = slides.find((s) => s.id === selectedSlideId) || slides[0];

  return (
    <div className="flex flex-col lg:flex-row gap-10 p-4 min-h-screen">
      <div className="w-full lg:w-96 flex flex-col">
        <ProjectManager
          projects={projects}
          currentProjectId={currentProjectId}
          onSave={handleSaveProject}
          onLoad={handleLoadProject}
          onDelete={handleDeleteProject}
          onNew={handleNewProject}
          onExport={handleExportProject}
          onImport={handleImportProject}
          onDuplicate={handleDuplicateProject}
        />
        <Sidebar
          mode={mode}
          setMode={setMode}
          accent={accent}
          setAccent={setAccent}
          showLogo={showLogo}
          setShowLogo={setShowLogo}
          logoImage={logoImage}
          setLogoImage={setLogoImage}
          username={username}
          setUsername={setUsername}
          previewMode={previewMode}
          setPreviewMode={setPreviewMode}
          slides={slides}
          selectedSlideId={selectedSlideId}
          setSelectedSlideId={setSelectedSlideId}
          updateSlide={updateSlide}
          addSlide={addSlide}
          removeSlide={removeSlide}
          moveSlide={moveSlide}
          duplicateSlide={duplicateSlide}
          exportFormat={exportFormat}
          setExportFormat={setExportFormat}
          exportQuality={exportQuality}
          setExportQuality={setExportQuality}
          onExportAll={handleExportAll}
          onExportCurrent={handleExportCurrent}
        />
      </div>
        <div className="flex-1 flex flex-col items-center justify-start py-10 overflow-auto bg-gray-50 dark:bg-gray-950 rounded-[3rem] border border-gray-200 dark:border-gray-800">
        <div className="w-full max-w-5xl flex flex-col items-center px-4">
          <div className="w-full flex justify-end mb-4">
             <button 
               onClick={handleReset}
               className="text-xs font-bold text-red-500 hover:text-red-600 uppercase tracking-widest bg-red-50 dark:bg-red-950/30 px-3 py-1 rounded-lg border border-red-100 dark:border-red-900/50 transition-colors"
             >
               Restablecer Todo
             </button>
          </div>
          <div
            className="w-full bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center"
            style={{ aspectRatio: `${previewSettings.width}/${previewSettings.height}` }}
          >
            <div
              ref={exportRef}
              className="w-full h-full bg-white dark:bg-slate-900 shadow-lg"
            >
              {renderSlide(selectedSlide)}
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white dark:bg-gray-800 px-6 py-3 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
             <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
               Previsualizando {slides.indexOf(selectedSlide) + 1} de {slides.length}
             </span>
             <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
               Vista: {previewSettings.label} — {previewSettings.width}×{previewSettings.height}
             </span>
             <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-700 mx-2" />
             <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               Autoguardado
             </span>
          </div>
        </div>
        </div>
    </div>
  );
};
