import { useEffect, useRef } from "react";
// import scene from "@/lib/spider-sense.html?raw";
import scene from "@/lib/spider-sense-html"
/** Keep the supplied illustration's animation isolated from the page cursor. */
export function SpiderSense({ mono }: { mono: boolean }) {
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const sync = () => {
      const styles = getComputedStyle(document.documentElement);
      const element = frame.current;
      const sheet = element?.closest("article");
      const rules = sheet?.querySelector(".paper-rules");
      frame.current?.contentWindow?.postMessage({
        type: "spider-sense-theme",
        mono,
        line: sheet ? parseFloat(getComputedStyle(sheet).lineHeight) : 36,
        offset: element && rules ? element.getBoundingClientRect().top - rules.getBoundingClientRect().top : 0,
        colors: {
          paper: styles.getPropertyValue(mono ? "--desk" : "--paper").trim(),
          rule: styles.getPropertyValue("--rule").trim(),
          margin: styles.getPropertyValue("--margin-rule").trim(),
        },
      }, "*");
    };
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "class"] });
    const element = frame.current;
    element?.addEventListener("load", sync);
    window.addEventListener("resize", sync);
    sync();
    return () => {
      observer.disconnect();
      element?.removeEventListener("load", sync);
      window.removeEventListener("resize", sync);
    };
  }, [mono]);

  return (
    <section className="spider-sense-section mx-auto w-full max-w-3xl" aria-label="Spider-Sense">
      <iframe
        ref={frame}
        className="spider-sense-frame"
        title="Spider-Sense — interactive Spider-Man illustration"
        srcDoc={scene}
        sandbox="allow-scripts"
      />
    </section>
  );
}