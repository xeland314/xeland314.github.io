import { useEffect, useRef } from "react";

export const useCanvasScale = (targetWidth: number = 1080) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scaleCanvas = () => {
      if (!wrapperRef.current || !canvasRef.current) return;
      
      const parent = wrapperRef.current.parentElement;
      if (!parent) return;

      // Use offsetWidth which is more stable
      const containerWidth = parent.offsetWidth;
      if (containerWidth <= 0) return;

      const padding = 32; 
      const maxWidth = Math.min(containerWidth - padding, 600); 
      
      const scale = maxWidth / targetWidth;
      
      // Only apply if the scale has significantly changed to avoid jitter/loops
      const currentScale = parseFloat(canvasRef.current.style.transform.replace("scale(", "").replace(")", "")) || 0;
      
      if (Math.abs(currentScale - scale) > 0.001) {
        canvasRef.current.style.transform = `scale(${scale})`;
        canvasRef.current.style.transformOrigin = "top left";
        
        wrapperRef.current.style.width = `${targetWidth * scale}px`;
        wrapperRef.current.style.height = `${targetWidth * scale}px`;
      }
    };

    // Use a small timeout to avoid immediate feedback loop during render
    let timeoutId: NodeJS.Timeout;
    const observerCallback = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(scaleCanvas, 50);
    };

    const resizeObserver = new ResizeObserver(observerCallback);

    if (wrapperRef.current?.parentElement) {
      resizeObserver.observe(wrapperRef.current.parentElement);
    }

    scaleCanvas();
    window.addEventListener("resize", scaleCanvas);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", scaleCanvas);
    };
  }, [targetWidth]);

  return { canvasRef, wrapperRef };
};
