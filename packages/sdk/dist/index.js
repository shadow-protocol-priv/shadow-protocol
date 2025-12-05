"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfigFromEnv = exports.LOCAL_CONFIG = exports.TESTNET_CONFIG = exports.DEFAULT_CONFIG = exports.ShadowSDK = void 0;
exports.createShadowSDK = createShadowSDK;
const encrypt_1 = require("./encrypt");
const submit_1 = require("./submit");
class ShadowSDK {
    constructor(config) {
        this.config = config;
        this.interactor = new submit_1.ContractInteractor(config);
    }
    /**
     * Main function: Submit a private swap intent
     */
    async swapPrivately(params, signer) {
        // Validate parameters
        this.validateSwapParams(params);
        // Prepare intent data
        const intentData = {
            fromToken: params.fromToken,
            toToken: params.toToken,
            amount: params.amount,
            slippage: params.slippage || 0.5,
            userAddress: params.userAddress,
            deadline: params.deadline || Math.floor(Date.now() / 1000) + 3600 // 1 hour
        };
        // Encrypt intent data
        const encryptedBlob = await (0, encrypt_1.encryptIntent)(intentData, this.config.fhePublicKey);
        // Sign the intent
        if (!signer) {
            throw new Error('Signer required for intent submission');
        }
        const signature = await (0, encrypt_1.signIntent)(intentData, signer);
        // Set wallet client if provided
        if (signer) {
            this.interactor.setWalletClient(signer);
        }
        // Submit to contract
        const result = await this.interactor.submitIntent(encryptedBlob, signature, intentData);
        return result;
    }
    /**
     * Get status of submitted intent
     */
    async getIntentStatus(intentHash) {
        return await this.interactor.getIntentStatus(intentHash);
    }
    /**
     * Cancel a pending intent
     */
    async cancelIntent(intentHash, signer) {
        // Implementation for canceling intents
        // This would require contract interaction
        throw new Error('Cancel intent not implemented yet');
    }
    /**
     * Batch submit multiple intents
     */
    async swapBatch(params, signer) {
        const results = [];
        for (const param of params) {
            const result = await this.swapPrivately(param, signer);
            results.push(result);
        }
        return results;
    }
    /**
     * Validate swap parameters
     */
    validateSwapParams(params) {
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
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        this.interactor = new submit_1.ContractInteractor(this.config);
    }
}
exports.ShadowSDK = ShadowSDK;
// Factory function for easy initialization
function createShadowSDK(config) {
    return new ShadowSDK(config);
}
// Default export
exports.default = ShadowSDK;
var config_1 = require("./config");
Object.defineProperty(exports, "DEFAULT_CONFIG", { enumerable: true, get: function () { return config_1.DEFAULT_CONFIG; } });
Object.defineProperty(exports, "TESTNET_CONFIG", { enumerable: true, get: function () { return config_1.TESTNET_CONFIG; } });
Object.defineProperty(exports, "LOCAL_CONFIG", { enumerable: true, get: function () { return config_1.LOCAL_CONFIG; } });
Object.defineProperty(exports, "getConfigFromEnv", { enumerable: true, get: function () { return config_1.getConfigFromEnv; } });
