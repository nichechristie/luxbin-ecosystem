#!/usr/bin/env node
/**
 * Deploy LuxbinToken (21M LUX) to Base Mainnet
 *
 * Usage:
 *   PRIVATE_KEY=0x... node scripts/deploy-lux.mjs
 *
 * Requirements:
 *   - ~$0.50 ETH on Base for gas
 *   - Your deployer wallet private key (never share this)
 */

import { ethers } from 'ethers'
import solc from 'solc'

const SOURCE = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

interface IERC20Metadata is IERC20 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
}

abstract contract Context {
    function _msgSender() internal view virtual returns (address) { return msg.sender; }
    function _msgData() internal view virtual returns (bytes calldata) { return msg.data; }
}

interface IERC20Errors {
    error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed);
    error ERC20InvalidSender(address sender);
    error ERC20InvalidReceiver(address receiver);
    error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed);
    error ERC20InvalidApprover(address approver);
    error ERC20InvalidSpender(address spender);
}

abstract contract ERC20 is Context, IERC20, IERC20Metadata, IERC20Errors {
    mapping(address account => uint256) private _balances;
    mapping(address owner => mapping(address spender => uint256)) private _allowances;
    uint256 private _totalSupply;
    string private _name;
    string private _symbol;

    constructor(string memory name_, string memory symbol_) { _name = name_; _symbol = symbol_; }
    function name() public view virtual returns (string memory) { return _name; }
    function symbol() public view virtual returns (string memory) { return _symbol; }
    function decimals() public view virtual returns (uint8) { return 18; }
    function totalSupply() public view virtual returns (uint256) { return _totalSupply; }
    function balanceOf(address account) public view virtual returns (uint256) { return _balances[account]; }

    function transfer(address to, uint256 value) public virtual returns (bool) {
        _transfer(_msgSender(), to, value);
        return true;
    }

    function allowance(address owner, address spender) public view virtual returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 value) public virtual returns (bool) {
        _approve(_msgSender(), spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public virtual returns (bool) {
        _spendAllowance(from, _msgSender(), value);
        _transfer(from, to, value);
        return true;
    }

    function _transfer(address from, address to, uint256 value) internal {
        if (from == address(0)) revert ERC20InvalidSender(address(0));
        if (to == address(0)) revert ERC20InvalidReceiver(address(0));
        _update(from, to, value);
    }

    function _update(address from, address to, uint256 value) internal virtual {
        if (from == address(0)) {
            _totalSupply += value;
        } else {
            uint256 fromBalance = _balances[from];
            if (fromBalance < value) revert ERC20InsufficientBalance(from, fromBalance, value);
            unchecked { _balances[from] = fromBalance - value; }
        }
        if (to == address(0)) {
            unchecked { _totalSupply -= value; }
        } else {
            unchecked { _balances[to] += value; }
        }
        emit Transfer(from, to, value);
    }

    function _mint(address account, uint256 value) internal {
        if (account == address(0)) revert ERC20InvalidReceiver(address(0));
        _update(address(0), account, value);
    }

    function _burn(address account, uint256 value) internal {
        if (account == address(0)) revert ERC20InvalidSender(address(0));
        _update(account, address(0), value);
    }

    function _approve(address owner, address spender, uint256 value) internal {
        _approve(owner, spender, value, true);
    }

    function _approve(address owner, address spender, uint256 value, bool emitEvent) internal virtual {
        if (owner == address(0)) revert ERC20InvalidApprover(address(0));
        if (spender == address(0)) revert ERC20InvalidSpender(address(0));
        _allowances[owner][spender] = value;
        if (emitEvent) emit Approval(owner, spender, value);
    }

    function _spendAllowance(address owner, address spender, uint256 value) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            if (currentAllowance < value) revert ERC20InsufficientAllowance(spender, currentAllowance, value);
            unchecked { _approve(owner, spender, currentAllowance - value, false); }
        }
    }
}

abstract contract ERC20Burnable is Context, ERC20 {
    function burn(uint256 value) public virtual { _burn(_msgSender(), value); }
    function burnFrom(address account, uint256 value) public virtual {
        _spendAllowance(account, _msgSender(), value);
        _burn(account, value);
    }
}

contract LuxbinToken is ERC20, ERC20Burnable {
    uint256 public constant TOTAL_SUPPLY = 21_000_000 * 10**18;
    constructor() ERC20("LUXBIN", "LUX") { _mint(msg.sender, TOTAL_SUPPLY); }
}
`

async function main() {
  const fs = await import('fs')
  const keyFile = new URL('../.env.key', import.meta.url).pathname
  let privateKey = process.env.PRIVATE_KEY
  if (!privateKey && fs.existsSync(keyFile)) {
    privateKey = fs.readFileSync(keyFile, 'utf-8').trim()
  }
  if (!privateKey) {
    console.error('\n  ERROR: No key found.')
    console.error('  Either set PRIVATE_KEY env var or create .env.key file.\n')
    process.exit(1)
  }

  console.log('\n  LUXBIN Token Deployer — Optimism Mainnet')
  console.log('  ========================================\n')

  // Compile
  console.log('  [1/4] Compiling LuxbinToken.sol...')
  const input = {
    language: 'Solidity',
    sources: { 'LuxbinToken.sol': { content: SOURCE } },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } },
    },
  }

  const output = JSON.parse(solc.compile(JSON.stringify(input)))

  if (output.errors?.some(e => e.severity === 'error')) {
    console.error('  Compilation errors:')
    output.errors.filter(e => e.severity === 'error').forEach(e => console.error(' ', e.formattedMessage))
    process.exit(1)
  }

  const contract = output.contracts['LuxbinToken.sol']['LuxbinToken']
  const abi = contract.abi
  const bytecode = '0x' + contract.evm.bytecode.object

  console.log('  [2/4] Compiled successfully.')

  // Connect to Base mainnet
  console.log('  [3/4] Connecting to Optimism mainnet...')
  const provider = new ethers.JsonRpcProvider('https://mainnet.optimism.io')
  const wallet = new ethers.Wallet(privateKey, provider)

  const balance = await provider.getBalance(wallet.address)
  const balanceETH = ethers.formatEther(balance)
  console.log(`        Deployer: ${wallet.address}`)
  console.log(`        Balance:  ${balanceETH} ETH`)

  if (balance === 0n) {
    console.error('\n  ERROR: No ETH on Optimism. You need ~$0.50 of ETH for gas.\n')
    process.exit(1)
  }

  // Deploy
  console.log('  [4/4] Deploying LuxbinToken (21M LUX)...')
  const factory = new ethers.ContractFactory(abi, bytecode, wallet)
  const token = await factory.deploy()

  console.log(`        Tx hash:  ${token.deploymentTransaction().hash}`)
  console.log('        Waiting for confirmation...')

  await token.waitForDeployment()
  const address = await token.getAddress()

  console.log('\n  ====================================')
  console.log(`  SUCCESS! LUX Token deployed!`)
  console.log(`  Contract: ${address}`)
  console.log(`  Explorer: https://optimistic.etherscan.io/address/${address}`)
  console.log('  ====================================\n')

  // Write the address to a file so we can update the website
  const fsWrite = await import('fs')
  fsWrite.writeFileSync('scripts/deployed-address.txt', address)
  console.log(`  Address saved to scripts/deployed-address.txt`)
  console.log('  Run the update script to patch the website:\n')
  console.log(`  node scripts/update-token-address.mjs\n`)
}

main().catch((err) => {
  console.error('\n  Deployment failed:', err.message || err)
  process.exit(1)
})
