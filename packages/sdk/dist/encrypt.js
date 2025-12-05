"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptIntent = encryptIntent;
exports.decryptIntent = decryptIntent;
exports.signIntent = signIntent;
/**
 * Mock FHE encryption for MVP
 * In production, this will use Zama fhEVM
 */
async function encryptIntent(intentData, publicKey) {
    // MVP: Simple mock encryption
    // In production: Use fhEVM encryption
    const dataString = JSON.stringify(intentData);
    const mockCiphertext = Buffer.from(dataString).toString('base64');
    const mockNonce = Date.now().toString();
    return {
        ciphertext: mockCiphertext,
        nonce: mockNonce,
        publicKey: publicKey || 'mock-fhe-public-key'
    };
}
/**
 * Mock FHE decryption for testing
 * In production, this would be done off-chain by solvers
 */
async function decryptIntent(encryptedBlob, privateKey) {
    // MVP: Simple mock decryption
    // In production: This is done by solvers with threshold FHE
    const dataString = Buffer.from(encryptedBlob.ciphertext, 'base64').toString();
    return JSON.parse(dataString);
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
