import type { ReactNode } from 'react';

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
] as const;

export type DemoStillKind = (typeof DEMO_STILL_KINDS)[number];

type DemoStillProps = {
  kind: DemoStillKind;
};

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 160 100"
      className="block h-full w-full"
      preserveAspectRatio="xMidYMid slice"
    >
      {children}
    </svg>
  );
}

export function DemoStill({ kind }: DemoStillProps) {
  switch (kind) {
    case 'market':
      return (
        <Svg>
          <rect width="160" height="100" fill="#12151c" />
          <rect x="0" y="58" width="160" height="42" fill="#0c0e12" />
          <rect x="8" y="28" width="36" height="48" fill="#1b2230" />
          <rect x="48" y="18" width="28" height="58" fill="#161c28" />
          <rect x="82" y="24" width="44" height="52" fill="#1a2030" />
          <rect x="130" y="32" width="24" height="44" fill="#141820" />
          <rect x="14" y="36" width="10" height="14" fill="#d4a84a" />
          <rect x="88" y="34" width="12" height="16" fill="#c47a2a" />
          <rect x="112" y="40" width="8" height="10" fill="#e8c97a" />
        </Svg>
      );
    case 'window':
      return (
        <Svg>
          <rect width="160" height="100" fill="#cfc6b8" />
          <rect x="0" y="0" width="160" height="42" fill="#b7c0c8" />
          <rect x="48" y="10" width="64" height="72" fill="#6a7380" />
          <rect x="52" y="14" width="26" height="30" fill="#e8eef2" />
          <rect x="82" y="14" width="26" height="30" fill="#d5dde4" />
          <rect x="52" y="48" width="26" height="30" fill="#c5d0d8" />
          <rect x="82" y="48" width="26" height="30" fill="#9aa8b4" />
        </Svg>
      );
    case 'textile':
      return (
        <Svg>
          <rect width="160" height="100" fill="#6e1428" />
          <rect x="0" y="0" width="28" height="100" fill="#8a1c34" />
          <rect x="28" y="0" width="18" height="100" fill="#4a0e1c" />
          <rect x="46" y="0" width="40" height="100" fill="#a42840" />
          <rect x="86" y="0" width="14" height="100" fill="#3a0c18" />
          <rect x="100" y="0" width="36" height="100" fill="#7a1830" />
          <rect x="136" y="0" width="24" height="100" fill="#c44860" />
          <rect x="0" y="70" width="160" height="4" fill="#d8a0a8" />
        </Svg>
      );
    case 'interior':
      return (
        <Svg>
          <rect width="160" height="100" fill="#e6dcc8" />
          <rect x="0" y="62" width="160" height="38" fill="#c4b49a" />
          <rect x="18" y="22" width="52" height="40" fill="#8fa8b0" />
          <rect x="22" y="26" width="20" height="16" fill="#f2f6f8" />
          <rect x="96" y="28" width="44" height="56" fill="#5a4030" />
          <rect x="108" y="40" width="12" height="20" fill="#2a1c14" />
        </Svg>
      );
    case 'portrait':
      return (
        <Svg>
          <rect width="160" height="100" fill="#1c1c1c" />
          <rect x="0" y="68" width="160" height="32" fill="#2a2a2a" />
          <ellipse cx="80" cy="42" rx="28" ry="26" fill="#c8c4be" />
          <rect x="52" y="64" width="56" height="36" fill="#3a3a3a" />
        </Svg>
      );
    case 'neon':
      return (
        <Svg>
          <rect width="160" height="100" fill="#d8ff3a" />
          <rect x="40" y="12" width="80" height="76" fill="#111111" />
          <rect x="52" y="28" width="56" height="44" fill="#f04aa4" />
        </Svg>
      );
    case 'paper':
      return (
        <Svg>
          <rect width="160" height="100" fill="#efe6d4" />
          <rect x="16" y="18" width="128" height="4" fill="#2a241c" />
          <rect x="16" y="30" width="110" height="3" fill="#2a241c" />
          <rect x="16" y="40" width="118" height="3" fill="#2a241c" />
          <rect x="16" y="50" width="96" height="3" fill="#2a241c" />
          <rect x="16" y="60" width="124" height="3" fill="#2a241c" />
          <rect x="16" y="70" width="72" height="3" fill="#2a241c" />
        </Svg>
      );
    case 'courtyard':
      return (
        <Svg>
          <rect width="160" height="100" fill="#1a1e18" />
          <rect x="0" y="0" width="160" height="48" fill="#2a322c" />
          <rect x="20" y="20" width="50" height="80" fill="#141814" />
          <rect x="90" y="12" width="56" height="88" fill="#101410" />
          <rect x="28" y="32" width="14" height="18" fill="#d8c48a" />
          <rect x="102" y="28" width="12" height="16" fill="#6a7a88" />
        </Svg>
      );
    case 'runway':
      return (
        <Svg>
          <rect width="160" height="100" fill="#0e0e10" />
          <rect x="70" y="8" width="20" height="84" fill="#f4f1ea" />
          <rect x="40" y="30" width="24" height="50" fill="#2a2a30" />
          <rect x="96" y="24" width="22" height="56" fill="#3a1820" />
        </Svg>
      );
    case 'door':
      return (
        <Svg>
          <rect width="160" height="100" fill="#c8b8a4" />
          <rect x="48" y="8" width="64" height="92" fill="#5a4030" />
          <rect x="54" y="14" width="52" height="80" fill="#4a3428" />
          <rect x="92" y="48" width="6" height="6" fill="#d4c4a8" />
        </Svg>
      );
  }
}
