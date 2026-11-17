/* eslint-disable @next/next/no-img-element */

import { projects } from "@/data/Project";

export function MoreFromMe() {
  return (
    <section className="more-from-me notebook-section" aria-labelledby="more-from-me-heading">
      <h2 id="more-from-me-heading" className="type-h2 relative flex items-center gap-2 text-ink-dark">
        <span className="absolute -left-10" aria-hidden>
          ➜
        </span>
        <span className="more-stamp" aria-hidden />
        <span className="underline underline-offset-2 decoration-dotted">More from me</span>
      </h2>

      <ul className="more-from-me-list heading-gap list-none p-0">
        {projects.slice(4).map((p) => (
          <li key={p.name} className="more-from-me-item project-note">
            <ProjectRow project={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProjectRow({ project: p }: { project: (typeof projects)[number] }) {
  const title = p.link ? (
    <a
      className="type-h3 group inline-flex items-center gap-1 text-ink-dark notebook-link decoration-dotted"
      href={p.link}
      target="_blank"
      rel="noreferrer"
    >
      {p.name}
      <span className="type-micro opacity-80 transition-transform group-hover:-translate-y-0.5" aria-hidden>
        ↗
      </span>
    </a>
  ) : (
    <span className="type-h3 text-ink-dark underline decoration-dotted underline-offset-2">{p.name}</span>
  );

  return (
    <div className="more-from-me-row flex gap-4">
      <div className="more-from-me-logo-wrap shrink-0">
        <img className="more-from-me-logo" src={p.logo} alt="" width={52} height={52} loading="lazy" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {title}
          {p.github ? (
            <a className="type-body-inline notebook-link text-ink opacity-70 hover:opacity-100" href={p.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          ) : null}
        </div>
        <p className="more-from-me-desc type-body-inline mt-0 text-ink/65">{p.desc}</p>
      </div>
    </div>
  );
}