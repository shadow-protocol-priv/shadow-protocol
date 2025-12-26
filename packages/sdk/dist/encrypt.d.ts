import { IntentData, EncryptedBlob } from './types';
/**
 * Initialize TFHE WASM
 */
export declare function initializeFHE(publicKeyData?: string): Promise<void>;
/**
 * Real FHE encryption using TFHE WASM
 */
export declare function encryptIntent(intentData: IntentData, publicKeyData?: string): Promise<EncryptedBlob>;
/**
 * FHE decryption for testing (normally done by solvers)
 * Note: In production, decryption happens on-chain or by authorized solvers
 */
export declare function decryptIntent(encryptedBlob: EncryptedBlob, privateKey: string): Promise<IntentData>;
/**
 * Generate EIP-712 signature for intent
 */
export declare function signIntent(intentData: IntentData, signer: any): Promise<string>;
