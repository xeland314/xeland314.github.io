import React from "react";

import { useAstroTheme } from "../../hooks/useAstroThemes"; // Ajusta la ruta a tu hook

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
  const { resolvedTheme, mounted } = useAstroTheme(); // O el hook de tu elección

  if (!mounted || !resolvedTheme) {
    // Retorna un div placeholder mientras se monta y resuelve el tema
    return (
      <div
        className={`w-[${width || "32px"}] h-[${
          height || "32px"
        }] bg-black dark:bg-white`}
      ></div>
    );
  }

  const matchedTheme = otherThemes.find(
    (theme) => theme.theme === resolvedTheme
  );
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
      className="transition-all duration-300"
    />
  );
};

export default ThemedImage;
