import telephone from '@/public/spidy-telephone.png'
import Image from 'next/image'

const CONTACTS: {
  label: string
  value: string
  href: string
  external?: boolean
}[] = [
  {
    label: 'Email',
    value: 'sahoo.dru@gmail.com',
    href: 'mailto:sahoo.dru@gmail.com'
  },
  {
    label: 'GitHub',
    value: 'dru-429',
    href: 'https://github.com/dru-429',
    external: true
  },
  {
    label: 'X',
    value: '@10xdhruv',
    href: 'https://x.com/10xdhruv',
    external: true
  }
]

// Slanted arrow that draws itself in from nothing on hover.
function SlantArrow () {
  return (
    <svg
      className='footer-arrow'
      viewBox='0 0 24 16'
      aria-hidden='true'
      focusable='false'
    >
      <path className='arrow-shaft' d='M1 15 L20 2' />
      <path className='arrow-head' d='M12 1 L20 2 L19 10' />
    </svg>
  )
}

export function Footer () {
  return (
    <footer className='mx-auto w-full max-w-3xl relative z-[1] text-ink'>
      <div className='grid grid-cols-[32%_minmax(0,1fr)] items-center gap-12 rounded-lg border-[1.5px] border-dashed border-ink px-5 py-3 max-sm:grid-cols-[minmax(0,1fr)] max-sm:gap-4 max-sm:p-5'>
        <div className="flex flex-col items-center relative">
          <Image
            src={telephone}
            alt='Etched antique telephone'
            className='pointer-events-none block relative bottom-2'
          />
          <span> Caught in my web :D</span>
        </div>
        <div className='w-'>
          <h2 className='w-full text-2xl font-normal leading-line text-ink-dark [.is-mono_&]:text-xl max-sm:text-[1.375rem]'>
            Dhruv Sahoo
          </h2>
          <ul className='w-full list-none'>
            {CONTACTS.map(c => (
              <li key={c.label}>
                <a
                  className='group w-full grid grid-cols-[6rem_1fr] gap-4 cursor-pointer leading-line focus-visible:outline-1 focus-visible:outline-dashed focus-visible:outline-offset-[3px] focus-visible:outline-ink items-end in-[.is-mono_&]:border-b in-[.is-mono_&]:border-ink/30'
                  href={c.href}
                  {...(c.external
                    ? { target: '_blank', rel: 'noreferrer' }
                    : {})}
                >
                  <span className='text-ink/70'>{c.label}</span>
                  <span className='wrap-anywhere text-ink group-hover:text-ink-dark group-focus-visible:text-ink-dark'>
                    {c.value}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className='base-footer absolute -bottom-16 flex justify-between gap-4  pt-[0.6rem] text-ink-dark text-xs leading-normal  max-sm:text-[0.6875rem]'>
        <span>© 2026 Dhruv Sahoo</span>
        <span>v 1.0 Nov 2-26</span>
      </div>
    </footer>
  )
}
