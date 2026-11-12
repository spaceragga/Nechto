export const HOUSE_NAV = [
  { href: '/creators', key: 'creators' },
  { href: '/works', key: 'works' },
  { href: '/projects', key: 'projects' },
  { href: '/hanging', key: 'hanging' },
  { href: '/new', key: 'new' },
  { href: '/collections', key: 'collections' },
  { href: '/journal', key: 'journal' },
  { href: '/dialogue', key: 'dialogue' },
  { href: '/studio', key: 'studio' },
  { href: '/community', key: 'community' },
  { href: '/community?tab=following', key: 'following' },
] as const;

export type HouseNavKey = (typeof HOUSE_NAV)[number]['key'];

let claimedKey: HouseNavKey | null = null;
const claimListeners = new Set<() => void>();

function emitClaim() {
  claimListeners.forEach((listener) => listener());
}

/** The section button has left the bar and is the page title. */
export function claimNavButton(key: HouseNavKey) {
  if (claimedKey === key) {
    return;
  }
  claimedKey = key;
  emitClaim();
}

export function releaseNavButton(key: HouseNavKey) {
  if (claimedKey !== key) {
    return;
  }
  claimedKey = null;
  emitClaim();
}

export function subscribeNavButton(listener: () => void) {
  claimListeners.add(listener);
  return () => claimListeners.delete(listener);
}

export function claimedNavButton() {
  return claimedKey;
}

/** Which wing of the house the current URL belongs to. */
export function houseSectionActive(
  pathname: string,
  tab: string | null,
  href: string,
): boolean {
  if (href === '/community?tab=following') {
    return pathname === '/community' && tab === 'following';
  }
  if (href === '/community') {
    return pathname === '/community' && tab !== 'following';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
