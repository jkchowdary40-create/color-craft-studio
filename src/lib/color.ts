export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export function hslToRgb({ h, s, l }: HSL): { r: number; g: number; b: number } {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

export function rgbToHsl(r: number, g: number, b: number): HSL {
  const rn = r / 255,
    gn = g / 255,
    bn = b / 255;
  const max = Math.max(rn, gn, bn),
    min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    if (max === rn) h = 60 * (((gn - bn) / d) % 6);
    else if (max === gn) h = 60 * ((bn - rn) / d + 2);
    else h = 60 * ((rn - gn) / d + 4);
  }
  if (h < 0) h += 360;
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToHex(hsl: HSL): string {
  const { r, g, b } = hslToRgb(hsl);
  const to = (n: number) => n.toString(16).padStart(2, "0").toUpperCase();
  return `#${to(r)}${to(g)}${to(b)}`;
}

export function hexToHsl(hex: string): HSL | null {
  const m = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(m)) return null;
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return rgbToHsl(r, g, b);
}

export function hslToCmyk(hsl: HSL): { c: number; m: number; y: number; k: number } {
  const { r, g, b } = hslToRgb(hsl);
  const rn = r / 255,
    gn = g / 255,
    bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - rn - k) / (1 - k)) * 100),
    m: Math.round(((1 - gn - k) / (1 - k)) * 100),
    y: Math.round(((1 - bn - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

export function hslCss(hsl: HSL): string {
  return `hsl(${Math.round(hsl.h)} ${Math.round(hsl.s)}% ${Math.round(hsl.l)}%)`;
}

const wrap = (h: number) => ((h % 360) + 360) % 360;

export function harmonies(hsl: HSL): { name: string; colors: HSL[] }[] {
  const { h, s, l } = hsl;
  const c = (hh: number, ss = s, ll = l): HSL => ({
    h: wrap(hh),
    s: Math.max(0, Math.min(100, ss)),
    l: Math.max(0, Math.min(100, ll)),
  });
  return [
    {
      name: "Complementary",
      colors: [c(h), c(h + 180), c(h, s, Math.min(l + 18, 88)), c(h + 180, s, Math.min(l + 18, 88))],
    },
    {
      name: "Analogous",
      colors: [c(h - 30), c(h), c(h + 30), c(h + 30, s, Math.min(l + 14, 88))],
    },
    {
      name: "Triadic",
      colors: [c(h), c(h + 120), c(h + 240), c(h, Math.max(s - 20, 20), Math.max(l - 10, 12))],
    },
    {
      name: "Monochrome",
      colors: [
        c(h, s, Math.max(l - 24, 10)),
        c(h, s, Math.max(l - 12, 8)),
        c(h, s, l),
        c(h, s, Math.min(l + 16, 92)),
      ],
    },
  ];
}

const NAME_PARTS: [string[], string[]] = [
  ["Crimson", "Coral", "Amber", "Gold", "Lime", "Mint", "Teal", "Cobalt", "Indigo", "Violet", "Rose", "Ember"],
  ["Pulse", "Signal", "Drift", "Haze", "Flare", "Bloom", "Current", "Static", "Glow", "Field"],
];

export function suggestName(hsl: HSL): string {
  const hue = NAME_PARTS[0][Math.floor(wrap(hsl.h) / 30) % 12];
  const suffix = NAME_PARTS[1][Math.floor((hsl.s + hsl.l) / 20) % 10];
  return `${hue} ${suffix}`;
}
