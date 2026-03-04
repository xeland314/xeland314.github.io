import React, { useState, useRef, useEffect } from 'react';
import { Highlight, themes, type Language } from 'prism-react-renderer';

const THEMES = {
  vsDark: themes.vsDark,
  dracula: themes.dracula,
  nightOwl: themes.nightOwl,
  shadesOfPurple: themes.shadesOfPurple,
};

const CodeToVideo = () => {
  const [code, setCode] = useState('// Pega tu código aquí\nfunction hello() {\n  console.log("Hello Customizable Video!");\n}\n\nhello();');
  const [language, setLanguage] = useState<Language>('javascript');
  const [themeName, setThemeName] = useState<keyof typeof THEMES>('vsDark');
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
  const [plainTextColor, setPlainTextColor] = useState('#ffffff');
  const [plainBgColor, setPlainBgColor] = useState('#111827');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
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

  const drawFrame = (ctx: CanvasRenderingContext2D, charCount: number, scrollY: number, tokens: any[][]) => {
    const lh = fontSize * layout.lineHeight;
    const theme = THEMES[themeName];
    
    // Color de fondo
    ctx.fillStyle = usePlainText ? plainBgColor : (theme.plain.backgroundColor || '#272822');
    ctx.fillRect(0, 0, width, height);

    ctx.font = `${fontSize}px "Fira Code", monospace`;
    ctx.textBaseline = 'top';

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
        ctx.fillStyle = style.color || (usePlainText ? plainTextColor : theme.plain.color) || '#fff';
        
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
        ctx.fillStyle = usePlainText ? plainTextColor : '#fff';
        ctx.fillRect(lastCursorPos.x + 2, lastCursorPos.y, 2, fontSize);
      }
    }

    return currentY + scrollY;
  };

  const startAnimation = (forExport = false, tokens: any[][]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let charCount = 0;
    let scrollY = 0;
    let lastTime = performance.now();
    const totalChars = code.length + tokens.length;

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const step = forExport ? (typingSpeed / fps) : (typingSpeed * deltaTime);
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
          if (forExport && mediaRecorderRef.current?.state === 'recording') {
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
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 12000000 
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
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
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) drawFrame(ctx, code.length + tokens.length, 0, tokens);
        }, [code, tokens, themeName, fontSize, width, height, topPadding, usePlainText, plainTextColor, plainBgColor]);

        return (
          <div className="flex flex-col lg:flex-row gap-8 p-4 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-200">
            <div className="w-full lg:w-80 space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl h-fit sticky top-4">
              <h2 className="text-xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">Configuración</h2>
              
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                    <label className="font-bold text-xs uppercase opacity-70">Texto Plano</label>
                    <input 
                        type="checkbox" 
                        checked={usePlainText} 
                        onChange={e => setUsePlainText(e.target.checked)}
                        className="w-4 h-4 accent-blue-600"
                    />
                </div>

                {!usePlainText ? (
                    <div>
                        <label className="block mb-1 font-bold">Lenguaje / Tema</label>
                        <div className="grid grid-cols-2 gap-2">
                            <select value={language} onChange={e => setLanguage(e.target.value as Language)} className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600 outline-none">
                            <option value="javascript">JavaScript</option>
                            <option value="typescript">TypeScript</option>
                            <option value="python">Python</option>
                            <option value="rust">Rust</option>
                            <option value="cpp">C++</option>
                            </select>
                            <select value={themeName} onChange={e => setThemeName(e.target.value as keyof typeof THEMES)} className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600 outline-none">
                            {Object.keys(THEMES).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div>
                            <label className="block mb-1 font-bold text-xs uppercase opacity-50">Color Texto</label>
                            <div className="flex gap-2">
                                <input type="color" value={plainTextColor} onChange={e => setPlainTextColor(e.target.value)} className="w-8 h-8 rounded border-none cursor-pointer" />
                                <input type="text" value={plainTextColor} onChange={e => setPlainTextColor(e.target.value)} className="flex-1 bg-gray-50 dark:bg-gray-700 px-2 rounded border border-gray-300 dark:border-gray-600 text-xs font-mono" />
                            </div>
                        </div>
                        <div>
                            <label className="block mb-1 font-bold text-xs uppercase opacity-50">Color Fondo</label>
                            <div className="flex gap-2">
                                <input type="color" value={plainBgColor} onChange={e => setPlainBgColor(e.target.value)} className="w-8 h-8 rounded border-none cursor-pointer" />
                                <input type="text" value={plainBgColor} onChange={e => setPlainBgColor(e.target.value)} className="flex-1 bg-gray-50 dark:bg-gray-700 px-2 rounded border border-gray-300 dark:border-gray-600 text-xs font-mono" />
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block mb-1 font-bold text-xs uppercase opacity-50">Ancho</label>
                        <input type="number" value={width} onChange={e => setWidth(Number(e.target.value))} className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block mb-1 font-bold text-xs uppercase opacity-50">Alto</label>
                        <input type="number" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600" />
                    </div>
                </div>

                <div>
                  <label className="block mb-1 font-bold">Top Padding ({topPadding}px)</label>
                  <input type="range" min="0" max="800" value={topPadding} onChange={e => setTopPadding(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                </div>

                <div>
                  <label className="block mb-1 font-bold">Caracteres / seg ({typingSpeed})</label>
                  <input type="range" min="10" max="300" value={typingSpeed} onChange={e => setTypingSpeed(Number(e.target.value))} className="w-full" />
                </div>

                <div>
                  <label className="block mb-1 font-bold">FPS ({fps})</label>
                  <input type="range" min="24" max="60" value={fps} onChange={e => setFps(Number(e.target.value))} className="w-full" />
                </div>

                <div>
                  <label className="block mb-1 font-bold">Tamaño Fuente ({fontSize}px)</label>
                  <input type="range" min="12" max="64" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full" />
                </div>

                <div className="pt-4 space-y-3">
                  <button 
                      onClick={() => {
                          if (requestRef.current) cancelAnimationFrame(requestRef.current);
                          startAnimation(false, tokens);
                      }}
                      disabled={isRendering}
                      className="w-full py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 font-bold rounded-xl transition-all disabled:opacity-50"
                  >
                    Vista Previa
                  </button>
                  <button 
                      onClick={() => handleExport(tokens)}
                      disabled={isRendering}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isRendering ? `Renderizando ${progress}%...` : 'Exportar Video'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-6">
              <textarea
                className="w-full h-40 p-4 font-mono text-sm bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-inner outline-none resize-y hover:border-blue-500 transition-colors"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Escribe tu código aquí..."
              />

              <div className="flex-1 bg-black/90 rounded-2xl overflow-hidden flex items-center justify-center p-4 border border-gray-700 relative shadow-2xl">
                <canvas 
                  ref={canvasRef} 
                  width={width} 
                  height={height}
                  className="max-h-full max-w-full object-contain"
                  style={{ width: 'auto', height: '100%', aspectRatio: `${width}/${height}` }}
                />
                {!isRendering && (
                   <div className="absolute top-8 left-8 bg-blue-600/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white border border-white/10 uppercase tracking-widest font-black shadow-xl">
                      {usePlainText ? 'Plain Text' : language} • Preview
                   </div>
                )}
              </div>
            </div>
          </div>
        );
      }}
    </Highlight>
  );
};

export default CodeToVideo;
