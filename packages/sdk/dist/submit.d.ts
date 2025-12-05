import { IntentData, EncryptedBlob, IntentResult, SDKConfig } from './types';
export declare class ContractInteractor {
    private publicClient;
    private walletClient;
    private config;
    constructor(config: SDKConfig, walletClient?: any);
    /**
     * Submit encrypted intent to ShadowRouter
     */
    submitIntent(encryptedBlob: EncryptedBlob, signature: string, intentData: IntentData): Promise<IntentResult>;
    /**
     * Get intent status from contract
     */
    getIntentStatus(intentHash: string): Promise<any>;
    /**
     * Prepare the data for intent submission
     */
    private prepareIntentSubmissionData;
    /**
     * Generate intent hash (matches contract logic)
     */
    private generateIntentHash;
    /**
     * Set wallet client for transactions
     */
    setWalletClient(walletClient: any): void;
}
