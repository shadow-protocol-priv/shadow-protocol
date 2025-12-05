// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "../types/Intent.sol";

interface IIntentVerifier {
    function verifyIntentSignature(
        Intent calldata intent
    ) external view returns (bool);
    function verifyExecutionProof(
        bytes calldata proof,
        bytes32 intentHash,
        bytes calldata executionData
    ) external view returns (bool);
    function isValidSolver(address solver) external view returns (bool);
}
