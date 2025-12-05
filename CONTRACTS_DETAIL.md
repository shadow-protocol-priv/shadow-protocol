# Solidity Contracts Detail

This document provides detailed specifications for the Solidity smart contracts in Shadow Protocol, deployed on the Base network.

## Overview

The contract suite consists of three main contracts:

- **ShadowRouter.sol**: Main entry point for intent submission and fulfillment.
- **IntentVerifier.sol**: Handles signature verification and proof validation.
- **FeeManager.sol**: Manages fee collection and distribution.

## ShadowRouter.sol

### Purpose

The core contract that accepts encrypted intents from users and allows solvers to fulfill them with public settlement.

### Key Components

#### Structs

```solidity
struct Intent {
    bytes encryptedData;      // fhEVM encrypted intent blob
    bytes signature;          // EIP-712 signature
    uint256 nonce;            // Replay protection
    uint256 deadline;         // Expiration timestamp
    address user;             // User address (for verification)
}

struct Fulfillment {
    bytes32 intentHash;       // Hash of the intent
    bytes executionData;      // Calldata for the settlement tx
    bytes proof;              // ZK/TEE proof of correct execution
    address solver;           // Solver address
}
```

#### Events

```solidity
event IntentSubmitted(bytes32 indexed intentHash, address indexed user, bytes encryptedData);
event IntentFulfilled(bytes32 indexed intentHash, address indexed solver, uint256 fee);
event IntentExpired(bytes32 indexed intentHash);
```

#### Functions

**submitIntent(Intent calldata intent) external**

- Validates signature and deadline
- Emits IntentSubmitted event
- Stores intent hash for tracking
- Requirements: Valid EIP-712 signature, deadline > block.timestamp

**fulfillIntent(Fulfillment calldata fulfillment) external**

- Verifies solver authorization
- Validates proof (via IntentVerifier)
- Executes settlement transaction
- Collects and distributes fees
- Emits IntentFulfilled event
- Requirements: Valid proof, intent not expired/fulfilled

**cancelIntent(bytes32 intentHash) external**

- Allows user to cancel unfilled intents
- Refunds any held funds if applicable

**getIntentStatus(bytes32 intentHash) view returns (IntentStatus)**

- Returns status: Pending, Fulfilled, Expired, Cancelled

### Security Considerations

- Reentrancy protection on fulfillment
- Access control for solver whitelist
- Timelock for critical updates

## IntentVerifier.sol

### Purpose

Verifies cryptographic proofs and signatures to ensure intent integrity and correct execution.

### Key Functions

**verifyIntentSignature(Intent calldata intent) view returns (bool)**

- Recovers signer from EIP-712 signature
- Checks against intent.user

**verifyExecutionProof(bytes proof, bytes32 intentHash, bytes executionData) view returns (bool)**

- Validates ZK proof that execution matches decrypted intent
- Ensures no front-running or manipulation

**isValidSolver(address solver) view returns (bool)**

- Checks if solver is authorized (threshold signature participation)

### Integration

Called by ShadowRouter during fulfillment to ensure only valid executions are settled.

## FeeManager.sol

### Purpose

Handles fee calculation, collection, and distribution between protocol and solvers.

### Key Components

#### Fee Structure

- Base fee: 10 bps (0.1%) of transaction value
- Split: 5 bps to solver, 5 bps to treasury
- Additional kickbacks from routed protocols

#### Functions

**calculateFee(uint256 amount) pure returns (uint256)**

- Computes fee based on transaction value

**distributeFees(address solver, uint256 totalFee) internal**

- Transfers solver share immediately
- Accumulates treasury share

**withdrawTreasury() external onlyOwner**

- Allows protocol owner to withdraw accumulated fees

### Treasury Management

- Fees held in contract until withdrawal
- Future integration with SHADOW token staking rewards

## Interfaces

### IShadowRouter.sol

```solidity
interface IShadowRouter {
    function submitIntent(Intent calldata intent) external;
    function fulfillIntent(Fulfillment calldata fulfillment) external;
    function getIntentStatus(bytes32 intentHash) external view returns (IntentStatus);
}
```

### IIntentVerifier.sol

```solidity
interface IIntentVerifier {
    function verifyIntentSignature(Intent calldata intent) external view returns (bool);
    function verifyExecutionProof(bytes proof, bytes32 intentHash, bytes executionData) external view returns (bool);
}
```

## Deployment Considerations

- **Base Network**: Deploy to Base mainnet with proxy pattern for upgradability
- **Dependencies**: OpenZeppelin contracts for Ownable, ReentrancyGuard
- **Testing**: Comprehensive unit tests with Foundry
- **Audits**: Plan for multiple security audits before mainnet

## Future Extensions

- **Multi-chain**: Bridge intents across EVM chains
- **Advanced Intents**: Support for complex DeFi strategies
- **Governance**: SHADOW token integration for parameter updates
