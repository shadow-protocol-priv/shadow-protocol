# Next.js Frontend Detail

This document details the Next.js frontend application that provides a user interface for Shadow Protocol, enabling private DeFi interactions through the SDK.

## Overview

The frontend serves as a demonstration and integration example, showcasing how dApps can implement Shadow Protocol's privacy features. It uses Next.js 13+ with the app router, wagmi for wallet connectivity, and the Shadow SDK for intent submission.

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Wallet**: wagmi + RainbowKit
- **SDK**: @shadowprotocol/sdk
- **UI Components**: Custom components with Radix UI primitives
- **State Management**: Zustand for global state
- **Type Safety**: TypeScript throughout

## Application Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Landing page
│   ├── swap/
│   │   ├── page.tsx         # Swap interface
│   │   └── loading.tsx      # Loading states
│   └── portfolio/
│       └── page.tsx         # Portfolio view (future)
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   ├── SwapForm.tsx         # Main swap interface
│   ├── TokenSelector.tsx    # Token selection dropdown
│   ├── SwapSummary.tsx      # Transaction summary
│   ├── IntentStatus.tsx     # Intent tracking
│   └── WalletConnect.tsx    # Wallet connection button
├── hooks/
│   ├── useSwap.ts           # Swap logic hook
│   ├── useTokens.ts         # Token data hook
│   ├── useIntentStatus.ts   # Intent monitoring hook
│   └── useBalances.ts       # Token balance hook
├── lib/
│   ├── config.ts            # App configuration
│   ├── constants.ts         # Network constants
│   ├── utils.ts             # Helper functions
│   └── types.ts             # Shared types
└── stores/
    ├── swapStore.ts         # Swap state management
    └── intentStore.ts       # Intent tracking store
```

## Core Components

### SwapForm Component

**Purpose**: Main interface for creating and submitting encrypted swap intents.

**Key Features**:

- Token pair selection
- Amount input with balance display
- Slippage settings
- Real-time quote display
- Privacy indicator

**Implementation**:

```tsx
function SwapForm() {
  const { fromToken, toToken, amount, setAmount } = useSwapStore();
  const { data: quote } = useSwapQuote({ fromToken, toToken, amount });

  const handleSwap = async () => {
    const result = await shadow.swapPrivately({
      fromToken: fromToken.address,
      toToken: toToken.address,
      amount: amount.toString(),
      slippage: 0.5,
      userAddress: address,
    });
    // Handle result
  };

  return (
    <Card>
      <TokenInput
        token={fromToken}
        value={amount}
        onChange={setAmount}
        balance={fromBalance}
      />
      <SwapArrow />
      <TokenInput token={toToken} value={quote?.outputAmount} readonly />
      <SwapSettings slippage={slippage} onSlippageChange={setSlippage} />
      <Button onClick={handleSwap} disabled={!isConnected}>
        Swap Privately
      </Button>
    </Card>
  );
}
```

### WalletConnect Component

**Purpose**: Handles wallet connection and network switching.

**Integration**:

```tsx
import { ConnectButton } from "@rainbow-me/rainbowkit";

function WalletConnect() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        if (!mounted) return null;
        return (
          <Button onClick={openConnectModal}>
            {account ? `${account.displayName}` : "Connect Wallet"}
          </Button>
        );
      }}
    </ConnectButton.Custom>
  );
}
```

### IntentStatus Component

**Purpose**: Displays the status of submitted intents.

**Features**:

- Real-time status updates
- Progress indicators
- Transaction links
- Error handling

## Custom Hooks

### useSwap Hook

**Purpose**: Manages swap logic and SDK integration.

```tsx
function useSwap() {
  const { address } = useAccount();
  const { swapPrivately } = useShadowSDK();

  const executeSwap = async (params: SwapParams) => {
    try {
      const result = await swapPrivately(params);
      addIntent(result.intentHash);
      return result;
    } catch (error) {
      handleError(error);
    }
  };

  return { executeSwap, isLoading, error };
}
```

### useIntentStatus Hook

**Purpose**: Monitors intent fulfillment status.

```tsx
function useIntentStatus(intentHash: string) {
  const [status, setStatus] = useState<IntentStatus>("pending");

  useEffect(() => {
    const pollStatus = async () => {
      const currentStatus = await shadow.getIntentStatus(intentHash);
      setStatus(currentStatus);
    };

    const interval = setInterval(pollStatus, 5000);
    return () => clearInterval(interval);
  }, [intentHash]);

  return status;
}
```

## State Management

### Swap Store (Zustand)

```tsx
interface SwapState {
  fromToken: Token;
  toToken: Token;
  amount: string;
  slippage: number;
  setFromToken: (token: Token) => void;
  setToToken: (token: Token) => void;
  setAmount: (amount: string) => void;
  setSlippage: (slippage: number) => void;
  swapTokens: () => void;
}
```

### Intent Store

```tsx
interface IntentState {
  intents: Intent[];
  addIntent: (intent: Intent) => void;
  updateIntent: (hash: string, status: IntentStatus) => void;
  getIntent: (hash: string) => Intent | undefined;
}
```

## Configuration

### App Configuration (config.ts)

```tsx
export const config = {
  chains: [base],
  connectors: [injected, walletConnect, metaMask],
  shadowSDK: {
    routerAddress: "0x...",
    fhePublicKey: "...",
  },
};
```

### Providers Setup (layout.tsx)

```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider>
            <ShadowProvider>{children}</ShadowProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </body>
    </html>
  );
}
```

## User Experience Flow

1. **Connect Wallet**: User connects their wallet
2. **Select Tokens**: Choose from/to tokens
3. **Enter Amount**: Input swap amount
4. **Review Quote**: See estimated output
5. **Submit Intent**: Click "Swap Privately"
6. **Monitor Status**: Track intent fulfillment
7. **Receive Tokens**: Automatic settlement

## Privacy Features UI

- **Privacy Indicators**: Visual cues showing encrypted state
- **No Address Display**: User addresses hidden in UI
- **Secure Messaging**: Clear communication about privacy guarantees
- **Status Transparency**: Clear intent lifecycle display

## Error Handling

### User-Friendly Errors

- Network connection issues
- Insufficient balance
- Invalid token pairs
- SDK errors

### Recovery Actions

- Retry buttons
- Alternative network suggestions
- Support links

## Performance Optimizations

- **Code Splitting**: Lazy load components
- **Image Optimization**: Next.js Image component
- **Caching**: React Query for API calls
- **Bundle Analysis**: Webpack bundle analyzer

## Testing

### Component Tests

- Unit tests for individual components
- Integration tests for user flows
- E2E tests with Playwright

### SDK Integration Tests

- Mock SDK responses
- Error scenario testing
- Wallet interaction simulation

## Deployment

### Build Configuration

```javascript
// next.config.js
module.exports = {
  experimental: { appDir: true },
  images: { domains: ["assets.coingecko.com"] },
};
```

### Environment Variables

- RPC endpoints
- SDK configuration
- Analytics keys

## Future Enhancements

- **Advanced Swaps**: Limit orders, DCA, etc.
- **Portfolio Integration**: DeFi position management
- **Cross-Chain**: Multi-chain swap support
- **Mobile App**: React Native companion
