import { useEffect, useRef } from "react";

const falloffs = {
  linear: (value) => value,
  smooth: (value) => value * value * (3 - 2 * value),
  sharp: (value) => value * value * value,
};

const hexToRgb = (hex) => {
  const value = hex.replace("#", "");
  const normalized = value.length === 3 ? value.split("").map((item) => item + item).join("") : value;
  const number = Number.parseInt(normalized.slice(0, 6), 16);
  return [(number >> 16) & 255, (number >> 8) & 255, number & 255];
};

export default function CursorGrid({
  cellSize = 70, color = "#D946EF", radius = 140, falloff = "smooth", holdTime = 400,
  fadeDuration = 800, lineWidth = 1.2, maxOpacity = 1, fillOpacity = 0, gridOpacity = 0,
  cellRadius = 0, clickPulse = true, pulseSpeed = 600, className = "",
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const propsRef = useRef({});
  const wakeRef = useRef(null);
  propsRef.current = { cellSize, color, radius, falloff, holdTime, fadeDuration, lineWidth, maxOpacity, fillOpacity, gridOpacity, cellRadius, clickPulse, pulseSpeed };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    const context = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let columns = 0; let rows = 0; let offsetX = 0; let offsetY = 0;
    let alphas = new Float32Array(0); let touched = new Float64Array(0);
    let width = 0; let height = 0; let frame = 0; let running = false; let lastFrame = 0;
    const pulses = [];

    const rebuild = () => {
      const props = propsRef.current;
      width = container.offsetWidth; height = container.offsetHeight;
      canvas.width = Math.max(1, Math.round(width * dpr)); canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = Math.ceil(width / props.cellSize) + 1; rows = Math.ceil(height / props.cellSize) + 1;
      offsetX = (width - columns * props.cellSize) / 2; offsetY = (height - rows * props.cellSize) / 2;
      alphas = new Float32Array(columns * rows); touched = new Float64Array(columns * rows);
    };
    const center = (index) => {
      const props = propsRef.current;
      return [offsetX + (index % columns) * props.cellSize + props.cellSize / 2, offsetY + Math.floor(index / columns) * props.cellSize + props.cellSize / 2];
    };
    const energize = (x, y, boost = 1) => {
      const props = propsRef.current; const range = Math.max(props.radius, 1); const ease = falloffs[props.falloff] || falloffs.linear; const now = performance.now();
      const minColumn = Math.max(0, Math.floor((x - range - offsetX) / props.cellSize)); const maxColumn = Math.min(columns - 1, Math.floor((x + range - offsetX) / props.cellSize));
      const minRow = Math.max(0, Math.floor((y - range - offsetY) / props.cellSize)); const maxRow = Math.min(rows - 1, Math.floor((y + range - offsetY) / props.cellSize));
      for (let row = minRow; row <= maxRow; row += 1) for (let column = minColumn; column <= maxColumn; column += 1) {
        const index = row * columns + column; const [cx, cy] = center(index); const distance = Math.hypot(cx - x, cy - y);
        if (distance > range) continue;
        const opacity = ease(1 - distance / range) * props.maxOpacity * boost;
        if (opacity > alphas[index]) alphas[index] = opacity;
        if (opacity > 0) touched[index] = now;
      }
    };
    const draw = (now) => {
      const props = propsRef.current; const delta = Math.min(now - lastFrame, 50); lastFrame = now;
      context.clearRect(0, 0, width, height); const [red, green, blue] = hexToRgb(props.color);
      if (props.gridOpacity > 0) {
        context.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${props.gridOpacity})`; context.lineWidth = 1; context.beginPath();
        for (let column = 0; column <= columns; column += 1) { const x = Math.round(offsetX + column * props.cellSize) + .5; context.moveTo(x, 0); context.lineTo(x, height); }
        for (let row = 0; row <= rows; row += 1) { const y = Math.round(offsetY + row * props.cellSize) + .5; context.moveTo(0, y); context.lineTo(width, y); }
        context.stroke();
      }
      for (let pulseIndex = pulses.length - 1; pulseIndex >= 0; pulseIndex -= 1) {
        const pulse = pulses[pulseIndex]; const ringRadius = ((now - pulse.started) / 1000) * props.pulseSpeed;
        if (ringRadius > Math.hypot(width, height)) { pulses.splice(pulseIndex, 1); continue; }
        const band = props.cellSize;
        for (let index = 0; index < alphas.length; index += 1) { const [cx, cy] = center(index); if (Math.abs(Math.hypot(cx - pulse.x, cy - pulse.y) - ringRadius) < band / 2) { alphas[index] = Math.max(alphas[index], props.maxOpacity); touched[index] = now; } }
      }
      let visible = pulses.length > 0; const fadeStep = delta / Math.max(props.fadeDuration, 16); const half = props.cellSize / 2;
      for (let index = 0; index < alphas.length; index += 1) {
        let opacity = alphas[index]; if (!opacity) continue;
        if (now - touched[index] > props.holdTime) { opacity = Math.max(0, opacity - fadeStep); alphas[index] = opacity; }
        if (!opacity) continue; visible = true;
        const [cx, cy] = center(index); const gradient = context.createRadialGradient(cx, cy, half * .1, cx, cy, props.cellSize);
        gradient.addColorStop(0, `rgba(${red}, ${green}, ${blue}, ${opacity})`); gradient.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);
        const x = cx - half + .5; const y = cy - half + .5; const size = props.cellSize - 1;
        context.beginPath(); if (props.cellRadius) context.roundRect(x, y, size, size, props.cellRadius); else context.rect(x, y, size, size);
        if (props.fillOpacity) { context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${opacity * props.fillOpacity})`; context.fill(); }
        context.strokeStyle = gradient; context.lineWidth = props.lineWidth; context.stroke();
      }
      if (visible) frame = requestAnimationFrame(draw); else running = false;
    };
    const wake = () => { if (!running) { running = true; lastFrame = performance.now(); frame = requestAnimationFrame(draw); } };
    wakeRef.current = wake;
    const localCoordinates = (event) => { const rect = canvas.getBoundingClientRect(); return [event.clientX - rect.left, event.clientY - rect.top]; };
    const move = (event) => { const [x, y] = localCoordinates(event); energize(x, y); wake(); };
    const click = (event) => { if (!propsRef.current.clickPulse) return; const [x, y] = localCoordinates(event); pulses.push({ x, y, started: performance.now() }); wake(); };
    const observer = new ResizeObserver(() => { rebuild(); wake(); }); observer.observe(container); rebuild();
    container.addEventListener("pointermove", move); container.addEventListener("pointerdown", click);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); container.removeEventListener("pointermove", move); container.removeEventListener("pointerdown", click); };
  }, [cellSize]);

  useEffect(() => { wakeRef.current?.(); }, [gridOpacity, color, lineWidth, maxOpacity, fillOpacity, cellRadius]);

  return <div ref={containerRef} className={`cursor-grid${className ? ` ${className}` : ""}`}><canvas ref={canvasRef} className="cursor-grid__canvas" /></div>;
}
