# Rust Solver Implementation Detail

This document details the Rust-based solver nodes responsible for decrypting intents, routing trades, and submitting bundles for private execution in Shadow Protocol.

## Overview

Solvers are decentralized nodes that compete to fulfill encrypted intents. Each solver runs threshold FHE decryption to access intent details, routes the trade through optimal DEX paths, and submits execution bundles to private mempools.

## Architecture

### Core Modules

```
src/
├── main.rs              # Entry point and orchestration
├── config.rs            # Configuration management
├── event_listener.rs    # Base network event monitoring
├── decryption.rs        # Threshold FHE decryption
├── routing.rs           # DEX routing and quote fetching
├── bundling.rs          # Transaction bundle creation
├── submission.rs        # Private mempool submission
├── types.rs             # Shared data structures
└── utils.rs             # Helper functions
```

## Key Components

### Event Listener (event_listener.rs)

**Purpose**: Monitors ShadowRouter.sol for IntentSubmitted events.

**Key Functions**:

```rust
async fn listen_for_intents() -> Result<(), Box<dyn std::error::Error>>
```

- Connects to Base RPC via web3 crate
- Subscribes to IntentSubmitted events
- Filters intents by solver capacity/region
- Queues intents for decryption

**Configuration**:

- RPC endpoints (Base mainnet + fallbacks)
- Event polling interval
- Intent filtering criteria

### Decryption Module (decryption.rs)

**Purpose**: Performs threshold FHE decryption using Zama tfhe-rs.

**Key Functions**:

```rust
async fn decrypt_intent(
    encrypted_blob: &[u8],
    threshold_keys: &[FheKey]
) -> Result<IntentData, DecryptionError>
```

- Implements 3-of-5 threshold decryption
- Validates decrypted data integrity
- Handles decryption failures gracefully

**Data Structures**:

```rust
struct IntentData {
    from_token: Address,
    to_token: Address,
    amount: U256,
    slippage: u32,
    user_address: Address,
    deadline: u64,
}
```

### Routing Module (routing.rs)

**Purpose**: Finds optimal trade routes across DEXes.

**Key Functions**:

```rust
async fn get_best_route(
    intent: &IntentData
) -> Result<Route, RoutingError>
```

- Queries 1inch API for quotes
- Compares with CoW Protocol
- Calculates optimal path considering fees/gas
- Applies solver's fee structure

**Integration**:

- REST API calls to DEX aggregators
- Gas estimation for Base network
- Slippage protection

### Bundling Module (bundling.rs)

**Purpose**: Creates executable transaction bundles.

**Key Functions**:

```rust
fn create_bundle(
    route: &Route,
    intent_hash: H256
) -> Result<Bundle, BundlingError>
```

- Constructs multicall transactions
- Includes proof generation (ZK/TEE)
- Adds solver signature
- Prepares for mempool submission

**Bundle Structure**:

```rust
struct Bundle {
    transactions: Vec<Transaction>,
    proof: Vec<u8>,
    solver_signature: Signature,
    intent_hash: H256,
}
```

### Submission Module (submission.rs)

**Purpose**: Submits bundles to private mempools.

**Key Functions**:

```rust
async fn submit_bundle(
    bundle: &Bundle
) -> Result<SubmissionResult, SubmissionError>
```

- Integrates with SUAVE or Flashbots Protect
- Handles submission failures and retries
- Monitors inclusion status

**Mempool Options**:

- SUAVE: For advanced private execution
- Flashbots: For MEV protection
- Fallback to public mempool if needed

## Solver Economics

### Fee Calculation

- Base: 5 bps of trade value
- Gas costs deducted from earnings
- Performance-based rewards

### Competition

- First solver to submit valid bundle wins
- Race condition handling
- Failed submission penalties

## Security Considerations

### Threshold Cryptography

- Distributed key management
- Secure key storage (HSM/TEE)
- Key rotation protocols

### Validation

- Intent authenticity checks
- Route profitability verification
- Bundle execution simulation

### Monitoring

- Performance metrics
- Error logging
- Alert system for anomalies

## Configuration (config.rs)

**Key Settings**:

```rust
struct SolverConfig {
    rpc_endpoints: Vec<String>,
    private_key: String,
    threshold_keys: Vec<FheKey>,
    dex_apis: DexConfig,
    fee_recipient: Address,
    min_profit_threshold: U256,
}
```

## Testing

### Unit Tests

- Mock decryption for testing
- Simulated routing responses
- Bundle validation

### Integration Tests

- Full intent processing pipeline
- Network simulation
- End-to-end execution

## Deployment

### Node Requirements

- High-performance CPU for FHE operations
- Reliable network connection
- Secure key management

### Scaling

- Horizontal scaling across regions
- Load balancing for intent distribution
- Database for intent tracking (optional)

## Future Enhancements

- **Advanced Routing**: Cross-chain intent fulfillment
- **AI Optimization**: ML-based route prediction
- **Staking**: SHADOW token requirements for solvers
