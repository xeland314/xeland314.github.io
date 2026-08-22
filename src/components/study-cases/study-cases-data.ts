export interface StudyCase {
  slug: string;
  client: string;
  role: { es: string; en: string };
  year: string;
  liveUrl: string;
  summary: { es: string; en: string };
  context: { es: string; en: string };
  problem: { es: string; en: string };
  work: { es: string[]; en: string[] };
  note: { es: string; en: string };
}

export const STUDY_CASES: StudyCase[] = [
  {
    slug: "taller-servi-auto",
    client: "Talleres Servi Auto",
    role: {
      es: "Construcción completa del sitio",
      en: "Complete website build",
    },
    year: "2026",
    liveUrl: "https://talleresserviauto.onrender.com",
    summary: {
      es: "Sitio completo desde cero para un taller mecánico familiar con más de 25 años de trayectoria en el sur de Quito.",
      en: "A complete from-scratch website for a family-owned auto repair shop with over 25 years of trajectory in South Quito.",
    },
    context: {
      es: "Taller mecánico familiar especializado en motor, transmisión, frenos ABS e inyectores, con diagnóstico computarizado multimarcas. Más de 25 años de trayectoria en el sur de Quito, hoy dirigido por la segunda generación de la familia.",
      en: "Family-owned auto repair shop specialized in engines, transmissions, ABS brakes and fuel injectors, with computerized multi-brand diagnostics. Over 25 years of trajectory in South Quito, today run by the family's second generation.",
    },
    problem: {
      es: "Un negocio con décadas de reputación offline pero sin presencia digital. El reto no era solo 'tener un sitio': era aparecer de forma confiable cuando alguien busca un taller en Quito, ya sea en buscadores tradicionales o preguntándole a un asistente de inteligencia artificial.",
      en: "A business with decades of offline reputation but no digital presence. The challenge was not just 'having a site': it was showing up reliably when someone searches for a repair shop in Quito, whether on traditional search engines or by asking an AI assistant.",
    },
    work: {
      es: [
        "Estructura completa del sitio construida desde cero: servicios, historia, equipo y contacto.",
        "Páginas educativas por síntoma (check engine encendido en Quito, consumo elevado de gasolina) que responden las preguntas reales que la gente le hace a un taller.",
        "Una única fuente de verdad para los datos del negocio —nombre, dirección, teléfono— para eliminar cualquier inconsistencia entre páginas.",
        "Datos estructurados de negocio local y de preguntas frecuentes, para que buscadores y asistentes de IA entiendan exactamente qué ofrece el taller.",
        "Línea de tiempo de la historia del fundador y página propia para cada miembro del equipo: señal de confianza antes del primer contacto.",
        "Información operativa poco común en talleres (altura máxima de ingreso, tipos de vehículo aceptados) que elimina fricción antes de la visita.",
        "Redacción orientada a conversión: la sección 'lo que cambia cuando vienes aquí' estructura cada dolor del cliente frente a su solución, en seis puntos reales.",
      ],
      en: [
        "Full site structure built from scratch: services, history, team and contact.",
        "Symptom-based educational pages (check engine light in Quito, high fuel consumption) answering the real questions people ask a repair shop.",
        "A single source of truth for business data —name, address, phone— eliminating any inconsistency across pages.",
        "Local business and FAQ structured data, so search engines and AI assistants understand exactly what the shop offers.",
        "Founder's story timeline and an individual page per team member: trust signals before first contact.",
        "Operational details rarely found on shop sites (maximum entry height, accepted vehicle types) that remove friction before the visit.",
        "Conversion-oriented copywriting: the 'what changes when you come here' section maps each customer pain point to its solution across six real points.",
      ],
    },
    note: {
      es: "El sitio está preparado tanto para búsqueda tradicional como para asistentes de IA: contenido claro, estructura semántica y respuestas directas a preguntas reales.",
      en: "The site is prepared for both traditional search and AI assistants: clear content, semantic structure and direct answers to real questions.",
    },
  },
  {
    slug: "eventos-mw",
    client: "Eventos MW",
    role: {
      es: "Auditoría SEO y correcciones",
      en: "SEO audit and fixes",
    },
    year: "2026",
    liveUrl: "https://eventosmw.vercel.app",
    summary: {
      es: "Auditoría y correcciones técnicas para una empresa de alquiler de carpas y organización de eventos con más de 10 años en Quito.",
      en: "Technical audit and fixes for an event tent rental and planning company with over 10 years in Quito.",
    },
    context: {
      es: "Empresa familiar de alquiler de carpas, toldos y mantelería, con catering, tarimas y mobiliario para bodas, quinceaños y graduaciones. Más de 10 años de trayectoria, dos locales físicos en Quito y atención directa por WhatsApp.",
      en: "Family company renting event tents, canopies and linens, with catering, dance floors and furniture for weddings, quinceañeras and graduations. Over 10 years of trajectory, two physical locations in Quito and direct WhatsApp service.",
    },
    problem: {
      es: "El sitio ya existía, pero tenía puntos técnicos que afectaban su desempeño: problemas de visibilidad orgánica y detalles que degradaban la experiencia en dispositivos móviles, justo donde llegan la mayoría de consultas de eventos.",
      en: "The site already existed but had technical issues affecting its performance: limited organic visibility and details that degraded the mobile experience, exactly where most event inquiries come from.",
    },
    work: {
      es: [
        "Auditoría técnica del sitio para identificar lo que estaba limitando su desempeño.",
        "Corrección del manejo de imágenes para que la carga en móviles sea correcta y rápida.",
        "Mejoras de accesibilidad sobre los componentes existentes del sitio.",
        "Revisión del recorrido del cliente: catálogo de servicios claros y contacto directo por WhatsApp desde cada local.",
      ],
      en: [
        "Technical audit of the site to identify what was limiting its performance.",
        "Image handling fixes so mobile loading is correct and fast.",
        "Accessibility improvements on the existing site components.",
        "Review of the customer journey: a clear services catalog and direct WhatsApp contact from each location.",
      ],
    },
    note: {
      es: "Este caso representa el otro modo de trabajo: diagnosticar y mejorar un sitio que ya está en producción, sin reconstruirlo desde cero.",
      en: "This case represents the other way of working: diagnosing and improving a site already in production, without rebuilding it from scratch.",
    },
  },
];
