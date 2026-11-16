"use client";

import { useRef, useState, type ReactNode } from "react";
import { Star } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { FallScene } from "@/components/fall-scene";
import { GithubActivity } from "@/components/github-activity";
import { SpiderCursor } from "./spider-coursor";
import { SpiderSense } from "./spider-sense";

const projects: { name: string; desc: string; githubUrl?: string; stars?: number }[] = [
  { name: "Github Wrapped", desc: "generates spotify style code wrapped show." },
  { name: "Readme", desc: "generates read me." },
  { name: "Pixel Journal", desc: "a tiny diary that draws your mood." },
  { name: "Math Playground", desc: "interactive visual proofs on the web." },
];

function Tapes() {
  return (
    <>
      <span className="tape absolute -left-4 -top-2 h-6 w-16 -rotate-[35deg]" />
      <span className="tape absolute -right-4 -top-2 h-6 w-16 rotate-[35deg]" />
      <span className="tape absolute -bottom-2 -left-4 h-6 w-16 rotate-[35deg]" />
      <span className="tape absolute -bottom-2 -right-4 h-6 w-16 -rotate-[35deg]" />
    </>
  );
}

function PicBox({ h, label = "Pic" }: { h: string; label?: string }) {
  return (
    <div className={`picture-box relative flex items-center justify-center rounded-lg border-2 border-dashed border-ink-dark/60 bg-paper ${h}`}>
      <Tapes />
      <span className="picture-label text-ink-dark/70">{label}</span>
    </div>
  );
}

function SheetChrome({ header }: { header?: ReactNode }) {
  return (
    <>
      <div className="paper-rules" aria-hidden="true" />
      <div className="paper-margin" aria-hidden="true" />
      {/* punch holes */}
      <div className="paper-holes pointer-events-none absolute left-5 top-0 flex h-full flex-col justify-around py-24">
        {[0, 1, 2].map((i) => <span key={i} className="punch block h-6 w-6 rounded-full" />)}
      </div>
      <header className="header-rule flex items-end justify-between pl-4 pr-6" style={{ height: "var(--header-height)" }}>
        {header}
      </header>
    </>
  );
}

export function Portfolio() {
  const [mono, setMono] = useState(false);
  const area = useRef<HTMLDivElement>(null)

  return (
    <main ref={area} className={`portfolio flex min-h-screen flex-col gap-10 bg-desk px-3 pb-10 pt-12 sm:pb-16 ${mono ? "is-mono font-mono-ui" : "font-hand text-[1.25rem]"}`}>
      <article className="sheet relative mx-auto w-full max-w-3xl leading-line text-ink">
        <SheetChrome
          header={
            <>
              <span className="paper-date pb-1 text-ink-dark">15/11/26</span>
              <label className="font-toggle mb-3 flex items-center gap-3 text-sm leading-6 text-ink-dark" htmlFor="font-mode">
                <span className="font-hand">✎</span>
                <Switch id="font-mode" checked={mono} onCheckedChange={setMono} aria-label="Use monospace font" />
                <span className="font-mono-ui">mono</span>
              </label>
            </>
          }
        />

        <div className="notebook-content pb-[var(--line)] pr-6 sm:pr-8">
          <h1 className="relative font-bold text-ink-dark"><span className="absolute -left-10">➜</span><span className="underline underline-offset-4">Dhruv Sahoo</span></h1>

          <ul className="notebook-list mt-[var(--line)]">
            <li>I'm Dhruv, 21-year-old design engineer from Delhi, India.</li>
            <li>My interests spectrum mostly has visuals, web, maths, softwares &amp; Games.</li>
            <li>You can know me better <s className="opacity-70">my through</s> by{" "}
              <a className="underline" href="https://github.com" target="_blank" rel="noreferrer">Github</a>,{" "}
              <a className="underline" href="https://x.com" target="_blank" rel="noreferrer">X (Twitter)</a>,{" "}
              <a className="underline" href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>.
            </li>
          </ul>

          <div className="mt-[var(--line)]">
            <FallScene />
          </div>

          <h2 className="relative mt-[var(--line)] font-bold text-ink-dark"><span className="absolute -left-10">➜</span><span className="underline underline-offset-4">Projects</span></h2>

          <div className="mt-[var(--line)] grid gap-x-10 gap-y-[var(--line)] sm:grid-cols-2">
            {projects.map((p) => (
              <div key={p.name}>
                <div className="project-note text-right text-sm text-ink">• live ↗</div>
                <PicBox h="h-[calc(var(--line)*3)]" />
                <div className="project-note flex items-center justify-between gap-3 font-bold text-ink-dark">
                  <span>{p.name}</span>
                  {p.githubUrl ? (
                    <a className="project-stars inline-flex shrink-0 items-center gap-1" href={p.githubUrl} target="_blank" rel="noreferrer" aria-label={`${p.name} on GitHub, ${p.stars ?? "unknown"} stars`}>
                      <Star className="sketch-star h-5 w-5" aria-hidden="true" /><span>{p.stars ?? "—"}</span>
                    </a>
                  ) : (
                    <span className="project-stars inline-flex shrink-0 items-center gap-1" title="GitHub repository not provided">
                      <Star className="sketch-star h-5 w-5" aria-hidden="true" /><span>—</span>
                    </span>
                  )}
                </div>
                <p className="project-note text-ink">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </article>

      <article className="sheet relative mx-auto w-full max-w-3xl leading-line text-ink overflow-x-hidden">
        <SheetChrome />
        <div className="notebook-content pb-[var(--line)] pr-6 sm:pr-8">
          <h2 className="relative font-bold text-ink-dark"><span className="absolute -left-10">➜</span><span className="underline underline-offset-4">GitHub Activity</span></h2>
          <div className="mt-[var(--line)]">
            <GithubActivity />
          </div>
          <div className="mt-[var(--line)] relative -left-30 min-w-3xl h-auto">
             <SpiderSense mono={mono} trackRef={area} />
          </div>
        </div>
      </article>
      <SpiderCursor />
    </main>
  );
}