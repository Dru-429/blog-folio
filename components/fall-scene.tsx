"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Moon, Sun } from "lucide-react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import plate from "@/public/assets/fall/plate.jpg";
import skyMask from "@/public/assets/fall/mask.png";
import { clampTime } from "@/lib/temple-time";
import { BOT, SUNC, TH_BG, TH_FG, TH_INK, TICK, TOP, lerp, pal, sm } from "@/lib/fall-palette";

const FIG_COUNT = 48;
/** Served from `public/assets/fall/` — root-relative paths, zero-padded for frame order. */
const frames = Array.from({ length: FIG_COUNT }, (_, i) => `/assets/fall/fig-${String(i).padStart(2, "0")}.webp`);
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
  const timeLabel = (t: number) => (t < 25 ? "Day" : t < 55 ? "Sunset" : "Night");
  const SPIDER_PATH =
  "M78 56L67 65L64 72L63 79L68 89L44 104L43 144L44 152L83 175L87 175L127 151L127 103L103 89L107 79L107 72L104 65L93 56Z " +
  "M131 17L122 24L122 52L111 59L111 88L140 105L141 162L150 169L150 99L121 82L121 64L132 58Z " +
  "M39 17L39 58L50 65L50 81L21 99L21 169L30 162L30 106L34 102L60 87L60 59L49 52L48 23Z " +
  "M153 0L143 8L143 56L126 67L126 79L127 81L161 100L161 177L171 186L171 94L136 73L153 62Z " +
  "M18 0L18 62L33 71L34 74L0 94L0 186L9 179L9 101L45 79L44 66L27 56L28 8Z";

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

    const imgs = frames.map((src) => {
      const i = new Image();
      i.src = src;
      return i;
    });
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
        <span className="tape absolute -left-3 top-5 z-10 h-6 w-30 -rotate-[35deg]" />
        <span className="tape absolute bottom-5 -right-3 z-10 h-6 w-34 -rotate-[30deg]" />
        <div ref={scene} className="fall-scene" style={edge ? ({ "--edge": `url("${edge}")` } as CSSProperties) : undefined} role="img" aria-label="Dithered pixel Spider-Man falling ">
          <img className="fall-plate" src={plate.src} alt="spider" />
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
<svg width="0" height="0" className="absolute" aria-hidden="true">
    {/* Waxy crayon bars: wobbly edge + grain */}
    <filter id="crayon" x="-5%" y="-30%" width="110%" height="160%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035 0.6" numOctaves="2" seed="3" result="wobble" />
      <feDisplacementMap in="SourceGraphic" in2="wobble" scale="4" xChannelSelector="R" yChannelSelector="G" result="rough" />
      <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="3" seed="8" result="grain" />
      <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3 0 0 0 -0.5" result="speckle" />
      <feComposite in="rough" in2="speckle" operator="in" />
    </filter>
    {/* Edge wobble only, for the spider (no grain, keeps the shape solid) */}
    <filter id="crayon-edge" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" seed="5" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </svg>

  {/* One centerline: every child is h-9 and centered */}
  <div className="mt-4 flex h-9 items-center gap-3 relative top-3" ref={controls}>
    <span className="type-micro inline-flex justify-center h-9 shrink-0 items-top gap-1.5">
      <Sun size={16} aria-hidden="true" />
      <span className="leading-none">Day</span>
    </span>

    <SliderPrimitive.Root
      className="relative flex h-9 flex-1 touch-none select-none items-center"
      min={0}
      max={100}
      step={1}
      value={[time]}
      onValueChange={([v]) => setTime(v ?? 0)}
    >
      {/* Track: mid-tone gradient (readable on cream AND near-black), clipped into wide bars */}
      <SliderPrimitive.Track
        className="relative h-5 w-full grow
          bg-[linear-gradient(to_right,#2f9bdc,#f5a524_35%,#e5484d_55%,#9333ea_75%,#4338ca)]
          dark:bg-[linear-gradient(to_right,#6ec1ee,#ffc15a_35%,#ff6b72_55%,#c084fc_75%,#818cf8)]
          [mask-image:repeating-linear-gradient(to_right,#000_0_10px,transparent_10px_18px)]
          [filter:url(#crayon)]"
      />

      {/* Thumb: the spider. fill-current follows theme text color, halo keeps it readable over any bar */}
      <SliderPrimitive.Thumb
        aria-label="Time of day"
        aria-valuetext={timeLabel(time)}
        className="flex h-9 w-9 -rotate-3 cursor-grab items-center justify-center rounded-full outline-none
          text-stone-900 dark:text-stone-50
          [filter:drop-shadow(0_0_2px_rgba(255,255,255,0.9))_drop-shadow(0_0_1px_rgba(255,255,255,0.9))]
          dark:[filter:drop-shadow(0_0_2px_rgba(0,0,0,0.9))_drop-shadow(0_0_1px_rgba(0,0,0,0.9))]
          focus-visible:ring-2 focus-visible:ring-current active:cursor-grabbing"
      >
        <svg viewBox="0 0 172 187" className="h-8 w-auto fill-current bg-zinc-100 px-auto border rounded-xs border-ink" aria-hidden="true">
          <path d={SPIDER_PATH} filter="url(#crayon-edge)" />
        </svg>
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>

    <span className="type-micro inline-flex h-9 shrink-0 items-top gap-1.5">
      <Moon size={16} aria-hidden="true" />
      <span className="leading-none">Night</span>
    </span>
  </div> </figure>
  );
}
