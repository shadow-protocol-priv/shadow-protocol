# Shadow Protocol FHE Setup Guide

This guide explains how to set up and use Fully Homomorphic Encryption (FHE) in Shadow Protocol using Zama's fhEVM and tfhe-rs.

## Overview

Shadow Protocol uses FHE to encrypt user intent data, ensuring privacy while allowing solvers to process and fulfill intents without revealing sensitive information.

## Architecture

- **SDK (JavaScript/TypeScript)**: Uses `fhevmjs` for client-side encryption
- **Solvers (Rust)**: Uses `tfhe-rs` for server-side decryption
- **Contracts (Solidity)**: Deployed on fhEVM-compatible networks for encrypted operations

## Prerequisites

1. **Node.js SDK Setup**

   ```bash
   cd packages/sdk
   npm install fhevmjs@^0.5.0
   ```

2. **Rust Solver Setup**
   ```bash
   cd packages/solvers
   cargo add tfhe@0.6
   ```

## Key Generation

Generate FHE keys for encryption/decryption:

```bash
cd packages/sdk
npx ts-node src/keygen.ts
```

This creates:

- `keys/fhe-key-{timestamp}.pub` (public key for encryption)
- `keys/fhe-key-{timestamp}.priv` (private key for decryption)

## Configuration

Update configuration files with FHE keys:

### SDK Configuration (`packages/sdk/src/config.ts`)

```typescript
export const TESTNET_CONFIG: SDKConfig = {
  // ... other config
  fhePublicKey: "your-generated-public-key-here",
  gasMultiplier: 1.1,
};
```

### Solver Configuration (`packages/solvers/config/testnet.toml`)

```toml
[solver.fhe]
public_key = "your-generated-public-key-here"
private_key_path = "/path/to/fhe/private/key"
```

## Usage

### Encrypting Intents (SDK)

```typescript
import { createShadowSDK } from "@shadowprotocol/sdk";
import { initializeFHE } from "@shadowprotocol/sdk/dist/encrypt";

const sdk = createShadowSDK({
  chainId: 84532, // Base Sepolia
  fhePublicKey: "your-public-key",
  // ... other config
});

// Initialize FHE (done automatically in encryptIntent)
await initializeFHE("your-public-key", 84532);

// Encrypt and submit intent
const result = await sdk.swapPrivately(swapParams, signer);
```

### Decrypting Intents (Solver)

```rust
use shadow_solver::decryption::Decryptor;

let decryptor = Decryptor::new();
let decrypted_data = decryptor.decrypt(&encrypted_intent.encrypted_data).await?;
```

## Security Considerations

1. **Key Management**: Store private keys securely, never in version control
2. **Key Rotation**: Implement regular key rotation procedures
3. **Access Control**: Limit decryption capabilities to authorized solvers only
4. **Network Security**: Use encrypted channels for key distribution

## Testing

Run integration tests with FHE:

```bash
cd packages/sdk
npm test

cd packages/solvers
cargo test
```

## Deployment

1. **Testnet Deployment**:

   - Deploy contracts on Base Sepolia with fhEVM
   - Generate test keys
   - Update all configurations
   - Run end-to-end tests

2. **Mainnet Deployment**:
   - Use production fhEVM network
   - Generate production keys with proper security
   - Implement key backup and recovery procedures

## Troubleshooting

### Common Issues

1. **Package Installation**: Ensure correct Zama package versions
2. **Key Generation**: Verify keys are properly formatted
3. **Network Compatibility**: Confirm fhEVM support on target network
4. **Performance**: FHE operations are computationally intensive

### Support

- Zama Documentation: https://docs.zama.org/
- Shadow Protocol Issues: Create GitHub issue

## Future Enhancements

- Threshold decryption for enhanced security
- On-chain encrypted computations
- Multi-party computation support
- Hardware-accelerated FHE operations
  </content>
