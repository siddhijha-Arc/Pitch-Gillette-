import { useEffect, useRef, useState } from "react";
import "./WakeSlider.css";

const H = 20; // a bar at rest, px
const GAP = 4; // bar pitch minus its width
const BAR = 3;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

interface WakeSliderProps {
  bars?: number;
  wake?: number;
  value: number; // 0 to 100
  onChange: (value: number) => void;
  label?: string;
}

export function WakeSlider({
  bars = 36,
  wake = 60,
  value,
  onChange,
  label,
}: WakeSliderProps) {
  const n = Math.round(clamp(bars, 12, 64));
  const track = useRef<HTMLDivElement | null>(null);
  const els = useRef<(HTMLSpanElement | null)[]>([]);
  const st = useRef({
    energy: new Float32Array(n),
    down: false,
    lastX: 0,
    lastT: 0,
    speed: 0,
    raf: 0,
    at: value / 100,
    lastBar: -1,
  });
  const knob = useRef(wake);
  knob.current = wake;

  useEffect(() => {
    st.current.energy = new Float32Array(n);
  }, [n]);

  useEffect(() => {
    st.current.at = value / 100;
  }, [value]);

  const loop = () => {
    const s = st.current;
    if (s.raf) return;
    let prev = performance.now();
    const run = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      let live = false;
      const fall = Math.exp(-dt * 6.5);
      for (let i = 0; i < s.energy.length; i++) {
        s.energy[i] *= fall;
        if (s.energy[i] < 0.002) s.energy[i] = 0;
        else live = true;
        const b = els.current[i];
        if (b) b.style.transform = `scaleY(${(1 + s.energy[i] * 1.6).toFixed(3)})`;
      }
      s.raf = live || s.down ? requestAnimationFrame(run) : 0;
    };
    s.raf = requestAnimationFrame(run);
  };

  useEffect(() => () => cancelAnimationFrame(st.current.raf), []);

  const to = (f: number, speed: number) => {
    const s = st.current;
    f = clamp(f, 0, 1);
    const from = s.at;
    s.at = f;
    const a = Math.round(from * (n - 1)), b = Math.round(f * (n - 1));
    const push = (1 - Math.exp(-speed / 900)) * (knob.current / 60);
    const lo = Math.min(a, b), hi = Math.max(a, b);
    for (let i = lo; i <= hi; i++) s.energy[i] = Math.max(s.energy[i], push);
    if (b !== s.lastBar) {
      s.lastBar = b;
    }
    const newVal = Math.round(f * 100);
    onChange(newVal);
    loop();
  };

  const frac = (clientX: number) => {
    const r = track.current!.getBoundingClientRect();
    return (clientX - r.left) / r.width;
  };

  const lit = Math.round((value / 100) * (n - 1));

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-[#1f1f47]">{label}</span>
          <span className="font-mono text-[#576cdb] font-semibold">{value}%</span>
        </div>
      )}
      <div className="wks overflow-x-auto py-2">
        <div
          ref={track}
          className="wks-track cursor-pointer select-none"
          role="slider"
          tabIndex={0}
          aria-label={label || "Value"}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={value}
          style={{ width: n * (BAR + GAP) - GAP, height: H * 2.6 }}
          onPointerDown={(e) => {
            const s = st.current;
            try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* pointer capture fallback */ }
            s.down = true;
            s.lastX = e.clientX;
            s.lastT = performance.now();
            s.speed = 0;
            to(frac(e.clientX), 0);
          }}
          onPointerMove={(e) => {
            const s = st.current;
            if (!s.down) return;
            const now = performance.now();
            const dt = Math.max(0.008, (now - s.lastT) / 1000);
            const v = Math.abs(e.clientX - s.lastX) / dt;
            s.speed = s.speed * 0.5 + v * 0.5;
            s.lastX = e.clientX;
            s.lastT = now;
            to(frac(e.clientX), s.speed);
          }}
          onPointerUp={(e) => {
            st.current.down = false;
            try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* pointer release fallback */ }
          }}
          onPointerCancel={() => { st.current.down = false; }}
          onKeyDown={(e) => {
            const step = e.shiftKey ? 10 : 1;
            let next: number | null = null;
            if (e.key === "ArrowRight" || e.key === "ArrowUp") next = value + step;
            if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = value - step;
            if (e.key === "Home") next = 0;
            if (e.key === "End") next = 100;
            if (next === null) return;
            e.preventDefault();
            to(clamp(next, 0, 100) / 100, 600);
          }}
        >
          {Array.from({ length: n }, (_, i) => (
            <span
              key={i}
              ref={(b) => { els.current[i] = b; }}
              className="wks-bar"
              data-on={(value > 0 && i <= lit) || undefined}
              style={{ height: H }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
