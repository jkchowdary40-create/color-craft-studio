import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useColor, copyText, type SavedColor } from "../lib/color-store";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved Colors — Chroma/lab" },
      {
        name: "description",
        content:
          "Your saved color swatches. Copy any hex code, load a color back into the picker, or clear out the ones that didn't make the cut.",
      },
      { property: "og:title", content: "Saved Colors — Chroma/lab" },
      {
        property: "og:description",
        content: "Browse and manage your saved color swatches.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SavedPage,
});

function SavedCard({
  swatch,
  index,
  onLoad,
  onRemove,
}: {
  swatch: SavedColor;
  index: number;
  onLoad: (s: SavedColor) => void;
  onRemove: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    if (await copyText(swatch.hex)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  return (
    <div
      className="group animate-rise overflow-hidden rounded-xl bg-card ring-1 ring-white/5"
      style={{ animationDelay: `${0.1 + index * 0.05}s` }}
    >
      <button
        onClick={() => onLoad(swatch)}
        title="Load into picker"
        className="block h-24 w-full transition-transform group-hover:scale-[1.02]"
        style={{ background: swatch.hex }}
      />
      <div className="flex items-center justify-between p-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold">{swatch.name}</p>
          <p className="font-mono text-[10px] text-muted-foreground">{swatch.hex}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={onCopy}
            className="font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
          >
            {copied ? "copied" : "copy"}
          </button>
          <button
            onClick={() => onRemove(swatch.id)}
            className="font-mono text-[10px] text-muted-foreground transition-colors hover:text-destructive"
          >
            delete
          </button>
        </div>
      </div>
    </div>
  );
}

function SavedPage() {
  const { saved, removeColor, setColor } = useColor();
  const navigate = useNavigate();

  const loadIntoPicker = (s: SavedColor) => {
    setColor(s.hsl);
    navigate({ to: "/" });
  };

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
      <section className="animate-rise">
        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" />
          <span>Saved swatches</span>
          <span className="text-border">/</span>
          <span>03 — 03</span>
        </div>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-5xl font-bold tracking-tighter md:text-7xl">Saved</h1>
          <span className="font-mono text-[11px] text-muted-foreground">
            {saved.length} {saved.length === 1 ? "color" : "colors"}
          </span>
        </div>
        <p className="mt-4 max-w-[48ch] text-base text-muted-foreground md:text-lg">
          The colors that earned their place. Tap a swatch to load it back into the
          picker.
        </p>
      </section>

      {saved.length === 0 ? (
        <section className="animate-rise mt-12 rounded-xl bg-card p-10 text-center ring-1 ring-white/5">
          <p className="text-lg font-semibold">No saved colors yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Pick a color you love and hit "Save this color" on the picker page.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent"
          >
            Open the picker
          </Link>
        </section>
      ) : (
        <section className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {saved.map((s, i) => (
            <SavedCard
              key={s.id}
              swatch={s}
              index={i}
              onLoad={loadIntoPicker}
              onRemove={removeColor}
            />
          ))}
        </section>
      )}
    </main>
  );
}
