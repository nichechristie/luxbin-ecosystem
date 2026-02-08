'use client'

const TOKEN_ADDRESS = 'TBD' // Updated after Optimism mainnet deployment
const TOKEN_SYMBOL = 'LUX'
const TOKEN_DECIMALS = 18

const distribution = [
  { label: 'Community & Ecosystem', pct: 40, color: 'bg-violet-500' },
  { label: 'Development Fund', pct: 20, color: 'bg-cyan-500' },
  { label: 'Liquidity Pool', pct: 20, color: 'bg-blue-500' },
  { label: 'Team (Vested)', pct: 10, color: 'bg-red-500' },
  { label: 'Treasury Reserve', pct: 10, color: 'bg-amber-500' },
]

async function addToMetaMask() {
  if (typeof window === 'undefined') return
  const ethereum = (window as unknown as { ethereum?: { request: (args: { method: string; params: unknown }) => Promise<unknown> } }).ethereum
  if (!ethereum) {
    alert('MetaMask not detected. Please install MetaMask to continue.')
    return
  }
  try {
    await ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: TOKEN_ADDRESS,
          symbol: TOKEN_SYMBOL,
          decimals: TOKEN_DECIMALS,
        },
      },
    })
  } catch (err) {
    console.error('Failed to add token:', err)
  }
}

export default function TokenPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/40 via-slate-950 to-slate-950" />
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
          <p className="text-violet-400 font-mono text-sm mb-4 tracking-wider uppercase">
            ERC-20 on Optimism
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            LUX Token
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            21 million fixed supply. Deflationary by design. The utility token powering the LUXBIN ecosystem.
          </p>
        </div>
      </section>

      {/* Tokenomics */}
      <section id="tokenomics" className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Tokenomics</h2>
            <div className="space-y-4">
              {[
                ['Token Name', 'LUXBIN'],
                ['Symbol', 'LUX'],
                ['Total Supply', '21,000,000 (fixed)'],
                ['Standard', 'ERC-20 + ERC-20Burnable'],
                ['Network', 'Optimism (Ethereum L2)'],
                ['Supply Model', 'Bitcoin-inspired — no minting after deploy'],
                ['Burn Mechanism', 'Anyone can burn tokens to reduce supply permanently'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-start text-sm border-b border-slate-800 pb-3">
                  <span className="text-slate-400">{label}</span>
                  <span className="text-white font-medium text-right max-w-[60%]">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Contract</h2>
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Network</p>
                  <p className="text-white font-medium">Optimism (Chain ID: 10)</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Contract Address</p>
                  <p className="text-white font-mono text-sm break-all">
                    {TOKEN_ADDRESS === 'TBD' ? (
                      <span className="text-amber-400">Deploying to Optimism mainnet soon</span>
                    ) : (
                      TOKEN_ADDRESS
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Testnet (Base Sepolia)</p>
                  <p className="text-slate-400 font-mono text-xs break-all">
                    QuantumToken: 0xe1Ba284CC77AD2FB7BC7C225d4A559B8D403Be32
                  </p>
                </div>
              </div>
              <button
                onClick={addToMetaMask}
                className="mt-6 w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Add LUX to MetaMask
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Distribution */}
      <section id="distribution" className="bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Token Distribution</h2>
          <div className="max-w-2xl mx-auto">
            {/* Bar */}
            <div className="flex rounded-lg overflow-hidden h-6 mb-8">
              {distribution.map((d) => (
                <div
                  key={d.label}
                  className={`${d.color} transition-all`}
                  style={{ width: `${d.pct}%` }}
                  title={`${d.label}: ${d.pct}%`}
                />
              ))}
            </div>
            {/* Legend */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {distribution.map((d) => (
                <div key={d.label} className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-sm ${d.color}`} />
                  <span className="text-sm text-slate-300">{d.label}</span>
                  <span className="text-sm text-slate-500 ml-auto">{d.pct}%</span>
                  <span className="text-sm text-slate-500">
                    {((21_000_000 * d.pct) / 100).toLocaleString()} LUX
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* QuantumToken */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-white mb-4">Coming Next: QuantumToken</h2>
        <p className="text-slate-400 mb-8 max-w-2xl">
          The advanced 1B-supply token with built-in staking, quantum entropy lottery, validator rotation, and treasury buybacks.
          Already deployed to Base Sepolia testnet.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: 'Quantum Staking', desc: '2-10x multiplier from quantum entropy' },
            { title: 'Auto Lottery', desc: 'Quantum-random prize draws every 1000 blocks' },
            { title: 'Validator Network', desc: '21 validators selected by quantum randomness' },
            { title: '3% Burn Fee', desc: 'Every transfer burns tokens automatically' },
          ].map((f) => (
            <div key={f.title} className="p-5 rounded-xl border border-slate-800 bg-slate-900/50">
              <h3 className="text-white font-semibold mb-1 text-sm">{f.title}</h3>
              <p className="text-slate-400 text-xs">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DEX */}
      <section className="bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Trade LUX</h2>
          <p className="text-slate-400 mb-8">
            LUX will be available on decentralized exchanges on Optimism.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://app.uniswap.org"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-slate-600 hover:border-violet-500 text-slate-200 font-semibold rounded-lg transition-colors text-sm"
            >
              Uniswap (Optimism)
            </a>
            <a
              href="https://velodrome.finance"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-slate-600 hover:border-cyan-500 text-slate-200 font-semibold rounded-lg transition-colors text-sm"
            >
              Velodrome Finance
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
