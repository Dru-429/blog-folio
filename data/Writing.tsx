type Kind = "post" | "blog";

export type Piece = {
  kind: Kind;
  date: string;
  longDate: string;
  meta: string;
  title: string;
  excerpt: string;
  href: string;
};

export const PIECES: Piece[] = [
  {
    kind: "post",
    date: "2026.11.18",
    longDate: "Nov 18, 2026",
    meta: "12.4k views",
    title: "Shipped Liquid Glass in the browser today",
    excerpt: "Turns out the hard part isn't the blur, it's the edge highlights.",
    href: "#",
  },
  {
    kind: "blog",
    date: "2026.11.02",
    longDate: "Nov 02, 2026",
    meta: "4 min read",
    title: "How I built this notebook portfolio",
    excerpt: "A breakdown of the stack, the ruled-paper CSS, and why I picked a handwritten font.",
    href: "#",
  },
  {
    kind: "post",
    date: "2026.10.30",
    longDate: "Oct 30, 2026",
    meta: "8.1k views",
    title: "Stop overengineering your first project",
    excerpt: "Ship the ugly version first. You learn more from users than from refactors.",
    href: "#",
  },
  {
    kind: "blog",
    date: "2026.10.12",
    longDate: "Oct 12, 2026",
    meta: "6 min read",
    title: "CSS tricks I wish I knew earlier",
    excerpt: "Five small CSS features that replaced a lot of JavaScript in my projects.",
    href: "#",
  },
  {
    kind: "post",
    date: "2026.09.21",
    longDate: "Sep 21, 2026",
    meta: "5.3k views",
    title: "Dark mode is a design system, not a toggle",
    excerpt: "Tokens, contrast and states. Get those right and the toggle takes care of itself.",
    href: "#",
  },
  {
    kind: "blog",
    date: "2026.09.02",
    longDate: "Sep 02, 2026",
    meta: "7 min read",
    title: "Building a color converter with palettes and Tailwind export",
    excerpt: "How I built a converter that outputs palettes, web-safe swatches and Tailwind config.",
    href: "#",
  },
  {
    kind: "blog",
    date: "2026.08.14",
    longDate: "Aug 14, 2026",
    meta: "5 min read",
    title: "What I learned shipping 5 side projects in a year",
    excerpt: "Lessons on scope, finishing, and why small launches beat big plans.",
    href: "#",
  },
  {
    kind: "post",
    date: "2026.07.30",
    longDate: "Jul 30, 2026",
    meta: "9.8k views",
    title: "Your portfolio needs fewer projects, not more",
    excerpt: "Three strong projects tell a better story than ten half-finished ones.",
    href: "#",
  },
];
