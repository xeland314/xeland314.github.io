"use client";
import React, { useState } from "react";

interface CodeBlockProps {
  code: string;
}

export default function CodeBlock({ code }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);

    // Cambia el estado después de unos segundos
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="relative bg-gray-200 dark:bg-gray-700 rounded-lg p-4">
      <code className="block font-mono text-sm text-black dark:text-white overflow-auto">
        {code}
      </code>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
      >
        {isCopied ? "Copiado!" : "Copiar"}
      </button>
    </div>
  );
}
