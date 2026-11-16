// components/github-activity.tsx
"use client";

import { useEffect, useState } from "react";


const CELL = 12, GAP = 3, LEFT = 0, TOP = 18;
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

type Contribution = { date: string; count: number; level: number };
type Activity = { total: number; contributions: Contribution[] };

export function GithubActivity() {
  const [data, setData] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/github-activity", { signal: controller.signal })
      .then((r) => (r.ok ? (r.json() as Promise<Activity>) : null))
      .then((json) => setData(json))
      .catch((err) => {
        if (err.name !== "AbortError") setData(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  if (loading) return <p className="project-note text-ink">loading activity…</p>;
  if (!data || !data.contributions.length)
    return <p className="project-note text-ink">activity could not load right now.</p>;

  return <ActivityGraph total={data.total} contributions={data.contributions} />;
}

function ActivityGraph({ total, contributions }: Activity) {
  const firstDay = new Date(contributions[0]!.date + "T00:00:00Z").getUTCDay();
  const cells = contributions.map((c, i) => ({
    ...c,
    col: Math.floor((i + firstDay) / 7),
    row: (i + firstDay) % 7,
  }));
  const cols = cells[cells.length - 1]!.col + 1;

  const months: { col: number; label: string }[] = [];
  cells.forEach((c) => {
    const d = new Date(c.date + "T00:00:00Z");
    if (
      d.getUTCDate() <= 7 &&
      c.row === 0 &&
      (!months.length || months[months.length - 1]!.col < c.col - 2)
    )
      months.push({ col: c.col, label: MONTHS[d.getUTCMonth()] ?? "" });
  });

  const w = LEFT + cols * (CELL + GAP), h = TOP + 7 * (CELL + GAP);

  return (
    <figure className="gh-activity">
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full min-w-[560px]" role="img" aria-label={`${total} GitHub contributions in the last year`}>
          <defs>
            <filter id="crayon" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="1.4 0.12" numOctaves="3" seed="4" result="streak" />
              <feColorMatrix in="streak" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.3 1.55" result="mask" />
              <feComposite in="SourceGraphic" in2="mask" operator="in" result="tex" />
              <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="9" result="wob" />
              <feDisplacementMap in="tex" in2="wob" scale="1.6" />
            </filter>
          </defs>
          {months.map((m) => (
            <text key={m.col + m.label} x={LEFT + m.col * (CELL + GAP)} y={11} className="gh-month">{m.label}</text>
          ))}
          <g filter="url(#crayon)">
            {cells.map((c) => (
              <rect key={c.date} x={LEFT + c.col * (CELL + GAP)} y={TOP + c.row * (CELL + GAP)} width={CELL} height={CELL} rx={2} className={`gh-l${c.level}`}>
                <title>{`${c.count} contributions on ${c.date}`}</title>
              </rect>
            ))}
          </g>
        </svg>
      </div>
      <figcaption className="project-note flex items-center justify-between text-sm text-ink-dark">
        <span>{total} contributions in the last year</span>
        <span className="flex items-center gap-1">
          Less
          <svg width="80" height="12" aria-hidden="true">
            <g filter="url(#crayon)">
              {[0, 1, 2, 3, 4].map((l) => (
                <rect key={l} x={l * 16} width={12} height={12} rx={2} className={`gh-l${l}`} />
              ))}
            </g>
          </svg>
          More
        </span>
      </figcaption>
    </figure>
  );
}