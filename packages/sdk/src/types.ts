export type IntentStatus = 'pending' | 'fulfilled' | 'expired' | 'cancelled';

export interface SwapParams {
  fromToken: string;        // ERC20 address
  toToken: string;          // ERC20 address
  amount: string;           // Human-readable amount
  slippage?: number;        // Slippage tolerance (percentage)
  userAddress: string;      // User wallet address
  deadline?: number;        // Unix timestamp
  referrer?: string;        // Optional referrer
}

export interface IntentResult {
  intentHash: string;       // Unique intent identifier
  txHash?: string;          // Submission transaction hash
  status: IntentStatus;     // Current status
  estimatedTime: number;    // Estimated completion (seconds)
  timestamp: number;        // Submission timestamp
}

export interface SDKConfig {
  chainId: number;              // Target chain (Base = 8453)
  routerAddress: string;        // ShadowRouter contract address
  rpcUrl: string;               // RPC endpoint
  fhePublicKey?: string;        // FHE public key for encryption
  gasMultiplier?: number;       // Gas price multiplier
}

export interface IntentData {
  fromToken: string;
  toToken: string;
  amount: string;
  slippage: number;
  userAddress: string;
  deadline: number;
}

export interface EncryptedBlob {
  ciphertext: string;
  nonce: string;
  publicKey?: string;
}

export interface Signer {
  signTypedData: (domain: any, types: any, value: any) => Promise<string>;
  getAddress: () => Promise<string>;
}

export interface WalletClient {
  signTypedData: (args: any) => Promise<string>;
  account: { address: string };
}