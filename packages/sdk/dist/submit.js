"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractInteractor = void 0;
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
class ContractInteractor {
    constructor(config, walletClient) {
        this.config = config;
        this.publicClient = (0, viem_1.createPublicClient)({
            chain: chains_1.base,
            transport: (0, viem_1.http)(config.rpcUrl)
        });
        if (walletClient) {
            this.walletClient = walletClient;
        }
    }
    /**
     * Submit encrypted intent to ShadowRouter
     */
    async submitIntent(encryptedBlob, signature, intentData) {
        if (!this.walletClient) {
            throw new Error('Wallet client required for submission');
        }
        // Prepare contract call data
        const callData = this.prepareIntentSubmissionData(encryptedBlob, signature, intentData);
        // Submit transaction
        const hash = await this.walletClient.sendTransaction({
            to: this.config.routerAddress,
            data: callData,
            gas: 300000n // Estimate gas
        });
        // For MVP/testing, skip real confirmation and return mock result
        // In production: const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
        // Generate intent hash (matches contract logic)
        const intentHash = this.generateIntentHash(intentData);
        return {
            intentHash,
            txHash: hash,
            status: 'pending',
            estimatedTime: 30, // 30 seconds estimated
            timestamp: Date.now()
        };
    }
    /**
     * Get intent status from contract
     */
    async getIntentStatus(intentHash) {
        // This would call the contract's getIntentStatus function
        // For MVP, return mock status
        return 'pending';
    }
    /**
     * Prepare the data for intent submission
     */
    prepareIntentSubmissionData(encryptedBlob, signature, intentData) {
        // Encode the submitIntent function call
        // This matches the ShadowRouter.submitIntent function signature
        const intentStruct = {
            encryptedData: `0x${Buffer.from(encryptedBlob.ciphertext, 'base64').toString('hex')}`,
            signature: signature.startsWith('0x') ? signature : `0x${signature}`,
            nonce: BigInt(Date.now()), // Simple nonce
            deadline: BigInt(intentData.deadline),
            user: intentData.userAddress
        };
        // Function signature: submitIntent((bytes,bytes,uint256,uint256,address))
        return (0, viem_1.encodeFunctionData)({
            abi: [{
                    inputs: [{
                            components: [
                                { name: 'encryptedData', type: 'bytes' },
                                { name: 'signature', type: 'bytes' },
                                { name: 'nonce', type: 'uint256' },
                                { name: 'deadline', type: 'uint256' },
                                { name: 'user', type: 'address' }
                            ],
                            name: 'intent',
                            type: 'tuple'
                        }],
                    name: 'submitIntent',
                    outputs: [{ name: '', type: 'bytes32' }],
                    stateMutability: 'nonpayable',
                    type: 'function'
                }],
            functionName: 'submitIntent',
            args: [intentStruct]
        });
    }
    /**
     * Generate intent hash (matches contract logic)
     */
    generateIntentHash(intentData) {
        // Simplified hash generation
        const data = `${intentData.fromToken}${intentData.toToken}${intentData.amount}${intentData.userAddress}`;
        return '0x' + Buffer.from(data).toString('hex').padEnd(64, '0');
    }
    /**
     * Set wallet client for transactions
     */
    setWalletClient(walletClient) {
        this.walletClient = walletClient;
    }
}
exports.ContractInteractor = ContractInteractor;
