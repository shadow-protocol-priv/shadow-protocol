# Shadow Protocol Architecture Summary

## Overview

Shadow Protocol is a universal privacy layer for Base and EVM-compatible chains, enabling users to execute DeFi actions (swaps, lending, staking) through encrypted intents. Solvers process these intents privately using threshold Fully Homomorphic Encryption (FHE), settling transactions publicly on-chain without exposing user data. The protocol aims to unlock $15B+ in Base TVL while generating 10-15 bps in fees, with mainnet launch targeted for February 2026.

## Problem Addressed

- **MEV Exploitation**: $47B annually stolen via front-running and sandwich attacks.
- **Total Surveillance**: All transactions are visible to Chainalysis and other trackers.
- **Regulatory Concerns**: Institutions avoid DeFi due to lack of privacy without mixer risks.
- **Fragmented Solutions**: Existing privacy tools either leak data or silo users.

## Solution

- **Encrypted Intents**: Users sign intents client-side; solvers decrypt and execute off-chain.
- **Key Guarantees**:
  - 100% privacy for address, amount, and strategy pre-execution.
  - Compliance through public settlement identical to approved protocols like UniswapX.
  - Universal integration with any dApp (Aave, EigenLayer, Aerodrome).
  - Decentralized solvers using threshold FHE (Zama/Inco).

## 4-Step Flow

1. **User Signs Encrypted Intent**: Wallet/dApp encrypts intent using fhEVM SDK and submits to ShadowRouter.sol.
2. **Solvers Fetch & Decrypt**: Rust nodes listen for events, decrypt via threshold FHE (3-of-5 keys), and compete to route/execute.
3. **Private Mempool Submission**: Winning solver builds bundle and submits via SUAVE/Flashbots Protect.
4. **Public Settlement**: Normal Base L2 transaction settles the trade, unlinked to user.

## Architecture Layers

- **User Layer**: Next.js frontend with wagmi and Shadow SDK (TypeScript).
- **Protocol Layer**: Solidity contracts on Base (ShadowRouter.sol for intent submission/verification).
- **Execution Layer**: Rust solvers (tfhe-rs for FHE decryption, 1inch/CoW API for routing).
- **Settlement Layer**: SUAVE/Flashbots for private mempool, Base RPC for public tx.

## Components

- **Contracts**: ShadowRouter.sol (submit/fulfill intents).
- **Off-Chain Solvers**: Rust nodes for decryption, routing, and bundle creation.
- **SDK**: `shadow.swapPrivately({from, to, amount})` - one-liner integration.
- **Security**: Threshold cryptography, replay-proof signatures, ZK/TEE proofs.

## Privacy Matrix

- Wallet Address: Hidden (solver submits tx).
- Input Amount: Hidden (fhEVM encrypted).
- Token Pair: Hidden (encrypted addresses).
- Strategy/Slippage: Hidden (private to solvers).
- Settlement Tx: Public (normal Base tx).
- Proof: On-chain attestation.

## Regulatory Safety

- No mixers; encrypted orders like CoW's private mempools.
- Footprint matches approved protocols (UniswapX).
- Auditable with view-keys for compliance.
- Partners: Zama (EU-compliant FHE), Base (Coinbase-backed).

## Tokenomics & Revenue

- MVP: Protocol fees only (10 bps split: 5% solvers, 5% treasury).
- Future: SHADOW token for governance/solver staking.
- Potential: $500M/year at 5% Base volume.
- Treasury: Dev grants, audits, ecosystem funding.

## Competitive Advantages

- 90% privacy, 100% compliance vs. competitors (Uniswap: 0% hidden; Tornado: 100% hidden but sanctioned).

## Implementation Roles

- Frontend: Uche (Next.js + wagmi + Shadow SDK).
- Solidity: Core contracts.
- Rust: Solver nodes.
