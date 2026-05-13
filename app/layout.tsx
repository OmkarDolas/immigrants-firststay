import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ImmigrantsFirstStay — Find Your First Home',
  description: 'Connect with welcoming hosts who help immigrants settle into their new country.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
        <footer className="border-t mt-20 py-8 bg-secondary/30">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">ImmigrantsFirstStay</p>
            <p>Helping newcomers find their first home with trusted hosts.</p>
            <p className="mt-2">© {new Date().getFullYear()} ImmigrantsFirstStay. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
