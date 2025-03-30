import React from "react";

export function TextEncryptorPreview() {
  return (
    <div className="relative w-full h-96 border rounded-lg shadow-lg my-8">
      <iframe
        src="https://xeland314.github.io/encriptador-de-texto/"
        title="Text Encryptor Preview"
        className="w-full h-full rounded-lg border-none"
      ></iframe>
    </div>
  );
}
