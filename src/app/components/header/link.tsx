"use client";

interface LinkProps {
  href: string;
  className?: string;
  onClick?: () => void;
}

export default function HeaderLink({
  href,
  className,
  onClick,
  children,
}: LinkProps & { children: React.ReactNode }) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();

    const targetId = href.replace("/#", ""); // Obtener el ID de la sección
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      const headerOffset = 80; // Altura del header fijo
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth", // Desplazamiento suave
      });
    }

    if (onClick) onClick(); // Ejecutar cualquier acción adicional del padre
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      <li
        className={`max-md:w-full md:basis-1/8 text-center block p-2 md:py-0 transition duration-300 ease-in-out hover:text-blue-700`}
      >
        {children}
      </li>
    </a>
  );
}
