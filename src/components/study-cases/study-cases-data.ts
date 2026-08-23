export interface LocalizedText {
  es: string;
  en: string;
}

export interface EvidenceItem {
  src: string;
  width: number;
  height: number;
  alt: LocalizedText;
  caption: LocalizedText;
}

export interface StudyCase {
  slug: string;
  client: string;
  role: LocalizedText;
  year: string;
  liveUrl: string;
  summary: LocalizedText;
  context: LocalizedText;
  problem: LocalizedText;
  work: { es: string[]; en: string[] };
  note: LocalizedText;
  heroImage?: { src: string; width: number; height: number; alt: LocalizedText };
  resultsIntro?: LocalizedText;
  evidence?: EvidenceItem[];
  nextSteps?: LocalizedText[];
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
      es: "Resultados verificables desde julio de 2026: primer resultado orgánico en Google, Bing y Brave Search para la búsqueda de marca, presencia en las respuestas de IA de los tres buscadores con los datos correctos del negocio, y 100/100 en accesibilidad, recomendaciones y SEO según PageSpeed Insights.",
      en: "Verifiable results since July 2026: first organic result on Google, Bing and Brave Search for the brand query, featured in all three engines' AI answers with accurate business details, and 100/100 in accessibility, best practices and SEO according to PageSpeed Insights.",
    },
    heroImage: {
      src: "/case-studies/talleres-serviauto/hero.webp",
      width: 1600,
      height: 840,
      alt: {
        es: "Sitio web de Talleres Servi Auto construido desde cero",
        en: "The Talleres Servi Auto website built from scratch",
      },
    },
    resultsIntro: {
      es: "Capturas reales tomadas en julio de 2026, unos meses después del lanzamiento.",
      en: "Real screenshots taken in July 2026, a few months after launch.",
    },
    nextSteps: [
      {
        es: "Recolección activa de reseñas: pedirle al cliente su reseña de Google al entregarle el vehículo. Eso ya no es programación sino operación del negocio, y es la pieza con más impacto a corto plazo.",
        en: "Active review collection: asking the customer for a Google review when handing back their car. That is no longer programming but business operations, and it is the piece with the most short-term impact.",
      },
      {
        es: "Perfil de empresa de Google más vivo: subir fotos reales de trabajos recientes con regularidad para mantener el perfil fresco y reforzar el posicionamiento local.",
        en: "A livelier Google Business Profile: regularly uploading real photos of recent jobs to keep the profile fresh and reinforce local ranking.",
      },
      {
        es: "Fotografía propia para el sitio: reemplazar imágenes genéricas por fotos reales del equipo trabajando, apenas el negocio pueda producirlas.",
        en: "Original photography for the site: replacing generic imagery with real photos of the team at work, as soon as the business can produce them.",
      },
    ],
    evidence: [
      {
        src: "/case-studies/talleres-serviauto/google-first-place.webp",
        width: 1200,
        height: 647,
        alt: {
          es: "Búsqueda 'talleres serviauto' en Google con el sitio como primer resultado",
          en: "Google search for 'talleres serviauto' with the site as the first result",
        },
        caption: {
          es: "Primer resultado orgánico en Google, por encima de Facebook e Instagram del propio negocio.",
          en: "First organic result on Google, above the business's own Facebook and Instagram.",
        },
      },
      {
        src: "/case-studies/talleres-serviauto/google-ai.webp",
        width: 1200,
        height: 647,
        alt: {
          es: "Modo IA de Google citando al taller como primera alternativa al sur de Quito",
          en: "Google AI Mode citing the shop as the first alternative in South Quito",
        },
        caption: {
          es: "El Modo IA de Google lo cita como la primera alternativa al sur de Quito, con dirección, teléfono y horarios correctos.",
          en: "Google AI Mode cites it as the first option in South Quito, with the right address, phone and hours.",
        },
      },
      {
        src: "/case-studies/talleres-serviauto/bing-first-place.webp",
        width: 1200,
        height: 648,
        alt: {
          es: "Panel de negocio destacado en Bing con mapa y fotos del taller",
          en: "Featured business panel on Bing with map and shop photos",
        },
        caption: {
          es: "Panel de negocio destacado en Bing: mapa, fotos reales del taller y botones de contacto directo.",
          en: "Featured business panel on Bing: map, real photos of the shop and direct contact buttons.",
        },
      },
      {
        src: "/case-studies/talleres-serviauto/bing-ai.webp",
        width: 1200,
        height: 645,
        alt: {
          es: "Respuesta generada con IA en Bing describiendo servicios y contacto del taller",
          en: "AI-generated answer on Bing describing the shop's services and contact info",
        },
        caption: {
          es: "La respuesta generada con IA de Bing describe al taller con su ubicación y horarios exactos.",
          en: "Bing's AI-generated answer describes the shop with its exact location and hours.",
        },
      },
      {
        src: "/case-studies/talleres-serviauto/brave-first-place.webp",
        width: 1200,
        height: 632,
        alt: {
          es: "Búsqueda en Brave Search desde Quito con el sitio como primer resultado",
          en: "Brave Search from Quito with the site as the first result",
        },
        caption: {
          es: "Primer resultado en Brave Search buscando desde Quito, junto a la ficha de mapa del taller.",
          en: "First result on Brave Search when searching from Quito, next to the shop's map listing.",
        },
      },
      {
        src: "/case-studies/talleres-serviauto/brave-ai.webp",
        width: 1200,
        height: 634,
        alt: {
          es: "Respuesta de IA de Brave presentando el taller con su trayectoria y sitio web",
          en: "Brave AI answer presenting the shop with its trajectory and website link",
        },
        caption: {
          es: "Respuesta de IA de Brave con nombre, trayectoria de 25 años y enlace directo al sitio.",
          en: "Brave's AI answer with the name, 25-year trajectory and a direct link to the site.",
        },
      },
      {
        src: "/case-studies/talleres-serviauto/pagespeed-mobile.webp",
        width: 1600,
        height: 840,
        alt: {
          es: "PageSpeed Insights en móviles: 96 de rendimiento y 100 en accesibilidad, recomendaciones y SEO",
          en: "PageSpeed Insights on mobile: 96 performance and 100 in accessibility, best practices and SEO",
        },
        caption: {
          es: "PageSpeed en móviles: 96 de rendimiento y 100 en accesibilidad, recomendaciones y SEO.",
          en: "Mobile PageSpeed: 96 performance and 100 in accessibility, best practices and SEO.",
        },
      },
      {
        src: "/case-studies/talleres-serviauto/pagespeed-desktop.webp",
        width: 1600,
        height: 840,
        alt: {
          es: "PageSpeed Insights en escritorio: 100 en las cuatro métricas y 3/3 en navegación con agentes",
          en: "Desktop PageSpeed Insights: 100 across all four metrics and 3/3 agent navigation",
        },
        caption: {
          es: "En escritorio, 100 en las cuatro métricas —y navegación por agentes de IA 3/3—.",
          en: "On desktop, 100 across all four metrics —plus 3/3 AI agent navigation—.",
        },
      },
    ],
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
