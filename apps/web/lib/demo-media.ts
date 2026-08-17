export const DEMO_STILL_KINDS = [
  'market',
  'window',
  'textile',
  'interior',
  'portrait',
  'neon',
  'paper',
  'courtyard',
  'runway',
  'door',
  'alley',
  'brick',
  'lamp',
  'kettle',
  'film',
  'glass',
  'fabric',
  'stair',
  'coat',
  'stool',
] as const;

export type DemoStillKind = (typeof DEMO_STILL_KINDS)[number];

/** Same-origin stills until works use StorageService like avatars. */
export function demoMediaSrc(kind: DemoStillKind): string {
  return `/demo/${kind}.jpg`;
}
