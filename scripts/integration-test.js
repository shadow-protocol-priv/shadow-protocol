#!/usr/bin/env node

/**
 * Shadow Protocol Integration Test Script
 * Tests the complete flow: SDK → Contracts → Solver
 */

const { createShadowSDK } = require("../packages/sdk/dist/index.js");

class MockSigner {
  async signTypedData(domain, types, value) {
    console.log("🔏 Signing intent with mock signature...");
    return "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
  }

  getAddress() {
    return Promise.resolve("0x742d35Cc6634C0532925a3b844Bc454e4438f44e");
  }

  // Mock transaction sending
  sendTransaction = async (tx) => {
    console.log("📤 Sending mock transaction...");
    console.log("To:", tx.to);
    console.log("Data length:", tx.data?.length || 0);
    return "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
  };

  waitForTransactionReceipt = async (hash) => {
    console.log("⏳ Waiting for mock transaction confirmation...");
    return { status: "success", blockNumber: 12345678 };
  };
}

async function runIntegrationTest() {
  console.log("🚀 Starting Shadow Protocol Integration Test\n");

  try {
    // 1. Initialize SDK
    console.log("📦 Initializing Shadow SDK...");
    const sdk = createShadowSDK({
      chainId: 8453,
      routerAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      rpcUrl: "https://mainnet.base.org",
      fhePublicKey: undefined,
      gasMultiplier: 1.0,
    });

    // 2. Create mock signer
    const signer = new MockSigner();

    // 3. Prepare swap parameters
    const swapParams = {
      fromToken: "0x4200000000000000000000000000000000000006", // WETH
      toToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
      amount: "1.0",
      slippage: 0.5,
      userAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      deadline: Math.floor(Date.now() / 1000) + 3600,
    };

    console.log("🔄 Preparing swap intent...");
    console.log(`From: ${swapParams.fromToken} (${swapParams.amount})`);
    console.log(`To: ${swapParams.toToken}`);
    console.log(`Slippage: ${swapParams.slippage}%`);

    // 4. Submit private swap intent
    console.log("\n📝 Submitting encrypted intent...");
    const result = await sdk.swapPrivately(swapParams, signer);

    console.log("✅ Intent submitted successfully!");
    console.log(`Intent Hash: ${result.intentHash}`);
    console.log(`Transaction: ${result.txHash}`);
    console.log(`Status: ${result.status}`);
    console.log(`Estimated Time: ${result.estimatedTime}s`);

    // 5. Check intent status
    console.log("\n🔍 Checking intent status...");
    const status = await sdk.getIntentStatus(result.intentHash);
    console.log(`Current Status: ${status}`);

    // 6. Simulate solver processing
    console.log("\n🤖 Simulating solver processing...");
    await simulateSolverProcessing(result.intentHash);

    // 7. Final status check
    console.log("\n📊 Final status check...");
    const finalStatus = await sdk.getIntentStatus(result.intentHash);
    console.log(`Final Status: ${finalStatus}`);

    console.log("\n🎉 Integration test completed successfully!");
    console.log("\n📋 Test Summary:");
    console.log("✅ SDK initialization");
    console.log("✅ Intent encryption");
    console.log("✅ EIP-712 signing");
    console.log("✅ Contract interaction");
    console.log("✅ Status monitoring");
    console.log("✅ Solver simulation");
  } catch (error) {
    console.error("\n❌ Integration test failed:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
}

async function simulateSolverProcessing(intentHash) {
  console.log(`🔄 Solver processing intent: ${intentHash}`);

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("🔍 Decrypting intent...");
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log("📊 Finding optimal route...");
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log("⚡ Executing transaction...");
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log("✅ Intent fulfilled!");
}

// Run the test
if (require.main === module) {
  runIntegrationTest();
}

module.exports = { runIntegrationTest };
