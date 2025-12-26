"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeFHE = initializeFHE;
exports.encryptIntent = encryptIntent;
exports.decryptIntent = decryptIntent;
exports.signIntent = signIntent;
// TFHE WASM imports
const { init_panic_hook, TfheClientKey, TfheCompactPublicKey, TfheCompressedServerKey, TfheConfigBuilder, CompactFheUint64List, CompactFheUint32List } = require('tfhe');
// Global FHE keys
let tfheInitialized = false;
let publicKey = null;
let clientKey = null;
/**
 * Initialize TFHE WASM
 */
async function initializeFHE(publicKeyData) {
    if (!tfheInitialized) {
        // Initialize panic hook for better error messages
        init_panic_hook();
        // Create configuration
        const config = TfheConfigBuilder.default().build();
        // Generate keys if no public key provided
        if (!publicKeyData) {
            clientKey = TfheClientKey.generate(config);
            publicKey = TfheCompactPublicKey.new(clientKey);
        }
        else {
            // Deserialize provided public key
            const keyBytes = Uint8Array.from(atob(publicKeyData), c => c.charCodeAt(0));
            publicKey = TfheCompactPublicKey.deserialize(keyBytes);
        }
        tfheInitialized = true;
        console.log('TFHE WASM initialized');
    }
}
/**
 * Real FHE encryption using TFHE WASM
 */
async function encryptIntent(intentData, publicKeyData) {
    // Ensure TFHE is initialized
    if (!tfheInitialized) {
        await initializeFHE(publicKeyData);
    }
    if (!tfheInitialized) {
        throw new Error('TFHE not initialized. Please provide a public key.');
    }
    if (!publicKey) {
        throw new Error('Public key not available for encryption');
    }
    // Encrypt intent data using TFHE
    // Convert addresses to BigInt for encryption (addresses are 160-bit)
    const fromTokenBigInt = BigInt(intentData.fromToken);
    const toTokenBigInt = BigInt(intentData.toToken);
    const userAddressBigInt = BigInt(intentData.userAddress);
    // Encrypt each field
    const encryptedAmount = CompactFheUint64List.encrypt_with_compact_public_key([BigInt(intentData.amount)], publicKey);
    const encryptedSlippage = CompactFheUint32List.encrypt_with_compact_public_key([intentData.slippage], publicKey);
    const encryptedDeadline = CompactFheUint64List.encrypt_with_compact_public_key([BigInt(intentData.deadline)], publicKey);
    // For addresses, we'll encrypt them as uint256 values
    // Note: In production, you might want to split addresses into smaller chunks
    const encryptedFromToken = CompactFheUint64List.encrypt_with_compact_public_key([fromTokenBigInt], publicKey);
    const encryptedToToken = CompactFheUint64List.encrypt_with_compact_public_key([toTokenBigInt], publicKey);
    const encryptedUserAddress = CompactFheUint64List.encrypt_with_compact_public_key([userAddressBigInt], publicKey);
    // Serialize encrypted data
    const encryptedData = {
        fromToken: encryptedFromToken.serialize(),
        toToken: encryptedToToken.serialize(),
        amount: encryptedAmount.serialize(),
        slippage: encryptedSlippage.serialize(),
        userAddress: encryptedUserAddress.serialize(),
        deadline: encryptedDeadline.serialize(),
    };
    // Serialize encrypted data
    const ciphertext = JSON.stringify(encryptedData);
    const nonce = Date.now().toString();
    return {
        ciphertext,
        nonce,
        publicKey: publicKeyData || 'placeholder-public-key',
    };
}
/**
 * FHE decryption for testing (normally done by solvers)
 * Note: In production, decryption happens on-chain or by authorized solvers
 */
async function decryptIntent(encryptedBlob, privateKey) {
    // Note: Client-side decryption is not typically done in FHE
    // This is a placeholder for testing purposes
    // In production, decryption happens on-chain or by solvers with proper keys
    throw new Error('Client-side decryption not supported in FHE. Decryption must be done by authorized solvers or on-chain.');
}
/**
 * Generate EIP-712 signature for intent
 */
async function signIntent(intentData, signer) {
    const domain = {
        name: 'Shadow Protocol',
        version: '1',
        chainId: 8453, // Base
        verifyingContract: '0x0000000000000000000000000000000000000000' // To be set
    };
    const types = {
        Intent: [
            { name: 'fromToken', type: 'address' },
            { name: 'toToken', type: 'address' },
            { name: 'amount', type: 'string' },
            { name: 'slippage', type: 'uint256' },
            { name: 'userAddress', type: 'address' },
            { name: 'deadline', type: 'uint256' }
        ]
    };
    const value = {
        fromToken: intentData.fromToken,
        toToken: intentData.toToken,
        amount: intentData.amount,
        slippage: Math.floor(intentData.slippage * 100), // Convert to bps
        userAddress: intentData.userAddress,
        deadline: intentData.deadline
    };
    // Support both wagmi and ethers signers
    if (signer.signTypedData) {
        return await signer.signTypedData(domain, types, value);
    }
    else if (signer._signTypedData) {
        return await signer._signTypedData(domain, types, value);
    }
    else {
        throw new Error('Unsupported signer type');
    }
}
