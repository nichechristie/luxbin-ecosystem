#!/usr/bin/env node
/**
 * Updates the token page with the deployed contract address.
 * Reads the address from scripts/deployed-address.txt
 */

import fs from 'fs'
import path from 'path'

const addressFile = 'scripts/deployed-address.txt'
const tokenPage = 'app/token/page.tsx'

if (!fs.existsSync(addressFile)) {
  console.error('No deployed address found. Run the deploy script first.')
  process.exit(1)
}

const address = fs.readFileSync(addressFile, 'utf-8').trim()

if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
  console.error('Invalid address in deployed-address.txt:', address)
  process.exit(1)
}

let content = fs.readFileSync(tokenPage, 'utf-8')
content = content.replace(
  "const TOKEN_ADDRESS = 'TBD'",
  `const TOKEN_ADDRESS = '${address}'`
)
fs.writeFileSync(tokenPage, content)

console.log(`Updated ${tokenPage} with address: ${address}`)
console.log('Run "npm run build" and push to update the live site.')
