"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ThemedImageProps {
  srcForLight: string;
  srcForDark: string;
  alt: string;
  width?: string;
  height?: string;
}

const ThemedImage: React.FC<ThemedImageProps> = ({
  srcForLight,
  srcForDark,
  alt,
  width,
  height,
}) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  let src;
  switch (resolvedTheme) {
    case "light":
      src = srcForLight;
      break;
    case "dark":
      src = srcForDark;
      break;
    default:
      src =
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      break;
  }

  return (
    <img src={src} alt={alt} width={width} height={height} loading="lazy" />
  );
};

export default ThemedImage;
