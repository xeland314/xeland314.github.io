import React, { useState, useRef } from "react";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { Sidebar } from "./Sidebar";
import { BlogCover } from "./BlogCover";
import { BlogStep } from "./BlogStep";
import { BlogComparison } from "./BlogComparison";
import { BlogCode } from "./BlogCode";
import { BlogEnd } from "./BlogEnd";
import { type ThemeMode, type AccentColor, type SlideData, type SlideType } from "./types";

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
  const exportRef = useRef<HTMLDivElement>(null);

  const theme = { mode, accent, showLogo, logoImage, username };

  const addSlide = (type: SlideType) => {
    const newId = Math.random().toString(36).substr(2, 9);
    let newSlide: SlideData;

    switch (type) {
      case "cover":
        newSlide = { id: newId, type: "cover", title: "Nuevo Título", subtitle: "Nuevo Subtítulo", category: "TECH", iconChar: "🚀" };
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

  const handleExportCurrent = async () => {
    if (!exportRef.current) return;
    try {
      const canvas = exportRef.current.querySelector('[data-export-canvas="true"]') as HTMLElement;
      if (!canvas) return;

      // Store original transform to restore it later
      const originalTransform = canvas.style.transform;
      
      // Temporarily set scale to 1 for clean capture
      canvas.style.transform = "scale(1)";

      const dataUrl = await toPng(canvas, { 
        pixelRatio: 1, 
        width: 1080,
        height: 1080,
        cacheBust: true,
      });

      // Restore original transform
      canvas.style.transform = originalTransform;

      const link = document.createElement("a");
      link.download = `slide-${selectedSlideId}.png`;
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

          const dataUrl = await toPng(canvas, { 
            pixelRatio: 1, 
            width: 1080,
            height: 1080,
            cacheBust: true,
          });

          canvas.style.transform = originalTransform;

          const base64Data = dataUrl.split(",")[1];
          folder.file(`slide-${i + 1}-${slide.type}.png`, base64Data, { base64: true });
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
    switch (slide.type) {
      case "cover": return <BlogCover {...slide} theme={theme} />;
      case "step": return <BlogStep {...slide} theme={theme} />;
      case "comparison": return <BlogComparison {...slide} theme={theme} />;
      case "code": return <BlogCode {...slide} theme={theme} />;
      case "end": return <BlogEnd {...slide} theme={theme} />;
    }
  };

  const selectedSlide = slides.find((s) => s.id === selectedSlideId) || slides[0];

  return (
    <div className="flex flex-col lg:flex-row gap-10 p-4 min-h-screen">
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

      <div className="flex-1 flex flex-col items-center justify-start py-10 overflow-auto bg-gray-50 dark:bg-gray-950 rounded-[3rem] border border-gray-200 dark:border-gray-800">
        <div className="w-full max-w-2xl flex flex-col items-center">
          <div ref={exportRef} className="w-full aspect-square overflow-hidden">
            {renderSlide(selectedSlide)}
          </div>
          
          <div className="mt-12 flex items-center gap-4 bg-white dark:bg-gray-800 px-6 py-3 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
             <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
               Previsualizando {slides.indexOf(selectedSlide) + 1} de {slides.length}
             </span>
          </div>
        </div>
      </div>
    </div>
  );
};
