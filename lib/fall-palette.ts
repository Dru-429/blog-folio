export type Stops = [number, string][];
const sm = (a: number, b: number, x: number) => { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); };
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.substr(i, 2), 16));
export function pal(t: number, S: Stops): string {
  for (let i = 1; i < S.length; i++) {
    if (t <= S[i]![0] || i === S.length - 1) {
      const [p0, c0] = S[i - 1]!, [p1, c1] = S[i]!;
      const k = Math.min(1, Math.max(0, (t - p0) / (p1 - p0)));
      const a = hex(c0), b = hex(c1);
      return "rgb(" + a.map((v, j) => Math.round(v + (b[j]! - v) * k)).join() + ")";
    }
  }
  return S[0]![1];
}
export { sm };
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const TICK: Stops = [[0, "#6fb4e6"], [.3, "#f0a040"], [.5, "#e5505e"], [.7, "#8a3fb0"], [.88, "#2a2a8a"], [1, "#12153a"]];
export const TOP: Stops = [[0, "#2f7fd8"], [.28, "#5b8fe0"], [.5, "#6a4fa8"], [.72, "#1d2a86"], [1, "#1d2a86"]];
export const BOT: Stops = [[0, "#aee0fa"], [.28, "#ffc98c"], [.5, "#ff7c6a"], [.72, "#2e4ab8"], [1, "#2e4ab8"]];
export const SUNC: Stops = [[0, "#ffe27a"], [.3, "#ffc24d"], [.55, "#ff6a30"], [1, "#ff6a30"]];
// whole-page theme (paper/desk/ink), driven by the same 0..1 value as the sky
export const TH_BG: Stops = [[0, "#f3f1ec"], [.25, "#fde7d0"], [.4, "#8a4a6e"], [.55, "#2d1b4d"], [.72, "#141a4a"], [1, "#060808"]];
export const TH_FG: Stops = [[0, "#2b1d16"], [.25, "#3a2418"], [.33, "#3a2418"], [.42, "#fff1ee"], [.72, "#dfe3ff"], [1, "#c9ccc8"]];
export const TH_INK: Stops = [[0, "#283c8c"], [.25, "#9a3f1a"], [.33, "#9a3f1a"], [.42, "#ffc2ae"], [.72, "#aab6ff"], [1, "#9fe0c0"]];
