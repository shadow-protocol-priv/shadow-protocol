"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOCAL_CONFIG = exports.TESTNET_CONFIG = exports.DEFAULT_CONFIG = void 0;
exports.getConfigFromEnv = getConfigFromEnv;
// Default configuration for Base mainnet
exports.DEFAULT_CONFIG = {
    chainId: 8453, // Base
    routerAddress: '0x0000000000000000000000000000000000000000', // To be deployed
    rpcUrl: 'https://mainnet.base.org',
    fhePublicKey: 'fhe-public-key-mainnet-placeholder', // TODO: Replace with real FHE public key
    gasMultiplier: 1.1
};
// Testnet configuration
exports.TESTNET_CONFIG = {
    chainId: 84532, // Base Sepolia
    routerAddress: '0x0000000000000000000000000000000000000000', // To be deployed
    rpcUrl: 'https://sepolia.base.org',
    fhePublicKey: 'fhe-public-key-testnet-placeholder', // TODO: Replace with real FHE public key
    gasMultiplier: 1.1
};
// Local development configuration
exports.LOCAL_CONFIG = {
    chainId: 31337, // Local hardhat/anvil
    routerAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Example local address
    rpcUrl: 'http://localhost:8545',
    fhePublicKey: 'fhe-public-key-local-placeholder', // TODO: Replace with real FHE public key
    gasMultiplier: 1.0
};
// Environment-based config selection
function getConfigFromEnv() {
    const env = process.env.NODE_ENV || 'development';
    const network = process.env.SHADOW_NETWORK || 'local';
    switch (network) {
        case 'mainnet':
            return exports.DEFAULT_CONFIG;
        case 'testnet':
        case 'sepolia':
            return exports.TESTNET_CONFIG;
        case 'local':
        default:
            return exports.LOCAL_CONFIG;
    }
}
