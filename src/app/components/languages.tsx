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
  const widthCalculated = parseInt(width as string, 10) * 3;
  const heightCalculated = parseInt(height as string, 10) * 3;
  return (
    <div className={`w-[${widthCalculated}px] h-[${heightCalculated}px] flex flex-col items-center justify-center overflow-hidden self-center`}>
      <ThemedImage
        srcForLight={`https://skillicons.dev/icons?i=${image}&perline=1&theme=light`}
        srcForDark={`https://skillicons.dev/icons?i=${image}&perline=1&theme=dark`}
        alt={title}
        width={width}
        height={height}
      />
      {isTitleHidden ? null : (
        <p className={"w-full text-center font-thin whitespace-nowrap"}>{title}</p>
      )}
    </div>
  );
}
