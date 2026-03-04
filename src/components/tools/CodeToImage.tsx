import React, { useState, useRef } from 'react';
import { Highlight, themes, type Language } from 'prism-react-renderer';
import { toPng } from 'html-to-image';

const THEMES = {
  vsDark: themes.vsDark,
  github: themes.github,
  dracula: themes.dracula,
  nightOwl: themes.nightOwl,
  shadesOfPurple: themes.shadesOfPurple,
  ultramin: themes.ultramin,
};

const CodeToImage = () => {
  const [code, setCode] = useState('// Pega tu código aquí\nconsole.log("Hola Mundo");');
  const [language, setLanguage] = useState<Language>('javascript');
  const [themeName, setThemeName] = useState<keyof typeof THEMES>('vsDark');
  const [padding, setPadding] = useState(60);
  const [width, setWidth] = useState(1080);
  const [height, setHeight] = useState(1080);
  const [bgImage, setBgImage] = useState('/assets/images/logo_v3.png');
  const [bgType, setBgType] = useState<'color' | 'image'>('image');
  const [bgColor, setBgColor] = useState('#3b82f6');
  const [bgBlur, setBgBlur] = useState(0);
  const [bgOpacity, setBgOpacity] = useState(100);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [fontSize, setFontSize] = useState(24);
  const [showFooter, setShowFooter] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [showUsername, setShowUsername] = useState(true);
  const [username, setUsername] = useState('xeland314');

  const exportRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!exportRef.current) return;

    try {
      // Forzamos la descarga con las dimensiones exactas
      const dataUrl = await toPng(exportRef.current, {
        width: width,
        height: height,
        pixelRatio: 1,
        cacheBust: true,
        backgroundColor: '#111827', // Fondo de seguridad
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          margin: '0',
          padding: '0',
        }
      });
      const link = document.createElement('a');
      link.download = `code-${width}x${height}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error al exportar imagen:', err);
      alert('Error al exportar la imagen.');
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
      {/* Panel de Controles */}
      <div className="w-full lg:w-80 space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl h-fit sticky top-4">
        <h2 className="text-xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">Configuración</h2>

        <div className="space-y-4 text-sm">
          <div>
            <label className="block mb-1 font-bold">Lenguaje</label>
            <select
              className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="rust">Rust</option>
              <option value="go">Go</option>
              <option value="cpp">C++</option>
              <option value="css">CSS</option>
              <option value="html">HTML</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-bold">Tema</label>
            <select
              className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600"
              value={themeName}
              onChange={(e) => setThemeName(e.target.value as keyof typeof THEMES)}
            >
              {Object.keys(THEMES).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1 font-bold">Ancho (px)</label>
              <input
                type="number"
                className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block mb-1 font-bold">Alto (px)</label>
              <input
                type="number"
                className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-bold">Padding ({padding}px)</label>
            <input type="range" min="0" max="400" value={padding} onChange={(e) => setPadding(Number(e.target.value))} className="w-full" />
          </div>

          <div>
            <label className="block mb-1 font-bold">Tamaño Fuente ({fontSize}px)</label>
            <input type="range" min="12" max="64" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full" />
          </div>

          <div>
            <label className="block mb-1 font-bold">Tipo de Fondo</label>
            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <button
                className={`flex-1 py-1 text-xs rounded-md transition-all ${bgType === 'color' ? 'bg-white dark:bg-gray-600 shadow-sm font-bold' : 'opacity-50'}`}
                onClick={() => setBgType('color')}
              >
                Color
              </button>
              <button
                className={`flex-1 py-1 text-xs rounded-md transition-all ${bgType === 'image' ? 'bg-white dark:bg-gray-600 shadow-sm font-bold' : 'opacity-50'}`}
                onClick={() => setBgType('image')}
              >
                Imagen
              </button>
            </div>
          </div>

          {bgType === 'color' ? (
            <div>
              <label className="block mb-1 font-bold">Color de Fondo</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-10 p-1 rounded bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600 font-mono text-xs uppercase"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block mb-1 font-bold">Fondo Personalizado</label>
              <input type="file" accept="image/*" onChange={handleBgUpload} className="w-full text-xs" />
            </div>
          )}

          <div className="flex items-center gap-2">
            <input type="checkbox" checked={showLineNumbers} onChange={(e) => setShowLineNumbers(e.target.checked)} />
            <label className="font-bold">Números de línea</label>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <label className="block font-bold text-xs uppercase text-gray-400">Marca de Agua</label>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={showFooter} onChange={(e) => setShowFooter(e.target.checked)} />
              <label className="">Mostrar Footer</label>
            </div>
            {showFooter && (
              <div className="pl-4 space-y-2 border-l-2 border-blue-500/30">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={showLogo} onChange={(e) => setShowLogo(e.target.checked)} />
                  <label className="text-xs">Mostrar Logo</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={showUsername} onChange={(e) => setShowUsername(e.target.checked)} />
                  <label className="text-xs">Mostrar Usuario</label>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-700 p-1 rounded border border-gray-300 dark:border-gray-600 text-xs font-mono"
                  placeholder="Usuario..."
                />
              </div>
            )}
          </div>

          <button
            onClick={handleExport}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
          >
            Exportar Imagen (PNG)
          </button>
        </div>
      </div>

      {/* Editor y Preview */}
      <div className="flex-1 flex flex-col gap-6 overflow-auto">
        <textarea
          className="w-full h-40 p-4 font-mono text-sm bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-inner outline-none resize-y hover:border-blue-500"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Escribe o pega tu código aquí..."
        />

        <div className="overflow-auto border border-gray-300 dark:border-gray-700 rounded-2xl bg-gray-200 dark:bg-black p-4 flex justify-start items-start min-h-[600px]">
          <div
            ref={exportRef}
            className="flex-shrink-0"
            style={{
              width: `${width}px`,
              height: `${height}px`,
              backgroundImage: bgType === 'image' && bgImage ? `url(${bgImage})` : 'none',
              backgroundColor: bgType === 'color' ? bgColor : 'transparent',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            {/* Overlay para oscurecer el fondo si es necesario */}
            <div className="absolute inset-0 bg-black/10"></div>

            {/* Footer / Watermark */}
            {showFooter && (
              <div className="absolute bottom-6 right-6 flex items-center gap-3 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-2xl">
                {showLogo && (
                  <img src="/assets/images/logo_v3.png" alt="Logo" className="w-8 h-8 rounded-full border border-white/20" />
                )}
                {showUsername && (
                  <span className="text-white font-bold text-sm tracking-tight">@{username}</span>
                )}
              </div>
            )}

            <div
              style={{
                padding: `${padding}px`,
                width: '100%',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Highlight theme={THEMES[themeName]} code={code} language={language}>
                {({ className, style, tokens, getLineProps, getTokenProps }) => (
                  <pre
                    className={`${className} shadow-2xl overflow-hidden min-w-[300px] w-full`}
                    style={{
                      ...style,
                      fontSize: `${fontSize}px`,
                      fontFamily: '"Fira Code", monospace',
                      lineHeight: '1.5',
                      borderRadius: '0px'
                    }}
                  >
                    <div className="bg-white/10 dark:bg-black/20 p-3 flex gap-2 border-b border-white/5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="p-6">
                      {tokens.map((line, i) => (
                        <div key={i} {...getLineProps({ line })} className="table-row">
                          {showLineNumbers && (
                            <span className="table-cell text-right pr-4 opacity-30 select-none text-xs">
                              {i + 1}
                            </span>
                          )}
                          <span className="table-cell">
                            {line.map((token, key) => (
                              <span key={key} {...getTokenProps({ token })} />
                            ))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </pre>
                )}
              </Highlight>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeToImage;
