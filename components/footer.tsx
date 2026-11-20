import telephone from "@/public/spidy-telephone.png";
import Image from "next/image";

const CONTACTS: { label: string; value: string; href: string; external?: boolean }[] = [
  { label: "Email", value: "sahoo.dru@gmail.com", href: "mailto:sahoo.dru@gmail.com" },
  { label: "GitHub", value: "dru-429", href: "https://github.com/dru-429", external: true },
  { label: "x", value: "10xdhruv", href: "https://x.com/10xdhruv", external: true },
];

// Slanted arrow that draws itself in from nothing on hover.
function SlantArrow() {
  return (
    <svg className="footer-arrow" viewBox="0 0 24 16" aria-hidden="true" focusable="false">
      <path className="arrow-shaft" d="M1 15 L20 2" />
      <path className="arrow-head" d="M12 1 L20 2 L19 10" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="relative z-[1] mx-auto w-full max-w-3xl text-ink">
      <div className="grid grid-cols-[32%_minmax(0,1fr)] items-center gap-12 rounded-lg border-[1.5px] border-dashed border-ink px-8 py-7 max-sm:grid-cols-[minmax(0,1fr)] max-sm:gap-4 max-sm:p-5">
        <Image
          src={telephone}
          alt="Etched antique telephone"
          width={1039}
          height={752}
          className="pointer-events-none block "
          style={{
            maskImage: `url("${telephone.src}")`,
            WebkitMaskImage: `url("${telephone.src}")`,
          }}
        />
        <div className="min-w-0">
          <h2 className="text-2xl font-normal leading-line text-ink-dark [.is-mono_&]:text-xl max-sm:text-[1.375rem]">
            Dhruv Sahoo
          </h2>
          <ul className="list-none">
            {CONTACTS.map((c) => (
              <li key={c.label}>
                <a
                  className="group grid w-full cursor-pointer grid-cols-[4.5rem_minmax(0,1fr)_1.4rem] items-baseline gap-2 leading-line focus-visible:outline-1 focus-visible:outline-dashed focus-visible:outline-offset-[3px] focus-visible:outline-ink max-sm:grid-cols-[3.75rem_minmax(0,1fr)_1.4rem] max-sm:gap-[0.35rem] max-sm:text-lg"
                  href={c.href}
                  {...(c.external ? { target: "_blank", rel: "noreferrer" } : {})}
                >
                  <span className="text-ink">{c.label}</span>
                  <span className="wrap-anywhere text-ink group-hover:text-ink-dark group-focus-visible:text-ink-dark">
                    {c.value}
                  </span>
                  <SlantArrow />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex justify-between gap-4 px-8 pt-[0.6rem] text-xs leading-normal max-sm:px-2 max-sm:text-[0.6875rem]">
        <span>© 2026 Dhruv Sahoo</span>
        <span>v 1.0 Nov 2-26</span>
      </div>
    </footer>
  );
}
