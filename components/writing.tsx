"use client";

import { useState } from "react";

type Kind = "post" | "blog";

type Piece = {
  kind: Kind;
  date: string;
  longDate: string;
  meta: string;
  title: string;
  excerpt: string;
  href: string;
};

const PIECES: Piece[] = [
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

const rowGrid =
  "grid grid-cols-[minmax(0,1fr)_3.4rem_1.15rem] items-center gap-x-3 sm:grid-cols-[5.4rem_minmax(0,1fr)_3.4rem_1.15rem]";

export function Writing() {
  const [active, setActive] = useState<number | null>(null);
  const piece = active === null ? null : PIECES[active];

  return (
    <section className="notebook-section relative" aria-labelledby="writing-heading">
      <h2 id="writing-heading" className="type-h2 relative text-ink-dark">
        <span className="absolute -left-10" aria-hidden>
          ➜
        </span>
        <span className="underline underline-offset-2">Writing</span>
        <span className="type-caption ml-2 text-ink">({PIECES.length})</span>
      </h2>

      <div className="heading-gap relative">
        <StickyNote piece={piece} />

        <div className={`${rowGrid} type-micro px-1 text-ink/70`}>
          <span className="hidden sm:block">/ date</span>
          <span>/ headline</span>
          <span className="text-center">/ type</span>
          <span />
        </div>

        <div>
          {PIECES.map((item, index) => (
            <a
              key={item.title}
              href={item.href}
              className={`${rowGrid} group relative top-[var(--baseline-offset)] min-h-[var(--line)] px-1 leading-line text-ink no-underline outline-none [.is-mono_&]:border-b [.is-mono_&]:border-ink/40`}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-[-5px] inset-y-[3px] z-0 origin-left scale-x-0 bg-[linear-gradient(180deg,oklch(0.92_0.14_125),oklch(0.86_0.15_128))] transition-transform duration-[380ms] ease-[cubic-bezier(0.6,0.05,0.2,1)] [clip-path:polygon(0_14%,1.5%_2%,40%_6%,98%_0,100%_18%,99%_62%,100%_94%,60%_100%,3%_92%,0_70%)] group-hover:scale-x-100 group-hover:-rotate-[0.3deg] group-focus-visible:scale-x-100 motion-reduce:transition-none"
              />
              <span className="relative z-[1] hidden items-center text-micro whitespace-nowrap text-ink transition-colors duration-150 group-hover:text-ink-dark group-focus-visible:text-ink-dark sm:flex">
                <span className="mr-1.5 inline-block size-[5px] shrink-0 rounded-[1px] bg-current" />
                {item.date}
              </span>
              <span className="relative z-[1] truncate text-ink-dark">{item.title}</span>
              <KindTag kind={item.kind} />
              <span className="relative z-[1] text-right text-ink transition-transform duration-200 group-hover:translate-x-[3px] group-hover:-translate-y-[3px] group-hover:text-ink-dark motion-reduce:transition-none">
                ↗
              </span>
            </a>
          ))}
        </div>

        <p className="type-caption relative top-[var(--baseline-offset)] mt-2">
          <a className="dotted-underline text-ink-dark" href="#">
            View all writing →
          </a>
        </p>
      </div>
    </section>
  );
}

function KindTag({ kind }: { kind: Kind }) {
  const blog = kind === "blog";
  return (
    <span
      className={`relative z-[1] rounded px-1 text-center text-micro transition-colors duration-150 ${
        blog
          ? "border border-ink bg-ink text-paper group-hover:border-ink-dark group-hover:bg-ink-dark"
          : "border border-dashed border-ink text-ink group-hover:border-ink-dark group-hover:text-ink-dark"
      }`}
    >
      {blog ? "Blog" : "Post"}
    </span>
  );
}

function StickyNote({ piece }: { piece: Piece | null }) {
  return (
    <aside
      className="pointer-events-none absolute top-2 z-20 hidden w-44 right-[calc(100%+var(--paper-margin)+1rem+0.75rem)] min-[1100px]:block"
      aria-hidden
    >
      <div className="relative h-[230px] rotate-[-4deg] overflow-hidden bg-[oklch(0.93_0.09_98)] px-4 pt-6 pb-4 text-[oklch(0.32_0.03_85)] shadow-[2px_6px_14px_oklch(0_0_0/0.16)] [border-bottom-right-radius:26px_8px]">
        <span className="absolute -top-2.5 left-1/2 h-4 w-16 -translate-x-1/2 rotate-[3deg] bg-white/45 shadow-[0_1px_2px_oklch(0_0_0/0.12)]" />
        <span className="absolute right-0 bottom-0 size-6 bg-[linear-gradient(135deg,oklch(0_0_0/0.16)_50%,transparent_50%)]" />
        {piece ? (
          <>
            <span
              className={`inline-block rounded px-1.5 text-[11px] ${
                piece.kind === "blog"
                  ? "bg-[oklch(0.32_0.03_85)] text-[oklch(0.93_0.09_98)]"
                  : "border border-dashed border-current"
              }`}
            >
              {piece.kind === "blog" ? "Blog" : "Post"}
            </span>
            <p className="mt-2.5 text-sm leading-snug font-bold">{piece.title}</p>
            <p className="mt-2 text-xs leading-normal text-[oklch(0.42_0.03_85)]">{piece.excerpt}</p>
            <p className="mt-3 text-[11px] text-[oklch(0.48_0.03_85)]">
              {piece.longDate} · {piece.meta}
            </p>
            <p className="mt-1.5 text-xs underline underline-offset-[3px]">open it ↗</p>
          </>
        ) : (
          <>
            <p className="mt-1.5 text-sm leading-snug font-bold">Hover a headline to peek inside ↗</p>
            <p className="mt-2 text-xs leading-normal text-[oklch(0.42_0.03_85)]">
              A quick preview shows up here before you click.
            </p>
          </>
        )}
      </div>
    </aside>
  );
}
