import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { hslToHex, suggestName, type HSL } from "./color";

export interface SavedColor {
  id: string;
  name: string;
  hsl: HSL;
  hex: string;
}

interface ColorState {
  color: HSL;
  setColor: (hsl: HSL) => void;
  saved: SavedColor[];
  saveColor: () => void;
  removeColor: (id: string) => void;
  isSaved: boolean;
}

const ColorContext = createContext<ColorState | null>(null);

const COLOR_KEY = "chroma-current-color";
const SAVED_KEY = "chroma-saved-colors";

const DEFAULT_COLOR: HSL = { h: 16, s: 92, l: 62 };

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function ColorProvider({ children }: { children: ReactNode }) {
  const [color, setColorState] = useState<HSL>(DEFAULT_COLOR);
  const [saved, setSaved] = useState<SavedColor[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setColorState(readJson(COLOR_KEY, DEFAULT_COLOR));
    setSaved(readJson(SAVED_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(COLOR_KEY, JSON.stringify(color));
  }, [color, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
  }, [saved, hydrated]);

  const setColor = useCallback((hsl: HSL) => setColorState(hsl), []);

  const hex = hslToHex(color);
  const isSaved = saved.some((s) => s.hex === hex);

  const saveColor = useCallback(() => {
    setSaved((prev) => {
      const h = hslToHex(color);
      if (prev.some((s) => s.hex === h)) return prev;
      return [
        { id: crypto.randomUUID(), name: suggestName(color), hsl: color, hex: h },
        ...prev,
      ];
    });
  }, [color]);

  const removeColor = useCallback((id: string) => {
    setSaved((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return (
    <ColorContext.Provider
      value={{ color, setColor, saved, saveColor, removeColor, isSaved }}
    >
      {children}
    </ColorContext.Provider>
  );
}

export function useColor() {
  const ctx = useContext(ColorContext);
  if (!ctx) throw new Error("useColor must be used inside ColorProvider");
  return ctx;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
