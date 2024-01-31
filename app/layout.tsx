import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { Providers } from './providers'
import Main from './Main'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Atomicals',
  description: 'Trade, Explorer & Mint Atomical',
  keywords: ['atomical', 'arc20', 'realm', 'nft', 'ft', 'dmint'],
  icons: '/logo.png',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Main>{children}</Main>
        </Providers>
      </body>
    </html>
  )
}
