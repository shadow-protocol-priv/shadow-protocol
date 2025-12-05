import { SwapParams, IntentResult, SDKConfig } from './types';
declare class ShadowSDK {
    private interactor;
    private config;
    constructor(config: SDKConfig);
    /**
     * Main function: Submit a private swap intent
     */
    swapPrivately(params: SwapParams, signer?: any): Promise<IntentResult>;
    /**
     * Get status of submitted intent
     */
    getIntentStatus(intentHash: string): Promise<any>;
    /**
     * Cancel a pending intent
     */
    cancelIntent(intentHash: string, signer?: any): Promise<boolean>;
    /**
     * Batch submit multiple intents
     */
    swapBatch(params: SwapParams[], signer?: any): Promise<IntentResult[]>;
    /**
     * Validate swap parameters
     */
    private validateSwapParams;
    /**
     * Update configuration
     */
    updateConfig(config: Partial<SDKConfig>): void;
}
export declare function createShadowSDK(config: SDKConfig): ShadowSDK;
export default ShadowSDK;
export { ShadowSDK };
export type { SwapParams, IntentResult, SDKConfig };
export { DEFAULT_CONFIG, TESTNET_CONFIG, LOCAL_CONFIG, getConfigFromEnv } from './config';
