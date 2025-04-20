'use client';

import { Providers } from './providers';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
