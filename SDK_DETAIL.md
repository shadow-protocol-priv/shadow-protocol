# TypeScript SDK Detail

This document details the Shadow Protocol SDK, a TypeScript library that enables seamless integration of encrypted intents into dApps and wallets.

## Overview

The SDK provides a simple, one-line API for submitting private DeFi intents while handling all encryption and blockchain interactions under the hood.

## Core API

### Main Function

**shadow.swapPrivately(params: SwapParams) => Promise<IntentResult>**

One-line function for encrypted swaps:

```typescript
import { shadow } from "@shadowprotocol/sdk";

const result = await shadow.swapPrivately({
  fromToken: "0xA0b86a33E6441e88C5F2712C3E9b74F5b8F1E9E6", // WETH
  toToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
  amount: "1.5", // 1.5 WETH
  slippage: 0.5, // 0.5%
  userAddress: "0x...", // User's wallet address
});
```

### Parameters

```typescript
interface SwapParams {
  fromToken: string; // ERC20 token address
  toToken: string; // ERC20 token address
  amount: string; // Amount in human-readable format
  slippage?: number; // Slippage tolerance (percentage)
  userAddress: string; // User's wallet address
  deadline?: number; // Unix timestamp for expiration
  referrer?: string; // Optional referrer address
}
```

### Return Value

```typescript
interface IntentResult {
  intentHash: string; // Unique identifier for the intent
  txHash?: string; // Transaction hash if submitted
  status: "submitted" | "pending" | "fulfilled" | "failed";
  estimatedTime: number; // Estimated completion time in seconds
}
```

## Architecture

### Core Modules

```
src/
├── index.ts              # Main exports and initialization
├── swap.ts               # swapPrivately implementation
├── encrypt.ts            # FHE encryption utilities
├── submit.ts             # Intent submission to blockchain
├── types.ts              # TypeScript interfaces
├── config.ts             # SDK configuration
└── utils/
    ├── formatters.ts     # Data formatting helpers
    ├── validation.ts     # Input validation
    └── constants.ts      # Network constants
```

## Key Components

### Encryption Module (encrypt.ts)

**Purpose**: Handles client-side FHE encryption of intent data.

**Key Functions**:

```typescript
async function encryptIntent(
  intentData: IntentData,
  publicKey: FhePublicKey
): Promise<EncryptedBlob>;
```

- Uses fhEVM-compatible encryption
- Prepares data for threshold decryption
- Includes integrity proofs

**Data Structures**:

```typescript
interface IntentData {
  fromToken: string;
  toToken: string;
  amount: bigint;
  slippageBps: number;
  userAddress: string;
  deadline: number;
}

interface EncryptedBlob {
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  publicKey: FhePublicKey;
}
```

### Submission Module (submit.ts)

**Purpose**: Handles blockchain interaction for intent submission.

**Key Functions**:

```typescript
async function submitEncryptedIntent(
  encryptedIntent: EncryptedBlob,
  signature: string
): Promise<SubmissionResult>;
```

- Signs intent with EIP-712
- Submits to ShadowRouter contract
- Handles transaction confirmation

**Integration**:

- Compatible with wagmi, ethers, viem
- Supports multiple wallet connectors
- Gas estimation and optimization

### Configuration (config.ts)

**Key Settings**:

```typescript
interface SDKConfig {
  chainId: number; // Target chain (Base = 8453)
  routerAddress: string; // ShadowRouter contract address
  rpcUrl: string; // RPC endpoint
  fhePublicKey: FhePublicKey; // FHE public key for encryption
  gasMultiplier: number; // Gas price multiplier
}
```

## Advanced Features

### Intent Tracking

```typescript
const status = await shadow.getIntentStatus(intentHash);
```

### Batch Intents

```typescript
const results = await shadow.swapBatch([
  { fromToken: "...", toToken: "...", amount: "1.0" },
  { fromToken: "...", toToken: "...", amount: "2.0" },
]);
```

### Custom Intents

```typescript
const customIntent = await shadow.createIntent({
  type: "lend",
  params: { token: "...", amount: "100" },
});
```

## Integration Examples

### With wagmi

```typescript
import { useAccount, useSignTypedData } from "wagmi";
import { shadow } from "@shadowprotocol/sdk";

function SwapComponent() {
  const { address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const handleSwap = async () => {
    const result = await shadow.swapPrivately(
      {
        fromToken: WETH_ADDRESS,
        toToken: USDC_ADDRESS,
        amount: "1.0",
        userAddress: address,
      },
      { signTypedDataAsync }
    );
  };
}
```

### With ethers

```typescript
import { ethers } from "ethers";
import { shadow } from "@shadowprotocol/sdk";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const result = await shadow.swapPrivately(params, { signer });
```

## Error Handling

### Common Errors

- **EncryptionFailed**: FHE encryption error
- **InvalidParams**: Input validation failure
- **NetworkError**: RPC or network issues
- **InsufficientFunds**: User balance check
- **SlippageTooHigh**: Route validation

### Error Recovery

- Automatic retries for network errors
- Fallback RPC endpoints
- User-friendly error messages

## Testing

### Unit Tests

- Encryption/decryption mocks
- Parameter validation
- Error scenarios

### Integration Tests

- Full intent lifecycle
- Multi-wallet support
- Network conditions

## Distribution

### NPM Package

```json
{
  "name": "@shadowprotocol/sdk",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts"
}
```

### CDN

```html
<script src="https://cdn.shadowprotocol.com/sdk/v1.0.0/index.js"></script>
```

## Security Considerations

- Client-side encryption ensures privacy
- No private keys handled by SDK
- Input sanitization and validation
- Rate limiting for spam protection

## Future Extensions

- **Multi-Chain**: Support for additional EVM chains
- **Complex Intents**: Lending, staking, yield farming
- **Wallet Integration**: Direct wallet plugin support
