import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkGPU } from './gpuDetector';

describe('checkGPU', () => {
  let originalSharedArrayBuffer: any;
  let originalOffscreenCanvas: any;

  beforeEach(() => {
    // Save original globals
    originalSharedArrayBuffer = global.SharedArrayBuffer;
    originalOffscreenCanvas = global.OffscreenCanvas;

    // Mock console methods to keep test output clean
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore globals
    global.SharedArrayBuffer = originalSharedArrayBuffer;
    global.OffscreenCanvas = originalOffscreenCanvas;

    vi.restoreAllMocks();
  });

  it('should return false if SharedArrayBuffer is not defined', async () => {
    // Temporarily remove SharedArrayBuffer
    // @ts-ignore
    delete global.SharedArrayBuffer;
    
    // Ensure OffscreenCanvas is available so we only test SharedArrayBuffer failure
    // @ts-ignore
    global.OffscreenCanvas = class {};

    const result = await checkGPU();
    expect(result).toBe(false);
    expect(console.warn).toHaveBeenCalledWith('GPU Check: Missing SharedArrayBuffer or OffscreenCanvas.');
  });

  it('should return false if OffscreenCanvas is not defined', async () => {
    // Ensure SharedArrayBuffer is available
    // @ts-ignore
    global.SharedArrayBuffer = class {};
    
    // Temporarily remove OffscreenCanvas
    // @ts-ignore
    delete global.OffscreenCanvas;

    const result = await checkGPU();
    expect(result).toBe(false);
    expect(console.warn).toHaveBeenCalledWith('GPU Check: Missing SharedArrayBuffer or OffscreenCanvas.');
  });

  it('should return false if webgl2 is not supported', async () => {
    global.SharedArrayBuffer = class {} as any;
    
    // Mock OffscreenCanvas to return null for webgl2 context
    global.OffscreenCanvas = class {
      getContext(contextId: string) {
        if (contextId === 'webgl2') {
          return null;
        }
        return {};
      }
    } as any;

    const result = await checkGPU();
    expect(result).toBe(false);
    expect(console.warn).toHaveBeenCalledWith('GPU Check: WebGL 2.0 not available. Fallback to WebGL 1.0 is not sufficient for Skwasm.');
  });

  it('should return false if the readback test fails (zombie GPU)', async () => {
    global.SharedArrayBuffer = class {} as any;
    
    const mockContext = {
      getParameter: vi.fn().mockImplementation((param) => {
        return param === 1 ? 'WebGL 2.0' : 'Mock Renderer';
      }),
      getExtension: vi.fn().mockReturnValue({ UNMASKED_RENDERER_WEBGL: 2 }),
      clearColor: vi.fn(),
      clear: vi.fn(),
      // Simulate broken readPixels
      readPixels: vi.fn((x, y, w, h, format, type, pixels) => {
        pixels[0] = 0; // r
        pixels[1] = 0; // g
        pixels[2] = 0; // b
        pixels[3] = 255; // a
      }),
      VERSION: 1,
      COLOR_BUFFER_BIT: 16384,
      RGBA: 6408,
      UNSIGNED_BYTE: 5121
    };

    global.OffscreenCanvas = class {
      getContext() {
        return mockContext;
      }
    } as any;

    const result = await checkGPU();
    expect(result).toBe(false);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('GPU Check: Readback test failed.'));
  });

  it('should return true if all checks pass', async () => {
    global.SharedArrayBuffer = class {} as any;
    
    const mockContext = {
      getParameter: vi.fn().mockImplementation((param) => {
        return param === 1 ? 'WebGL 2.0' : 'Good Renderer';
      }),
      getExtension: vi.fn().mockReturnValue({ UNMASKED_RENDERER_WEBGL: 2 }),
      clearColor: vi.fn(),
      clear: vi.fn(),
      // Simulate successful readPixels (expected: 128, 64, 191)
      readPixels: vi.fn((x, y, w, h, format, type, pixels) => {
        pixels[0] = 127; // r (within threshold)
        pixels[1] = 65;  // g (within threshold)
        pixels[2] = 191; // b (exact)
        pixels[3] = 255; // a
      }),
      VERSION: 1,
      COLOR_BUFFER_BIT: 16384,
      RGBA: 6408,
      UNSIGNED_BYTE: 5121
    };

    global.OffscreenCanvas = class {
      getContext() {
        return mockContext;
      }
    } as any;

    const result = await checkGPU();
    expect(result).toBe(true);
    // Warning about EXT_color_buffer_float might still fire, but it shouldn't fail
  });
});
