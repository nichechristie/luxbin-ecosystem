import Link from 'next/link'

const stats = [
  { label: 'Total Supply', value: '21M LUX' },
  { label: 'Products Built', value: '5+' },
  { label: 'Chain', value: 'Optimism (L2)' },
  { label: 'Token Standard', value: 'ERC-20' },
]

const products = [
  {
    name: 'Drainer Defense v2',
    description: 'Wallet rescue suite that detects and neutralizes crypto drainer attacks in real-time.',
    href: 'https://drainer-defense-web.vercel.app',
    tag: 'Security',
    color: 'from-red-500/20 to-red-900/20',
    border: 'border-red-500/30',
  },
  {
    name: 'LUXBIN EVM Compiler',
    description: 'Write smart contracts in LUXBIN Light Language and compile to EVM bytecode.',
    href: 'https://luxbin-evm-compiler.vercel.app',
    tag: 'Dev Tools',
    color: 'from-violet-500/20 to-violet-900/20',
    border: 'border-violet-500/30',
  },
  {
    name: 'Deploy IDE',
    description: 'Remix-like deployment tool for contracts on Base, Ethereum, and more.',
    href: 'https://luxbin-evm-compiler.vercel.app/deploy',
    tag: 'Dev Tools',
    color: 'from-cyan-500/20 to-cyan-900/20',
    border: 'border-cyan-500/30',
  },
  {
    name: 'ENS Subdomains',
    description: 'Claim yourname.luxbin.eth — decentralized identity powered by ENS.',
    href: '/ecosystem',
    tag: 'Identity',
    color: 'from-blue-500/20 to-blue-900/20',
    border: 'border-blue-500/30',
  },
]

const roadmap = [
  {
    phase: 'Phase 1',
    title: 'Build',
    status: 'Complete',
    items: ['LUXBIN Light Language spec', 'EVM Compiler + Deploy IDE', 'Drainer Defense v2', 'Token contracts (LUX + QuantumToken)', 'Base Sepolia testnet deployment'],
  },
  {
    phase: 'Phase 2',
    title: 'Launch',
    status: 'In Progress',
    items: ['Ecosystem website (this site)', 'LUX token on Optimism mainnet', 'DEX liquidity (Uniswap / Velodrome)', 'ENS subdomain registrations', 'Community launch'],
  },
  {
    phase: 'Phase 3',
    title: 'Scale',
    status: 'Upcoming',
    items: ['QuantumToken with staking & lottery', 'Quantum entropy oracle integration', 'Validator network', 'Multi-chain expansion', 'Developer grants program'],
  },
]

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/40 via-slate-950 to-slate-950" />
        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-36 text-center">
          <p className="text-violet-400 font-mono text-sm mb-4 tracking-wider uppercase">
            Photonic Computing Platform
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            The Future of{' '}
            <span className="gradient-text">Ethereum Development</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            LUXBIN is a complete ecosystem of developer tools, a photonic programming language,
            and the LUX token — all built on Base.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/token"
              className="px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition-colors"
            >
              Get LUX Token
            </Link>
            <Link
              href="/ecosystem"
              className="px-8 py-3 border border-slate-600 hover:border-slate-400 text-slate-200 font-semibold rounded-lg transition-colors"
            >
              Explore Products
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-800 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-sm text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Built Products</h2>
          <p className="text-slate-400">Live tools powering the LUXBIN ecosystem</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((p) => (
            <a
              key={p.name}
              href={p.href}
              target={p.href.startsWith('http') ? '_blank' : undefined}
              rel={p.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className={`block p-6 rounded-xl border ${p.border} bg-gradient-to-br ${p.color} card-glow`}
            >
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                {p.tag}
              </span>
              <h3 className="text-xl font-semibold text-white mt-2 mb-2">{p.name}</h3>
              <p className="text-slate-400 text-sm">{p.description}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Token Overview */}
      <section className="bg-gradient-to-b from-slate-950 to-violet-950/20">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">LUX Token</h2>
              <p className="text-slate-400 mb-6">
                21 million fixed supply, inspired by Bitcoin&apos;s scarcity model. ERC-20 on Base
                with a built-in burn mechanism for long-term deflation.
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-violet-500" />
                  Fixed 21M supply — no inflation, no minting
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  ERC-20 Burnable — deflationary by design
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Deployed on Optimism L2 — fast &amp; cheap transactions
                </li>
              </ul>
              <Link
                href="/token"
                className="inline-block mt-8 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition-colors"
              >
                View Tokenomics
              </Link>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-white mb-6">Token Snapshot</h3>
              <div className="space-y-4">
                {[
                  ['Name', 'LUXBIN'],
                  ['Symbol', 'LUX'],
                  ['Total Supply', '21,000,000'],
                  ['Standard', 'ERC-20'],
                  ['Network', 'Optimism (Ethereum L2)'],
                  ['Features', 'Burnable, Fixed Supply'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-slate-400">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Technology</h2>
          <p className="text-slate-400">A photonic programming language with EVM compilation</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50">
            <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 mb-4 text-lg font-bold">
              L
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Light Language</h3>
            <p className="text-slate-400 text-sm">
              Full RFC spec, EBNF grammar, and bytecode VM. A photonic programming language designed
              for quantum-era computing.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 text-lg font-bold">
              Q
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Quantum Extensions</h3>
            <p className="text-slate-400 text-sm">
              QuantumToken contract with entropy oracle, staking with quantum multipliers,
              and validator rotation using quantum randomness.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 mb-4 text-lg font-bold">
              E
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">EVM Compiler</h3>
            <p className="text-slate-400 text-sm">
              Write contracts in LUXBIN Light Language and compile down to EVM bytecode. Deploy to
              any EVM chain from the browser.
            </p>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Roadmap</h2>
            <p className="text-slate-400">Following Ethereum&apos;s launch path: whitepaper → token → tools → community</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roadmap.map((r) => (
              <div key={r.phase} className="p-6 rounded-xl border border-slate-800 bg-slate-950/50">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs font-mono px-2 py-1 rounded ${
                    r.status === 'Complete'
                      ? 'bg-green-500/20 text-green-400'
                      : r.status === 'In Progress'
                      ? 'bg-violet-500/20 text-violet-400'
                      : 'bg-slate-700/50 text-slate-400'
                  }`}>
                    {r.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {r.phase}: {r.title}
                </h3>
                <ul className="mt-4 space-y-2">
                  {r.items.map((item) => (
                    <li key={item} className="text-sm text-slate-400 flex items-start gap-2">
                      <span className="text-slate-600 mt-1">&#8226;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Team</h2>
        </div>
        <div className="max-w-md mx-auto text-center p-8 rounded-2xl border border-slate-800 bg-slate-900/50">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white">
            NC
          </div>
          <h3 className="text-xl font-semibold text-white">Nichole Christie</h3>
          <p className="text-slate-400 text-sm mt-1">Founder &amp; Builder</p>
          <div className="flex justify-center gap-3 mt-4">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-800 text-slate-400">
              nichebiche.eth
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-800 text-slate-400">
              luxbin.eth
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-4">
            Building the photonic computing ecosystem for Ethereum. Dev tools, token, language, and quantum extensions.
          </p>
        </div>
      </section>
    </div>
  )
}
