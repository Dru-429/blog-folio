"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Moon, Sun } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import plate from "@/public/assets/fall/plate.jpg";
import skyMask from "@/public/assets/fall/mask.png";
import { clampTime } from "@/lib/temple-time";
import { BOT, SUNC, TH_BG, TH_FG, TH_INK, TICK, TOP, lerp, pal, sm } from "@/lib/fall-palette";

const frames = Object.values(import.meta.glob("@/public/assets/fall/fig-*.webp", { eager: true, import: "default" })) as string[];
const D = { W: 960, H: 448, bw: 100, bh: 150 };
const track = `linear-gradient(to right, ${TICK.map(([p, c]) => `${c} ${p * 100}%`).join(",")})`;
type Star = { l: number; t: number; z: number; d: number; o: number };

/** Dithered falling Spider-Man scene; the slider drives the sky and the whole page theme. */
export function FallScene() {
  const [time, setTime] = useState(0);
  const target = useRef(0);
  const controls = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const fig = useRef<HTMLCanvasElement>(null);
  const [edge, setEdge] = useState<string>();
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => { target.current = time; }, [time]);

  useEffect(() => {
    setStars(Array.from({ length: 90 }, () => ({ l: Math.random() * 100, t: Math.random() * 80, z: Math.random() * 1.8 + 0.8, d: Math.random() * 3, o: 0.5 + Math.random() * 0.5 })));
    // feathered, dithered edge mask
    const w = 320, h = Math.round((w * D.H) / D.W), cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const x = cv.getContext("2d")!, d = x.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let X = 0; X < w; X++) {
      const nx = (X / w - 0.5) * 2, ny = (y / h - 0.5) * 2, e = Math.abs(nx) ** 3 + Math.abs(ny) ** 3;
      const f = Math.min(1, Math.max(0, (1 - e) / 0.4));
      d.data[(y * w + X) * 4 + 3] = f > Math.random() * 0.9 + 0.05 ? 255 : 0;
    }
    x.putImageData(d, 0, 0); setEdge(cv.toDataURL());

    const el = controls.current;
    const onWheel = (e: WheelEvent) => { e.preventDefault(); setTime((c) => clampTime(c + (e.deltaY + e.deltaX) * 0.08)); };
    el?.addEventListener("wheel", onWheel, { passive: false });

    const imgs = frames.map((s) => { const i = new Image(); i.src = s; return i; });
    const canvas = fig.current!, ctx = canvas.getContext("2d")!;
    canvas.width = D.W; canvas.height = D.H;
    const N = imgs.length, R = document.documentElement.style, root = scene.current!;
    let cur = 0, raf = 0;
    const loop = (ts: number) => {
      const goal = target.current / 100;
      cur += (goal - cur) * 0.14; if (Math.abs(goal - cur) < 0.0005) cur = goal;
      const t = cur, s = ts / 1000, n = sm(0.15, 0.75, t);
      const bg = pal(t, TH_BG), fg = pal(t, TH_FG);
      R.setProperty("--desk", bg);
      R.setProperty("--paper", t < 0.36 ? `color-mix(in srgb, ${bg} 60%, #fff)` : `color-mix(in srgb, ${bg} 93%, ${fg})`);
      R.setProperty("--ink-dark", fg);
      R.setProperty("--ink", pal(t, TH_INK));
      R.setProperty("--rule", `color-mix(in srgb, ${fg} 22%, transparent)`);
      R.setProperty("--paper-shadow", `rgb(0 0 0 / ${0.12 + n * 0.3})`);
      const st = root.style;
      st.setProperty("--plate-filter", `brightness(${1 + 0.38 * (1 - n)}) saturate(${1 - 0.3 * (1 - n)})`);
      st.setProperty("--gt", pal(t, TOP)); st.setProperty("--gb", pal(t, BOT));
      st.setProperty("--grad-o", String(1 - sm(0.72, 1, t)));
      st.setProperty("--sun-x", lerp(34, 41, sm(0, 0.6, t)) + "%"); st.setProperty("--sun-y", lerp(30, 95, sm(0.05, 0.6, t)) + "%");
      st.setProperty("--sc", pal(t, SUNC));
      st.setProperty("--moon-x", lerp(63, 58, sm(0.5, 1, t)) + "%"); st.setProperty("--moon-y", lerp(98, 30, sm(0.5, 0.97, t)) + "%");
      st.setProperty("--stars-o", String(sm(0.68, 0.95, t)));
      // falling figure: ping-pong through the frames, travelling with the slider
      ctx.clearRect(0, 0, D.W, D.H);
      const f = Math.floor(s * 12) % (2 * (N - 1)), im = imgs[f < N ? f : 2 * (N - 1) - f];
      if (im?.complete && im.naturalWidth) {
        const px = (lerp(0.62, 0.33, t) + Math.sin(s * 0.9) * 0.004) * D.W, py = (lerp(0.36, 0.72, t) + Math.sin(s * 1.4) * 0.008) * D.H, k = lerp(0.85, 1.5, t);
        ctx.save(); ctx.translate(px, py); ctx.rotate(Math.sin(s * 0.8) * 0.05 + (t - 0.5) * 0.3); ctx.scale(k, k);
        ctx.drawImage(im, -D.bw / 2, -D.bh / 2); ctx.restore();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf); el?.removeEventListener("wheel", onWheel);
      for (const k of ["--desk", "--paper", "--ink-dark", "--ink", "--rule", "--paper-shadow"]) R.removeProperty(k);
    };
  }, []);

  return (
    <figure className="temple-figure" style={{ "--temple-track": track } as CSSProperties}>
      <div className="temple-frame relative">
        <span className="tape absolute -left-4 -top-2 z-10 h-6 w-16 -rotate-[35deg]" />
        <span className="tape absolute -right-4 -top-2 z-10 h-6 w-16 rotate-[35deg]" />
        <span className="tape absolute -bottom-2 -left-4 z-10 h-6 w-16 rotate-[35deg]" />
        <span className="tape absolute -bottom-2 -right-4 z-10 h-6 w-16 -rotate-[35deg]" />
        <div ref={scene} className="fall-scene" style={edge ? ({ "--edge": `url("${edge}")` } as CSSProperties) : undefined} role="img" aria-label="Dithered pixel Spider-Man falling past an upside-down city, from day into night">
          <img className="fall-plate" src={plate.src} alt="" />
          <div className="fall-sky" style={{ "--sky": `url("${skyMask.src}")` } as CSSProperties}>
            <div className="fall-grad" />
            <div className="fall-stars">
              {stars.map((s, i) => <i key={i} style={{ left: `${s.l}%`, top: `${s.t}%`, width: s.z, height: s.z, animationDelay: `${s.d}s`, opacity: s.o }} />)}
            </div>
            <div className="fall-orb fall-sun" />
            <div className="fall-orb fall-moon" />
          </div>
          <canvas ref={fig} className="fall-fig" />
          <div className="fall-fx" />
          <div className="fall-grain" />
        </div>
      </div>
      <div className="temple-controls" ref={controls}>
        <span className="temple-endpoint"><Sun size={16} aria-hidden="true" /><span>Day</span></span>
        <Slider className="temple-slider" min={0} max={100} step={1} value={[time]} onValueChange={([v]) => setTime(v ?? 0)} aria-label="Time of day" aria-valuetext={time < 25 ? "Day" : time < 55 ? "Sunset" : "Night"} />
        <span className="temple-endpoint"><Moon size={16} aria-hidden="true" /><span>Night</span></span>
      </div>
    </figure>
  );
}
