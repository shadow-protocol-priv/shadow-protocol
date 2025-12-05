export type IntentStatus = 'pending' | 'fulfilled' | 'expired' | 'cancelled';
export interface SwapParams {
    fromToken: string;
    toToken: string;
    amount: string;
    slippage?: number;
    userAddress: string;
    deadline?: number;
    referrer?: string;
}
export interface IntentResult {
    intentHash: string;
    txHash?: string;
    status: IntentStatus;
    estimatedTime: number;
    timestamp: number;
}
export interface SDKConfig {
    chainId: number;
    routerAddress: string;
    rpcUrl: string;
    fhePublicKey?: string;
    gasMultiplier?: number;
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
    account: {
        address: string;
    };
}
