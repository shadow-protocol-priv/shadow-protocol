// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

enum IntentStatus {
    Pending,
    Fulfilled,
    Expired,
    Cancelled
}

struct Intent {
    bytes encryptedData; // fhEVM encrypted intent blob
    bytes signature; // EIP-712 signature
    uint256 nonce; // Replay protection
    uint256 deadline; // Expiration timestamp
    address user; // User address
}

struct Fulfillment {
    bytes32 intentHash; // Reference to intent
    bytes executionData; // Calldata for settlement
    bytes proof; // ZK/TEE proof
    address solver; // Solver address
}
