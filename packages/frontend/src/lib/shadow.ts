import { createShadowSDK, DEFAULT_CONFIG } from '@shadowprotocol/sdk';
import { getAccount, getWalletClient } from '@wagmi/core';
import { config } from './wagmi';

// Initialize Shadow SDK with default config
export const shadowSDK = createShadowSDK(DEFAULT_CONFIG);

/**
 * Submit a private swap using the connected wallet
 */
export async function submitPrivateSwap(params: {
  fromToken: string;
  toToken: string;
  amount: string;
  slippage?: number;
}) {
  try {
    // Get connected account
    const account = getAccount(config);
    if (!account.address) {
      throw new Error('No wallet connected');
    }

    // Get wallet client for signing
    const walletClient = await getWalletClient(config);
    if (!walletClient) {
      throw new Error('No wallet client available');
    }

    // Prepare swap parameters
    const swapParams = {
      ...params,
      userAddress: account.address,
      slippage: params.slippage || 0.5,
      deadline: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    };

    // Submit private swap
    const result = await shadowSDK.swapPrivately(swapParams, {
      signTypedData: walletClient.signTypedData,
      getAddress: () => Promise.resolve(account.address)
    });

    return result;
  } catch (error) {
    console.error('Private swap failed:', error);
    throw error;
  }
}

/**
 * Get intent status
 */
export async function getIntentStatus(intentHash: string) {
  return await shadowSDK.getIntentStatus(intentHash);
}

/**
 * Cancel an intent
 */
export async function cancelIntent(intentHash: string) {
  try {
    const account = getAccount(config);
    if (!account.address) {
      throw new Error('No wallet connected');
    }

    const walletClient = await getWalletClient(config);
    if (!walletClient) {
      throw new Error('No wallet client available');
    }

    return await shadowSDK.cancelIntent(intentHash, {
      signTypedData: walletClient.signTypedData,
      getAddress: () => Promise.resolve(account.address)
    });
  } catch (error) {
    console.error('Cancel intent failed:', error);
    throw error;
  }
}