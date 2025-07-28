document.addEventListener("DOMContentLoaded", () => {
  // Función para aplicar el desplazamiento suave
  function applySmoothScroll(event: MouseEvent) {
    // Obtenemos el atributo href del enlace clickeado
    const anchor = event.currentTarget as HTMLAnchorElement;
    const href = anchor.getAttribute("href");

    // Solo procesamos enlaces de ancla (que empiezan con #)
    if (!href || !href.startsWith("#")) {
      return;
    }

    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      event.preventDefault(); // Previene el comportamiento por defecto (salto brusco)

      const fixedHeaderHeight = 50;

      const elementPosition =
        targetElement.getBoundingClientRect().top + window.scrollY;

      const offsetPosition = elementPosition - fixedHeaderHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      history.pushState(null, "", href);
    }
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    // Asegura de no aplicar esto a enlaces que ya tienen su propia lógica
    // if (!anchor.classList.contains('no-offset-scroll')) {
    //   anchor.addEventListener('click', applySmoothScroll);
    // }
    anchor.addEventListener("click", applySmoothScroll as EventListener);
  });
});
