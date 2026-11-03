import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import type { CategoryId } from './data/catalog';

export interface CartLine {
  key: string;
  pid: string;
  vkey: string;
  qty: number;
}

export type SortKey = 'rel' | 'new' | 'asc' | 'desc' | 'az';

export interface CatalogFilters {
  cat: CategoryId | 'all';
  q: string;
  sort: SortKey;
  onlyAvail: boolean;
}

export const DEFAULT_FILTERS: CatalogFilters = { cat: 'all', q: '', sort: 'rel', onlyAvail: false };

export const MAX_QTY = 10;
const DATA_KEY = 'ar_demo_v1';
const THEME_KEY = 'ar_demo_theme';

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function initialDark(): boolean {
  try {
    const t = window.localStorage.getItem(THEME_KEY);
    if (t) return t === 'dark';
    return !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

/** Tema claro/noturno compartilhado entre loja e painel. */
export function useTheme() {
  const [dark, setDark] = useState(initialDark);
  const toggle = useCallback(() => {
    setDark((d) => {
      const next = !d;
      try {
        window.localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
      } catch {
        /* armazenamento indisponível */
      }
      return next;
    });
  }, []);
  return { dark, toggleDark: toggle };
}

interface StoreValue {
  favs: string[];
  cart: CartLine[];
  toggleFav: (id: string) => void;
  addToCart: (pid: string, vkey: string, qty: number) => void;
  setLineQty: (key: string, qty: number) => void;
  removeLine: (key: string) => void;
  clearDemo: () => void;
  filters: CatalogFilters;
  setFilters: (patch: Partial<CatalogFilters>) => void;
  toast: string | null;
  showToast: (msg: string) => void;
  dark: boolean;
  toggleDark: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [favs, setFavs] = useState<string[]>(() => {
    const d = readJSON<{ favs?: unknown }>(DATA_KEY, {});
    return Array.isArray(d.favs) ? (d.favs as string[]) : [];
  });
  const [cart, setCart] = useState<CartLine[]>(() => {
    const d = readJSON<{ cart?: unknown }>(DATA_KEY, {});
    return Array.isArray(d.cart) ? (d.cart as CartLine[]) : [];
  });
  const [filters, setFilterState] = useState<CatalogFilters>(DEFAULT_FILTERS);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const { dark, toggleDark } = useTheme();
  const location = useLocation();

  useEffect(() => {
    try {
      window.localStorage.setItem(DATA_KEY, JSON.stringify({ favs, cart }));
    } catch {
      /* armazenamento indisponível */
    }
  }, [favs, cart]);

  // Cada navegação volta ao topo e dispensa o aviso.
  useEffect(() => {
    window.scrollTo(0, 0);
    setToast(null);
  }, [location.pathname]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 3800);
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      favs,
      cart,
      toggleFav: (id) => setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id])),
      addToCart: (pid, vkey, qty) =>
        setCart((c) => {
          const key = `${pid}|${vkey}`;
          return c.some((l) => l.key === key)
            ? c.map((l) => (l.key === key ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l))
            : [...c, { key, pid, vkey, qty }];
        }),
      setLineQty: (key, qty) =>
        setCart((c) => c.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(MAX_QTY, qty)) } : l))),
      removeLine: (key) => setCart((c) => c.filter((l) => l.key !== key)),
      clearDemo: () => {
        setFavs([]);
        setCart([]);
        setToast(null);
      },
      filters,
      setFilters: (patch) => setFilterState((f) => ({ ...f, ...patch })),
      toast,
      showToast,
      dark,
      toggleDark,
    }),
    [favs, cart, filters, toast, showToast, dark, toggleDark],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore precisa estar dentro de <StoreProvider>');
  return ctx;
}
