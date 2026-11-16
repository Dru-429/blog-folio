import { useEffect, useRef } from "react";
import standSrc from "@/assets/spidey-stand.png";
import shootSrc from "@/assets/spidey-shoot.png";
import airSrc from "@/assets/spidey-air.png";

type Pt = { x: number; y: number };
type Web = { x: number; y: number; t: number; r: number; R: number; n: number; g: number; lw: number; life: number; s: number[] };
const S = {
  stand: { w: 21, h: 23 },
  shoot: { w: 32, h: 28, hx: 13.5, hy: -10.5 },
  air: { w: 26, h: 29 },
};
type Key = keyof typeof S;
const K = 2;
const SKIP = ".temple-controls,a,button,input,select,textarea,label,[role=switch],[role=slider]";

/** Pixel Spider-Man: rests on the page, shoots a web at a resting cursor and swings to it; click/hold spins webs. */
export function SpiderCursor() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const c = cv?.getContext("2d");
    if (!cv || !c) return;
    const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const im: Record<Key, HTMLImageElement> = { stand: new Image(), shoot: new Image(), air: new Image() };
    im.stand.src = standSrc; im.shoot.src = shootSrc; im.air.src = airSrc;

    let W = 0, H = 0, st: "stand" | "shoot" | "swing" | "land" = "stand";
    let pos: Pt = { x: 0, y: 0 }, from: Pt = pos, to: Pt = pos, dist = 0, t0 = 0, flip = 1, rot = 0;
    let mouse: Pt | null = null, pending: Pt | null = null, idle = 0, raf = 0;
    const webs: Web[] = [];
    let hold: { x: number; y: number; t: number; p: number } | null = null;

    const fit = () => {
      const d = devicePixelRatio || 1; W = innerWidth; H = innerHeight;
      cv.width = W * d; cv.height = H * d; c.setTransform(d, 0, 0, d, 0, 0); c.imageSmoothingEnabled = false;
    };
    fit();
    pos = { x: Math.min(140, W * 0.14), y: H - (S.stand.h * K) / 2 - 8 };
    const onResize = () => { fit(); pos.x = Math.min(pos.x, W - 30); pos.y = Math.min(pos.y, H - 30); };
    const skip = (e: Event) => !!(e.target as Element | null)?.closest?.(SKIP);
    const onSl = (e: Event) => !!(e.target as Element | null)?.closest?.(".temple-controls");

    const fire = () => {
      if (!mouse) return;
      if (st !== "stand") { pending = { ...mouse }; return; }
      const tx = Math.min(W - 30, Math.max(30, mouse.x)), ty = Math.min(H - 30, Math.max(70, mouse.y));
      const d = Math.hypot(tx - pos.x, ty - pos.y);
      if (d < 70) return;
      from = { ...pos }; to = { x: tx, y: ty }; dist = d; flip = tx < pos.x ? -1 : 1;
      if (RM) { pos = { ...to }; return; }
      st = "shoot"; t0 = performance.now();
    };

    const onMove = (e: PointerEvent) => {
      if (hold && e.pointerType !== "mouse") hold.p = Math.max(hold.p || 0, e.pressure);
      if (onSl(e) || e.pointerType === "touch") return;
      mouse = { x: e.clientX, y: e.clientY }; clearTimeout(idle); idle = window.setTimeout(fire, 450);
    };
    const onDown = (e: PointerEvent) => {
      if (onSl(e)) return;
      mouse = { x: e.clientX, y: e.clientY }; clearTimeout(idle);
      if (skip(e)) return;
      hold = { x: e.clientX, y: e.clientY, t: performance.now(), p: e.pointerType === "mouse" ? 0 : e.pressure };
    };
    const inten = (h: NonNullable<typeof hold>, now: number) => Math.max(0.12, Math.min(1, Math.max((now - h.t) / 900, h.p || 0)));
    const onUp = (e: PointerEvent) => {
      const h = hold; hold = null; if (!h) return;
      const now = performance.now(), I = inten(h, now), n = 8 + Math.round(I * 6);
      if (webs.length >= 12) webs.shift();
      webs.push({ x: h.x, y: h.y, t: now, r: Math.random() * Math.PI, R: 32 + I * 93 + Math.random() * 10, n, g: 2 + Math.floor(I * 5), lw: 1.1 + I * 1.6, life: 5000 + I * 7000, s: Array.from({ length: n }, () => 0.9 + Math.random() * 0.2) });
      mouse = { x: e.clientX, y: e.clientY }; clearTimeout(idle);
      if (e.pointerType === "touch") fire(); else idle = window.setTimeout(fire, 120);
    };
    const onCancel = () => { hold = null; };
    const onLeave = () => clearTimeout(idle);

    const drawCharge = (now: number) => {
      if (!hold) return;
      const I = inten(hold, now); c.save(); c.lineCap = "round";
      c.strokeStyle = "rgba(0,0,0,.35)"; c.lineWidth = 4; c.beginPath();
      c.arc(hold.x, hold.y, 14, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * I); c.stroke();
      c.strokeStyle = "#fff"; c.lineWidth = 2; c.stroke();
      c.setLineDash([3, 5]); c.lineWidth = 1.2; c.strokeStyle = "rgba(60,60,70,.6)"; c.beginPath();
      c.arc(hold.x, hold.y, 32 + I * 93, 0, Math.PI * 2); c.stroke(); c.restore();
    };
    const drawWebs = (now: number) => {
      drawCharge(now);
      for (let i = webs.length - 1; i >= 0; i--) {
        const w = webs[i]!, age = now - w.t;
        if (age > w.life + 1500) { webs.splice(i, 1); continue; }
        const p = Math.min(1, age / 700), al = age > w.life ? 1 - (age - w.life) / 1500 : 1, sp = Math.min(1, p / 0.4);
        const P = (k: number, r: number) => { const a = w.r + (k * 2 * Math.PI) / w.n, l = w.s[k % w.n]! * w.R * r; return { x: w.x + Math.cos(a) * l, y: w.y + Math.sin(a) * l }; };
        const L = new Path2D();
        for (let k = 0; k < w.n; k++) { const a = P(k, sp); L.moveTo(w.x, w.y); L.lineTo(a.x, a.y); }
        for (let g = 0; g < w.g; g++) {
          const q = Math.max(0, Math.min(1, (p - 0.3 - (g * 0.5) / w.g) / 0.3)), segs = Math.ceil(q * w.n), r = (g + 1) / w.g;
          for (let k = 0; k < segs; k++) {
            const a = P(k, r), b = P(k + 1, r);
            L.moveTo(a.x, a.y); L.quadraticCurveTo(w.x + ((a.x + b.x) / 2 - w.x) * 0.86, w.y + ((a.y + b.y) / 2 - w.y) * 0.86, b.x, b.y);
          }
        }
        c.save(); c.globalAlpha = al; c.lineCap = "round";
        c.strokeStyle = "rgba(0,0,0,.3)"; c.lineWidth = w.lw + 1.6; c.stroke(L);
        c.strokeStyle = "#e9eaf0"; c.lineWidth = w.lw; c.setLineDash([4, 1.5]); c.stroke(L); c.restore();
      }
    };

    const a0 = Math.atan2(S.shoot.hy, S.shoot.hx);
    const put = (k: Key, x: number, y: number, sx: number, sy: number, r = 0) => {
      const s = S[k]; if (!im[k].complete) return;
      c.save(); c.translate(x, y); c.scale(sx * K, sy * K); c.rotate(r); c.drawImage(im[k], -s.w / 2, -s.h / 2); c.restore();
    };
    const web = (a: Pt, b: Pt) => {
      c.save(); c.lineCap = "round"; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y);
      c.strokeStyle = "rgba(0,0,0,.35)"; c.lineWidth = 3.5; c.stroke(); c.strokeStyle = "#fff"; c.lineWidth = 1.6; c.stroke(); c.restore();
    };
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame); c.clearRect(0, 0, W, H); drawWebs(now);
      if (st === "stand") { put("stand", pos.x, pos.y, flip, 1 + Math.sin(now / 520) * 0.02); return; }
      if (st === "shoot") {
        const p = Math.min(1, (now - t0) / 170), dx = to.x - from.x, dy = to.y - from.y;
        rot = Math.atan2(dy, Math.abs(dx)) - a0;
        put("shoot", from.x, from.y, flip, 1, rot);
        const hx = S.shoot.hx * K, hy = S.shoot.hy * K, cs = Math.cos(rot), sn = Math.sin(rot);
        const h = { x: from.x + flip * (hx * cs - hy * sn), y: from.y + (hx * sn + hy * cs) };
        web(h, { x: h.x + (to.x - h.x) * p, y: h.y + (to.y - h.y) * p });
        if (p >= 1) { st = "swing"; t0 = now; }
        return;
      }
      if (st === "swing") {
        const dur = Math.min(1100, 380 + dist * 0.6), s = Math.min(1, (now - t0) / dur), e = s * s * (3 - 2 * s);
        const sag = Math.min(90, dist * 0.2) * Math.sin(Math.PI * e);
        const x = from.x + (to.x - from.x) * e, y = from.y + (to.y - from.y) * e + sag, vx = to.x - x, vy = to.y - y;
        if (Math.hypot(vx, vy) > 18) rot = Math.max(-1.1, Math.min(1.1, Math.atan2(vx, -vy)));
        put("air", x, y, 1, 1, rot);
        const off = S.air.h * K * 0.38; web({ x: x + Math.sin(rot) * off, y: y - Math.cos(rot) * off }, to);
        if (s >= 1) { pos = { ...to }; st = "land"; t0 = now; }
        return;
      }
      const p = Math.min(1, (now - t0) / 220);
      put("stand", pos.x, pos.y, flip, 1 - 0.16 * Math.sin(Math.PI * p));
      if (p >= 1) { st = "stand"; if (pending) { mouse = pending; pending = null; fire(); } }
    };

    addEventListener("resize", onResize);
    addEventListener("pointermove", onMove);
    addEventListener("pointerdown", onDown);
    addEventListener("pointerup", onUp);
    addEventListener("pointercancel", onCancel);
    document.documentElement.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf); clearTimeout(idle);
      removeEventListener("resize", onResize); removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown); removeEventListener("pointerup", onUp);
      removeEventListener("pointercancel", onCancel);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="spider-canvas" />;
}
