export type Project = {
  name: string;
  desc: string;
  logo: string;
  banner: string;
  link?: string;
  github?: string;
  stars?: number;
};

const logoPlaceholder = "/assets/projects/placeholder-logo.svg";
const bannerPlaceholder = "/assets/projects/placeholder-banner.svg";

/** Portfolio and “More from me” listings share this array. */
export const projects: Project[] = [
  {
    name: "GitHub Wrapped",
    desc: "Generates a Spotify-style year-in-code show from your GitHub activity.",
    logo: logoPlaceholder,
    banner: bannerPlaceholder,
    link: "#",
    github: "https://github.com",
    stars: 128,
  },
  {
    name: "README",
    desc: "Generates polished README files for your repositories.",
    logo: logoPlaceholder,
    banner: bannerPlaceholder,
    link: "#",
    github: "https://github.com",
  },
  {
    name: "Pixel Journal",
    desc: "A tiny diary that draws your mood.",
    logo: logoPlaceholder,
    banner: bannerPlaceholder,
    link: "#",
  },
  {
    name: "Math Playground",
    desc: "Interactive visual proofs on the web.",
    logo: logoPlaceholder,
    banner: bannerPlaceholder,
    link: "#",
    github: "https://github.com",
    stars: 42,
  },
  {
    name: "Nodge",
    desc: "A logbook for your body. Steps, meals, sleep and weight, stored on your iPhone.",
    logo: logoPlaceholder,
    banner: bannerPlaceholder,
    link: "#",
  },
  {
    name: "BetterCSS",
    desc: "Play with CSS and watch your layout change as you go.",
    logo: logoPlaceholder,
    banner: bannerPlaceholder,
    link: "#",
  },
  {
    name: "macOS 26 Tahoe",
    desc: "macOS 26 Tahoe in the browser, Liquid Glass included.",
    logo: logoPlaceholder,
    banner: bannerPlaceholder,
    link: "#",
  },
  {
    name: "Fermion",
    desc: "Landing pages for an AI learning platform, illustrations and motion included.",
    logo: logoPlaceholder,
    banner: bannerPlaceholder,
    link: "#",
  },
  {
    name: "Colors",
    desc: "A color format converter with palettes, web-safe swatches, and CSS and Tailwind export.",
    logo: logoPlaceholder,
    banner: bannerPlaceholder,
    link: "#",
    github: "https://github.com",
  },
];