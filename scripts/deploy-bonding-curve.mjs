#!/usr/bin/env node
/**
 * Deploy LUX Bonding Curve to Optimism Mainnet
 * Then transfer LUX tokens into it so people can buy.
 *
 * Usage:
 *   node scripts/deploy-bonding-curve.mjs
 *   (reads key from .env.key file)
 */

import { ethers } from 'ethers'
import solc from 'solc'
import fs from 'fs'

const BONDING_CURVE_SOURCE = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title LUX Bonding Curve
 * @notice Send ETH, receive LUX. Price rises with each purchase.
 * @dev Linear bonding curve: price = basePrice + slope * totalSold
 *      No upfront liquidity needed from the team.
 */
contract LuxBondingCurve {
    IERC20 public immutable luxToken;
    address public owner;

    uint256 public totalSold;

    // Pricing: starts at ~$0.001/LUX, rises as tokens sell
    // basePrice = 0.0000004 ETH (~$0.001 at $2500/ETH)
    // After 5M tokens sold, price reaches ~0.0000008 ETH (~$0.002)
    uint256 public constant BASE_PRICE = 400000000000;     // 0.0000004 ETH in wei
    uint256 public constant PRICE_SLOPE = 80000;           // price increase per token sold (in wei per 1e18 token)

    uint256 public constant MAX_PER_TX = 500000 * 1e18;    // 500K LUX max per transaction

    bool public active = true;

    event Buy(address indexed buyer, uint256 ethSpent, uint256 luxReceived, uint256 newPrice);
    event Withdrawn(address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _luxToken) {
        luxToken = IERC20(_luxToken);
        owner = msg.sender;
    }

    /**
     * @notice Get current price per LUX token in wei
     */
    function currentPrice() public view returns (uint256) {
        return BASE_PRICE + (PRICE_SLOPE * totalSold / 1e18);
    }

    /**
     * @notice Estimate how many LUX tokens you get for a given ETH amount
     */
    function estimateTokens(uint256 ethAmount) public view returns (uint256) {
        // Use current price as average (good approximation for small purchases)
        uint256 price = currentPrice();
        return (ethAmount * 1e18) / price;
    }

    /**
     * @notice Buy LUX tokens by sending ETH
     */
    function buy() external payable {
        require(active, "Sale paused");
        require(msg.value > 0, "Send ETH");

        uint256 price = currentPrice();
        uint256 tokensOut = (msg.value * 1e18) / price;

        require(tokensOut <= MAX_PER_TX, "Exceeds max per tx");
        require(luxToken.balanceOf(address(this)) >= tokensOut, "Sold out");

        totalSold += tokensOut;

        require(luxToken.transfer(msg.sender, tokensOut), "Transfer failed");

        emit Buy(msg.sender, msg.value, tokensOut, currentPrice());
    }

    /**
     * @notice Owner withdraws collected ETH
     */
    function withdraw() external onlyOwner {
        uint256 bal = address(this).balance;
        require(bal > 0, "No ETH");
        (bool ok, ) = payable(owner).call{value: bal}("");
        require(ok, "Withdraw failed");
        emit Withdrawn(owner, bal);
    }

    /**
     * @notice Owner can pause/unpause the sale
     */
    function setActive(bool _active) external onlyOwner {
        active = _active;
    }

    /**
     * @notice Owner can recover unsold LUX tokens
     */
    function recoverTokens() external onlyOwner {
        uint256 bal = luxToken.balanceOf(address(this));
        require(bal > 0, "No tokens");
        luxToken.transfer(owner, bal);
    }

    /**
     * @notice Tokens available for purchase
     */
    function tokensAvailable() external view returns (uint256) {
        return luxToken.balanceOf(address(this));
    }

    receive() external payable {
        revert("Use buy()");
    }
}
`

const LUX_TOKEN = '0x479EeC6Bbab3840258bA2D6cEc592fF8B5908477'
const TOKENS_TO_FUND = ethers.parseEther('5000000') // 5M LUX for sale

async function main() {
  const keyFile = new URL('../.env.key', import.meta.url).pathname
  let privateKey = process.env.PRIVATE_KEY
  if (!privateKey && fs.existsSync(keyFile)) {
    privateKey = fs.readFileSync(keyFile, 'utf-8').trim()
  }
  if (!privateKey) {
    console.error('\n  ERROR: No key found. Create .env.key file with your private key.\n')
    process.exit(1)
  }

  console.log('\n  LUX Bonding Curve Deployer — Optimism')
  console.log('  ======================================\n')

  // Compile
  console.log('  [1/5] Compiling BondingCurve...')
  const input = {
    language: 'Solidity',
    sources: { 'LuxBondingCurve.sol': { content: BONDING_CURVE_SOURCE } },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } },
    },
  }

  const output = JSON.parse(solc.compile(JSON.stringify(input)))
  if (output.errors?.some(e => e.severity === 'error')) {
    output.errors.filter(e => e.severity === 'error').forEach(e => console.error(e.formattedMessage))
    process.exit(1)
  }

  const contract = output.contracts['LuxBondingCurve.sol']['LuxBondingCurve']
  const abi = contract.abi
  const bytecode = '0x' + contract.evm.bytecode.object
  console.log('  [2/5] Compiled.')

  // Connect
  console.log('  [3/5] Connecting to Optimism...')
  const provider = new ethers.JsonRpcProvider('https://mainnet.optimism.io')
  const wallet = new ethers.Wallet(privateKey, provider)
  const balance = await provider.getBalance(wallet.address)
  console.log(`        Deployer: ${wallet.address}`)
  console.log(`        Balance:  ${ethers.formatEther(balance)} ETH`)

  // Deploy bonding curve
  console.log('  [4/5] Deploying bonding curve...')
  const factory = new ethers.ContractFactory(abi, bytecode, wallet)
  const curve = await factory.deploy(LUX_TOKEN)
  console.log(`        Tx: ${curve.deploymentTransaction().hash}`)
  await curve.waitForDeployment()
  const curveAddress = await curve.getAddress()
  console.log(`        Bonding Curve: ${curveAddress}`)

  // Transfer 5M LUX to the curve
  console.log('  [5/5] Funding curve with 5M LUX...')
  const luxAbi = ['function transfer(address to, uint256 amount) returns (bool)']
  const lux = new ethers.Contract(LUX_TOKEN, luxAbi, wallet)
  const tx = await lux.transfer(curveAddress, TOKENS_TO_FUND)
  console.log(`        Tx: ${tx.hash}`)
  await tx.wait()

  console.log('\n  ======================================')
  console.log('  SUCCESS! Bonding curve is live!')
  console.log(`  Contract:  ${curveAddress}`)
  console.log(`  Explorer:  https://optimistic.etherscan.io/address/${curveAddress}`)
  console.log(`  Funded:    5,000,000 LUX`)
  console.log(`  Start:     ~$0.001 per LUX`)
  console.log('  ======================================\n')

  // Save address
  fs.writeFileSync('scripts/bonding-curve-address.txt', curveAddress)

  // Save ABI for frontend
  fs.writeFileSync('app/buy/curve-abi.json', JSON.stringify(abi, null, 2))

  console.log('  Saved to scripts/bonding-curve-address.txt')
  console.log('  ABI saved to app/buy/curve-abi.json\n')
}

main().catch((err) => {
  console.error('\n  Deploy failed:', err.message || err)
  process.exit(1)
})
