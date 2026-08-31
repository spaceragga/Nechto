const KEY = 'nechto:preserve-scroll';

let pending: number | null = null;

export function markPreserveScroll() {
  pending = window.scrollY;
  sessionStorage.setItem(KEY, String(pending));
}

export function readPreservedScroll(): number | null {
  if (pending != null) {
    return pending;
  }
  const raw = sessionStorage.getItem(KEY);
  if (raw == null) {
    return null;
  }
  const top = Number(raw);
  return Number.isFinite(top) ? top : null;
}

export function clearPreservedScroll() {
  pending = null;
  sessionStorage.removeItem(KEY);
}
