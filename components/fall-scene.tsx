"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Moon, Sun } from "lucide-react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import plate from "@/public/assets/city-bld.png";
import skyMask from "@/public/assets/city-win.png";
import { clampTime } from "@/lib/temple-time";
import { BOT, SUNC, TH_BG, TH_FG, TH_INK, TICK, TOP, lerp, pal, sm } from "@/lib/fall-palette";

const FIG_COUNT = 48;
/** Served from `public/assets/fall/` — root-relative paths, zero-padded for frame order. */
const frames = Array.from({ length: FIG_COUNT }, (_, i) => `/assets/fall/fig-${String(i).padStart(2, "0")}.webp`);
const D = { W: 960, H: 448, bw: 100, bh: 150 };
const track = `linear-gradient(to right, ${TICK.map(([p, c]) => `${c} ${p * 100}%`).join(",")})`;
type Star = { l: number; t: number; z: number; d: number; o: number };

type Pt = [number, number];
/** Swinging Spider-Man: a jointed cut-out posed from the swing sheet, drawn on the 960×448 canvas. */
const PX = 480, PY = -246, PL = 490, A0 = Math.asin(365 / PL), PG = PL - 76;
const RAD = Math.PI / 180;
const RC = { suit: "#1b1b25", suitF: "#101016", red: "#d3262b", redF: "#9b1b21", lens: "#f6f1e2", line: "#07070b", mesh: "#8f1d24" };
const LN = { fo: 25, up: 25, ch: 23, ab: 22, neck: 18, th: 33, sh: 32, ft: 14 };
/** [shoulders from hands, arm reach, torso, head lift, near thigh, near shin, near foot flex, far thigh, far shin, far foot flex, rope-follow, spine bend] */
const RIG_KEY: number[][] = [
  [-8, 0.78, -6, 8, 62, -12, 0.5, -30, -52, 0, 0.35, 14], // launch crouch
  [8, 0.88, 16, -6, 108, -22, 0.2, 96, -38, 0.1, 0.3, 40], // curled tuck
  [-14, 1.0, -26, 26, 40, -18, 0.3, -34, -46, 0, 0.2, -12], // stretched out
  [-6, 0.8, -6, 8, 102, 14, 0.5, 116, -12, 0.3, 0.3, 32], // pull up, knees high
  [4, 0.96, 8, 16, 52, 24, 0.6, 36, 14, 0.5, 0.35, 10], // reach
];
const rDr = (a: number, l: number): Pt => [Math.sin(a * RAD) * l, Math.cos(a * RAD) * l];
const rAdd = (p: Pt, q: Pt): Pt => [p[0] + q[0], p[1] + q[1]];
const rMix = (p: Pt, q: Pt, u: number): Pt => [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u];
const rSamp = (p: number) => {
  const n = RIG_KEY.length - 1, x = Math.min(0.9999, Math.max(0, p)) * n, i = Math.floor(x), u = x - i, u2 = u * u, u3 = u2 * u;
  const a = RIG_KEY[Math.max(0, i - 1)], b = RIG_KEY[i], c = RIG_KEY[i + 1], d = RIG_KEY[Math.min(n, i + 2)];
  return b.map((_, k) => 0.5 * (2 * b[k] + (c[k] - a[k]) * u + (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * u2 + (3 * b[k] - a[k] - 3 * c[k] + d[k]) * u3));
};
/** two-bone IK: hand G, shoulder S -> elbow, bending towards the front */
const rElbow = (G: Pt, S: Pt, l1: number, l2: number): Pt => {
  const dx = S[0] - G[0], dy = S[1] - G[1], L = Math.hypot(dx, dy) || 1, d = Math.min(L, l1 + l2 - 0.05);
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a)), ux = dx / L, uy = dy / L;
  return [G[0] + ux * a + uy * h, G[1] + uy * a - ux * h];
};
/** tapered capsule between two joints */
function rBone(c: CanvasRenderingContext2D, A: Pt, B: Pt, ra: number, rb: number, fill: string, lw = 1) {
  let dx = B[0] - A[0], dy = B[1] - A[1];
  const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
  const nx = -dy, ny = dx, an = Math.atan2(ny, nx);
  c.beginPath();
  c.moveTo(A[0] + nx * ra, A[1] + ny * ra);
  c.lineTo(B[0] + nx * rb, B[1] + ny * rb);
  c.arc(B[0], B[1], rb, an, an - Math.PI, true);
  c.lineTo(A[0] - nx * ra, A[1] - ny * ra);
  c.arc(A[0], A[1], ra, an + Math.PI, an, true);
  c.closePath();
  c.fillStyle = fill; c.fill();
  if (lw > 0) { c.strokeStyle = RC.line; c.lineWidth = lw; c.lineJoin = "round"; c.stroke(); }
}
function rLine(c: CanvasRenderingContext2D, a: Pt, b: Pt, color: string, w: number) {
  c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]);
  c.strokeStyle = color; c.lineWidth = w; c.lineCap = "round"; c.stroke();
}
function rHand(c: CanvasRenderingContext2D, p: Pt, r: number, fill: string) {
  c.beginPath(); c.arc(p[0], p[1], r, 0, Math.PI * 2);
  c.fillStyle = fill; c.fill(); c.strokeStyle = RC.line; c.lineWidth = 1; c.stroke();
}
function makeRig() {
  const oc = document.createElement("canvas");
  oc.width = D.W; oc.height = D.H;
  const c = oc.getContext("2d")!;
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1;
  const spiderP = new Path2D("M0 -2.6C2 -2.6 2.6 .8 0 3.4C-2.6 .8 -2 -2.6 0 -2.6Z");
  const spiderL = new Path2D("M-1 -.5L-4 -3L-5.8 -2.2M-1.2 .8L-5 .6L-6.4 2M-.8 2L-3.6 4.4L-4.4 6.2M1 -.5L4 -3L5.8 -2.2M1.2 .8L5 .6L6.4 2M.8 2L3.6 4.4L4.4 6.2");
  const meshL = new Path2D("M-9.5 -5Q-1 -2.5 9 -6M-10 3.5Q0 1 10 2.5M-3 -11.5Q-5.5 0 -3 11.5");
  let cp: number[] | null = null, spd = 0, dir = 1, fs = 1;
  /** t: 0..1 slider time, s: seconds, v: slider velocity this frame */
  return (ctx: CanvasRenderingContext2D, t: number, s: number, v: number) => {
    spd += (Math.min(1, Math.abs(v) / 0.02) - spd) * 0.12;
    if (v > 0.0008) dir = 1; else if (v < -0.0008) dir = -1;
    fs += (dir - fs) * 0.2; if (Math.abs(dir - fs) < 0.01) fs = dir;
    const p = dir > 0 ? t : 1 - t;
    const a = lerp(-A0, A0, t) + calm * Math.sin(s * 1.1) * 0.012;
    const gx = PX + PG * Math.sin(a), gy = PY + PG * Math.cos(a) + calm * Math.sin(s * 1.6) * 2;
    const tg = rSamp(p);
    if (!cp) cp = tg.slice(); else for (let k = 0; k < tg.length; k++) cp[k] += (tg[k] - cp[k]) * 0.28;
    const [sg, rr, tr, hd, k1, k2, nf, fk1, fk2, ff, ra, bd] = cp, ga = (-fs * a) / RAD, L = (w: number) => w + ga * (1 - ra);
    const tl = spd * 20, sw = calm * Math.sin(s * 2.3), sw2 = calm * Math.sin(s * 2.3 + 1.4);
    const G: Pt = [0, 0], G2: Pt = [-3, 3.5], reach = LN.fo + LN.up - 0.2;
    const S = rDr(L(sg - spd * 6), reach * rr);
    const En = rElbow(G, S, LN.fo, LN.up), Ef = rElbow(G2, S, LN.fo, LN.up);
    const trA = L(tr - spd * 8 + sw * 1.5), M = rAdd(S, rDr(trA, LN.ch)), trB = trA + bd, H = rAdd(M, rDr(trB, LN.ab));
    const eta = trA + 180 - (hd + spd * 5 + sw * 1.5), hc = rAdd(S, rDr(eta, LN.neck));

    // the web, from the hands up to the anchor above the scene
    const hx = gx, hy = gy;
    const web = new Path2D(`M${hx} ${hy}Q${(hx + PX) / 2} ${(hy + PY) / 2 + 14} ${PX} ${PY}`);
    ctx.save(); ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(10,20,50,.3)"; ctx.lineWidth = 4.4; ctx.stroke(web);
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 2.2; ctx.stroke(web);
    ctx.restore();

    // the figure, drawn on its own layer so the shadow is cast once
    c.clearRect(0, 0, D.W, D.H);
    c.save();
    c.translate(gx, gy); c.rotate(-a); c.scale(Math.max(Math.abs(fs), 0.03) * (fs < 0 ? -1 : 1) * 1.12, 1.12);
    const leg = (H0: Pt, t1: number, t2: number, fl: number, sa: number, r0: number, body: string, sole: string, wl: number) => {
      const A1 = L(t1 - tl * 0.8 + sa), A2 = L(t2 - tl + sa * 1.4), K = rAdd(H0, rDr(A1, LN.th)), F = rAdd(K, rDr(A2, LN.sh)), T = rAdd(F, rDr(A2 + 90 * fl, LN.ft));
      rBone(c, H0, K, r0, r0 - 1.7, body, wl); rBone(c, K, F, r0 - 1.7, 4.3, body, wl); rBone(c, F, T, 4.9, 3.5, body, wl);
      const o = rDr(A2 + 90 * fl + 90, 3.3);
      rLine(c, rAdd(F, o), rAdd(T, o), sole, 1.8);
    };
    // far leg + far arm
    leg(rAdd(H, [-1.5, 1]), fk1, fk2, ff, sw2 * 3, 7.2, RC.suitF, RC.redF, 1);
    rBone(c, S, Ef, 5.2, 4.2, RC.suitF); rBone(c, Ef, G2, 4.2, 3.6, RC.suitF);
    rBone(c, G2, rMix(G2, Ef, 0.3), 4.3, 4.1, RC.redF, 0.6); rHand(c, G2, 4.4, RC.suitF);
    // torso, belt, chest spider
    rBone(c, S, M, 10.4, 9.4, RC.suit); rBone(c, M, H, 8.8, 7, RC.suit);
    const hb = rMix(M, H, 0.9), hn = rDr(trB + 90, 7.4);
    rLine(c, [hb[0] - hn[0], hb[1] - hn[1]], [hb[0] + hn[0], hb[1] + hn[1]], RC.red, 2.6);
    const sp = rMix(S, M, 0.55);
    c.save(); c.translate(sp[0], sp[1]); c.rotate(-trA * RAD); c.scale(1.15, 1.15);
    c.fillStyle = RC.red; c.fill(spiderP); c.beginPath(); c.arc(0, -4.2, 1.5, 0, Math.PI * 2); c.fill();
    c.strokeStyle = RC.red; c.lineWidth = 0.9; c.lineCap = "round"; c.lineJoin = "round"; c.stroke(spiderL);
    c.restore();
    // near leg
    leg(H, k1, k2, nf, sw * 3, 7.8, RC.suit, RC.red, 1);
    // head
    c.save(); c.translate(hc[0], hc[1]); c.rotate((180 - eta) * RAD);
    c.beginPath(); c.ellipse(0, 0, 12, 13.6, 0, 0, Math.PI * 2);
    c.fillStyle = RC.suit; c.fill(); c.strokeStyle = RC.line; c.lineWidth = 1; c.stroke();
    c.strokeStyle = RC.mesh; c.lineWidth = 0.9; c.lineCap = "round"; c.stroke(meshL);
    c.translate(6.2, -2.6); c.rotate(24 * RAD);
    c.beginPath(); c.ellipse(0, 0, 5.6, 3.4, 0, 0, Math.PI * 2);
    c.fillStyle = RC.lens; c.fill(); c.strokeStyle = RC.red; c.lineWidth = 1.1; c.stroke();
    c.restore();
    // near arm + red sleeve
    rBone(c, S, En, 5.8, 4.5, RC.suit); rBone(c, En, G, 4.5, 3.8, RC.suit);
    rBone(c, G, rMix(G, En, 0.3), 4.6, 4.4, RC.red, 0.6); rHand(c, G, 4.8, RC.suit);
    rBone(c, S, rMix(S, En, 0.3), 5.2, 5, RC.red, 0);
    c.restore();

    // composite with the cardboard rim light + drop shadow
    ctx.save();
    ctx.shadowColor = "rgba(255,255,255,.3)"; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = -1; ctx.shadowBlur = 0; ctx.drawImage(oc, 0, 0);
    ctx.shadowColor = "rgba(0,0,0,.4)"; ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 7; ctx.shadowBlur = 5; ctx.drawImage(oc, 0, 0);
    ctx.restore();
  };
}

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
    const rig = makeRig();
    const N = imgs.length, R = document.documentElement.style, root = scene.current!;
    let cur = 0, raf = 0;
    let pc = 0;
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
      // swinging figure: a jointed cut-out posed from the swing sheet, riding a pendulum that follows the slider
      ctx.clearRect(0, 0, D.W, D.H);
      rig(ctx, t, s, cur - pc); pc = cur;
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