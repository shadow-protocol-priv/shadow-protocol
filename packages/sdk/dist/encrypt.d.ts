import { IntentData, EncryptedBlob } from './types';
/**
 * Mock FHE encryption for MVP
 * In production, this will use Zama fhEVM
 */
export declare function encryptIntent(intentData: IntentData, publicKey?: string): Promise<EncryptedBlob>;
/**
 * Mock FHE decryption for testing
 * In production, this would be done off-chain by solvers
 */
export declare function decryptIntent(encryptedBlob: EncryptedBlob, privateKey: string): Promise<IntentData>;
/**
 * Generate EIP-712 signature for intent
 */
export declare function signIntent(intentData: IntentData, signer: any): Promise<string>;
