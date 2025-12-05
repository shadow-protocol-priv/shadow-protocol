# @shadowprotocol/sdk

Shadow Protocol SDK for private DeFi intents on Base.

## Installation

```bash
npm install @shadowprotocol/sdk
# or
yarn add @shadowprotocol/sdk
```

## Quick Start

```typescript
import { createShadowSDK } from "@shadowprotocol/sdk";

const shadow = createShadowSDK({
  chainId: 8453, // Base
  routerAddress: "0x...", // Deployed ShadowRouter address
  rpcUrl: "https://mainnet.base.org",
});

// Submit a private swap
const result = await shadow.swapPrivately(
  {
    fromToken: "0x4200000000000000000000000000000000000006", // WETH
    toToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
    amount: "1.0",
    slippage: 0.5,
    userAddress: "0x...",
  },
  signer
);

console.log("Intent submitted:", result.intentHash);
```

## With wagmi

```typescript
import { useAccount, useSignTypedData } from 'wagmi';
import { createShadowSDK } from '@shadowprotocol/sdk';

function SwapComponent() {
  const { address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const shadow = createShadowSDK({
    chainId: 8453,
    routerAddress: '0x...',
    rpcUrl: 'https://mainnet.base.org'
  });

  const handleSwap = async () => {
    const result = await shadow.swapPrivately({
      fromToken: WETH_ADDRESS,
      toToken: USDC_ADDRESS,
      amount: '1.0',
      userAddress: address,
    }, { signTypedDataAsync });
  };

  return <button onClick={handleSwap}>Swap Privately</button>;
}
```

## API Reference

### createShadowSDK(config)

Creates a new Shadow SDK instance.

**Parameters:**

- `config` (SDKConfig): SDK configuration

**Returns:** ShadowSDK instance

### shadow.swapPrivately(params, signer)

Submit a private swap intent.

**Parameters:**

- `params` (SwapParams): Swap parameters
- `signer` (Signer): Wallet signer for EIP-712 signing

**Returns:** Promise<IntentResult>

### shadow.getIntentStatus(intentHash)

Get the status of a submitted intent.

**Parameters:**

- `intentHash` (string): Intent hash

**Returns:** Promise<IntentStatus>

## Configuration

```typescript
interface SDKConfig {
  chainId: number; // Target chain ID
  routerAddress: string; // ShadowRouter contract address
  rpcUrl: string; // RPC endpoint
  fhePublicKey?: string; // FHE public key (future)
  gasMultiplier?: number; // Gas price multiplier
}
```

## Swap Parameters

```typescript
interface SwapParams {
  fromToken: string; // Source token address
  toToken: string; // Destination token address
  amount: string; // Amount in human-readable format
  slippage?: number; // Slippage tolerance (percentage)
  userAddress: string; // User wallet address
  deadline?: number; // Expiration timestamp
  referrer?: string; // Optional referrer address
}
```

## Privacy Features

- **Encrypted Intents**: All swap details are encrypted client-side
- **No Address Exposure**: User addresses are never exposed on-chain
- **MEV Protection**: Solvers compete privately off-chain
- **Regulatory Compliance**: Settlement appears as normal Base transactions

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Lint
npm run lint
```

## License

MIT
