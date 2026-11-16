"use client";
/* eslint-disable @next/next/no-img-element */

import { Fragment, useEffect, useId, useMemo, useRef, type RefObject } from "react";
import { Archivo_Black } from "next/font/google";

const archivo = Archivo_Black({ subsets: ["latin"], weight: "400", variable: "--font-archivo" });

/* ---------- scene data (from the original html) ---------- */
const T = {
  W: 856,
  H: 826,
  head: "/assets/spider-sense/sense-0.webp",
  outline: "/assets/spider-sense/sense-1.png",
  eyes: [
    { cx: 355.0191250824357, cy: 336.15717740162677, rx: 49.558811394506456, ry: 29.950762653110097, ang: 43.894469756830915, sock: "M306 263L301 297L293 297L293 278L289 296L289 330L297 359L294 346L294 323L301 324L307 354L316 370L329 382L341 389L357 394L370 394L383 390L401 375L415 353L415 347L410 336L400 321L384 305L349 278L331 261L321 259Z" },
    { cx: 500.657993384785, cy: 336.1753031973539, rx: 49.46472233877803, ry: 29.918299745294963, ang: -43.896895786232534, sock: "M550 263L535 259L524 261L507 278L475 302L453 325L443 341L441 353L448 366L465 385L486 394L504 393L519 387L533 377L542 367L551 348L555 329L562 330L562 345L559 359L566 335L566 289L562 275L562 289L554 289Z" },
  ],
  bolts: [
    { src: "/assets/spider-sense/sense-2.png", x: 0.46448598130841123, y: -0.005326876513317198, w: 0.07102803738317758, cx: 0.5, cy: 0.0774818401937046 },
    { src: "/assets/spider-sense/sense-3.png", x: 0.644626168224299, y: 0.056658595641646485, w: 0.11962616822429907, cx: 0.7044392523364486, cy: 0.13317191283292978 },
    { src: "/assets/spider-sense/sense-4.png", x: 0.2366822429906542, y: 0.07869249394673124, w: 0.1177570093457944, cx: 0.2955607476635514, cy: 0.13922518159806296 },
    { src: "/assets/spider-sense/sense-5.png", x: 0.7254672897196262, y: 0.23462469733656174, w: 0.14485981308411214, cx: 0.7978971962616822, cy: 0.27239709443099275 },
    { src: "/assets/spider-sense/sense-6.png", x: 0.13574766355140186, y: 0.2532687651331719, w: 0.13271028037383178, cx: 0.20210280373831777, cy: 0.29055690072639223 },
    { src: "/assets/spider-sense/sense-7.png", x: 0.7827102803738317, y: 0.3581113801452785, w: 0.13551401869158877, cx: 0.8504672897196262, cy: 0.40556900726392253 },
    { src: "/assets/spider-sense/sense-8.png", x: 0.07570093457943924, y: 0.36561743341404357, w: 0.12429906542056075, cx: 0.1378504672897196, cy: 0.423728813559322 },
  ],
  face: [0.5, 0.4043583535108959, 0.169392523364486, 0.2566585956416465] as const,
};
const FACE_CENTER = [T.face[0], T.face[1]] as const;
const FACE_RADIUS = [T.face[2], T.face[3]] as const;

/* ---------- expressions ---------- */
type Expr = { sx: number; sy: number; top: number; slant: number; bot: number; curve: number };
const KEYS = ["sx", "sy", "top", "slant", "bot", "curve"] as const;
const X: Record<string, Expr | readonly [Expr, Expr]> = {
  neutral: { sx: 1, sy: 1, top: 0, slant: 0, bot: 0, curve: 0 },
  alert: { sx: 1.03, sy: 1.1, top: 0.1, slant: 0.22, bot: 0.08, curve: 0 },
  shocked: { sx: 1.12, sy: 1.24, top: 0, slant: 0, bot: 0, curve: 0 },
  sleepy: { sx: 1, sy: 1, top: 0.52, slant: 0, bot: 0.04, curve: 0 },
  angry: { sx: 1, sy: 1, top: 0.2, slant: 0.55, bot: 0.12, curve: 0 },
  squint: { sx: 1.08, sy: 1, top: 0.34, slant: 0.12, bot: 0.4, curve: 0.1 },
  happy: { sx: 1, sy: 0.95, top: 0.04, slant: 0, bot: 0.5, curve: 0.9 },
  confused: [
    { sx: 1, sy: 1.12, top: 0, slant: -0.12, bot: 0, curve: 0 },
    { sx: 1, sy: 0.85, top: 0.28, slant: 0.35, bot: 0.05, curve: 0 },
  ],
  curious: { sx: 0.92, sy: 1, top: 0.12, slant: -0.2, bot: 0.05, curve: 0 },
};
const CLICK_CYCLE = ["happy", "angry", "squint", "confused", "curious", "sleepy"];

const expr = (name: string, k: number): Expr => {
  const v = X[name] ?? X.neutral!;
  return Array.isArray(v) ? (v as readonly [Expr, Expr])[k as 0 | 1] : (v as Expr);
};
const mix = (a: Expr, b: Expr, w: number): Expr => {
  const o = {} as Expr;
  for (const k of KEYS) o[k] = a[k] + (b[k] - a[k]) * w;
  return o;
};

/* ---------- helpers ---------- */
const smooth = (a: number, b: number, v: number) => {
  const x = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return x * x * (3 - 2 * x);
};
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const hash = (a: number, b: number) => {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const starPoints = (cx: number, cy: number, R: number, r: number, n: number) =>
  Array.from({ length: 2 * n }, (_, i) => {
    const a = (i * Math.PI) / n, q = i % 2 ? r : R;
    return `${(cx + Math.sin(a) * q).toFixed(1)},${(cy - Math.cos(a) * q).toFixed(1)}`;
  }).join(" ");
const STAR = starPoints(30, 30, 29, 14, 8);

/** deterministic torn-paper edges (same output on server and client) */
function tornEdges() {
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const edge = (n: number, base: number, amp: number) => {
    const out: number[] = [];
    let w = 0;
    for (let i = 0; i <= n; i++) { w = (w + (rnd() - 0.5) * amp * 0.9) * 0.82; out.push(base + w + (rnd() - 0.5) * amp * 0.7); }
    return out;
  };
  const poly = (a: number[], top: boolean) => {
    const n = a.length - 1;
    const p = a.map((y, i) => `${((i / n) * 100).toFixed(1)}% ${y.toFixed(1)}%`);
    return top ? `polygon(0 0,100% 0,${p.reverse().join(",")})` : `polygon(${p.join(",")},100% 100%,0 100%)`;
  };
  const strip = (top: boolean) => {
    const pap = edge(46, top ? 68 : 34, 9);
    const fib = pap.map((y) => y + (top ? 1 : -1) * (4 + rnd() * 5));
    return { pap: poly(pap, top), fib: poly(fib, top) };
  };
  const t = strip(true);
  const b = strip(false);
  return { top: t, bot: b };
}

/* ---------- styles (scoped under .ss) ---------- */
const CSS = `
.ss{--sense-paper:var(--paper,oklch(0.975 0.008 85));--sense-rule:var(--rule,oklch(0.72 0.04 240 / 0.55));--sense-backdrop:oklch(0.14 0 0);--sense-fiber:oklch(0.98 0 0);--sense-type:oklch(0.94 0 0);width:100%}
.ss[data-mono="true"]{--sense-paper:var(--desk,oklch(0.975 0.008 85))}
.ss .tear{position:relative;container-type:inline-size;aspect-ratio:2.44/1;overflow:hidden;background:var(--sense-backdrop);border-radius:4px;margin:0}
.ss .big{position:absolute;left:-.5cqw;top:50%;transform:translateY(-50%);z-index:0;font-family:var(--font-archivo),Impact,"Arial Black",sans-serif;font-weight:900;font-size:min(10vw,92px);font-size:10.4cqw;line-height:1;white-space:nowrap;color:var(--sense-type);user-select:none}
.ss .spk{position:absolute;right:2.5cqw;top:38%;width:24cqw;z-index:2;transform:scale(calc(1 + var(--i,0)*.3));transform-origin:center;pointer-events:none}
.ss .spk .r{transform-box:fill-box;transform-origin:center;animation:ss-spin 14s linear infinite}
.ss .spk .r:nth-child(2){animation-duration:9s;animation-direction:reverse}
@keyframes ss-spin{to{transform:rotate(360deg)}}
.ss .strip{position:absolute;left:-1%;right:-1%;z-index:1;filter:drop-shadow(0 5px 7px rgba(0,0,0,.5));pointer-events:none}
.ss .strip.top{top:0;height:24%}
.ss .strip.bot{bottom:0;height:26%;z-index:4}
.ss .strip i{position:absolute;inset:0}
.ss .fib{background:color-mix(in oklch,var(--sense-paper) 85%,var(--sense-fiber))}
.ss .pap{background:var(--sense-paper)}
.ss .pap::before{content:"";position:absolute;inset:0;transition:transform 650ms ease;transform-origin:left;background-image:linear-gradient(180deg,transparent calc(100% - 1.5px),var(--sense-rule) calc(100% - 1.5px));background-size:100% var(--sense-line,36px);background-repeat:repeat-y;background-position-y:var(--sense-rule-offset,0px)}
.ss[data-mono="true"] .pap::before{transform:scaleX(0)}
.ss .fig{position:absolute;height:113%;aspect-ratio:856/826;left:50%;top:0;transform:translateX(-50%);z-index:3}
.ss .head{position:absolute;inset:0;transform-origin:50% 62%;pointer-events:none}
.ss .head>img{position:absolute;inset:0;width:100%;height:100%;display:block;max-width:none}
.ss .head>.ol{filter:drop-shadow(0 4px 9px rgba(0,0,0,.55))}
.ss .eyes{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}
.ss .bolts{position:absolute;inset:0;z-index:4;pointer-events:none}
.ss .bolts img{position:absolute;opacity:0;will-change:transform,opacity;max-width:none;height:auto}
.ss .face{position:absolute;border-radius:50%;z-index:5;cursor:pointer}
.ss .face:focus-visible{outline:2px dashed var(--sense-type);outline-offset:5px}
@media (prefers-reduced-motion:reduce){.ss .spk .r{animation:none}.ss .pap::before{transition:none}}
`;

type Shared = { mx: number; my: number; last: number; burst: number; ci: number; cu: number };
const OFFSCREEN = -1e4;

/**
 * Spider-Sense scene.
 * @param mono      page is in monospace mode (hides the ruled lines on the torn paper)
 * @param trackRef  ref of the element whose area the cursor is followed in.
 *                  Falls back to the scene itself when omitted.
 */
export function SpiderSense({ mono, trackRef }: { mono: boolean; trackRef?: RefObject<HTMLElement | null> }) {
  const uid = useId().replace(/:/g, "");
  const edges = useMemo(tornEdges, []);

  const rootRef = useRef<HTMLDivElement>(null);
  const tearRef = useRef<HTMLElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HTMLDivElement>(null);
  const figRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const spkRef = useRef<SVGSVGElement>(null);
  const lidRefs = useRef<(SVGPathElement | null)[]>([]);
  const lensRefs = useRef<(SVGEllipseElement | null)[]>([]);
  const boltRefs = useRef<(HTMLImageElement | null)[]>([]);
  const shared = useRef<Shared>({ mx: OFFSCREEN, my: OFFSCREEN, last: 0, burst: -1e4, ci: -1, cu: 0 });

  const poke = () => {
    const S = shared.current, n = performance.now();
    S.burst = n; S.ci = (S.ci + 1) % CLICK_CYCLE.length; S.cu = n + 1700;
  };

  /* line height + ruled-line alignment with the notebook page */
  useEffect(() => {
    const root = rootRef.current, tear = tearRef.current;
    if (!root || !tear) return;
    const sync = () => {
      const sheet = root.closest("article");
      const rules = sheet?.querySelector(".paper-rules");
      const lh = sheet ? parseFloat(getComputedStyle(sheet).lineHeight) : NaN;
      root.style.setProperty("--sense-line", `${Number.isFinite(lh) && lh > 0 ? lh : 36}px`);
      if (!rules) return;
      const offset = tear.getBoundingClientRect().top - rules.getBoundingClientRect().top;
      for (const s of [topRef.current, botRef.current]) s?.style.setProperty("--sense-rule-offset", `${-(offset + s.offsetTop)}px`);
    };
    const ro = new ResizeObserver(sync);
    ro.observe(tear);
    window.addEventListener("resize", sync);
    sync();
    return () => { ro.disconnect(); window.removeEventListener("resize", sync); };
  }, []);

  /* animation + cursor following (only inside the tracking element) */
  useEffect(() => {
    const area: HTMLElement | null = trackRef?.current ?? rootRef.current;
    const fig = figRef.current, head = headRef.current, spk = spkRef.current;
    if (!area || !fig || !head || !spk) return;

    const S = shared.current;
    S.last = performance.now();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const eyes = T.eyes.map((e, k) => ({ e, inner: k ? -1 : 1, p: { ...expr("neutral", 0) }, ox: 0, oy: 0 }));

    const move = (ev: PointerEvent) => { S.mx = ev.clientX; S.my = ev.clientY; S.last = performance.now(); };
    const leave = () => { S.mx = OFFSCREEN; S.my = OFFSCREEN; };
    area.addEventListener("pointermove", move);
    area.addEventListener("pointerdown", move);
    area.addEventListener("pointerleave", leave);

    const setEye = (k: number, bl: number) => {
      const Q = eyes[k]!, lid = lidRefs.current[k], lens = lensRefs.current[k];
      if (!lid || !lens) return;
      const { e, p } = Q;
      const rx = e.rx * 1.1, ry = e.ry * 1.1, L = rx * 1.9;
      const slope = Math.tan(p.slant) * Q.inner, a = (e.ang * Math.PI) / 180;
      const yb = (x: number) => ry - 2 * ry * p.bot - p.curve * ry * (1 - (x / rx) * (x / rx));
      const tp = Math.min(Math.max(p.top, bl * 0.97), (yb(0) + ry) / (2 * ry) - 0.03);
      const yt = (x: number) => -ry + 2 * ry * tp + slope * x;
      const bL = yb(-L), bR = yb(L), c = 2 * yb(0) - 0.5 * (bL + bR);
      lens.setAttribute("cx", String(Q.ox * Math.cos(a) + Q.oy * Math.sin(a)));
      lens.setAttribute("cy", String(-Q.ox * Math.sin(a) + Q.oy * Math.cos(a)));
      lens.setAttribute("rx", String(rx * p.sx));
      lens.setAttribute("ry", String(ry * p.sy));
      lid.setAttribute("d", `M${-L} ${yt(-L)}L${L} ${yt(L)}L${L} ${bR}Q0 ${c} ${-L} ${bL}Z`);
    };

    let raf = 0, I = 0, hx = 0, hy = 0, nextBlink = 2500, blinkAt = -1e4;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      const r = fig.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;

      const { mx, my } = S;
      const has = mx > OFFSCREEN / 2;
      const fx = r.left + FACE_CENTER[0] * r.width, fy = r.top + FACE_CENTER[1] * r.height;
      const frx = FACE_RADIUS[0] * r.width, fry = FACE_RADIUS[1] * r.height;
      const dist = Math.hypot((mx - fx) / frx, (my - fy) / fry); // 1 = edge of the face
      const burst = t - S.burst < 700;
      let tg = dist < 1 ? 1 : dist < 2.3 ? 0.15 + 0.6 * (1 - (dist - 1) / 1.3) : 0;
      if (burst) tg = 1;
      I += (tg - I) * (tg > I ? 0.25 : 0.08);

      if (t > nextBlink) { blinkAt = t; nextBlink = t + 2400 + Math.random() * 3600; }
      const blink = !reduced && t - blinkAt < 170 ? Math.sin((Math.PI * (t - blinkAt)) / 170) : 0;

      eyes.forEach((Q, k) => {
        const want =
          t < S.cu ? expr(CLICK_CYCLE[S.ci] ?? "neutral", k)
          : I > 0.92 ? expr("shocked", k)
          : I > 0.12 ? mix(expr("neutral", k), expr("alert", k), smooth(0.12, 0.7, I))
          : t - S.last > 9000 ? expr("sleepy", k)
          : expr("neutral", k);
        for (const q of KEYS) Q.p[q] += (want[q] - Q.p[q]) * 0.18;
        const ex = r.left + (Q.e.cx / T.W) * r.width, ey = r.top + (Q.e.cy / T.H) * r.height;
        const dx = mx - ex, dy = my - ey, d = Math.hypot(dx, dy) || 1;
        const s = has ? Math.min(1, d / 260) : 0;
        Q.ox += ((dx / d) * s * Q.e.ry * 0.7 - Q.ox) * 0.2;
        Q.oy += ((dy / d) * s * Q.e.ry * 0.6 - Q.oy) * 0.2;
        setEye(k, blink);
      });

      // head turns toward the cursor and vibrates when the sense is strong
      hx += ((has ? clamp((mx - fx) / 420, -1, 1) : 0) - hx) * 0.12;
      hy += ((has ? clamp((my - fy) / 420, -1, 1) : 0) - hy) * 0.12;
      const f = Math.floor(t / 40);
      const shake = !reduced && I > 0.5 ? (I - 0.5) * 6 : 0;
      const jolt = burst ? 1 + 0.05 * (1 - (t - S.burst) / 700) : 1;
      head.style.transform = `perspective(800px) rotateY(${hx * 8}deg) rotateX(${-hy * 6}deg) translate(${hx * 6 + (hash(1, f) - 0.5) * shake}px,${hy * 4 + (hash(2, f) - 0.5) * shake}px) scale(${jolt})`;

      // tingle bolts: more appear the closer you get, all at max
      T.bolts.forEach((o, k) => {
        const el = boltRefs.current[k];
        if (!el) return;
        const th = (k + 0.6) / 7.4, li = smooth(th - 0.12, th, I);
        if (li < 0.01) { el.style.opacity = "0"; return; }
        const dx = (o.cx - FACE_CENTER[0]) * r.width, dy = (o.cy - FACE_CENTER[1]) * r.height;
        const n = Math.hypot(dx, dy) || 1, j = hash(k, f), j2 = hash(k + 9, f);
        const off = li * (4 + I * I * 14) * (0.55 + 0.45 * Math.sin(t / 60 + k * 2));
        const sc = (0.8 + 0.25 * li) * (burst ? 1 + 0.25 * (1 - (t - S.burst) / 700) : 1);
        el.style.opacity = String(I > 0.9 ? 0.75 + 0.25 * j2 : li);
        el.style.transform = `translate(${(dx / n) * off + (j - 0.5) * I * 8}px,${(dy / n) * off + (j2 - 0.5) * I * 8}px) rotate(${(j - 0.5) * I * 14}deg) scale(${sc})`;
      });
      spk.style.setProperty("--i", reduced ? "0" : I.toFixed(3));
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      area.removeEventListener("pointermove", move);
      area.removeEventListener("pointerdown", move);
      area.removeEventListener("pointerleave", leave);
    };
  }, [trackRef]);

  return (
    <section className="spider-sense-section mx-auto w-full max-w-3xl" aria-label="Spider-Sense">
      <style>{CSS}</style>
      <div ref={rootRef} className={`ss ${archivo.variable}`} data-mono={String(mono)}>
        <section ref={tearRef} className="tear" aria-label="Spider-sense">
          <div className="big">SPIDER-SENSE</div>

          <svg ref={spkRef} className="spk" viewBox="0 0 220 60" aria-hidden="true">
            <g className="r"><polygon points={STAR} style={{ fill: "var(--sense-type)" }} /></g>
            <g className="r"><path d="M110 0Q110 30 140 30Q110 30 110 60Q110 30 80 30Q110 30 110 0Z" style={{ fill: "var(--sense-type)" }} /></g>
            <g className="r" style={{ fill: "var(--sense-type)" }}>
              <circle cx="181" cy="30" r="12" /><circle cx="199" cy="30" r="12" />
              <circle cx="190" cy="21" r="12" /><circle cx="190" cy="39" r="12" />
            </g>
          </svg>

          <div ref={topRef} className="strip top" aria-hidden="true">
            <i className="fib" style={{ clipPath: edges.top.fib }} />
            <i className="pap" style={{ clipPath: edges.top.pap }} />
          </div>

          <div ref={figRef} className="fig">
            <div ref={headRef} className="head">
              <img className="ol" src={T.outline} alt="" />
              <img src={T.head} alt="Spider-Man" />
              <svg className="eyes" viewBox={`0 0 ${T.W} ${T.H}`} preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  {T.eyes.map((e, k) => (
                    <Fragment key={k}>
                      <clipPath id={`${uid}-sk${k}`}><path d={e.sock} /></clipPath>
                      <clipPath id={`${uid}-cl${k}`}><path ref={(el) => { lidRefs.current[k] = el; }} /></clipPath>
                    </Fragment>
                  ))}
                </defs>
                {T.eyes.map((e, k) => (
                  <g key={k} clipPath={`url(#${uid}-sk${k})`}>
                    <g transform={`translate(${e.cx} ${e.cy}) rotate(${e.ang})`}>
                      <ellipse
                        ref={(el) => { lensRefs.current[k] = el; }}
                        clipPath={`url(#${uid}-cl${k})`}
                        style={{ fill: "var(--sense-type)" }}
                      />
                    </g>
                  </g>
                ))}
              </svg>
            </div>

            <div className="bolts">
              {T.bolts.map((b, k) => (
                <img
                  key={b.src}
                  ref={(el) => { boltRefs.current[k] = el; }}
                  src={b.src}
                  alt=""
                  style={{ left: `${b.x * 100}%`, top: `${b.y * 100}%`, width: `${b.w * 100}%` }}
                />
              ))}
            </div>

            <div
              className="face"
              role="button"
              tabIndex={0}
              aria-label="Change Spider-Man expression"
              style={{
                left: `${(T.face[0] - T.face[2]) * 100}%`,
                top: `${(T.face[1] - T.face[3]) * 100}%`,
                width: `${T.face[2] * 200}%`,
                height: `${T.face[3] * 200}%`,
              }}
              onPointerDown={poke}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); poke(); }
              }}
            />
          </div>

          <div ref={botRef} className="strip bot" aria-hidden="true">
            <i className="fib" style={{ clipPath: edges.bot.fib }} />
            <i className="pap" style={{ clipPath: edges.bot.pap }} />
          </div>
        </section>
      </div>
    </section>
  );
}