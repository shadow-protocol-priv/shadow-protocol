import { SwapParams, IntentResult, SDKConfig, IntentData } from './types';
import { encryptIntent, signIntent } from './encrypt';
import { ContractInteractor } from './submit';

class ShadowSDK {
  private interactor: ContractInteractor;
  private config: SDKConfig;

  constructor(config: SDKConfig) {
    this.config = config;
    this.interactor = new ContractInteractor(config);
  }

  /**
   * Main function: Submit a private swap intent
   */
  async swapPrivately(
    params: SwapParams,
    signer?: any
  ): Promise<IntentResult> {
    // Validate parameters
    this.validateSwapParams(params);

    // Prepare intent data
    const intentData: IntentData = {
      fromToken: params.fromToken,
      toToken: params.toToken,
      amount: params.amount,
      slippage: params.slippage || 0.5,
      userAddress: params.userAddress,
      deadline: params.deadline || Math.floor(Date.now() / 1000) + 3600 // 1 hour
    };

    // Encrypt intent data
    const encryptedBlob = await encryptIntent(intentData, this.config.fhePublicKey);

    // Sign the intent
    if (!signer) {
      throw new Error('Signer required for intent submission');
    }
    const signature = await signIntent(intentData, signer);

    // Set wallet client if provided
    if (signer) {
      this.interactor.setWalletClient(signer);
    }

    // Submit to contract
    const result = await this.interactor.submitIntent(
      encryptedBlob,
      signature,
      intentData
    );

    return result;
  }

  /**
   * Get status of submitted intent
   */
  async getIntentStatus(intentHash: string): Promise<any> {
    return await this.interactor.getIntentStatus(intentHash);
  }

  /**
   * Cancel a pending intent
   */
  async cancelIntent(intentHash: string, signer?: any): Promise<boolean> {
    // Implementation for canceling intents
    // This would require contract interaction
    throw new Error('Cancel intent not implemented yet');
  }

  /**
   * Batch submit multiple intents
   */
  async swapBatch(
    params: SwapParams[],
    signer?: any
  ): Promise<IntentResult[]> {
    const results: IntentResult[] = [];

    for (const param of params) {
      const result = await this.swapPrivately(param, signer);
      results.push(result);
    }

    return results;
  }

  /**
   * Validate swap parameters
   */
  private validateSwapParams(params: SwapParams): void {
    if (!params.fromToken || !params.toToken) {
      throw new Error('Token addresses required');
    }
    if (!params.amount || parseFloat(params.amount) <= 0) {
      throw new Error('Valid amount required');
    }
    if (!params.userAddress) {
      throw new Error('User address required');
    }
    if (params.slippage && (params.slippage < 0 || params.slippage > 100)) {
      throw new Error('Slippage must be between 0 and 100');
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SDKConfig>): void {
    this.config = { ...this.config, ...config };
    this.interactor = new ContractInteractor(this.config);
  }
}

// Factory function for easy initialization
export function createShadowSDK(config: SDKConfig): ShadowSDK {
  return new ShadowSDK(config);
}

// Default export
export default ShadowSDK;

// Named exports
export { ShadowSDK };
export type { SwapParams, IntentResult, SDKConfig };
export { DEFAULT_CONFIG, TESTNET_CONFIG, LOCAL_CONFIG, getConfigFromEnv } from './config';