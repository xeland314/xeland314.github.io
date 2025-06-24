"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ImageThemeProps {
  src: string;
  theme: string;
}

interface ThemedImageProps {
  srcForLight: string;
  srcForDark: string;
  alt: string;
  width?: string;
  height?: string;
  otherThemes?: ImageThemeProps[];
}

const ThemedImage: React.FC<ThemedImageProps> = ({
  srcForLight,
  srcForDark,
  alt,
  width,
  height,
  otherThemes = [],
}) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Buscar un tema adicional en el array otherThemes
  const matchedTheme = otherThemes.find(
    (theme) => theme.theme === resolvedTheme
  );

  // Definir la imagen según el tema activo
  const src =
    matchedTheme?.src || (resolvedTheme === "dark" ? srcForDark : srcForLight);

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      title={alt}
    />
  );
};

export default ThemedImage;
