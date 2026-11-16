import type { Metadata } from "next";
import { Portfolio } from "@/components/portfolio";

export const metadata: Metadata = {
  title: "Dhruv Sahoo — Handwritten Portfolio",
  description:
    "Dhruv Sahoo, 21-year-old design engineer from Delhi. Visuals, web, maths, software & games.",
  openGraph: {
    title: "Dhruv Sahoo — Handwritten Portfolio",
    description: "A portfolio written on a sheet of notebook paper.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function Page() {
  return <Portfolio />;
}