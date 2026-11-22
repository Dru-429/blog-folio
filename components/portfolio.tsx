"use client";
/* eslint-disable @next/next/no-img-element */

import { useRef, useState, type ReactNode } from "react";
import { Star } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { FallScene } from "@/components/fall-scene";
import { GithubActivity } from "@/components/github-activity";
import { SpiderCursor } from "./spider-coursor";
import { SpiderSense } from "./spider-sense";
import { MoreFromMe } from "./more-from-me";
import { projects } from "@/data/Project";
import { Footer } from "./footer";

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

function PicBox({ h, src, label = "Pic" }: { h: string; src?: string; label?: string }) {
  return (
    <div className={`picture-box relative overflow-hidden rounded-lg border-2 border-dashed border-ink-dark/60 bg-paper ${h}`}>
      <Tapes />
      {src ? (
        <img className="absolute inset-0 h-full w-full object-cover" src={src} alt="" />
      ) : (
        <div className="flex h-full items-center justify-center">
          <span className="picture-label type-micro text-ink-dark/70">{label}</span>
        </div>
      )}
    </div>
  );
}

function SheetChrome({ header }: { header?: ReactNode }) {
  return (
    <>
      <div className="paper-rules" aria-hidden="true" />
      <div className="paper-margin" aria-hidden="true" />
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
  const area = useRef<HTMLDivElement>(null);

  return (
    <main ref={area} className={`portfolio flex min-h-screen flex-col gap-[var(--space-section)] bg-desk px-3 pb-10 pt-12 sm:pb-16 ${mono ? "is-mono font-mono-ui" : "font-hand"}`}>
      <article className="sheet relative mx-auto w-full max-w-3xl text-ink">
        <SheetChrome
          header={
            <>
              <span className="paper-date type-caption text-ink-dark">15/11/26</span>
              <label className="font-toggle type-micro mb-3 flex items-center gap-3 text-ink-dark" htmlFor="font-mode">
                <span className="font-hand" aria-hidden>✎</span>
                <Switch id="font-mode" checked={mono} onCheckedChange={setMono} aria-label="Use monospace font" />
                <span className="font-mono-ui">mono</span>
              </label>
            </>
          }
        />

        <div className="notebook-content pb-[var(--line)] pr-6 sm:pr-8">
          <header className="notebook-section">
            <h1 className="type-h2 relative text-ink-dark">
              <span className="absolute -left-10" aria-hidden>➜</span>
              <span className="underline underline-offset-2">Dhruv Sahoo</span>
            </h1>
          </header>

          <ul className="notebook-list type-body list-none p-0 mt-7.5 text-ink">
            <li>I&apos;m Dhruv, 21-year-old design engineer from Delhi, India.</li>
            <li>My interests spectrum mostly has visuals, web, maths, softwares &amp; Games.</li>
            <li>
              You can know me better <s className="opacity-70">my through</s> by{" "}
              <a className="notebook-link underline underline-offset-4 decoration-dotted" href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>,{" "}
              <a className="underline underline-offset-4 decoration-dotted" href="https://x.com" target="_blank" rel="noreferrer">X (Twitter)</a>,{" "}
              <a className="underline underline-offset-4 decoration-dotted" href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>.
            </li>
          </ul>

          <div className="notebook-section">
            <FallScene />
          </div>

          <section className="mt-12" aria-labelledby="projects-heading">
            <h2 id="projects-heading" className="type-h2 relative -top-10 text-ink-dark">
              <span className="absolute -left-10" aria-hidden>➜</span>
              <span className="underline underline-offset-2">Projects</span>
            </h2>
            <div className="heading-gap grid gap-x-10 gap-4 sm:grid-cols-2">
              {projects.slice(0, 4).map((p) => (
                <ProjectCard key={p.name} project={p} />
              ))}
            </div>
          </section>
        </div>
      </article>

      <article className="sheet relative mx-auto w-full max-w-3xl text-ink overflow-x-hidden">
        <SheetChrome />
        <div className="notebook-content pb-[var(--line)] pr-6 sm:pr-8">
          <section className="notebook-section" aria-labelledby="github-activity-heading">
            <h2 id="github-activity-heading" className="type-h2 relative text-ink-dark">
              <span className="absolute -left-10" aria-hidden>➜</span>
              <span className="underline underline-offset-2">GitHub Activity</span>
            </h2>
            <div className="heading-gap ">
              <GithubActivity />
            </div>
          </section>
          <MoreFromMe />
          <div className="notebook-section relative -left-30 min-w-3xl h-auto">
            <SpiderSense mono={mono} trackRef={area} />
          </div>
          <div>
            <Footer />
          </div>
        </div>
      </article>
      {/* <SpiderCursor /> */}
    </main>
  );
}

function ProjectCard({ project: p }: { project: (typeof projects)[number] }) {
  return (
    <article>
      <div className="relative -top-1 text-right">
        {p.link ? (
          <a className="notebook-link  decoration-dotted text-micro text-right hover:scale-150 transition-all ease-in cursor-pointer" href={p.link} target="_blank" rel="noreferrer">
            • live ↗
          </a>
        ) : (
          "• draft"
        )}
      </div>
      <PicBox h="h-[calc(var(--line)*3)] -mt-2" src={p.banner} />
      <div className="project-note -mt-2 flex items-center justify-between gap-3">
        <h3 className="type-h3 text-ink-dark">{p.name}</h3>
        {p.github ? (
          <a className="project-stars type-caption inline-flex shrink-0 items-center gap-1 notebook-link  decoration-dotted" href={p.github} target="_blank" rel="noreferrer" aria-label={`${p.name} on GitHub, ${p.stars ?? "unknown"} stars`}>
            <Star className="sketch-star h-4 w-4" aria-hidden="true" /><span>{p.stars ?? "—"}</span>
          </a>
        ) : (
          <span className="project-stars type-caption inline-flex shrink-0 items-center gap-1" title="GitHub repository not provided">
            <Star className="sketch-star h-4 w-4" aria-hidden="true" /><span>—</span>
          </span>
        )}
      </div>
      <p className="relative top-3 type-body-inline text-ink">{p.desc}</p>
    </article>
  );
}