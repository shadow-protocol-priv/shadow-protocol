# Shadow Protocol Deployment Information

## Deployment Details

**Network:** Base Sepolia Testnet
**Chain ID:** 84532
**RPC URL:** https://base-sepolia.g.alchemy.com/v2/Z8ps3lEeb_j7VOniV_nSVx4o1940CLWl

**Deployer Account:**

- Address: 0x80a63aa554c8742bc964bdd21f54f72e2637d9c4
- Private Key: 211f12b490779f0dd0a5f4fb55755518d8ec62a5af1d0cedbe5c11244c2cf829
- Current Balance: 0.000265 ETH (Insufficient for deployment)
- Required Balance: ~0.02 ETH minimum for contract deployment

### Getting Test ETH

Before deployment, fund the account with Base Sepolia ETH:

1. **Alchemy Faucet**: https://faucets.chain.link/base-sepolia
2. **QuickNode Faucet**: https://faucet.quicknode.com/base/sepolia
3. **Sepolia Faucet**: https://sepoliafaucet.com/

Request ~0.05 ETH to cover deployment and testing costs.

## Deployed Contract Addresses

### Production Addresses (After Deployment)

```
IntentVerifier:     0x0000000000000000000000000000000000000000
FeeManager:         0x0000000000000000000000000000000000000000
ShadowRouter:       0x0000000000000000000000000000000000000000
```

### Test Addresses (For Development)

```
IntentVerifier:     0x5FbDB2315678afecb367f032d93F642f64180aa3
FeeManager:         0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
ShadowRouter:       0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

## SDK Configuration

### Testnet Configuration

```typescript
export const TESTNET_CONFIG: SDKConfig = {
  chainId: 84532,
  routerAddress: "0x...", // Replace with actual deployed address
  rpcUrl:
    "https://base-sepolia.g.alchemy.com/v2/Z8ps3lEeb_j7VOniV_nSVx4o1940CLWl",
  fhePublicKey: undefined,
  gasMultiplier: 1.0,
};
```

## Solver Configuration

### Testnet Solver Config

```toml
[solver]
rpc_url = "https://base-sepolia.g.alchemy.com/v2/Z8ps3lEeb_j7VOniV_nSVx4o1940CLWl"
router_address = "0x..." # Replace with actual deployed address
verifier_address = "0x..." # Replace with actual deployed address
private_key = "0x..." # Solver's private key
min_profit_threshold = 0.001
max_slippage = 50

[solver.dex_apis]
oneinch_api_key = "your-1inch-api-key"
cowswap_api_url = "https://api.cow.fi/sepolia"
```

## Deployment Commands

### Deploy to Testnet

```bash
cd packages/contracts
PRIVATE_KEY=0x211f12b490779f0dd0a5f4fb55755518d8ec62a5af1d0cedbe5c11244c2cf829
RPC_URL=https://base-sepolia.g.alchemy.com/v2/Z8ps3lEeb_j7VOniV_nSVx4o1940CLWl

forge script script/Deploy.s.sol --fork-url $RPC_URL --broadcast --private-key $PRIVATE_KEY
```

### Verify Contracts

```bash
forge verify-contract <CONTRACT_ADDRESS> <CONTRACT_NAME> --chain-id 84532
```

## Post-Deployment Steps

1. **Update SDK Configuration**

   - Replace placeholder addresses with actual deployed addresses
   - Update all configuration files

2. **Fund Contracts**

   - Send test ETH to FeeManager contract for solver payments
   - Ensure deployer has enough ETH for transactions

3. **Configure Solvers**

   - Set up solver nodes with correct contract addresses
   - Fund solver accounts with ETH

4. **Update Frontend**

   - Update frontend configuration with deployed addresses
   - Test end-to-end flow

5. **Test Integration**
   - Run integration tests with real contracts
   - Verify privacy features work correctly

## Security Notes

- **Private Key Security**: Never commit private keys to version control
- **Environment Variables**: Use .env files for sensitive configuration
- **Access Control**: Limit who can deploy and manage contracts
- **Auditing**: Consider security audit before mainnet deployment

## Monitoring

After deployment, monitor:

- Contract events on Base Sepolia explorer
- Transaction success rates
- Gas usage and costs
- Solver performance

## Rollback Plan

If issues arise:

1. Pause contracts using emergency functions
2. Deploy updated contracts with fixes
3. Update all configurations
4. Resume operations

## Deployment Readiness Checklist

### Pre-Deployment ✅

- [x] Contracts compiled successfully
- [x] Deployment script created
- [x] Environment variables configured
- [x] Private key and RPC URL ready

### Account Setup 🔄

- [ ] Get Base Sepolia ETH from faucet (~0.05 ETH)
- [ ] Verify account balance: `cast balance 0x80a63aa554c8742bc964bdd21f54f72e2637d9c4 --rpc-url https://base-sepolia.g.alchemy.com/v2/Z8ps3lEeb_j7VOniV_nSVx4o1940CLWl`

### Deployment Steps 🔄

- [ ] Run deployment: `forge script script/Deploy.s.sol --fork-url https://base-sepolia.g.alchemy.com/v2/Z8ps3lEeb_j7VOniV_nSVx4o1940CLWl --broadcast --private-key 0x211f12b490779f0dd0a5f4fb55755518d8ec62a5af1d0cedbe5c11244c2cf829`
- [ ] Update this file with deployed addresses
- [ ] Verify contracts on Base Sepolia explorer
- [ ] Update SDK configuration with real addresses
- [ ] Update solver configuration
- [ ] Test end-to-end integration

### Post-Deployment ✅

- [ ] Contracts verified on blockchain explorer
- [ ] SDK updated with deployed addresses
- [ ] Solver configuration updated
- [ ] Integration tests pass with real contracts
- [ ] Frontend configured for testnet

---

_This file will be updated with actual deployed addresses after successful deployment._
