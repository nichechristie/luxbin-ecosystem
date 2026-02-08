import Link from 'next/link'

const products = [
  {
    name: 'Drainer Defense v2',
    tag: 'Security',
    description:
      'Real-time wallet rescue suite. Detects drainer contracts, rescues trapped tokens, and provides a safe transfer environment for compromised wallets.',
    features: ['Drainer detection engine', 'Token rescue mode', 'Safe transfer proxy', 'Transaction simulation'],
    href: 'https://drainer-defense-web.vercel.app',
    status: 'Live',
    color: 'border-red-500/30',
    gradient: 'from-red-500/10 to-red-900/10',
    accent: 'text-red-400',
  },
  {
    name: 'LUXBIN EVM Compiler',
    tag: 'Dev Tools',
    description:
      'Write smart contracts in LUXBIN Light Language and compile them to EVM-compatible bytecode. Browser-based with syntax highlighting and error reporting.',
    features: ['LUXBIN → EVM compilation', 'Browser-based editor', 'Syntax highlighting', 'ABI generation'],
    href: 'https://luxbin-evm-compiler.vercel.app',
    status: 'Live',
    color: 'border-violet-500/30',
    gradient: 'from-violet-500/10 to-violet-900/10',
    accent: 'text-violet-400',
  },
  {
    name: 'Deploy IDE',
    tag: 'Dev Tools',
    description:
      'Remix-like deployment tool for smart contracts. Connect your wallet and deploy to Optimism, Ethereum mainnet, Sepolia, or any EVM chain directly from the browser.',
    features: ['Multi-chain deployment', 'Wallet integration', 'Constructor args support', 'Deploy history'],
    href: 'https://luxbin-evm-compiler.vercel.app/deploy',
    status: 'Live',
    color: 'border-cyan-500/30',
    gradient: 'from-cyan-500/10 to-cyan-900/10',
    accent: 'text-cyan-400',
  },
  {
    name: 'ENS Subdomains',
    tag: 'Identity',
    description:
      'Claim your own yourname.luxbin.eth subdomain. Decentralized identity for the LUXBIN ecosystem, powered by ENS on Ethereum.',
    features: ['luxbin.eth subdomains', 'ENS resolution', 'On-chain identity', 'Avatar support'],
    href: '#',
    status: 'Coming Soon',
    color: 'border-blue-500/30',
    gradient: 'from-blue-500/10 to-blue-900/10',
    accent: 'text-blue-400',
  },
  {
    name: 'LUXBIN Light Language',
    tag: 'Language',
    description:
      'A photonic programming language designed for the quantum era. Full RFC specification, EBNF grammar, and a bytecode virtual machine.',
    features: ['RFC specification', 'EBNF grammar', 'Bytecode VM', 'Quantum type extensions'],
    href: 'https://github.com/nichechristie',
    status: 'Spec Complete',
    color: 'border-amber-500/30',
    gradient: 'from-amber-500/10 to-amber-900/10',
    accent: 'text-amber-400',
  },
]

export default function EcosystemPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/40 via-slate-950 to-slate-950" />
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
          <p className="text-violet-400 font-mono text-sm mb-4 tracking-wider uppercase">
            Ecosystem
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Products &amp; Tools
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Everything you need to build, deploy, and secure smart contracts on Optimism and Ethereum.
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="space-y-6">
          {products.map((p) => (
            <div
              key={p.name}
              className={`rounded-xl border ${p.color} bg-gradient-to-r ${p.gradient} card-glow`}
            >
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                        {p.tag}
                      </span>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                        p.status === 'Live'
                          ? 'bg-green-500/20 text-green-400'
                          : p.status === 'Spec Complete'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-slate-700/50 text-slate-400'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{p.name}</h2>
                    <p className="text-slate-400 mb-4 max-w-2xl">{p.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {p.features.map((f) => (
                        <span
                          key={f}
                          className="text-xs px-3 py-1 rounded-full border border-slate-700 text-slate-400"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {p.href !== '#' ? (
                      <a
                        href={p.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-block px-6 py-2.5 border border-slate-600 hover:border-slate-400 text-white font-medium rounded-lg transition-colors text-sm`}
                      >
                        Launch
                      </a>
                    ) : (
                      <span className="inline-block px-6 py-2.5 border border-slate-700 text-slate-500 font-medium rounded-lg text-sm cursor-default">
                        Coming Soon
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture */}
      <section className="bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Architecture</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-950/50 text-center">
              <p className="text-3xl font-bold gradient-text mb-2">Layer 1</p>
              <p className="text-white font-semibold mb-1">Ethereum</p>
              <p className="text-slate-400 text-sm">ENS domains, security anchor</p>
            </div>
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-950/50 text-center">
              <p className="text-3xl font-bold gradient-text mb-2">Layer 2</p>
              <p className="text-white font-semibold mb-1">Optimism</p>
              <p className="text-slate-400 text-sm">LUX token, smart contracts, fast execution</p>
            </div>
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-950/50 text-center">
              <p className="text-3xl font-bold gradient-text mb-2">Application</p>
              <p className="text-white font-semibold mb-1">LUXBIN Tools</p>
              <p className="text-slate-400 text-sm">Compiler, IDE, Defense, Language</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Start Building</h2>
        <p className="text-slate-400 mb-8">
          Write your first LUXBIN contract and deploy it to Optimism in minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://luxbin-evm-compiler.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition-colors"
          >
            Open Compiler
          </a>
          <Link
            href="/token"
            className="px-8 py-3 border border-slate-600 hover:border-slate-400 text-slate-200 font-semibold rounded-lg transition-colors"
          >
            Get LUX Token
          </Link>
        </div>
      </section>
    </div>
  )
}
