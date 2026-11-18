// components/github-activity.tsx
'use client'

import { useEffect, useState } from 'react'

const CELL = 16
const GAP = 4
const LEFT = 0
const TOP = 20
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

type Contribution = { date: string; count: number; level: number }
type Activity = { total: number; contributions: Contribution[] }

export function GithubActivity () {
  const [data, setData] = useState<Activity | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/github-activity', { signal: controller.signal })
      .then(r => (r.ok ? (r.json() as Promise<Activity>) : null))
      .then(json => setData(json))
      .catch(err => {
        if (err.name !== 'AbortError') setData(null)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [])

  if (loading)
    return <p className='type-body-inline text-ink'>loading activity…</p>
  if (!data || !data.contributions.length)
    return (
      <p className='type-body-inline text-ink'>
        activity could not load right now.
      </p>
    )

  return <ActivityGraph total={data.total} contributions={data.contributions} />
}

function cellPos (col: number, row: number) {
  return {
    x: LEFT + col * (CELL + GAP),
    y: TOP + row * (CELL + GAP)
  }
}

function ActivityGraph ({ total, contributions }: Activity) {
  const firstDay = new Date(contributions[0]!.date + 'T00:00:00Z').getUTCDay()
  const cells = contributions.map((c, i) => ({
    ...c,
    col: Math.floor((i + firstDay) / 7),
    row: (i + firstDay) % 7
  }))
  const cols = cells[cells.length - 1]!.col + 1

  const months: { col: number; label: string }[] = []
  cells.forEach(c => {
    const d = new Date(c.date + 'T00:00:00Z')
    if (
      d.getUTCDate() <= 7 &&
      c.row === 0 &&
      (!months.length || months[months.length - 1]!.col < c.col - 2)
    )
      months.push({ col: c.col, label: MONTHS[d.getUTCMonth()] ?? '' })
  })

  const w = LEFT + cols * (CELL + GAP)
  const h = TOP + 7 * (CELL + GAP)
  const legendStep = CELL + GAP
  const legendW = 5 * CELL + 4 * GAP
  const legendH = CELL

  return (
    <figure className='gh-activity rounded-lg border-2 border-dashed border-ink-dark/60 bg-paper px-4 py-4'>
      <div className='overflow-x-hidden '>
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className='w-full min-w-[720px]'
          role='img'
          aria-label={`${total} GitHub contributions in the last year`}
        >
          {months.map(m => (
            <text
              key={m.col + m.label}
              x={LEFT + m.col * (CELL + GAP)}
              y={13}
              className='gh-month'
            >
              {m.label}
            </text>
          ))}
          {cells.map(c => {
            const { x, y } = cellPos(c.col, c.row)
            return (
              <g filter="url(#)" key={c.date}>
                <rect
                  key={c.date}
                  x={x}
                  y={y}
                  width={CELL}
                  height={CELL}
                  rx={3}
                  className={`gh-l${c.level}`}
                >
                  <title>
                    {c.level === 0
                      ? `No contributions on ${c.date}`
                      : `${c.count} contributions on ${c.date}`}
                  </title>
                </rect>
              </g>
            )
          })}
        </svg>
      </div>
      <figcaption className='project-note flex items-center justify-between type-caption text-ink-dark'>
        <span>{total} contributions in the last year</span>
        <span className='flex items-center gap-1.5'>
          <span className='gh-legend-less'>Less</span>
          <svg
            width={legendW}
            height={legendH}
            viewBox={`0 0 ${legendW} ${legendH}`}
            aria-hidden='true'
          >
            {[0, 1, 2, 3, 4].map(l => (
              <rect
                key={l}
                x={l * legendStep}
                width={CELL}
                height={CELL}
                rx={3}
                className={`gh-l${l}`}
              />
            ))}
          </svg>
          <span className='gh-legend-more'>More</span>
        </span>
      </figcaption>
    </figure>
  )
}