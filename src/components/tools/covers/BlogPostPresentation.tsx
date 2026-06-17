import React from "react";
import { type SlideData, type ThemeConfig } from "./types";
import { BlogCover } from "./BlogCover";
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
import { toJpeg } from "html-to-image";
import JSZip from "jszip";

interface BlogPostPresentationProps {
  slides: SlideData[];
  theme: ThemeConfig;
  title: string;
}

export const BlogPostPresentation: React.FC<BlogPostPresentationProps> = ({
  slides,
  theme,
  title,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    const folder = zip.folder("slides");
    if (!folder) return;

    const canvases = containerRef.current?.querySelectorAll('[data-export-canvas="true"]');
    if (!canvases) return;

    for (let i = 0; i < canvases.length; i++) {
      const canvas = canvases[i] as HTMLElement;
      const originalTransform = canvas.style.transform;
      
      // Temporarily set scale to 1 for clean capture
      canvas.style.transform = "scale(1)";
      
      const dataUrl = await toJpeg(canvas, { 
        pixelRatio: 1, 
        width: 1080,
        height: 1350,
        quality: 1,
        cacheBust: true,
        backgroundColor: "#ffffff",
      });

      canvas.style.transform = originalTransform;
      
      const base64Data = dataUrl.split(",")[1];
      const slide = slides[i];
      folder.file(`slide-${i + 1}-${slide?.type || "unknown"}.jpg`, base64Data, { base64: true });
    }

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `${title.toLowerCase().replace(/\s+/g, "-")}-slides.zip`;
    link.click();
  };

  const renderSlide = (slide: SlideData) => {
    const props = { ...slide, theme };
    switch (slide.type) {
      case "cover": return <BlogCover {...(props as any)} />;
      case "step": return <BlogStep {...(props as any)} />;
      case "comparison": return <BlogComparison {...(props as any)} />;
      case "code": return <BlogCode {...(props as any)} />;
      case "end": return <BlogEnd {...(props as any)} />;
      case "image": return <BlogImage {...(props as any)} />;
      case "alert": return <BlogAlert {...(props as any)} />;
      case "metric": return <BlogMetric {...(props as any)} />;
      case "list": return <BlogList {...(props as any)} />;
      case "quote": return <BlogQuote {...(props as any)} />;
      case "timeline": return <BlogTimeline {...(props as any)} />;
      case "qna": return <BlogQnA {...(props as any)} />;
      case "pros-cons": return <BlogProsCons {...(props as any)} />;
      case "definition": return <BlogDefinition {...(props as any)} />;
      case "testimonial": return <BlogTestimonial {...(props as any)} />;
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-12 px-4 gap-12" ref={containerRef}>
      <header className="w-full flex flex-col md:flex-row justify-between items-center gap-6 mb-8 bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-xl">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            {title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Presentación interactiva • {slides.length} diapositivas
          </p>
        </div>
        <button
          onClick={handleDownloadAll}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-3 transition-all active:scale-95 shadow-lg shadow-blue-500/25"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Descargar Diapositivas (.zip)
        </button>
      </header>

      <div className="w-full space-y-3 sm:space-y-12">
        {slides.map((slide, index) => (
          <div key={slide.id} className="w-full max-w-[600px] mx-auto aspect-[4/5] flex items-center justify-center bg-slate-100 dark:bg-slate-950 overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800">
             {renderSlide(slide)}
          </div>
        ))}
      </div>

      <footer className="mt-12 text-center text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">
        Fin de la presentación • xeland314
      </footer>
    </div>
  );
};
