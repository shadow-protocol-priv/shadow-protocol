# Interfaces and APIs Detail

This document defines the interfaces and APIs for communication between Shadow Protocol components, ensuring seamless integration across the protocol layers.

## Overview

Shadow Protocol components communicate through well-defined interfaces:

- **Contract Interfaces**: Solidity interfaces for on-chain interactions
- **SDK APIs**: TypeScript APIs for dApp integration
- **Solver APIs**: Internal APIs for solver operations
- **Event Schemas**: Standardized event structures

## Contract Interfaces

### IShadowRouter.sol

**Primary Interface**: Main contract for intent submission and fulfillment.

```solidity
interface IShadowRouter {
    // Intent submission
    function submitIntent(Intent calldata intent) external returns (bytes32 intentHash);

    // Intent fulfillment
    function fulfillIntent(Fulfillment calldata fulfillment) external;

    // Intent management
    function cancelIntent(bytes32 intentHash) external;
    function getIntentStatus(bytes32 intentHash) external view returns (IntentStatus);

    // Events
    event IntentSubmitted(bytes32 indexed intentHash, address indexed user, bytes encryptedData);
    event IntentFulfilled(bytes32 indexed intentHash, address indexed solver, uint256 fee);
    event IntentCancelled(bytes32 indexed intentHash);
}
```

### IIntentVerifier.sol

**Verification Interface**: Handles cryptographic proofs and signatures.

```solidity
interface IIntentVerifier {
    function verifyIntentSignature(Intent calldata intent) external view returns (bool);
    function verifyExecutionProof(bytes proof, bytes32 intentHash, bytes executionData) external view returns (bool);
    function isValidSolver(address solver) external view returns (bool);
}
```

### IFeeManager.sol

**Fee Management Interface**: Handles fee calculation and distribution.

```solidity
interface IFeeManager {
    function calculateFee(uint256 amount) external view returns (uint256);
    function distributeFees(address solver, uint256 totalFee) external;
    function withdrawTreasury() external;
}
```

## Data Structures

### Intent Struct

```solidity
struct Intent {
    bytes encryptedData;      // fhEVM encrypted intent blob
    bytes signature;          // EIP-712 signature
    uint256 nonce;            // Replay protection
    uint256 deadline;         // Expiration timestamp
    address user;             // User address
}
```

### Fulfillment Struct

```solidity
struct Fulfillment {
    bytes32 intentHash;       // Reference to intent
    bytes executionData;      // Calldata for settlement
    bytes proof;              // ZK/TEE proof
    address solver;           // Solver address
}
```

## SDK APIs

### Core SDK Interface

**TypeScript API**: Client-side interface for intent creation.

```typescript
interface ShadowSDK {
  // Main swap function
  swapPrivately(params: SwapParams): Promise<IntentResult>;

  // Advanced functions
  createIntent(params: IntentParams): Promise<IntentResult>;
  getIntentStatus(intentHash: string): Promise<IntentStatus>;
  cancelIntent(intentHash: string): Promise<boolean>;

  // Batch operations
  swapBatch(params: SwapParams[]): Promise<IntentResult[]>;
}
```

### SwapParams Interface

```typescript
interface SwapParams {
  fromToken: string; // ERC20 address
  toToken: string; // ERC20 address
  amount: string; // Human-readable amount
  slippage?: number; // Slippage tolerance (bps)
  userAddress: string; // User wallet address
  deadline?: number; // Unix timestamp
  referrer?: string; // Optional referrer
}
```

### IntentResult Interface

```typescript
interface IntentResult {
  intentHash: string; // Unique intent identifier
  txHash?: string; // Submission transaction hash
  status: IntentStatus; // Current status
  estimatedTime: number; // Estimated completion (seconds)
  timestamp: number; // Submission timestamp
}
```

## Solver Internal APIs

### Intent Processing API

**Internal Interface**: Solver-side intent handling.

```rust
trait IntentProcessor {
    async fn process_intent(&self, intent: EncryptedIntent) -> Result<ProcessedIntent, ProcessError>;
    async fn submit_fulfillment(&self, fulfillment: Fulfillment) -> Result<SubmissionResult, SubmitError>;
}

struct ProcessedIntent {
    intent_hash: H256,
    decrypted_data: IntentData,
    route: SwapRoute,
    bundle: TransactionBundle,
}

struct SubmissionResult {
    tx_hash: H256,
    status: SubmissionStatus,
}
```

### DEX Integration API

**Routing Interface**: External DEX API abstraction.

```rust
trait DexRouter {
    async fn get_quote(&self, params: QuoteParams) -> Result<Quote, RouterError>;
    async fn build_swap_tx(&self, quote: Quote) -> Result<Transaction, BuildError>;
}

struct QuoteParams {
    from_token: Address,
    to_token: Address,
    amount: U256,
    slippage: u32,
}

struct Quote {
    output_amount: U256,
    estimated_gas: U256,
    route: Vec<SwapStep>,
}
```

## Event Schemas

### IntentSubmitted Event

```solidity
event IntentSubmitted(
    bytes32 indexed intentHash,
    address indexed user,
    bytes encryptedData,
    uint256 nonce,
    uint256 deadline,
    uint256 timestamp
);
```

### IntentFulfilled Event

```solidity
event IntentFulfilled(
    bytes32 indexed intentHash,
    address indexed solver,
    uint256 fee,
    bytes executionData,
    bytes32 txHash,
    uint256 timestamp
);
```

## Communication Protocols

### SDK to Contract Flow

1. **Encryption**: SDK encrypts intent data client-side
2. **Signing**: User signs EIP-712 message
3. **Submission**: SDK calls `submitIntent()` on ShadowRouter
4. **Confirmation**: SDK monitors transaction confirmation

### Solver to Contract Flow

1. **Event Listening**: Solver monitors `IntentSubmitted` events
2. **Decryption**: Threshold FHE decryption of intent data
3. **Processing**: Route finding and bundle creation
4. **Fulfillment**: Call `fulfillIntent()` with proof
5. **Settlement**: Monitor on-chain settlement

### Frontend to SDK Flow

1. **Parameter Collection**: UI collects swap parameters
2. **SDK Call**: Frontend calls `swapPrivately()`
3. **Status Monitoring**: Poll `getIntentStatus()` for updates
4. **Result Display**: Show completion or errors

## Error Handling

### Contract Errors

```solidity
error InvalidSignature();
error IntentExpired();
error InsufficientFee();
error InvalidProof();
error UnauthorizedSolver();
```

### SDK Errors

```typescript
class SDKError extends Error {
  code:
    | "NETWORK_ERROR"
    | "INVALID_PARAMS"
    | "ENCRYPTION_FAILED"
    | "SUBMISSION_FAILED";
  details?: any;
}
```

### Solver Errors

```rust
enum ProcessError {
    DecryptionFailed,
    RoutingFailed,
    BuildFailed,
    SubmissionFailed,
}
```

## API Versioning

- **Contract Interfaces**: Use semantic versioning in interface names
- **SDK APIs**: Versioned endpoints and backward compatibility
- **Event Schemas**: Include version fields for future upgrades

## Security Interfaces

### Access Control

```solidity
interface IAccessControl {
    function grantSolverRole(address solver) external;
    function revokeSolverRole(address solver) external;
    function hasSolverRole(address account) external view returns (bool);
}
```

### Emergency Controls

```solidity
interface IEmergency {
    function pause() external;
    function unpause() external;
    function emergencyWithdraw(address token, uint256 amount) external;
}
```

## Monitoring APIs

### Health Checks

```typescript
interface HealthAPI {
  getSystemStatus(): Promise<SystemStatus>;
  getSolverStats(): Promise<SolverStats[]>;
  getIntentMetrics(): Promise<IntentMetrics>;
}
```

### Analytics

```typescript
interface AnalyticsAPI {
  trackIntent(intentHash: string, event: IntentEvent): void;
  getProtocolStats(timeframe: Timeframe): Promise<ProtocolStats>;
}
```

## Future Extensions

- **Cross-Chain Interfaces**: Bridge intent across chains
- **Complex Intent Types**: Support for multi-step DeFi strategies
- **Governance APIs**: SHADOW token integration
- **Oracle Interfaces**: Price feed integrations
