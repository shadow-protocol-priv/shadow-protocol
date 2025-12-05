// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Script.sol";
import "../src/ShadowRouter.sol";
import "../src/IntentVerifier.sol";
import "../src/FeeManager.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy IntentVerifier
        IntentVerifier verifier = new IntentVerifier(msg.sender);
        console.log("IntentVerifier deployed at:", address(verifier));

        // Deploy FeeManager
        FeeManager feeManager = new FeeManager();
        console.log("FeeManager deployed at:", address(feeManager));

        // Deploy ShadowRouter
        ShadowRouter router = new ShadowRouter(
            address(verifier),
            address(feeManager)
        );
        console.log("ShadowRouter deployed at:", address(router));

        vm.stopBroadcast();
    }
}
