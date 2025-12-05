# Shadow Protocol Frontend Integration

This guide shows how to integrate Shadow Protocol's privacy features into your dApp.

## Installation

```bash
npm install @shadowprotocol/sdk wagmi viem @wagmi/core
```

## Setup

### 1. Configure wagmi

```typescript
// wagmi.ts
import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

export const config = createConfig({
  chains: [base],
  connectors: [injected(), walletConnect({ projectId: "your-project-id" })],
  transports: {
    [base.id]: http("https://mainnet.base.org"),
  },
});
```

### 2. Initialize Shadow SDK

```typescript
// lib/shadow.ts
import { createShadowSDK } from "@shadowprotocol/sdk";
import { getAccount, getWalletClient } from "@wagmi/core";
import { config } from "./wagmi";

export const shadowSDK = createShadowSDK({
  chainId: 8453, // Base
  routerAddress: "0x...", // Deployed ShadowRouter address
  rpcUrl: "https://mainnet.base.org",
});

export async function submitPrivateSwap(params: {
  fromToken: string;
  toToken: string;
  amount: string;
  slippage?: number;
}) {
  const account = getAccount(config);
  const walletClient = await getWalletClient(config);

  if (!account.address || !walletClient) {
    throw new Error("Wallet not connected");
  }

  const result = await shadowSDK.swapPrivately(
    {
      ...params,
      userAddress: account.address,
      slippage: params.slippage || 0.5,
      deadline: Math.floor(Date.now() / 1000) + 3600,
    },
    {
      signTypedData: walletClient.signTypedData,
      getAddress: () => Promise.resolve(account.address),
    }
  );

  return result;
}
```

## Usage in Components

### Swap Component

```tsx
// components/SwapForm.tsx
import { useState } from "react";
import { useAccount } from "wagmi";
import { submitPrivateSwap, getIntentStatus } from "../lib/shadow";

export function SwapForm() {
  const { isConnected } = useAccount();
  const [fromToken, setFromToken] = useState(
    "0x4200000000000000000000000000000000000006"
  ); // WETH
  const [toToken, setToToken] = useState(
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
  ); // USDC
  const [amount, setAmount] = useState("");
  const [intentHash, setIntentHash] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleSwap = async () => {
    try {
      const result = await submitPrivateSwap({
        fromToken,
        toToken,
        amount,
        slippage: 0.5,
      });

      setIntentHash(result.intentHash);
      setStatus(result.status);

      // Monitor status
      const checkStatus = async () => {
        if (result.intentHash) {
          const currentStatus = await getIntentStatus(result.intentHash);
          setStatus(currentStatus);

          if (currentStatus === "fulfilled") {
            console.log("Swap completed!");
          } else if (currentStatus === "pending") {
            setTimeout(checkStatus, 5000); // Check again in 5 seconds
          }
        }
      };

      setTimeout(checkStatus, 5000);
    } catch (error) {
      console.error("Swap failed:", error);
    }
  };

  return (
    <div className="swap-form">
      <div className="token-input">
        <label>From Token</label>
        <input
          value={fromToken}
          onChange={(e) => setFromToken(e.target.value)}
          placeholder="0x..."
        />
      </div>

      <div className="token-input">
        <label>To Token</label>
        <input
          value={toToken}
          onChange={(e) => setToToken(e.target.value)}
          placeholder="0x..."
        />
      </div>

      <div className="amount-input">
        <label>Amount</label>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          type="number"
        />
      </div>

      <button
        onClick={handleSwap}
        disabled={!isConnected || !amount}
        className="swap-button"
      >
        {isConnected ? "Swap Privately" : "Connect Wallet"}
      </button>

      {intentHash && (
        <div className="intent-status">
          <p>Intent: {intentHash}</p>
          <p>Status: {status}</p>
        </div>
      )}
    </div>
  );
}
```

### Intent Status Component

```tsx
// components/IntentStatus.tsx
import { useEffect, useState } from "react";
import { getIntentStatus } from "../lib/shadow";

interface IntentStatusProps {
  intentHash: string;
}

export function IntentStatus({ intentHash }: IntentStatusProps) {
  const [status, setStatus] = useState<string>("pending");
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const currentStatus = await getIntentStatus(intentHash);
        setStatus(currentStatus);

        if (currentStatus === "pending") {
          setTimeout(checkStatus, 3000);
        }
      } catch (error) {
        console.error("Status check failed:", error);
      }
    };

    checkStatus();

    // Update time elapsed
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [intentHash]);

  const getStatusColor = () => {
    switch (status) {
      case "fulfilled":
        return "green";
      case "expired":
        return "red";
      case "cancelled":
        return "orange";
      default:
        return "blue";
    }
  };

  return (
    <div className="intent-status-card">
      <div className="status-header">
        <h3>Private Swap Status</h3>
        <span className={`status-badge ${getStatusColor()}`}>
          {status.toUpperCase()}
        </span>
      </div>

      <div className="status-details">
        <p>
          <strong>Intent:</strong> {intentHash}
        </p>
        <p>
          <strong>Time Elapsed:</strong> {timeElapsed}s
        </p>

        {status === "pending" && (
          <div className="privacy-notice">
            <p>🔒 Your swap details are encrypted and private</p>
            <p>🤖 Solvers are competing to fulfill your order</p>
          </div>
        )}

        {status === "fulfilled" && (
          <div className="success-notice">
            <p>✅ Swap completed successfully!</p>
            <p>Your tokens have been delivered privately</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

## Privacy Features

- **Encrypted Intents**: All swap parameters are encrypted client-side
- **No Address Exposure**: User addresses are never visible on-chain
- **MEV Protection**: Solvers compete privately off-chain
- **Gas Efficiency**: Optimized transaction bundling

## Error Handling

```typescript
try {
  const result = await submitPrivateSwap(params);
  // Handle success
} catch (error) {
  if (error.message.includes("insufficient funds")) {
    // Handle insufficient balance
  } else if (error.message.includes("slippage")) {
    // Handle slippage issues
  } else {
    // Handle other errors
  }
}
```

## Configuration

Update the SDK configuration with your deployed contract addresses:

```typescript
const shadowSDK = createShadowSDK({
  chainId: 8453,
  routerAddress: "0x...", // Your deployed ShadowRouter
  rpcUrl: "https://mainnet.base.org",
  gasMultiplier: 1.1,
});
```

## Next Steps

1. Deploy contracts to Base mainnet
2. Update SDK configuration with real addresses
3. Test integration with real transactions
4. Add advanced features (batch swaps, limit orders)
