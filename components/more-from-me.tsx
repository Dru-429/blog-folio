/* eslint-disable @next/next/no-img-element */

import { projects } from "@/data/Project";

export function MoreFromMe() {
  return (
    <section className="more-from-me mt-16" aria-labelledby="more-from-me-heading">
      <h2 id="more-from-me-heading" className="type-h2 relative flex items-center gap-2 text-ink-dark">
        <span className="absolute -left-10" aria-hidden>
          ➜
        </span>
        <span className="underline underline-offset-2">More from me</span>
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
      className="dotted-underline type-h3 group inline-flex items-center gap-1 text-ink-dark"
      href={p.link}
      target="_blank"
      rel="noreferrer"
    >
      {p.name}
      {/* <span className="type-micro opacity-80 transition-transform group-hover:-translate-y-0.5" aria-hidden>
        ↗
      </span> */}
    </a>
  ) : (
    <span className="type-h3 text-ink-dark underline decoration-dotted underline-offset-2">{p.name}</span>
  );

  return (
    <div>
      <div className="more-from-me-row flex gap-4">
        <div className="more-from-me-logo-wrap relative top-1.5">
          <img className="more-from-me-logo" src={p.logo} alt="" width={52} height={52} loading="lazy" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline ">
            {title}
          </div>
        </div>
      </div>
      <p className=" type-body-inline mt-0 tracking-tighter text-ink/97 w-full">{p.desc}</p>
    </div>
  );
}