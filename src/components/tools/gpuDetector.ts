export async function checkGPU(): Promise<boolean> {
  // 1. Critical Environment Checks
  if (
    typeof SharedArrayBuffer === "undefined" ||
    typeof OffscreenCanvas === "undefined"
  ) {
    console.warn("GPU Check: Missing SharedArrayBuffer or OffscreenCanvas.");
    return false;
  }

  try {
    const canvas = new OffscreenCanvas(1, 1);

    // 2. Strict WebGL 2.0 Requirement
    // Skia/Skwasm (Flutter WASM) fundamentally needs WebGL 2.0 (ES 3.0)
    // for modern shader features and buffer management.
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      depth: true,
      stencil: true,
      antialias: false,
      // Removed failIfMajorPerformanceCaveat to allow modern llvmpipe
    }) as WebGL2RenderingContext | null;

    if (!gl) {
      console.warn(
        "GPU Check: WebGL 2.0 not available. Fallback to WebGL 1.0 is not sufficient for Skwasm."
      );
      return false;
    }

    // 3. Version Check
    // Even if WebGL 2 exists, we check the underlying version if possible.
    const versionStr = gl.getParameter(gl.VERSION);
    console.log(`GL Version: ${versionStr}`);

    // 4. Renderer Info (Informational, no longer a hard blocklist)
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      console.log(`Detected Renderer: ${renderer}`);
    }

    // 5. "Zombie GPU" & Pipeline Integrity Test
    // We clear with a specific color and read it back.
    // This detects drivers that report WebGL 2 but have a broken implementation.
    gl.clearColor(0.5, 0.25, 0.75, 1.0); // Distinctive color
    gl.clear(gl.COLOR_BUFFER_BIT);

    const pixels = new Uint8Array(4);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    // Validation (allowing for slight precision errors in software renderers)
    const r = pixels[0];
    const g = pixels[1];
    const b = pixels[2];

    // Expected: 128, 64, 191
    if (
      Math.abs(r - 128) > 2 ||
      Math.abs(g - 64) > 2 ||
      Math.abs(b - 191) > 2
    ) {
      console.warn(
        `GPU Check: Readback test failed. Expected ~128,64,191 but got ${r},${g},${b}.`
      );
      return false;
    }

    // 6. Feature check: Float buffers (Often used by Skia for high-precision masks)
    const floatBuffer = gl.getExtension("EXT_color_buffer_float");
    if (!floatBuffer) {
      console.warn(
        "GPU Check: EXT_color_buffer_float missing. Complex UI might glich, but we might allow it."
      );
    }

    return true;
  } catch (e) {
    console.error("GPU Check: Exception during detection.", e);
    return false;
  }
}
