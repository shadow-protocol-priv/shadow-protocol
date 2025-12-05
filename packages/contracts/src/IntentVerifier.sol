// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./interfaces/IIntentVerifier.sol";
import "./types/Intent.sol";

contract IntentVerifier is IIntentVerifier, Ownable {
    using ECDSA for bytes32;

    // EIP-712 domain separator
    bytes32 private constant DOMAIN_TYPEHASH =
        keccak256(
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
        );
    bytes32 private constant INTENT_TYPEHASH =
        keccak256(
            "Intent(bytes encryptedData,bytes signature,uint256 nonce,uint256 deadline,address user)"
        );

    string private constant NAME = "Shadow Protocol";
    string private constant VERSION = "1";

    mapping(address => bool) public authorizedSolvers;
    bool public mockMode = true; // For testing

    constructor(address initialOwner) Ownable(initialOwner) {
        // Allow any solver for MVP
        authorizedSolvers[address(0)] = true;
    }

    function verifyIntentSignature(
        Intent calldata intent
    ) external view returns (bool) {
        if (mockMode) return true; // For testing

        bytes32 domainSeparator = keccak256(
            abi.encode(
                DOMAIN_TYPEHASH,
                keccak256(bytes(NAME)),
                keccak256(bytes(VERSION)),
                block.chainid,
                address(this)
            )
        );

        bytes32 structHash = keccak256(
            abi.encode(
                INTENT_TYPEHASH,
                keccak256(intent.encryptedData),
                keccak256(intent.signature),
                intent.nonce,
                intent.deadline,
                intent.user
            )
        );

        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", domainSeparator, structHash)
        );

        (address recoveredSigner, ECDSA.RecoverError err, ) = digest.tryRecover(
            intent.signature
        );
        return
            err == ECDSA.RecoverError.NoError && recoveredSigner == intent.user;
    }

    function verifyExecutionProof(
        bytes calldata proof,
        bytes32 /*intentHash*/,
        bytes calldata /*executionData*/
    ) external pure returns (bool) {
        // MVP: Mock proof verification
        // In production, this would verify ZK proof or TEE attestation
        return proof.length > 0; // Simple check for non-empty proof
    }

    function isValidSolver(address /*solver*/) external pure returns (bool) {
        // MVP: Allow any address as solver
        // In production, this would check whitelist or staking requirements
        return true;
    }

    // Admin functions
    function addSolver(address solver) external onlyOwner {
        authorizedSolvers[solver] = true;
    }

    function removeSolver(address solver) external onlyOwner {
        authorizedSolvers[solver] = false;
    }
}
