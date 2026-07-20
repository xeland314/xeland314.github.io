import type { SlideType } from "../types";

export type SocialPreviewMode = "threads" | "facebook" | "tiktok";

export interface EditorProps<T> {
  slide: T;
  updateSlide: (id: string, data: Partial<T>) => void;
}

export const SLIDE_TYPE_OPTIONS: { value: SlideType; label: string }[] = [
  { value: "cover", label: "Portada" },
  { value: "announcement", label: "Anuncio" },
  { value: "step", label: "Paso" },
  { value: "comparison", label: "Comparación" },
  { value: "code", label: "Código" },
  { value: "mistakes", label: "Errores (Mal/Bien)" },
  { value: "image", label: "Imagen" },
  { value: "alert", label: "Alerta/Tip" },
  { value: "metric", label: "Métrica" },
  { value: "list", label: "Lista" },
  { value: "checklist", label: "Checklist" },
  { value: "highlight", label: "Cita / Testimonio" },
  { value: "myth-fact", label: "Mito vs Realidad" },
  { value: "tech-stack", label: "Tech Stack" },
  { value: "timeline", label: "Línea de Tiempo" },
  { value: "qna", label: "Pregunta/Respuesta" },
  { value: "poll", label: "Encuesta" },
  { value: "pros-cons", label: "Pros y Contras" },
  { value: "definition", label: "Definición" },
  { value: "takeaways", label: "Puntos Clave" },
  { value: "end", label: "Final" },
];
