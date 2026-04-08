import React, { useState, useRef } from "react";
import { type Language } from "prism-react-renderer";
import { toPng } from "html-to-image";
import { THEMES } from "./code-to-img/constants";
import { Sidebar } from "./code-to-img/Sidebar";
import { ImagePreview } from "./code-to-img/ImagePreview";

const CodeToImage = () => {
  const [code, setCode] = useState(
    '// Pega tu código aquí\nconsole.log("Hola Mundo");',
  );
  const [language, setLanguage] = useState<Language>("javascript");
  const [themeName, setThemeName] = useState<keyof typeof THEMES>("vsDark");
  const [padding, setPadding] = useState(60);
  const [width, setWidth] = useState(1080);
  const [height, setHeight] = useState(1080);
  const [bgImage, setBgImage] = useState("/assets/images/logo_v3.png");
  const [bgType, setBgType] = useState<"color" | "image">("image");
  const [bgColor, setBgColor] = useState("#3b82f6");
  const [bgBlur, setBgBlur] = useState(0);
  const [bgOpacity, setBgOpacity] = useState(100);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [fontSize, setFontSize] = useState(24);
  const [showFooter, setShowFooter] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [showUsername, setShowUsername] = useState(true);
  const [username, setUsername] = useState("xeland314");

  const exportRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!exportRef.current) return;

    try {
      const dataUrl = await toPng(exportRef.current, {
        width: width,
        height: height,
        pixelRatio: 1,
        cacheBust: true,
        backgroundColor: "#111827",
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
          margin: "0",
          padding: "0",
        },
      });
      const link = document.createElement("a");
      link.download = `code-${width}x${height}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error al exportar imagen:", err);
      alert("Error al exportar la imagen.");
    }
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBgImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-4 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-200">
      <Sidebar
        language={language}
        setLanguage={setLanguage}
        themeName={themeName}
        setThemeName={setThemeName}
        width={width}
        setWidth={setWidth}
        height={height}
        setHeight={setHeight}
        padding={padding}
        setPadding={setPadding}
        bgType={bgType}
        setBgType={setBgType}
        bgBlur={bgBlur}
        setBgBlur={setBgBlur}
        bgOpacity={bgOpacity}
        setBgOpacity={setBgOpacity}
        bgColor={bgColor}
        setBgColor={setBgColor}
        handleBgUpload={handleBgUpload}
        fontSize={fontSize}
        setFontSize={setFontSize}
        showLineNumbers={showLineNumbers}
        setShowLineNumbers={setShowLineNumbers}
        showFooter={showFooter}
        setShowFooter={setShowFooter}
        showLogo={showLogo}
        setShowLogo={setShowLogo}
        showUsername={showUsername}
        setShowUsername={setShowUsername}
        username={username}
        setUsername={setUsername}
        handleExport={handleExport}
      />

      <div className="flex-1 flex flex-col gap-6 overflow-auto">
        <textarea
          className="w-full h-40 p-4 font-mono text-sm bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-inner outline-none resize-y hover:border-blue-500"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Escribe o pega tu código aquí..."
        />

        <ImagePreview
          exportRef={exportRef}
          width={width}
          height={height}
          bgType={bgType}
          bgColor={bgColor}
          bgImage={bgImage}
          bgBlur={bgBlur}
          bgOpacity={bgOpacity}
          padding={padding}
          code={code}
          language={language}
          themeName={themeName}
          fontSize={fontSize}
          showLineNumbers={showLineNumbers}
          showFooter={showFooter}
          showLogo={showLogo}
          showUsername={showUsername}
          username={username}
        />
      </div>
    </div>
  );
};

export default CodeToImage;
