import { IBM_Plex_Sans, Spectral } from 'next/font/google';

export const fontSans = IBM_Plex_Sans({
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
  weight: ['400', '500'],
  variable: '--font-ui',
  display: 'swap',
});

export const fontSerif = Spectral({
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
  weight: ['400', '500'],
  variable: '--font-display',
  display: 'swap',
});
