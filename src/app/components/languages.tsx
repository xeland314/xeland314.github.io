import ThemedImage from "./themedImage";

interface LanguageImageProps {
  title: string;
  image: string;
  width?: string;
  height?: string;
  isTitleHidden?: boolean;
}

export default function LanguageImage({
  title,
  image,
  width: width = "32",
  height: height = "32",
  isTitleHidden: isTitleHidden = false,
}: LanguageImageProps) {
  const widthCalculated = parseInt(width as string, 10) * 1;
  const heightCalculated = parseInt(height as string, 10) * 1;

  return (
    <div className="flex flex-col items-center">
      {/* Imagen ajustada con width y height */}
      <div className="flex items-center justify-center">
        <ThemedImage
          srcForLight={`https://skillicons.dev/icons?i=${image}&perline=1&theme=light`}
          srcForDark={`https://skillicons.dev/icons?i=${image}&perline=1&theme=dark`}
          alt={title}
          width={widthCalculated.toString()}
          height={heightCalculated.toString()}
        />
      </div>
      {/* Título ajustado para no verse afectado por la imagen */}
      {isTitleHidden ? null : (
        <p className="text-center text-sm font-thin p-0 pt-1">{title}</p>
      )}
    </div>
  );
}
