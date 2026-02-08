import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'LUXBIN — Photonic Computing Platform for Ethereum',
  description: 'The photonic computing platform for Ethereum. Dev tools, token, and ecosystem built on Optimism.',
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="gradient-bar" />
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold gradient-text">
          LUXBIN
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/" className="text-slate-300 hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/token" className="text-slate-300 hover:text-white transition-colors">
            Token
          </Link>
          <Link href="/ecosystem" className="text-slate-300 hover:text-white transition-colors">
            Ecosystem
          </Link>
          <Link href="/playground" className="text-slate-300 hover:text-white transition-colors">
            Playground
          </Link>
          <Link href="/buy" className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors font-medium">
            Buy LUX
          </Link>
          <a
            href="https://github.com/nichechristie"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-300 hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>
      </nav>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-slate-800 mt-24">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold gradient-text text-lg mb-3">LUXBIN</h3>
            <p className="text-slate-400 text-sm">
              The Photonic Computing Platform for Ethereum. Building the future of decentralized technology.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Products</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="https://drainer-defense-web.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 transition-colors">Drainer Defense</a></li>
              <li><a href="https://luxbin-evm-compiler.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 transition-colors">EVM Compiler</a></li>
              <li><a href="https://luxbin-evm-compiler.vercel.app/deploy" target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 transition-colors">Deploy IDE</a></li>
              <li><Link href="/playground" className="hover:text-violet-400 transition-colors">VM Playground</Link></li>
              <li><Link href="/ecosystem" className="hover:text-violet-400 transition-colors">All Products</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Token</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/token" className="hover:text-violet-400 transition-colors">LUX Token</Link></li>
              <li><Link href="/token#tokenomics" className="hover:text-violet-400 transition-colors">Tokenomics</Link></li>
              <li><Link href="/token#distribution" className="hover:text-violet-400 transition-colors">Distribution</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Community</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="https://github.com/nichechristie" target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 transition-colors">GitHub</a></li>
              <li><span className="text-slate-500">nichebiche.eth</span></li>
              <li><span className="text-slate-500">luxbin.eth</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} LUXBIN. Built by Nichole Christie.</p>
          <p className="mt-2 md:mt-0">Deployed on Optimism &middot; Powered by Ethereum</p>
        </div>
      </div>
    </footer>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-200 antialiased">
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
