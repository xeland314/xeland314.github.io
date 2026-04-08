import React from "react";

interface Props {
  showFooter: boolean;
  setShowFooter: (show: boolean) => void;
  showLogo: boolean;
  setShowLogo: (show: boolean) => void;
  showUsername: boolean;
  setShowUsername: (show: boolean) => void;
  username: string;
  setUsername: (username: string) => void;
}

export const WatermarkSettings: React.FC<Props> = ({
  showFooter,
  setShowFooter,
  showLogo,
  setShowLogo,
  showUsername,
  setShowUsername,
  username,
  setUsername,
}) => (
  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
    <label
      htmlFor="watermark-footer"
      className="block font-bold text-xs uppercase text-gray-400"
    >
      Marca de Agua
    </label>
    <div className="flex items-center gap-2">
      <input
        id="watermark-footer"
        type="checkbox"
        checked={showFooter}
        onChange={(e) => setShowFooter(e.target.checked)}
      />
      <label htmlFor="watermark-footer" className="text-sm">
        Mostrar Footer
      </label>
    </div>
    {showFooter && (
      <div className="pl-4 space-y-2 border-l-2 border-blue-500/30">
        <div className="flex items-center gap-2">
          <input
            id="watermark-logo"
            type="checkbox"
            checked={showLogo}
            onChange={(e) => setShowLogo(e.target.checked)}
          />
          <label htmlFor="watermark-logo" className="text-xs">
            Mostrar Logo
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="watermark-username"
            type="checkbox"
            checked={showUsername}
            onChange={(e) => setShowUsername(e.target.checked)}
          />
          <label htmlFor="watermark-username" className="text-xs">
            Mostrar Usuario
          </label>
        </div>
        <input
          id="watermark-username-input"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-gray-50 dark:bg-gray-700 p-1 rounded border border-gray-300 dark:border-gray-600 text-xs font-mono"
          placeholder="Usuario..."
        />
      </div>
    )}
  </div>
);
