'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const CURVE_ADDRESS = '0xCADdfEA1cefb2530a7D463fC7f3C4Cc23BF1a8B5'
const CURVE_ABI = [
  'function buy() payable',
  'function currentPrice() view returns (uint256)',
  'function estimateTokens(uint256 ethAmount) view returns (uint256)',
  'function totalSold() view returns (uint256)',
  'function tokensAvailable() view returns (uint256)',
  'function active() view returns (bool)',
]

const OPTIMISM_CHAIN_ID = '0xa' // 10

function formatLux(wei: string) {
  const num = Number(wei) / 1e18
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M'
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K'
  return num.toFixed(2)
}

function formatEthPrice(wei: string) {
  const eth = Number(wei) / 1e18
  const usd = eth * 2500 // approximate
  return { eth: eth.toFixed(10), usd: usd < 0.01 ? usd.toExponential(2) : '$' + usd.toFixed(4) }
}

export default function BuyPage() {
  const [account, setAccount] = useState<string | null>(null)
  const [ethAmount, setEthAmount] = useState('0.001')
  const [status, setStatus] = useState('')
  const [txHash, setTxHash] = useState('')
  const [curveData, setCurveData] = useState({
    price: '0',
    available: '0',
    totalSold: '0',
    active: true,
  })
  const [estimatedTokens, setEstimatedTokens] = useState('0')

  const getEthereum = () => {
    if (typeof window === 'undefined') return null
    return (window as unknown as { ethereum?: Record<string, unknown> }).ethereum as {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
      on: (event: string, handler: (...args: unknown[]) => void) => void
    } | undefined
  }

  const loadCurveData = useCallback(async () => {
    if (!CURVE_ADDRESS) return
    try {
      const ethereum = getEthereum()
      if (!ethereum) return

      const call = async (data: string) => {
        const result = await ethereum.request({
          method: 'eth_call',
          params: [{ to: CURVE_ADDRESS, data }, 'latest'],
        })
        return result as string
      }

      const [price, available, sold, active] = await Promise.all([
        call('0x9d1b464a'), // currentPrice()
        call('0x60659a92'), // tokensAvailable()
        call('0x4b319713'), // totalSold()
        call('0x02fb0c5e'), // active()
      ])

      setCurveData({
        price,
        available,
        totalSold: sold,
        active: parseInt(active, 16) === 1,
      })
    } catch (e) {
      console.error('Failed to load curve data:', e)
    }
  }, [])

  useEffect(() => {
    loadCurveData()
    const interval = setInterval(loadCurveData, 15000)
    return () => clearInterval(interval)
  }, [loadCurveData])

  useEffect(() => {
    if (!ethAmount || isNaN(Number(ethAmount)) || Number(ethAmount) <= 0) {
      setEstimatedTokens('0')
      return
    }
    if (!CURVE_ADDRESS) return

    const estimate = async () => {
      try {
        const ethereum = getEthereum()
        if (!ethereum) return
        const weiAmount = BigInt(Math.floor(Number(ethAmount) * 1e18))
        const encoded = '0xafa90054' + weiAmount.toString(16).padStart(64, '0')
        const result = await ethereum.request({
          method: 'eth_call',
          params: [{ to: CURVE_ADDRESS, data: encoded }, 'latest'],
        }) as string
        setEstimatedTokens(BigInt(result).toString())
      } catch {
        setEstimatedTokens('0')
      }
    }
    estimate()
  }, [ethAmount])

  async function connectWallet() {
    const ethereum = getEthereum()
    if (!ethereum) {
      setStatus('Install MetaMask to continue')
      return
    }
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' }) as string[]
      setAccount(accounts[0])

      // Switch to Optimism
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: OPTIMISM_CHAIN_ID }],
        })
      } catch {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: OPTIMISM_CHAIN_ID,
            chainName: 'Optimism',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://mainnet.optimism.io'],
            blockExplorerUrls: ['https://optimistic.etherscan.io'],
          }],
        })
      }

      setStatus('')
      loadCurveData()
    } catch (err) {
      setStatus('Connection failed')
      console.error(err)
    }
  }

  async function buyTokens() {
    const ethereum = getEthereum()
    if (!ethereum || !account) return
    if (!CURVE_ADDRESS) {
      setStatus('Bonding curve not deployed yet')
      return
    }

    setStatus('Confirming transaction...')
    setTxHash('')

    try {
      const weiValue = '0x' + BigInt(Math.floor(Number(ethAmount) * 1e18)).toString(16)

      // buy() function selector
      const hash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: CURVE_ADDRESS,
          value: weiValue,
          data: '0xa6f2ae3a', // buy()
        }],
      }) as string

      setTxHash(hash)
      setStatus('Transaction sent! Waiting for confirmation...')

      // Poll for receipt
      let receipt = null
      for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 2000))
        receipt = await ethereum.request({
          method: 'eth_getTransactionReceipt',
          params: [hash],
        })
        if (receipt) break
      }

      if (receipt) {
        setStatus('Purchase complete!')
        loadCurveData()
      } else {
        setStatus('Transaction pending — check explorer')
      }
    } catch (err: unknown) {
      const error = err as { code?: number; message?: string }
      if (error.code === 4001) {
        setStatus('Transaction cancelled')
      } else {
        setStatus('Transaction failed: ' + (error.message || 'Unknown error'))
      }
      console.error(err)
    }
  }

  const priceInfo = formatEthPrice(curveData.price ? BigInt(curveData.price).toString() : '0')
  const notDeployed = !CURVE_ADDRESS

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/40 via-slate-950 to-slate-950" />
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
          <p className="text-violet-400 font-mono text-sm mb-4 tracking-wider uppercase">
            Bonding Curve
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Buy LUX
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Send ETH, receive LUX. Price rises with each purchase. Early buyers get the best price.
          </p>
        </div>
      </section>

      {/* Buy Interface */}
      <section className="max-w-lg mx-auto px-4 py-12">
        {/* Price Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center p-4 rounded-xl border border-slate-800 bg-slate-900/50">
            <p className="text-xs text-slate-500 uppercase mb-1">Price</p>
            <p className="text-white font-semibold text-sm">
              {notDeployed ? '~$0.001' : priceInfo.usd}
            </p>
          </div>
          <div className="text-center p-4 rounded-xl border border-slate-800 bg-slate-900/50">
            <p className="text-xs text-slate-500 uppercase mb-1">Sold</p>
            <p className="text-white font-semibold text-sm">
              {notDeployed ? '0' : formatLux(BigInt(curveData.totalSold).toString())}
            </p>
          </div>
          <div className="text-center p-4 rounded-xl border border-slate-800 bg-slate-900/50">
            <p className="text-xs text-slate-500 uppercase mb-1">Available</p>
            <p className="text-white font-semibold text-sm">
              {notDeployed ? '5M' : formatLux(BigInt(curveData.available).toString())}
            </p>
          </div>
        </div>

        {/* Buy Card */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
          {!account ? (
            <button
              onClick={connectWallet}
              className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors"
            >
              Connect Wallet
            </button>
          ) : (
            <>
              <div className="mb-1 flex justify-between">
                <span className="text-sm text-slate-400">You pay</span>
                <span className="text-xs text-slate-500 font-mono">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-950 border border-slate-700 mb-4">
                <input
                  type="number"
                  min="0.0001"
                  step="0.001"
                  value={ethAmount}
                  onChange={(e) => setEthAmount(e.target.value)}
                  className="flex-1 bg-transparent text-white text-2xl font-semibold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0.0"
                />
                <span className="text-slate-400 font-medium">ETH</span>
              </div>

              <div className="text-center text-slate-500 my-3">&#8595;</div>

              <div className="mb-1 text-sm text-slate-400">You receive</div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-950 border border-slate-700 mb-6">
                <p className="flex-1 text-2xl font-semibold text-white">
                  {notDeployed
                    ? (Number(ethAmount || 0) / 0.0000004).toLocaleString(undefined, { maximumFractionDigits: 0 })
                    : Number(estimatedTokens) > 0
                      ? formatLux(estimatedTokens)
                      : '0'
                  }
                </p>
                <span className="text-violet-400 font-medium">LUX</span>
              </div>

              <button
                onClick={buyTokens}
                disabled={notDeployed || !curveData.active}
                className="w-full py-4 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl transition-colors"
              >
                {notDeployed ? 'Coming Soon' : !curveData.active ? 'Sale Paused' : 'Buy LUX'}
              </button>
            </>
          )}

          {status && (
            <p className={`mt-4 text-sm text-center ${status.includes('complete') ? 'text-green-400' : status.includes('failed') || status.includes('cancelled') ? 'text-red-400' : 'text-slate-400'}`}>
              {status}
            </p>
          )}

          {txHash && (
            <p className="mt-2 text-xs text-center">
              <a
                href={`https://optimistic.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300"
              >
                View on Etherscan
              </a>
            </p>
          )}
        </div>

        {/* How it works */}
        <div className="mt-8 p-6 rounded-xl border border-slate-800 bg-slate-900/30">
          <h3 className="text-white font-semibold mb-4">How it works</h3>
          <div className="space-y-3 text-sm text-slate-400">
            <div className="flex gap-3">
              <span className="text-violet-400 font-mono shrink-0">1.</span>
              <span>Connect your wallet on Optimism</span>
            </div>
            <div className="flex gap-3">
              <span className="text-violet-400 font-mono shrink-0">2.</span>
              <span>Enter how much ETH you want to spend</span>
            </div>
            <div className="flex gap-3">
              <span className="text-violet-400 font-mono shrink-0">3.</span>
              <span>Click Buy — LUX tokens are sent to your wallet instantly</span>
            </div>
            <div className="flex gap-3">
              <span className="text-violet-400 font-mono shrink-0">4.</span>
              <span>Price rises with each purchase — early buyers get the best price</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/token" className="text-sm text-violet-400 hover:text-violet-300">
            View full tokenomics &rarr;
          </Link>
        </div>
      </section>
    </div>
  )
}
