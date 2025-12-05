// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "../types/Intent.sol";

interface IShadowRouter {
    // Intent submission
    function submitIntent(
        Intent calldata intent
    ) external returns (bytes32 intentHash);

    // Intent fulfillment
    function fulfillIntent(Fulfillment calldata fulfillment) external;

    // Intent management
    function cancelIntent(bytes32 intentHash) external;
    function getIntentStatus(
        bytes32 intentHash
    ) external view returns (IntentStatus);

    // Events
    event IntentSubmitted(
        bytes32 indexed intentHash,
        address indexed user,
        bytes encryptedData
    );
    event IntentFulfilled(
        bytes32 indexed intentHash,
        address indexed solver,
        uint256 fee
    );
    event IntentCancelled(bytes32 indexed intentHash);
}
