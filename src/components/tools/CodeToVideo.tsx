import { useState, useRef, useEffect } from "react";
import { Highlight, type Language } from "prism-react-renderer";
import { THEMES } from "./code-to-video/constants";
import { Sidebar } from "./code-to-video/Sidebar";
import { VideoPreview } from "./code-to-video/VideoPreview";

const CodeToVideo = () => {
  const [code, setCode] = useState(
    '// Pega tu código aquí\nfunction hello() {\n  console.log("Hello Customizable Video!");\n}\n\nhello();',
  );
  const [language, setLanguage] = useState<Language>("javascript");
  const [themeName, setThemeName] = useState<keyof typeof THEMES>("vsDark");
  const [fontSize, setFontSize] = useState(24);
  const [width, setWidth] = useState(1080);
  const [height, setHeight] = useState(1920);
  const [fps, setFps] = useState(30);
  const [typingSpeed, setTypingSpeed] = useState(50);
  const [topPadding, setTopPadding] = useState(200);
  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState(0);

  // Opciones de Texto Plano
  const [usePlainText, setUsePlainText] = useState(false);
  const [plainTextColor, setPlainTextColor] = useState("#ffffff");
  const [plainBgColor, setPlainBgColor] = useState("#111827");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const layout = {
    margin: 60,
    lineHeight: 1.5,
  };

  const getTokenStyle = (token: any, theme: any) => {
    if (usePlainText) return { color: plainTextColor };

    const styles = theme.styles;
    for (const s of styles) {
      if (s.types.some((type: string) => token.types.includes(type))) {
        return s.style;
      }
    }
    return theme.plain;
  };

  const drawFrame = (
    ctx: CanvasRenderingContext2D,
    charCount: number,
    scrollY: number,
    tokens: any[][],
  ) => {
    const lh = fontSize * layout.lineHeight;
    const theme = THEMES[themeName];

    // Color de fondo
    ctx.fillStyle = usePlainText
      ? plainBgColor
      : theme.plain.backgroundColor || "#272822";
    ctx.fillRect(0, 0, width, height);

    ctx.font = `${fontSize}px "Fira Code", monospace`;
    ctx.textBaseline = "top";

    let totalCharsProcessed = 0;
    let currentY = topPadding - scrollY;
    let lastCursorPos = { x: layout.margin, y: currentY };

    for (let i = 0; i < tokens.length; i++) {
      const line = tokens[i];
      let currentX = layout.margin;

      if (totalCharsProcessed >= charCount) break;

      for (const token of line) {
        const remainingChars = Math.max(0, charCount - totalCharsProcessed);
        if (remainingChars <= 0) break;

        const textToDraw = token.content.substring(0, remainingChars);
        const style = getTokenStyle(token, theme);
        ctx.fillStyle =
          style.color ||
          (usePlainText ? plainTextColor : theme.plain.color) ||
          "#fff";

        ctx.fillText(textToDraw, currentX, currentY);

        const metrics = ctx.measureText(textToDraw);
        currentX += metrics.width;
        totalCharsProcessed += token.content.length;

        lastCursorPos = { x: currentX, y: currentY };

        if (token.content.length > remainingChars) {
          totalCharsProcessed = charCount;
          break;
        }
      }

      totalCharsProcessed += 1;
      currentY += lh;
    }

    if (charCount < code.length + tokens.length) {
      if (Math.floor(Date.now() / 500) % 2 === 0 || isRendering) {
        ctx.fillStyle = usePlainText ? plainTextColor : "#fff";
        ctx.fillRect(lastCursorPos.x + 2, lastCursorPos.y, 2, fontSize);
      }
    }

    return currentY + scrollY;
  };

  const startAnimation = (forExport = false, tokens: any[][]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let charCount = 0;
    let scrollY = 0;
    let lastTime = performance.now();
    const totalChars = code.length + tokens.length;

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const step = forExport ? typingSpeed / fps : typingSpeed * deltaTime;
      charCount += step;

      const endY = drawFrame(ctx, Math.floor(charCount), scrollY, tokens);

      const triggerY = height - 500;
      if (endY - scrollY > triggerY) {
        scrollY += (endY - scrollY - triggerY) * (forExport ? 0.2 : 0.1);
      }

      if (charCount < totalChars) {
        setProgress(Math.floor((charCount / totalChars) * 100));
        requestRef.current = requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          if (forExport && mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop();
          }
        }, 1000);
      }
    };

    requestRef.current = requestAnimationFrame(animate);
  };

  const handleExport = (tokens: any[][]) => {
    const canvas = canvasRef.current;
    if (!canvas || isRendering) return;

    setIsRendering(true);
    chunksRef.current = [];

    const stream = canvas.captureStream(fps);
    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
      videoBitsPerSecond: 12000000,
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `code-video-${width}x${height}.webm`;
      a.click();
      setIsRendering(false);
      setProgress(0);
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    startAnimation(true, tokens);
  };

  return (
    <Highlight theme={THEMES[themeName]} code={code} language={language}>
      {({ tokens }) => {
        useEffect(() => {
          const ctx = canvasRef.current?.getContext("2d");
          if (ctx) drawFrame(ctx, code.length + tokens.length, 0, tokens);
        }, [
          code,
          tokens,
          themeName,
          fontSize,
          width,
          height,
          topPadding,
          usePlainText,
          plainTextColor,
          plainBgColor,
        ]);

        return (
          <div className="flex flex-col lg:flex-row gap-8 p-4 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-200">
            <Sidebar
              usePlainText={usePlainText}
              setUsePlainText={setUsePlainText}
              language={language}
              setLanguage={setLanguage}
              themeName={themeName}
              setThemeName={setThemeName}
              plainTextColor={plainTextColor}
              setPlainTextColor={setPlainTextColor}
              plainBgColor={plainBgColor}
              setPlainBgColor={setPlainBgColor}
              width={width}
              setWidth={setWidth}
              height={height}
              setHeight={setHeight}
              topPadding={topPadding}
              setTopPadding={setTopPadding}
              typingSpeed={typingSpeed}
              setTypingSpeed={setTypingSpeed}
              fps={fps}
              setFps={setFps}
              fontSize={fontSize}
              setFontSize={setFontSize}
              isRendering={isRendering}
              progress={progress}
              onPreview={() => {
                if (requestRef.current)
                  cancelAnimationFrame(requestRef.current);
                startAnimation(false, tokens);
              }}
              onExport={() => handleExport(tokens)}
            />

            <VideoPreview
              code={code}
              setCode={setCode}
              canvasRef={canvasRef}
              width={width}
              height={height}
              isRendering={isRendering}
              usePlainText={usePlainText}
              language={language}
            />
          </div>
        );
      }}
    </Highlight>
  );
};

export default CodeToVideo;
