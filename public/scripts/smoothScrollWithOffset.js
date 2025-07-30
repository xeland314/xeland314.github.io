document.addEventListener("DOMContentLoaded", () => {
  const fixedHeader = document.getElementById("main-header");
  let fixedHeaderHeight = 0;

  // Función para obtener la altura del header de forma dinámica
  function getFixedHeaderHeight() {
    if (fixedHeader) {
      // clientHeight es mejor que offsetHeight para este caso
      // ya que no incluye el borde si está definido.
      return fixedHeader.clientHeight;
    }
    // Valor de fallback si el header no se encuentra o no tiene altura
    return 0; // O un valor seguro como 60 si siempre esperas un header
  }

  // Función principal para aplicar el desplazamiento suave con offset
  function smoothScrollToTarget(targetId) {
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      fixedHeaderHeight = getFixedHeaderHeight(); // Obtener la altura más reciente del header

      // Calcula la posición del elemento relativa al viewport y añade el scroll actual
      const elementPosition =
        targetElement.getBoundingClientRect().top + window.scrollY;

      // Calcula la posición final con el offset del header
      // Se resta un poco más para evitar que el texto quede justo al borde inferior del header
      const offsetPosition = elementPosition - fixedHeaderHeight + 40;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Actualiza la URL para reflejar la sección actual sin un salto brusco
      // Usa replaceState para no añadir múltiples entradas al historial si el usuario
      // hace clic en varios enlaces de ancla en la misma página.
      history.replaceState(null, "", `#${targetId}`);
    }
  }

  // 1. Manejar clics en enlaces de ancla
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    // Aseguramos que no se aplique a enlaces que tengan su propia lógica
    // o que deban ser manejados de forma diferente (ej. enlaces a modales)
    if (!anchor.classList.contains("no-offset-scroll")) {
      anchor.addEventListener("click", (event) => {
        const href = anchor.getAttribute("href");
        if (href && href.startsWith("#")) {
          event.preventDefault(); // Previene el salto por defecto
          const targetId = href.substring(1);
          smoothScrollToTarget(targetId);
        }
      });
    }
  });

  // 2. Manejar la carga inicial de la página con un hash en la URL
  // Esto asegura que si alguien llega a tudominio.com/#seccion, el offset se aplique.
  function handleInitialHashScroll() {
    if (window.location.hash) {
      const targetId = window.location.hash.substring(1);
      // Retrasar un poco la ejecución para asegurar que el DOM esté completamente renderizado
      // y que Astro haya aplicado su hidratación si es necesario,
      // y que la altura del header sea precisa.
      // Un timeout de 50-100ms suele ser suficiente.
      setTimeout(() => {
        smoothScrollToTarget(targetId);
      }, 100);
    }
  }

  // Ejecuta la función al cargar la página
  handleInitialHashScroll();

  // Opcional: Re-aplicar el scroll si el usuario usa los botones de avance/retroceso del navegador
  // que cambian el hash de la URL.
  window.addEventListener('hashchange', () => {
    handleInitialHashScroll();
  });
});