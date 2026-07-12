import { useState, useRef, useEffect } from "react";
import { toJpeg } from "html-to-image";
import JSZip from "jszip";
import { Sidebar } from "./Sidebar";
import { BlogCover } from "./BlogCover";
import { BlogCoverImage } from "./BlogCoverImage";
import { BlogStep } from "./BlogStep";
import { BlogComparison } from "./BlogComparison";
import { BlogCode } from "./BlogCode";
import { BlogEnd } from "./BlogEnd";
import { BlogImage } from "./BlogImage";
import { BlogAlert } from "./BlogAlert";
import { BlogMetric } from "./BlogMetric";
import { BlogList } from "./BlogList";
import { BlogQuote } from "./BlogQuote";
import { BlogTimeline } from "./BlogTimeline";
import { BlogQnA } from "./BlogQnA";
import { BlogProsCons } from "./BlogProsCons";
import { BlogDefinition } from "./BlogDefinition";
import { BlogTestimonial } from "./BlogTestimonial";
import { ProjectManager, type Project } from "./ProjectManager";
import { type ThemeMode, type AccentColor, type SlideData, type SlideType, getThemeBgColor } from "./types";
import { db } from "./db";

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
    type: "step",
    stepNumber: "01",
    title: "El Elemento <svg>",
    description: "Es el contenedor principal que define el sistema de coordenadas y el espacio de dibujo.",
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
        setProjects(savedProjects);
      }

      if (savedState) {
        try {
          const { mode, accent, showLogo, logoImage, username, slides, selectedSlideId, currentProjectId: savedId } = savedState;
          setMode(mode);
          setAccent(accent);
          setShowLogo(showLogo);
          setLogoImage(logoImage);
          setUsername(username);
          setSlides(slides);
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

  const theme = { mode, accent, showLogo, logoImage, username };

  const addSlide = (type: SlideType) => {
    const newId = Math.random().toString(36).substr(2, 9);
    let newSlide: SlideData;

    switch (type) {
      case "cover":
        newSlide = { id: newId, type: "cover", title: "Nuevo Título", subtitle: "Nuevo Subtítulo", category: "TECH", iconChar: "🚀" };
        break;
      case "cover-image":
        newSlide = { id: newId, type: "cover-image", title: "Nueva Imagen", subtitle: "Subtítulo de la imagen", category: "PHOTO", imageUrl: "", imageFit: "contain" };
        break;
      case "step":
        newSlide = { id: newId, type: "step", stepNumber: "01", title: "Nuevo Paso", description: "Descripción del paso..." };
        break;
      case "comparison":
        newSlide = { id: newId, type: "comparison", title: "Comparativa", leftTitle: "Old", leftItems: ["Bad"], rightTitle: "New", rightItems: ["Good"] };
        break;
      case "code":
        newSlide = { id: newId, type: "code", title: "Snippet", code: 'console.log("Hello World");', language: "javascript" };
        break;
      case "image":
        newSlide = { id: newId, type: "image", title: "Imagen", imageUrl: "", caption: "Pie de foto...", imageFit: "contain" };
        break;
      case "alert":
        newSlide = { id: newId, type: "alert", alertType: "info", title: "Atención", description: "Este es un mensaje importante..." };
        break;
      case "metric":
        newSlide = { id: newId, type: "metric", value: "100%", label: "Métrica", trend: "+10% vs ayer" };
        break;
      case "list":
        newSlide = { id: newId, type: "list", title: "Resumen", items: ["Item 1", "Item 2"], bulletType: "bullet" };
        break;
      case "quote":
        newSlide = { id: newId, type: "quote", text: "La mejor forma de predecir el futuro es creándolo.", author: "Peter Drucker" };
        break;
      case "timeline":
        newSlide = { id: newId, type: "timeline", title: "Mi Ruta", events: [{ date: "2024", title: "Inicio", description: "Comenzando mi viaje..." }] };
        break;
      case "qna":
        newSlide = { id: newId, type: "qna", question: "¿Pregunta frecuente?", answer: "Esta es una respuesta detallada...", questionLabel: "Q", answerLabel: "A" };
        break;
      case "pros-cons":
        newSlide = { id: newId, type: "pros-cons", title: "¿Vale la pena?", pros: ["Velocidad"], cons: ["Aprendizaje"] };
        break;
      case "definition":
        newSlide = { id: newId, type: "definition", term: "Término", phonetic: "/pronunciación/", definition: "Significado del término..." };
        break;
      case "testimonial":
        newSlide = { id: newId, type: "testimonial", quote: "Excelente contenido.", author: "Usuario", avatarUrl: "", rating: 5 };
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

      const dataUrl = await toJpeg(canvas, { 
        pixelRatio: 1, 
        width: previewSettings.width,
        height: previewSettings.height,
        quality: 1,
        cacheBust: true,
        backgroundColor: getThemeBgColor(mode),
      });

      // Restore original transform
      canvas.style.transform = originalTransform;

      const link = document.createElement("a");
      link.download = `${previewSettings.label.toLowerCase()}-slide-${selectedSlideId}.jpg`;
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

          const dataUrl = await toJpeg(canvas, { 
            pixelRatio: 1, 
            width: previewSettings.width,
            height: previewSettings.height,
            quality: 1,
            cacheBust: true,
            backgroundColor: getThemeBgColor(mode),
          });

          canvas.style.transform = originalTransform;

          const base64Data = dataUrl.split(",")[1];
          folder.file(`${previewSettings.label.toLowerCase()}-slide-${i + 1}-${slide.type}.jpg`, base64Data, { base64: true });
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
      case "cover-image": return <BlogCoverImage {...slideProps as any} />;
      case "step": return <BlogStep {...slideProps as any} />;
      case "comparison": return <BlogComparison {...slideProps as any} />;
      case "code": return <BlogCode {...slideProps as any} />;
      case "end": return <BlogEnd {...slideProps as any} />;
      case "image": return <BlogImage {...slideProps as any} />;
      case "alert": return <BlogAlert {...slideProps as any} />;
      case "metric": return <BlogMetric {...slideProps as any} />;
      case "list": return <BlogList {...slideProps as any} />;
      case "quote": return <BlogQuote {...slideProps as any} />;
      case "timeline": return <BlogTimeline {...slideProps as any} />;
      case "qna": return <BlogQnA {...slideProps as any} />;
      case "pros-cons": return <BlogProsCons {...slideProps as any} />;
      case "definition": return <BlogDefinition {...slideProps as any} />;
      case "testimonial": return <BlogTestimonial {...slideProps as any} />;
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
