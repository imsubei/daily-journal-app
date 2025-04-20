'use client';

import { Providers } from './providers';
import './globals.css';

export const metadata = {
  title: '每日随记与反拖延',
  description: '记录每日感想，克服拖延症',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
