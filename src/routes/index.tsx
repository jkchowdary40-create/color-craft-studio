import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { useColor, copyText } from "../lib/color-store";
import {
  hslToHex,
  hslToRgb,
  hslToCmyk,
  hexToHsl,
  hslCss,
  suggestName,
  type HSL,
} from "../lib/color";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Picker — Chroma/lab" },
      {
        name: "description",
        content:
          "Interactive color picker with a live color field, hue slider, and HEX, RGB, HSL and CMYK values you can copy in one tap.",
      },
      { property: "og:title", content: "Picker — Chroma/lab" },
      {
        property: "og:description",
        content: "Pick any color and copy its HEX, RGB, HSL and CMYK values instantly.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PickerPage,
});

function ValueRow({
  label,
  value,
  copyValue,
}: {
  label: string;
  value: string;
  copyValue: string;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    if (await copyText(copyValue)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  return (
    <button
      onClick={onCopy}
      className="flex w-full items-center justify-between border-b border-border bg-card px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-secondary"
    >
      <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </span>
      <span className="flex items-center gap-2">
        <span className="font-mono text-sm text-foreground">{value}</span>
        <span className="grid size-4 place-items-center rounded bg-secondary font-mono text-[9px] text-muted-foreground">
          {copied ? "✓" : "C"}
        </span>
      </span>
    </button>
  );
}

function PickerPage() {
  const { color, setColor, saveColor, isSaved } = useColor();
  const fieldRef = useRef<HTMLDivElement>(null);
  const [hexInput, setHexInput] = useState("");
  const [hexError, setHexError] = useState(false);

  const hex = hslToHex(color);
  const rgb = hslToRgb(color);
  const cmyk = hslToCmyk(color);
  const name = suggestName(color);

  const pickFromField = useCallback(
    (clientX: number, clientY: number) => {
      const el = fieldRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
      const y = Math.min(Math.max((clientY - rect.top) / rect.height, 0), 1);
      // x → saturation 0..100, y → lightness 100..0 (top light, bottom dark)
      const s = Math.round(x * 100);
      const l = Math.round((1 - y) * 100);
      setColor({ h: color.h, s, l });
    },
    [color.h, setColor]
  );

  const onFieldPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    pickFromField(e.clientX, e.clientY);
  };
  const onFieldPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons === 1) pickFromField(e.clientX, e.clientY);
  };

  const applyHex = () => {
    const parsed = hexToHsl(hexInput);
    if (parsed) {
      setColor(parsed);
      setHexError(false);
      setHexInput("");
    } else {
      setHexError(true);
    }
  };

  const fieldX = color.s;
  const fieldY = 100 - color.l;

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
      {/* HERO */}
      <section className="animate-rise">
        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" />
          <span>Color picker</span>
          <span className="text-border">/</span>
          <span>01 — 03</span>
        </div>
        <h1 className="mt-5 text-[15vw] leading-[0.82] font-bold tracking-tighter text-balance md:text-[9rem]">
          <span className="text-gradient-hero animate-sweep inline-block">CHROMA</span>
        </h1>
        <p className="mt-6 max-w-[42ch] text-base text-muted-foreground text-pretty md:text-lg">
          A precise, playful color lab. Pick a hue, generate harmonies, and keep the
          ones that earn their place.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            to="/palettes"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent"
          >
            Generate a palette
          </Link>
          <button
            onClick={saveColor}
            disabled={isSaved}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-muted-foreground disabled:opacity-40"
          >
            {isSaved ? "Saved ✓" : "Save this color"}
          </button>
        </div>
      </section>

      {/* PICKER */}
      <section className="mt-14 grid gap-8 md:mt-20 lg:grid-cols-12">
        <div className="animate-rise lg:col-span-7" style={{ animationDelay: "0.1s" }}>
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              (a) Color field
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              H {color.h} · S {color.s} · L {color.l}
            </span>
          </div>
          <div
            ref={fieldRef}
            onPointerDown={onFieldPointerDown}
            onPointerMove={onFieldPointerMove}
            className="relative h-64 cursor-crosshair touch-none overflow-hidden rounded-xl ring-1 ring-white/5 select-none md:h-80"
            style={{
              background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${color.h} 100% 50%))`,
            }}
          >
            <div
              className="pointer-events-none absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white ring-2 ring-black/40"
              style={{ left: `${fieldX}%`, top: `${fieldY}%` }}
            />
          </div>
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Hue
              </span>
              <span className="font-mono text-[11px] text-foreground">{color.h}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              value={color.h}
              onChange={(e) => setColor({ ...color, h: Number(e.target.value) })}
              aria-label="Hue"
              className="hue-slider h-2.5 w-full cursor-pointer appearance-none rounded-full"
            />
          </div>
        </div>

        {/* VALUES */}
        <div className="animate-rise lg:col-span-5" style={{ animationDelay: "0.2s" }}>
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              (b) Values
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">tap to copy</span>
          </div>
          <div className="overflow-hidden rounded-xl ring-1 ring-white/5">
            <ValueRow label="HEX" value={hex} copyValue={hex} />
            <ValueRow
              label="RGB"
              value={`${rgb.r} ${rgb.g} ${rgb.b}`}
              copyValue={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`}
            />
            <ValueRow
              label="HSL"
              value={`${color.h} ${color.s} ${color.l}`}
              copyValue={hslCss(color)}
            />
            <ValueRow
              label="CMYK"
              value={`${cmyk.c} ${cmyk.m} ${cmyk.y} ${cmyk.k}`}
              copyValue={`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`}
            />
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-xl bg-card p-3 ring-1 ring-white/5">
            <span
              className="size-12 shrink-0 rounded-lg transition-colors duration-300"
              style={{ background: hex }}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="font-mono text-[11px] text-muted-foreground">
                primary · selected
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-card p-3 ring-1 ring-white/5">
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
              Paste a hex code
            </label>
            <div className="flex gap-2">
              <input
                value={hexInput}
                onChange={(e) => {
                  setHexInput(e.target.value);
                  setHexError(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && applyHex()}
                placeholder="#FF5A3C"
                className={`min-w-0 flex-1 rounded-md border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground/50 ${
                  hexError ? "border-destructive" : "border-input focus:border-ring"
                }`}
              />
              <button
                onClick={applyHex}
                className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent"
              >
                Apply
              </button>
            </div>
            {hexError && (
              <p className="mt-2 font-mono text-[11px] text-destructive">
                Not a valid hex color — try #RRGGBB
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
