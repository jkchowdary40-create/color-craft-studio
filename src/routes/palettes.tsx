import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useColor, copyText } from "../lib/color-store";
import { harmonies, hslToHex, hslCss } from "../lib/color";

export const Route = createFileRoute("/palettes")({
  head: () => ({
    meta: [
      { title: "Palettes — Chroma/lab" },
      {
        name: "description",
        content:
          "Generate complementary, analogous, triadic and monochrome palettes from your picked color, and copy any swatch in one tap.",
      },
      { property: "og:title", content: "Palettes — Chroma/lab" },
      {
        property: "og:description",
        content: "Harmonious color palettes generated from your current color.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PalettesPage,
});

function Swatch({ hex, delay }: { hex: string; delay: number }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    if (await copyText(hex)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };
  return (
    <button
      onClick={onCopy}
      title={`Copy ${hex}`}
      className="group relative flex-1 transition-transform hover:z-10 hover:scale-[1.03]"
      style={{ background: hex, animationDelay: `${delay}s` }}
    >
      <span className="absolute inset-0 grid place-items-center font-mono text-[10px] font-medium text-white opacity-0 mix-blend-difference transition-opacity group-hover:opacity-100">
        {copied ? "copied" : hex}
      </span>
    </button>
  );
}

function PalettesPage() {
  const { color } = useColor();
  const hex = hslToHex(color);
  const sets = harmonies(color);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
      <section className="animate-rise">
        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" />
          <span>Palette generator</span>
          <span className="text-border">/</span>
          <span>02 — 03</span>
        </div>
        <h1 className="mt-5 text-5xl font-bold tracking-tighter md:text-7xl">
          Harmonies from{" "}
          <span className="font-mono" style={{ color: hex }}>
            {hex}
          </span>
        </h1>
        <p className="mt-4 max-w-[48ch] text-base text-muted-foreground md:text-lg">
          Four classic harmony sets built around your current color. Tap any swatch to
          copy its hex.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-muted-foreground"
          >
            ← Change the color
          </Link>
          <span className="flex items-center gap-2 rounded-md bg-card px-3 py-2 ring-1 ring-white/5">
            <span
              className="size-4 rounded-sm"
              style={{ background: hslCss(color) }}
            />
            <span className="font-mono text-[11px] text-muted-foreground">
              H {color.h} · S {color.s} · L {color.l}
            </span>
          </span>
        </div>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-2">
        {sets.map((set, i) => (
          <div
            key={set.name}
            className="animate-rise rounded-xl bg-card p-4 ring-1 ring-white/5"
            style={{ animationDelay: `${0.15 + i * 0.07}s` }}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">{set.name}</p>
              <button
                onClick={() => copyText(set.colors.map(hslToHex).join(", "))}
                className="font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
              >
                copy all
              </button>
            </div>
            <div className="flex h-28 overflow-hidden rounded-lg ring-1 ring-white/5">
              {set.colors.map((c, j) => (
                <Swatch key={j} hex={hslToHex(c)} delay={0} />
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5 font-mono text-[10px] text-muted-foreground">
              {set.colors.map((c, j) => (
                <span key={j}>{hslToHex(c)}</span>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
