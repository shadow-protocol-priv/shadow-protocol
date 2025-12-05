// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Test.sol";
import "../src/ShadowRouter.sol";
import "../src/IntentVerifier.sol";
import "../src/FeeManager.sol";
import "../src/types/Intent.sol";

contract ShadowRouterTest is Test {
    ShadowRouter public router;
    IntentVerifier public verifier;
    FeeManager public feeManager;

    address public user = address(0x123);
    address public solver = address(0x456);

    function setUp() public {
        verifier = new IntentVerifier(address(this));
        feeManager = new FeeManager();
        router = new ShadowRouter(address(verifier), address(feeManager));

        // Fund contracts for testing
        vm.deal(address(router), 1 ether);
        vm.deal(address(feeManager), 1 ether);
    }

    function testSubmitIntent() public {
        // Create a mock intent
        Intent memory intent = Intent({
            encryptedData: "mock data",
            signature: "",
            nonce: 1,
            deadline: block.timestamp + 3600,
            user: user
        });

        // Mock signature verification to return true
        // In real test, would sign properly

        vm.prank(user);
        bytes32 intentHash = router.submitIntent(intent);

        assertTrue(intentHash != bytes32(0));
        assertEq(
            uint(router.getIntentStatus(intentHash)),
            uint(IntentStatus.Pending)
        );
    }

    function testFulfillIntent() public {
        // First submit intent
        Intent memory intent = Intent({
            encryptedData: "mock data",
            signature: "",
            nonce: 1,
            deadline: block.timestamp + 3600,
            user: user
        });

        vm.prank(user);
        bytes32 intentHash = router.submitIntent(intent);

        // Create fulfillment with dummy execution data
        Fulfillment memory fulfillment = Fulfillment({
            intentHash: intentHash,
            executionData: abi.encodeWithSignature("dummy()"), // Dummy call
            proof: "mock proof",
            solver: solver
        });

        // Fund the contract for fee distribution
        vm.deal(address(router), 1 ether);

        vm.prank(solver);
        router.fulfillIntent(fulfillment);

        assertEq(
            uint(router.getIntentStatus(intentHash)),
            uint(IntentStatus.Fulfilled)
        );
    }

    function testCancelIntent() public {
        // Submit intent
        Intent memory intent = Intent({
            encryptedData: "mock data",
            signature: "",
            nonce: 1,
            deadline: block.timestamp + 3600,
            user: user
        });

        vm.prank(user);
        bytes32 intentHash = router.submitIntent(intent);

        // Fast forward past deadline
        vm.warp(intent.deadline + 1);

        vm.prank(user);
        router.cancelIntent(intentHash);

        assertEq(
            uint(router.getIntentStatus(intentHash)),
            uint(IntentStatus.Cancelled)
        );
    }
}
