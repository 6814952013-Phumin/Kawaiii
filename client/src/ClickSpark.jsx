import { useCallback, useEffect, useRef } from "react";

export default function ClickSpark({
  sparkColor = "#fff", sparkSize = 10, sparkRadius = 15, sparkCount = 8,
  duration = 400, easing = "ease-out", extraScale = 1, children,
}) {
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return undefined;
    const resize = () => {
      const { width, height } = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      canvas.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const observer = new ResizeObserver(resize); observer.observe(parent); resize();
    return () => observer.disconnect();
  }, []);

  const ease = useCallback((value) => {
    if (easing === "linear") return value;
    if (easing === "ease-in") return value * value;
    if (easing === "ease-in-out") return value < .5 ? 2 * value * value : -1 + (4 - 2 * value) * value;
    return value * (2 - value);
  }, [easing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext("2d"); let frame = 0;
    const draw = (timestamp) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      context.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.started;
        if (elapsed >= duration) return false;
        const progress = ease(elapsed / duration); const distance = progress * sparkRadius * extraScale; const length = sparkSize * (1 - progress);
        context.strokeStyle = sparkColor; context.lineWidth = 2; context.beginPath();
        context.moveTo(spark.x + distance * Math.cos(spark.angle), spark.y + distance * Math.sin(spark.angle));
        context.lineTo(spark.x + (distance + length) * Math.cos(spark.angle), spark.y + (distance + length) * Math.sin(spark.angle)); context.stroke();
        return true;
      });
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [duration, ease, extraScale, sparkColor, sparkRadius, sparkSize]);

  const handleClick = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect(); const started = performance.now();
    sparksRef.current.push(...Array.from({ length: sparkCount }, (_, index) => ({ x: event.clientX - rect.left, y: event.clientY - rect.top, angle: (Math.PI * 2 * index) / sparkCount, started })));
  };

  return <div className="click-spark" onClick={handleClick}><canvas ref={canvasRef} className="click-spark__canvas" />{children}</div>;
}
